using Blogium.API.Data;
using Blogium.API.DTOs;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Blogium.API.Services;

public class AuthService : IAuthService
{
    private readonly BlogiumDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        BlogiumDbContext context, 
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<User> FindOrCreateExternalUserAsync(string email, string name, string image)
    {
        // Project to anonymous type first to avoid NULL issues
        var existingUser = await _context.Users
            .Where(u => u.Email == email)
            .Select(u => new
            {
                u.Id,
                Username = u.Username ?? string.Empty,
                Email = u.Email ?? string.Empty,
                u.EmailVerified,
                u.Image,
                u.Bio,
                u.CreatedAt,
                u.UpdatedAt
            })
            .FirstOrDefaultAsync();
            
        if (existingUser != null)
        {
            // Update avatar if it's missing or different
            var needsUpdate = false;
            if (string.IsNullOrEmpty(existingUser.Image) && !string.IsNullOrEmpty(image))
            {
                _logger.LogInformation($"Updating avatar for user {existingUser.Username}: {image}");
                var userEntity = await _context.Users.FindAsync(existingUser.Id);
                if (userEntity != null)
                {
                    userEntity.Image = image;
                    await _context.SaveChangesAsync();
                    needsUpdate = true;
                }
            }
            
            // Reconstruct User object for return
            return new User
            {
                Id = existingUser.Id,
                Username = existingUser.Username,
                Email = existingUser.Email,
                EmailVerified = existingUser.EmailVerified,
                Image = needsUpdate ? image : existingUser.Image,
                Bio = existingUser.Bio,
                CreatedAt = existingUser.CreatedAt,
                UpdatedAt = existingUser.UpdatedAt,
                PasswordHash = null // OAuth users don't have password
            };
        }
        
        // Username benzersiz olmalı
        var username = name ?? "user";
        int suffix = 1;
        while (await _context.Users.AnyAsync(u => u.Username == username))
        {
            username = (name ?? "user") + suffix;
            suffix++;
        }
        
        var user = new User
        {
            Username = username,
            Email = email ?? "",
            EmailVerified = true,
            Image = image,
            Bio = null,
            PasswordHash = null,
            PasswordResetCode = null,
            PasswordResetCodeExpiry = null,
            VerificationCode = null,
            VerificationCodeExpiry = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }


    public async Task<UserDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            throw new Exception("Email already exists");
        }

        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
        {
            throw new Exception("Username already exists");
        }

        // Generate 6-digit verification code
        var verificationCode = new Random().Next(100000, 999999).ToString();

        // Create new user (not verified yet)
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            EmailVerified = false,
            VerificationCode = verificationCode,
            VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15), // 15 dakika geçerli
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Send verification email
        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationCode);
            _logger.LogInformation("Verification email sent to {Email} with code {Code}", user.Email, verificationCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
        }

        // Return user WITHOUT token (not verified yet)
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio,
            Image = user.Image,
            Token = "" // No token until email is verified
        };
    }

    public async Task<UserDto> LoginAsync(LoginDto loginDto)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password");
        }

        // Check if email is verified
        if (!user.EmailVerified)
        {
            throw new Exception("Email not verified. Please check your email for verification code.");
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio,
            Image = user.Image,
            Token = token
        };
    }

    public async Task<bool> VerifyEmailAsync(string email, string code)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (user.EmailVerified)
        {
            return true; // Already verified
        }

        if (user.VerificationCode != code)
        {
            throw new Exception("Invalid verification code");
        }

        if (user.VerificationCodeExpiry < DateTime.UtcNow)
        {
            throw new Exception("Verification code expired. Please request a new one.");
        }

        // Verify user
        user.EmailVerified = true;
        user.VerificationCode = null;
        user.VerificationCodeExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send welcome email
        try
        {
            await _emailService.SendWelcomeEmailAsync(user.Email, user.Username);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
        }

        return true;
    }

    public async Task<bool> ResendVerificationCodeAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (user.EmailVerified)
        {
            throw new Exception("Email already verified");
        }

        // Generate new code
        var verificationCode = new Random().Next(100000, 999999).ToString();
        user.VerificationCode = verificationCode;
        user.VerificationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send new verification email
        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, user.Username, verificationCode);
            _logger.LogInformation("New verification email sent to {Email} with code {Code}", user.Email, verificationCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to {Email}", user.Email);
            throw;
        }

        return true;
    }

    public async Task<bool> ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
            throw new Exception("Üyeliğiniz bulunmamaktadır.");
        }

        // Generate secure token
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        user.PasswordResetCode = token;
        user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(30); // 30 minutes validity
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Generate reset link
        var resetLink = $"https://blogium.yunusemrecoskun.xyz/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

        // Send password reset email with link
        try
        {
            await _emailService.SendPasswordResetLinkAsync(user.Email, user.Username, resetLink);
            _logger.LogInformation("Password reset email sent to {Email} with link {Link}", user.Email, resetLink);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
            throw new Exception("Failed to send password reset email");
        }

        return true;
    }

    public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (string.IsNullOrEmpty(user.PasswordResetCode))
        {
            throw new Exception("No password reset request found. Please request a password reset first.");
        }

        if (user.PasswordResetCode != code)
        {
            throw new Exception("Invalid or expired reset code");
        }

        if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
        {
            throw new Exception("Reset code expired. Please request a new one.");
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password successfully reset for user {Email}", user.Email);

        return true;
    }

    public async Task<bool> ResetPasswordWithTokenAsync(string token, string newPassword)
    {
        // Find user by token
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetCode == token);
        
        if (user == null)
        {
            throw new Exception("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.");
        }

        if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
        {
            throw new Exception("Şifre sıfırlama bağlantısının süresi doldu. Lütfen yeni bir bağlantı isteyin.");
        }

        // Update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Password successfully reset with token for user {Email}", user.Email);

        return true;
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.Username ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationInMinutes"])),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(secretKey),
                SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
