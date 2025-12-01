# 🔐 Security Configuration Guide

**Important**: This guide must be followed before deploying to production!

## Required Configuration Files

Before running the application, you need to create the following configuration files from their examples:

### 1. Backend Configuration

#### appsettings.Development.json
Copy `appsettings.Development.json.example` to `appsettings.Development.json` and update:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=blogium;User Id=SA;Password=YOUR_STRONG_PASSWORD;TrustServerCertificate=True;"
  }
}
```

#### appsettings.Production.json
Create this file with your production settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_PRODUCTION_DATABASE_CONNECTION_STRING"
  },
  "JwtSettings": {
    "Secret": "GENERATE_A_SECURE_64_CHARACTER_SECRET_KEY_HERE",
    "Issuer": "Blogium.API",
    "Audience": "Blogium.Client",
    "ExpirationInMinutes": 1440
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-specific-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "Blogium"
  }
}
```

### 2. JWT Secret Key Generation

Generate a secure JWT secret key:

```bash
# On Linux/Mac
openssl rand -base64 64

# Or use online generator
# https://randomkeygen.com/
```

### 3. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate a new app password for "Blogium"
4. Use this password in `appsettings.json`

## Security Checklist

- [ ] Changed JWT Secret in appsettings.json
- [ ] Changed database password
- [ ] Created Gmail App Password (not regular password!)
- [ ] Added appsettings.Development.json to .gitignore
- [ ] Added appsettings.Production.json to .gitignore
- [ ] Reviewed all configuration files for sensitive data
- [ ] Updated CORS origins for production domain
- [ ] Enabled HTTPS in production

## Environment Variables (Alternative)

Instead of appsettings files, you can use environment variables:

```bash
export JWT_SECRET="your_secure_secret_key"
export DB_PASSWORD="your_database_password"
export SMTP_PASSWORD="your_email_app_password"
```

## Docker Secrets (Recommended for Production)

For Docker deployment, use Docker secrets:

```yaml
# docker-compose.yml
services:
  blogium-api:
    secrets:
      - jwt_secret
      - db_password
      - smtp_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
  smtp_password:
    file: ./secrets/smtp_password.txt
```

## ⚠️ Never Commit

**Never commit these files to Git:**
- appsettings.Development.json
- appsettings.Production.json
- .env files
- Any file containing passwords, API keys, or secrets

## Need Help?

If you have questions about security configuration, please open an issue.
