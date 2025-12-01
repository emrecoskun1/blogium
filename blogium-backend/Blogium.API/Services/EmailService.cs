using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Blogium.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string username, string verificationCode)
    {
        var subject = "Blogium - Email Doğrulama Kodu";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .code-box {{ background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✨ Blogium'a Hoş Geldiniz!</h1>
        </div>
        <div class='content'>
            <h2>Merhaba {username},</h2>
            <p>Blogium'a kayıt olduğunuz için teşekkür ederiz! Email adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
            
            <div class='code-box'>
                <p style='margin: 0; color: #666; font-size: 14px;'>Doğrulama Kodunuz</p>
                <div class='code'>{verificationCode}</div>
            </div>
            
            <div class='warning'>
                <strong>⏰ Önemli:</strong> Bu kod 15 dakika içinde geçerliliğini yitirecektir.
            </div>
            
            <p>Bu kodu Blogium'da doğrulama sayfasına girerek hesabınızı aktif hale getirebilirsiniz.</p>
            
            <p><strong>Bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</strong></p>
            
            <p>Saygılarımızla,<br><strong>Blogium Ekibi</strong></p>
        </div>
        <div class='footer'>
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            <p>&copy; 2025 Blogium. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string username)
    {
        var subject = "Blogium'a Hoş Geldiniz! 🎉";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Hesabınız Aktif!</h1>
        </div>
        <div class='content'>
            <h2>Tebrikler {username}!</h2>
            <p>Email adresiniz başarıyla doğrulandı. Artık Blogium'un tüm özelliklerinden yararlanabilirsiniz:</p>
            
            <ul style='line-height: 2;'>
                <li>📝 Kendi yazılarınızı yazın ve yayınlayın</li>
                <li>👥 Diğer yazarları takip edin</li>
                <li>💬 Makalelere yorum yapın</li>
                <li>❤️ Beğendiğiniz içerikleri favorilerinize ekleyin</li>
                <li>🏷️ Etiketlerle ilginizi çeken konuları keşfedin</li>
            </ul>
            
            <center>
                <a href='https://blogium.yunusemrecoskun.xyz' class='button'>Blogium'u Keşfet</a>
            </center>
            
            <p>İyi okumalar ve keyifli yazılar dileriz!</p>
            
            <p>Saygılarımızla,<br><strong>Blogium Ekibi</strong></p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 Blogium. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendFollowerNotificationAsync(string toEmail, string followerUsername, string profileUrl)
    {
        var subject = $"{followerUsername} size abone oldu! - Blogium";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #1173d4; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f6f7f8; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ background: #1173d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .follower-card {{ background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Yeni Takipçi!</h1>
        </div>
        <div class='content'>
            <div class='follower-card'>
                <h2>@{followerUsername}</h2>
                <p>size abone oldu!</p>
            </div>
            
            <p style='text-align: center;'>
                <a href='{profileUrl}' class='button'>Profili Görüntüle</a>
            </p>
            
            <p style='text-align: center; color: #64748b;'>
                Blogium topluluğu büyüyor! 🚀
            </p>
        </div>
        <div class='footer'>
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            <p>&copy; 2025 Blogium. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string username, string resetCode)
    {
        var subject = "Blogium - Şifre Sıfırlama Kodu";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .code-box {{ background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .code {{ font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }}
        .security {{ background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; border-radius: 4px; color: #721c24; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔒 Şifre Sıfırlama</h1>
        </div>
        <div class='content'>
            <h2>Merhaba {username},</h2>
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki kodu kullanın:</p>
            
            <div class='code-box'>
                <p style='margin: 0; color: #666; font-size: 14px;'>Sıfırlama Kodunuz</p>
                <div class='code'>{resetCode}</div>
            </div>
            
            <div class='warning'>
                <strong>⏰ Önemli:</strong> Bu kod 15 dakika içinde geçerliliğini yitirecektir.
            </div>
            
            <div class='security'>
                <strong>🛡️ Güvenlik Uyarısı:</strong> Bu işlemi siz yapmadıysanız, hesabınızın güvenliği tehlikede olabilir. Lütfen derhal şifrenizi değiştirin ve bu e-postayı bize bildirin.
            </div>
            
            <p>Bu kodu Blogium'da şifre sıfırlama sayfasına girerek yeni bir şifre belirleyebilirsiniz.</p>
            
            <p>Saygılarımızla,<br><strong>Blogium Ekibi</strong></p>
        </div>
        <div class='footer'>
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            <p>&copy; 2025 Blogium. Tüm hakları saklıdır.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendPasswordResetLinkAsync(string email, string username, string link)
    {
        var subject = "Blogium - Şifre Sıfırlama";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }}
        .container {{ 
            max-width: 600px; 
            margin: 40px auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }}
        .content {{ 
            padding: 40px 30px;
        }}
        .content h2 {{
            color: #1a1a1a;
            font-size: 20px;
            margin-bottom: 20px;
        }}
        .content p {{
            color: #666;
            margin-bottom: 15px;
            line-height: 1.8;
        }}
        .button-container {{
            text-align: center;
            margin: 35px 0;
        }}
        .button {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 16px 40px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }}
        .button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }}
        .info-box {{ 
            background: #f8f9fa; 
            border-left: 4px solid #667eea; 
            padding: 16px 20px; 
            margin: 25px 0; 
            border-radius: 4px;
        }}
        .info-box strong {{
            color: #667eea;
            display: block;
            margin-bottom: 8px;
        }}
        .security {{ 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 16px 20px; 
            margin: 25px 0; 
            border-radius: 4px;
        }}
        .security strong {{
            color: #856404;
            display: block;
            margin-bottom: 8px;
        }}
        .footer {{ 
            background: #f8f9fa;
            text-align: center; 
            padding: 30px;
            color: #666; 
            font-size: 13px;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            margin: 5px 0;
        }}
        .link-text {{
            word-break: break-all;
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
            color: #666;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔒 Şifre Sıfırlama</h1>
            <p>Hesap güvenliği talebi</p>
        </div>
        <div class='content'>
            <h2>Merhaba {username},</h2>
            <p>Blogium hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:</p>
            
            <div class='button-container'>
                <a href='{link}' class='button'>Şifremi Sıfırla</a>
            </div>
            
            <div class='info-box'>
                <strong>⏰ Dikkat:</strong>
                Bu bağlantı güvenlik nedeniyle <strong>30 dakika</strong> süreyle geçerlidir.
            </div>
            
            <div class='security'>
                <strong>🛡️ Güvenlik Uyarısı:</strong>
                Bu işlemi siz yapmadıysanız, hesabınızın güvenliği tehlikede olabilir. Lütfen derhal şifrenizi değiştirin veya bizimle iletişime geçin.
            </div>
            
            <p style='margin-top: 30px;'>Buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
            <div class='link-text'>{link}</div>
            
            <p style='margin-top: 30px;'>Saygılarımızla,<br><strong>Blogium Ekibi</strong></p>
        </div>
        <div class='footer'>
            <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            <p>&copy; 2025 Blogium. Tüm hakları saklıdır.</p>
            <p style='margin-top: 10px;'><a href='https://blogium.yunusemrecoskun.xyz' style='color: #667eea; text-decoration: none;'>blogium.yunusemrecoskun.xyz</a></p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(email, subject, htmlBody);
    }    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpHost = emailSettings["SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var smtpUser = emailSettings["SmtpUser"] ?? "";
            var smtpPass = emailSettings["SmtpPassword"] ?? "";
            var fromEmail = emailSettings["FromEmail"] ?? smtpUser;
            var fromName = emailSettings["FromName"] ?? "Blogium";

            // Development modunda console'a yaz
            if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
            {
                _logger.LogWarning("═══════════════════════════════════════════════════════════");
                _logger.LogWarning("📧 EMAIL NOTIFICATION (Development Mode)");
                _logger.LogWarning("═══════════════════════════════════════════════════════════");
                _logger.LogWarning("To: {Email}", toEmail);
                _logger.LogWarning("Subject: {Subject}", subject);
                
                // Extract verification code from HTML if present
                var codeMatch = System.Text.RegularExpressions.Regex.Match(htmlBody, @"<div class='code'>(\d{6})</div>");
                if (codeMatch.Success)
                {
                    _logger.LogWarning("🔐 VERIFICATION CODE: {Code}", codeMatch.Groups[1].Value);
                }
                
                _logger.LogWarning("═══════════════════════════════════════════════════════════");
                _logger.LogInformation("💡 To enable real email sending, configure SMTP settings in appsettings.json");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }
}
