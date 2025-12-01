# Blogium Production Deployment Guide

## 🚀 Production Özellikleri

Bu güncelleme ile aşağıdaki production-ready özellikler eklendi:

### 1. Cookie-Based Authentication
- ✅ localStorage yerine güvenli cookie kullanımı
- ✅ HttpOnly ve Secure flag desteği
- ✅ SameSite=Strict ayarı
- ✅ Otomatik session timeout (24 saat)

### 2. Session Management
- ✅ Otomatik session kontrolü (5 dakikada bir)
- ✅ Son aktivite takibi
- ✅ Timeout sonrası otomatik logout

### 3. Responsive Design
- ✅ Mobile-first tasarım
- ✅ Tablet ve desktop desteği
- ✅ Touch-friendly interface
- ✅ Flexible grid layouts

### 4. Favorite System Fix
- ✅ Favori kaldırınca listeden otomatik silme
- ✅ Real-time güncelleme
- ✅ Optimized API calls

### 5. Production Configuration
- ✅ Environment-based configuration
- ✅ API timeout handling
- ✅ Error logging (production'da minimize)
- ✅ Security headers

## 📦 Production Build

### Frontend

```bash
cd blogium-frontend

# Production build
npm run build

# Build output: dist/blogium-frontend
```

### Backend

```bash
cd blogium-backend/Blogium.API

# Production build
dotnet publish -c Release -o ./publish

# Output: ./publish
```

## 🔐 Environment Variables

### Frontend (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Relative URL for same domain
  apiTimeout: 30000,
  enableLogging: false,
  cookieSecure: true,
  sessionTimeout: 24 * 60 * 60 * 1000,
  cacheTimeout: 5 * 60 * 1000
};
```

### Backend (appsettings.Production.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_PRODUCTION_DB_CONNECTION_STRING"
  },
  "JwtSettings": {
    "Secret": "YOUR_STRONG_SECRET_KEY_MIN_32_CHARS",
    "ExpirationInMinutes": 1440
  }
}
```

## 🐳 Docker Deployment

### Full Stack Deployment

```bash
# Build and start all services
docker-compose up -d

# Services:
# - Frontend: http://localhost:4201
# - Backend: http://localhost:5001
# - SQL Server: localhost:1435
```

### Individual Services

```bash
# Backend only
cd blogium-backend
docker-compose up -d

# Frontend only
cd blogium-frontend
docker build -t blogium-frontend .
docker run -p 4201:80 blogium-frontend
```

## 🔧 Configuration Checklist

### Before Production Deployment

- [ ] Update `appsettings.Production.json` with production DB connection
- [ ] Change JWT secret to a strong random key (min 32 chars)
- [ ] Update CORS settings to allow production domain only
- [ ] Enable HTTPS redirect
- [ ] Configure proper email SMTP settings
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets (optional)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database

### Security

- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] SQL injection protection (EF Core handles this)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## 📊 Monitoring

### Application Logs

Loglar production'da minimum seviyede tutulur:

```json
"Logging": {
  "LogLevel": {
    "Default": "Warning",
    "Microsoft.AspNetCore": "Error"
  }
}
```

### Performance Metrics

- API response time monitoring
- Database query performance
- Frontend page load time
- Cookie/session tracking

## 🔄 Updates & Maintenance

### Database Migrations

```bash
cd blogium-backend/Blogium.API

# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

### Cache Management

Frontend'te cache timeout: 5 dakika
- Article listesi
- User profilleri
- Tag listesi

## 🐛 Troubleshooting

### Cookie Issues

Eğer cookie çalışmıyorsa:
1. HTTPS kullanıldığından emin olun (production)
2. Domain'in doğru set edildiğini kontrol edin
3. Browser cookie settings'i kontrol edin

### Session Timeout

Session timeout ayarları:
- Default: 24 saat
- Değiştirmek için `environment.ts` ve `AuthService` güncelleyin

### CORS Errors

Backend `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowProduction", policy =>
    {
        policy.WithOrigins("https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

## 🎯 Performance Optimization

1. **Frontend**
   - Lazy loading for routes
   - Image optimization
   - Code splitting
   - Minification

2. **Backend**
   - Database indexing
   - Query optimization
   - Response caching
   - Connection pooling

## 📞 Support

Issues için GitHub repository'de issue açabilirsiniz.

## 📝 Changelog

### v2.0.0 (Latest)
- ✅ Cookie-based authentication
- ✅ Session management
- ✅ Responsive design improvements
- ✅ Favorite system fix
- ✅ Production configuration
- ✅ Security enhancements

### v1.0.0
- Initial release
