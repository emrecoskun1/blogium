namespace Blogium.API.Services;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string username, string verificationCode);
    Task SendWelcomeEmailAsync(string toEmail, string username);
    Task SendFollowerNotificationAsync(string toEmail, string followerUsername, string profileUrl);
       Task SendPasswordResetEmailAsync(string toEmail, string username, string resetCode);
       Task SendPasswordResetLinkAsync(string toEmail, string username, string link);
}
