using Blogium.API.DTOs;
using Blogium.API.Models;

namespace Blogium.API.Services;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto registerDto);
    Task<UserDto> LoginAsync(LoginDto loginDto);
    Task<bool> VerifyEmailAsync(string email, string code);
    Task<bool> ResendVerificationCodeAsync(string email);
    Task<bool> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
    Task<bool> ResetPasswordWithTokenAsync(string token, string newPassword);
    string GenerateJwtToken(User user);
    Task<User> FindOrCreateExternalUserAsync(string email, string name, string image);
}
