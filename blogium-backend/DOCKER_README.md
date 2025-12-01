# Blogium Docker Deployment

Bu proje Docker ile çalıştırılmak için yapılandırılmıştır.

## Yeni Portlar

Sunucuda 4200, 5000 ve 1433 portları kullanımda olduğu için yeni portlar:

- **Frontend (Angular)**: `4201` (http://localhost:4201)
- **Backend (ASP.NET Core)**: `5001` (http://localhost:5001)
- **MSSQL Server**: `1434` (localhost:1434)

## Kurulum

### 1. Docker Compose ile Tüm Servisleri Başlatma

```bash
cd blogium-backend
docker compose up -d --build
```

Bu komut şunları başlatır:
- MSSQL Server (port 1434)
- Backend API (port 5001)
- Frontend Angular App (port 4201)

### 2. Logları İzleme

```bash
# Tüm servislerin logları
docker compose logs -f

# Sadece API logları
docker compose logs -f api

# Sadece Frontend logları
docker compose logs -f frontend

# Sadece Database logları
docker compose logs -f sqlserver
```

### 3. Servisleri Durdurma

```bash
docker compose down
```

### 4. Servisleri Durdurma ve Verileri Silme

```bash
docker compose down -v
```

## Manuel Build

### Backend Build

```bash
cd blogium-backend/Blogium.API
docker build -t blogium-api:latest .
docker run -d -p 5001:80 --name blogium-api blogium-api:latest
```

### Frontend Build

```bash
cd blogium
docker build -t blogium-frontend:latest .
docker run -d -p 4201:80 --name blogium-frontend blogium-frontend:latest
```

## Database Migration

Container başlatıldıktan sonra migration'ları çalıştırmak için:

```bash
# API container'a bağlan
docker exec -it blogium-api /bin/bash

# Migration'ları çalıştır
dotnet ef database update
```

## Servis Durumu Kontrolü

```bash
# Çalışan container'ları listele
docker ps

# Tüm container'ları (durmuş olanlar dahil) listele
docker ps -a

# Network bilgilerini görüntüle
docker network inspect blogium-network
```

## Sorun Giderme

### Container başlamıyor

```bash
# Container loglarını kontrol et
docker compose logs <service-name>

# Örnek:
docker compose logs api
```

### Database bağlantı hatası

MSSQL Server'ın tamamen başlaması 10-30 saniye sürebilir. Healthcheck bekleyin:

```bash
docker compose ps
```

### Port çakışması

Eğer portlar hala dolu ise docker-compose.yml'de portları değiştirin:

```yaml
ports:
  - "YENI_PORT:80"
```

## Production Deployment

Production sunucusunda deployment için:

1. `.env` dosyası oluşturun (hassas bilgiler için)
2. `docker-compose.prod.yml` kullanın
3. SSL sertifikası ekleyin
4. Environment variable'ları ayarlayın

```bash
docker compose -f docker-compose.yml up -d --build
```

## Güvenlik Notları

⚠️ **Önemli**: Production'da mutlaka yapılması gerekenler:

1. MSSQL SA şifresini değiştirin
2. JWT Secret key'i değiştirin
3. Email credentials'ı environment variable olarak ayarlayın
4. HTTPS kullanın
5. Firewall kuralları ekleyin

## Teknolojiler

- **Frontend**: Angular 20, Tailwind CSS, TipTap
- **Backend**: ASP.NET Core 8.0, Entity Framework Core
- **Database**: MSSQL Server 2022
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (frontend için)
