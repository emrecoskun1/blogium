# Blogium - Modern Blog Platform

Modern blog platformu. Angular + ASP.NET Core + MSSQL ile geliştirilmiştir.

## � Important Security Notice

**Before running the application**, you must configure sensitive settings:

1. Read [SECURITY.md](./SECURITY.md) for detailed setup instructions
2. Create `appsettings.Development.json` from the example file
3. Update JWT secret, database password, and email credentials
4. Never commit configuration files with real credentials

## �📋 Gereksinimler

- Docker Desktop (Mac/Windows) veya Docker Engine (Linux)
- Docker Compose v2.0+
- Minimum 4GB RAM
- 10GB disk alanı

## 🚀 Hızlı Başlangıç

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/emrecoskun1/blogium.git
cd blogium
```

### 2. Güvenlik Yapılandırması

See [SECURITY.md](./SECURITY.md) for complete configuration guide.

### 3. Tüm Servisleri Başlatın

```bash
docker compose up -d --build
```

Bu komut 3 servisi başlatır:
- **blogium-db**: MSSQL Server (Port: 1435)
- **blogium-api**: Backend API (Port: 5001)
- **blogium-frontend**: Angular Frontend (Port: 4201)

### 3. İlk Kurulum - Database Migration

Container'lar başladıktan sonra (yaklaşık 30-60 saniye), database migration'ı çalıştırın:

```bash
# API container'a bağlan
docker exec -it blogium-api /bin/bash

# Migration'ı çalıştır
dotnet ef database update

# Container'dan çık
exit
```

### 4. Uygulamayı Açın

- **Frontend**: http://localhost:4201
- **Backend API**: http://localhost:5001
- **API Swagger**: http://localhost:5001/swagger

## 📊 Servis Detayları

### Database (blogium-db)
- **Image**: mcr.microsoft.com/mssql/server:2022-latest
- **Container**: blogium-sqlserver
- **Port**: 1435 (Localhost SQL Server ile çakışmamak için)
- **Database**: BlogiumDB
- **SA Password**: BlogiumDb@2024!
- **Volume**: blogium_sqldata

### Backend API (blogium-api)
- **Image**: blogium-api:latest
- **Container**: blogium-api
- **Port**: 5001
- **Framework**: ASP.NET Core 8.0
- **Environment**: Production
- **Health Check**: http://localhost:5001/api/health

### Frontend (blogium-frontend)
- **Image**: blogium-frontend:latest
- **Container**: blogium-frontend
- **Port**: 4201
- **Framework**: Angular 20
- **Web Server**: Nginx

## 🔍 Container Yönetimi

### Container Durumunu Kontrol Et

```bash
docker compose ps
```

### Logları İzle

```bash
# Tüm servisler
docker compose logs -f

# Sadece backend
docker compose logs -f blogium-api

# Sadece frontend
docker compose logs -f blogium-frontend

# Sadece database
docker compose logs -f blogium-db
```

### Container'a Bağlan

```bash
# Backend
docker exec -it blogium-api /bin/bash

# Frontend
docker exec -it blogium-frontend /bin/sh

# Database
docker exec -it blogium-sqlserver /bin/bash
```

### Servisleri Durdur

```bash
docker compose stop
```

### Servisleri Başlat

```bash
docker compose start
```

### Servisleri Durdur ve Sil

```bash
docker compose down
```

### Servisleri Sil (Verilerle Birlikte)

```bash
docker compose down -v
```

## 🔧 Geliştirme

### Yeniden Build Et

```bash
# Tüm servisleri yeniden build et
docker compose up -d --build

# Sadece backend'i build et
docker compose up -d --build blogium-api

# Sadece frontend'i build et
docker compose up -d --build blogium-frontend
```

### Cache Olmadan Build

```bash
docker compose build --no-cache
docker compose up -d
```

## 🗄️ Database İşlemleri

### Database'e Bağlan

```bash
# SQL Server Management Studio veya Azure Data Studio kullanarak:
Server: localhost,1435
User: sa
Password: BlogiumDb@2024!
Database: BlogiumDB
```

### Backup Al

```bash
docker exec blogium-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost,1435 -U sa -P 'BlogiumDb@2024!' \
  -Q "BACKUP DATABASE BlogiumDB TO DISK = '/var/opt/mssql/data/blogium_backup.bak'"

# Container'dan host'a kopyala
docker cp blogium-sqlserver:/var/opt/mssql/data/blogium_backup.bak ./blogium_backup.bak
```

### Restore Et

```bash
# Host'tan container'a kopyala
docker cp ./blogium_backup.bak blogium-sqlserver:/var/opt/mssql/data/

# Restore et
docker exec blogium-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost,1435 -U sa -P 'BlogiumDb@2024!' \
  -Q "RESTORE DATABASE BlogiumDB FROM DISK = '/var/opt/mssql/data/blogium_backup.bak' WITH REPLACE"
```

### Seed Data Yükle

```bash
# SQL dosyasını container'a kopyala
docker cp ./blogium-backend/seed-1000-articles.sql blogium-sqlserver:/tmp/

# SQL dosyasını çalıştır
docker exec blogium-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost,1435 -U sa -P 'BlogiumDb@2024!' \
  -d BlogiumDB -i /tmp/seed-1000-articles.sql
```

## 🔐 Güvenlik

### Production Önerileri

1. **Şifreleri Değiştir**: docker-compose.yml'deki tüm şifreleri değiştir
2. **Environment Variables**: .env dosyası kullan
3. **HTTPS**: Nginx'e SSL sertifikası ekle
4. **Firewall**: Sadece gerekli portları aç
5. **Secrets**: Docker secrets kullan

### .env Dosyası Örneği

```env
MSSQL_SA_PASSWORD=your_strong_password_here
JWT_SECRET=your_jwt_secret_here
SMTP_PASSWORD=your_smtp_password_here
```

## 🐛 Sorun Giderme

### Container Başlamıyor

```bash
# Hata loglarını kontrol et
docker compose logs <service-name>

# Örnek
docker compose logs blogium-api
```

### Port Çakışması

```bash
# Kullanımda olan portları kontrol et
lsof -i :4201
lsof -i :5001
lsof -i :1435

# Port değiştirmek için docker-compose.yml'i düzenle
```

### Database Bağlantı Hatası

1. Database container'ının tamamen başladığından emin ol:
```bash
docker compose ps
```

2. Health check'i kontrol et:
```bash
docker inspect blogium-sqlserver | grep Health
```

3. Manuel bağlantı testi:
```bash
docker exec blogium-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost,1435 -U sa -P 'BlogiumDb@2024!' -Q "SELECT 1"
```

### Migration Hatası

```bash
# Migration'ları kontrol et
docker exec -it blogium-api dotnet ef migrations list

# Migration'ı tekrar çalıştır
docker exec -it blogium-api dotnet ef database update

# Migration'ı sıfırla
docker exec -it blogium-api dotnet ef database update 0
docker exec -it blogium-api dotnet ef database update
```

### Frontend Build Hatası

```bash
# Node modules'u temizle ve tekrar build et
docker compose down
docker rmi blogium-frontend
docker compose up -d --build blogium-frontend
```

### Disk Alanı Sorunu

```bash
# Kullanılmayan Docker objelerini temizle
docker system prune -a

# Volumes'leri temizle (DİKKAT: Veri kaybı olur!)
docker volume prune
```

## 📝 Notlar

- Database ilk başlatmada 30-60 saniye sürebilir
- Migration'ları container başladıktan sonra çalıştırın
- Production'da HTTPS kullanmayı unutmayın
- Regular backup almayı unutmayın

## 🆘 Destek

Sorun yaşarsanız:
1. Logları kontrol edin: `docker compose logs -f`
2. Container durumunu kontrol edin: `docker compose ps`
3. Network'ü kontrol edin: `docker network inspect blogium-network`

## 📦 Versiyon

- Angular: 20.x
- ASP.NET Core: 8.0
- MSSQL Server: 2022
- Node: 20-alpine
- Nginx: alpine

## 🎉 Başarılı Deployment

Container'lar başarıyla başladığında:

```bash
$ docker compose ps

NAME                 COMMAND                  STATUS              PORTS
blogium-api          "dotnet Blogium.API.dll" Up (healthy)        0.0.0.0:5001->80/tcp
blogium-frontend     "nginx -g daemon off"    Up                  0.0.0.0:4201->80/tcp
blogium-sqlserver    "/opt/mssql/bin/perm…"   Up (healthy)        0.0.0.0:1435->1435/tcp
```

✅ Frontend: http://localhost:4201
✅ Backend: http://localhost:5001
✅ Swagger: http://localhost:5001/swagger
✅ Database: localhost,1435

Happy coding! 🚀
