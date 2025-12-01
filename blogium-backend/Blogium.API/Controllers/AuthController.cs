
using Blogium.API.DTOs;
using Blogium.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Blogium.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var redirectUrl = $"{baseUrl}/api/auth/google/callback";
            var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "";
            var scope = "openid email profile";
            var state = Guid.NewGuid().ToString();
            var googleUrl = $"https://accounts.google.com/o/oauth2/v2/auth?client_id={clientId}&response_type=code&scope={scope}&redirect_uri={redirectUrl}&state={state}";
            return Redirect(googleUrl);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string state)
        {
            Console.WriteLine($"=== GOOGLE CALLBACK RECEIVED ===");
            Console.WriteLine($"Code: {code?.Substring(0, Math.Min(20, code?.Length ?? 0))}...");
            Console.WriteLine($"State: {state}");
            
            try
            {
                var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "";
                var clientSecret = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") ?? "";
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var redirectUrl = $"{baseUrl}/api/auth/google/callback";
                
                Console.WriteLine($"Redirect URL: {redirectUrl}");
                
                using var http = new HttpClient();
                var tokenRes = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUrl,
                    ["grant_type"] = "authorization_code"
                }));
                
                var tokenJson = await tokenRes.Content.ReadAsStringAsync();
                var tokenObj = System.Text.Json.JsonDocument.Parse(tokenJson).RootElement;
                var accessToken = tokenObj.GetProperty("access_token").GetString();
                
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                var userInfoRes = await http.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
                var userInfoJson = await userInfoRes.Content.ReadAsStringAsync();
                var userInfo = System.Text.Json.JsonDocument.Parse(userInfoJson).RootElement;
                
                var email = userInfo.GetProperty("email").GetString();
                var name = userInfo.GetProperty("name").GetString();
                var image = userInfo.GetProperty("picture").GetString();
                
                Console.WriteLine($"Google user info - Email: {email}, Name: {name}");
                
                var user = await _authService.FindOrCreateExternalUserAsync(email, name, image);
                var token = _authService.GenerateJwtToken(user);
                
                Console.WriteLine($"User created/found: {user.Username} (ID: {user.Id})");
                Console.WriteLine($"Token generated: {token.Substring(0, 20)}...");
                
                // Redirect to frontend with token in URL (frontend will store it)
                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4200";
                var redirectTo = $"{frontendUrl}/auth/callback?token={token}";
                Console.WriteLine($"Redirecting to: {redirectTo}");
                return Redirect(redirectTo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== GOOGLE CALLBACK ERROR ===");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                
                // Redirect to login with error
                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4200";
                return Redirect($"{frontendUrl}/login?error=oauth_failed");
            }
        }

        [HttpGet("github")]
        public IActionResult GithubLogin()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var redirectUrl = $"{baseUrl}/api/auth/github/callback";
            var clientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID") ?? "";
            var scope = "user:email";
            var state = Guid.NewGuid().ToString();
            var githubUrl = $"https://github.com/login/oauth/authorize?client_id={clientId}&scope={scope}&redirect_uri={redirectUrl}&state={state}";
            return Redirect(githubUrl);
        }

        [HttpGet("github/callback")]
        public async Task<IActionResult> GithubCallback([FromQuery] string code, [FromQuery] string state)
        {
            try
            {
                var clientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID") ?? "";
                var clientSecret = Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET") ?? "";
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var redirectUrl = $"{baseUrl}/api/auth/github/callback";
                
                using var http = new HttpClient();
                http.DefaultRequestHeaders.Add("Accept", "application/json");
                http.DefaultRequestHeaders.Add("User-Agent", "Blogium");
                
                var tokenRes = await http.PostAsync("https://github.com/login/oauth/access_token", new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["code"] = code,
                    ["client_id"] = clientId,
                    ["client_secret"] = clientSecret,
                    ["redirect_uri"] = redirectUrl
                }));
                
                var tokenJson = await tokenRes.Content.ReadAsStringAsync();
                var tokenObj = System.Text.Json.JsonDocument.Parse(tokenJson).RootElement;
                var accessToken = tokenObj.GetProperty("access_token").GetString();
                
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
                var userRes = await http.GetAsync("https://api.github.com/user");
                var userJson = await userRes.Content.ReadAsStringAsync();
                var userObj = System.Text.Json.JsonDocument.Parse(userJson).RootElement;
                
                // Get email from user endpoint or emails endpoint if null
                var email = userObj.TryGetProperty("email", out var emailProp) && emailProp.ValueKind != System.Text.Json.JsonValueKind.Null
                    ? emailProp.GetString()
                    : null;
                
                if (string.IsNullOrEmpty(email))
                {
                    var emailsRes = await http.GetAsync("https://api.github.com/user/emails");
                    var emailsJson = await emailsRes.Content.ReadAsStringAsync();
                    var emails = System.Text.Json.JsonDocument.Parse(emailsJson).RootElement;
                    if (emails.GetArrayLength() > 0)
                    {
                        email = emails[0].GetProperty("email").GetString();
                    }
                }
                
                var name = userObj.GetProperty("login").GetString();
                var image = userObj.GetProperty("avatar_url").GetString();
                
                var user = await _authService.FindOrCreateExternalUserAsync(email, name, image);
                var token = _authService.GenerateJwtToken(user);
                
                // Redirect to frontend with token in URL (frontend will store it)
                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4200";
                return Redirect($"{frontendUrl}/auth/callback?token={token}");
            }
            catch (Exception ex)
            {
                // Redirect to login with error
                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:4200";
                return Redirect($"{frontendUrl}/login?error=oauth_failed");
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<object>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var user = await _authService.RegisterAsync(registerDto);
                return Ok(new {
                    user,
                    message = "Registration successful. Please check your email for verification code."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult<object>> VerifyEmail([FromBody] VerifyEmailDto verifyDto)
        {
            try
            {
                var success = await _authService.VerifyEmailAsync(verifyDto.Email, verifyDto.Code);
                return Ok(new {
                    success,
                    message = "Email verified successfully. You can now login."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resend-code")]
        public async Task<ActionResult<object>> ResendCode([FromBody] ResendCodeDto resendDto)
        {
            try
            {
                var success = await _authService.ResendVerificationCodeAsync(resendDto.Email);
                return Ok(new {
                    success,
                    message = "Verification code sent to your email."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _authService.LoginAsync(loginDto);
                return Ok(new { user });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<object>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var success = await _authService.ForgotPasswordAsync(forgotPasswordDto.Email);
                return Ok(new {
                    success,
                    message = "E-posta adresinize şifre sıfırlama kodu gönderilmiştir."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<object>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                bool success;
                
                // Support both token-based (secure link) and code-based (email code) reset
                if (!string.IsNullOrEmpty(resetPasswordDto.Token))
                {
                    // Token-based reset (secure link from email)
                    success = await _authService.ResetPasswordWithTokenAsync(
                        resetPasswordDto.Token,
                        resetPasswordDto.NewPassword
                    );
                }
                else if (!string.IsNullOrEmpty(resetPasswordDto.Email) && !string.IsNullOrEmpty(resetPasswordDto.Code))
                {
                    // Code-based reset (legacy)
                    success = await _authService.ResetPasswordAsync(
                        resetPasswordDto.Email,
                        resetPasswordDto.Code,
                        resetPasswordDto.NewPassword
                    );
                }
                else
                {
                    return BadRequest(new { message = "Either token or email+code is required." });
                }
                
                return Ok(new {
                    success,
                    message = "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
