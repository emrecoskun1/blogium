# Blogium Backend API

Modern blog platformu için .NET 8 Web API backend projesi.

## 🚀 Özellikler

- **Kimlik Doğrulama**: JWT tabanlı authentication
- **Makale Yönetimi**: CRUD işlemleri, favorileme, etiketleme
- **Kullanıcı Profilleri**: Takip sistemi, profil güncelleme
- **Yorumlar**: Makale yorumlama sistemi
- **Etiketler**: Kategorizasyon ve filtreleme
- **SQL Server**: İlişkisel veritabanı
- **Entity Framework Core**: ORM
- **Seed Data**: Hazır test verileri

## 📋 Gereksinimler

- .NET 8 SDK
- SQL Server (Docker ile veya local)
- Visual Studio 2022 / VS Code / Rider

## 🛠️ Kurulum

### 1. .NET SDK Kurulumu

macOS için:
```bash
brew install dotnet
```

Veya [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download) adresinden indirin.

### 2. SQL Server Kurulumu (Docker)

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Password1Strong." \
   -p 1433:1433 --name blogium-sql \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Projeyi Çalıştırma

```bash
cd Blogium.API

# NuGet paketlerini yükle
dotnet restore

# Veritabanı migration'ları çalıştır
dotnet ef database update

# Projeyi çalıştır
dotnet run
```

API: `https://localhost:7001`
Swagger: `https://localhost:7001/swagger`

## 📊 Veritabanı Yapısı

### Tablolar

- **Users**: Kullanıcı bilgileri
- **Articles**: Blog yazıları
- **Tags**: Etiketler
- **ArticleTags**: Makale-Etiket ilişkisi (Many-to-Many)
- **Comments**: Yorumlar
- **ArticleFavorites**: Favorilenen makaleler (Many-to-Many)
- **UserFollows**: Takip ilişkileri (Many-to-Many)

### Seed Data

Proje ilk çalıştırıldığında otomatik olarak şu veriler eklenir:
- 5 örnek kullanıcı
- 8 makale (gerçek içeriklerle)
- 15 tag
- 8 yorum
- Takip ve favori ilişkileri

## 🔗 API Endpoints

### Authentication

```
POST   /api/auth/register      - Yeni kullanıcı kaydı
POST   /api/auth/login          - Kullanıcı girişi
```

### Articles

```
GET    /api/articles                    - Tüm makaleleri listele
GET    /api/articles/{slug}             - Makale detayı
POST   /api/articles                    - Yeni makale oluştur (Auth)
PUT    /api/articles/{slug}             - Makale güncelle (Auth)
DELETE /api/articles/{slug}             - Makale sil (Auth)
POST   /api/articles/{slug}/favorite    - Favorile (Auth)
DELETE /api/articles/{slug}/favorite    - Favoriden çıkar (Auth)
```

Query Parameters:
- `limit`: Sayfa başına kayıt (default: 20)
- `offset`: Başlangıç pozisyonu (default: 0)
- `tag`: Etikete göre filtrele
- `author`: Yazara göre filtrele

### Users

```
GET    /api/users/{username}            - Kullanıcı profili
PUT    /api/users                       - Profil güncelle (Auth)
POST   /api/users/{username}/follow     - Takip et (Auth)
DELETE /api/users/{username}/follow     - Takibi bırak (Auth)
```

### Comments

```
GET    /api/articles/{slug}/comments       - Yorumları listele
POST   /api/articles/{slug}/comments       - Yorum ekle (Auth)
DELETE /api/articles/{slug}/comments/{id}  - Yorum sil (Auth)
```

### Tags

```
GET    /api/tags                        - Tüm etiketler
```

## 🔐 Authentication

JWT token kullanımı:

```bash
# 1. Login
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmet@blogium.com","password":"Password123!"}'

# 2. Token'ı al ve kullan
curl -X POST https://localhost:7001/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Yeni Makale","description":"Açıklama","body":"İçerik","tagList":["Teknoloji"]}'
```

## 📝 Örnek Request/Response

### Register

**Request:**
```json
POST /api/auth/register
{
  "username": "yeni_kullanici",
  "email": "yeni@blogium.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "id": 6,
  "username": "yeni_kullanici",
  "email": "yeni@blogium.com",
  "bio": null,
  "image": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Articles

**Request:**
```
GET /api/articles?limit=10&tag=Teknoloji
```

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "slug": "angular-20-de-yenilikler-ve-signals-api",
      "title": "Angular 20'de Yenilikler ve Signals API",
      "description": "Angular 20 ile gelen yeni özellikler...",
      "body": "Angular 20, modern web uygulamaları...",
      "image": "https://images.unsplash.com/...",
      "readTime": 8,
      "tagList": ["Teknoloji", "Yazılım", "Angular"],
      "createdAt": "2024-10-02T10:00:00Z",
      "updatedAt": null,
      "favorited": false,
      "favoritesCount": 3,
      "author": {
        "id": 1,
        "username": "ahmet_yazar",
        "bio": "Teknoloji ve yazılım geliştirme üzerine yazıyorum.",
        "image": "https://i.pravatar.cc/150?img=12",
        "following": false
      }
    }
  ],
  "articlesCount": 1
}
```

## 🧪 Test Kullanıcıları

Tüm kullanıcıların şifresi: `Password123!`

| Username      | Email                | Açıklama                |
|---------------|----------------------|-------------------------|
| ahmet_yazar   | ahmet@blogium.com    | Teknoloji yazarı        |
| zeynep_blogger| zeynep@blogium.com   | Seyahat blogger'ı       |
| mehmet_dev    | mehmet@blogium.com   | Full-stack developer    |
| ayse_tasarim  | ayse@blogium.com     | UI/UX tasarımcısı       |
| can_tech      | can@blogium.com      | AI uzmanı               |

## 🔧 Yapılandırma

`appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=blogium;User Id=SA;Password=Password1Strong.;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Secret": "BlogiumSecretKeyForJWTTokenGeneration2024!@#$",
    "Issuer": "Blogium.API",
    "Audience": "Blogium.Client",
    "ExpirationInMinutes": 1440
  }
}
```

## 📦 NuGet Paketleri

- `Microsoft.EntityFrameworkCore.SqlServer` - SQL Server provider
- `Microsoft.EntityFrameworkCore.Design` - EF Core tools
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT auth
- `BCrypt.Net-Next` - Password hashing
- `Swashbuckle.AspNetCore` - Swagger/OpenAPI

## 🏗️ Proje Yapısı

```
Blogium.API/
├── Controllers/          # API endpoints
│   ├── AuthController.cs
│   ├── ArticlesController.cs
│   ├── UsersController.cs
│   ├── CommentsController.cs
│   └── TagsController.cs
├── Data/                 # Database context ve seeder
│   ├── BlogiumDbContext.cs
│   └── DbSeeder.cs
├── DTOs/                 # Data Transfer Objects
│   ├── UserDtos.cs
│   ├── ArticleDtos.cs
│   └── CommentDtos.cs
├── Models/               # Database models
│   ├── User.cs
│   ├── Article.cs
│   ├── Tag.cs
│   ├── Comment.cs
│   ├── ArticleTag.cs
│   ├── ArticleFavorite.cs
│   └── UserFollow.cs
├── Services/             # Business logic
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IArticleService.cs
│   ├── ArticleService.cs
│   ├── IUserService.cs
│   ├── UserService.cs
│   ├── ICommentService.cs
│   └── CommentService.cs
├── Program.cs            # App configuration
└── appsettings.json      # Configuration
```

## 🚀 Production Deployment

### Docker ile çalıştırma

```bash
docker-compose up -d
```

### Migration komutları

```bash
# Yeni migration oluştur
dotnet ef migrations add InitialCreate

# Database güncelle
dotnet ef database update

# Migration geri al
dotnet ef database update PreviousMigrationName

# Database sil
dotnet ef database drop
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License

## 📧 İletişim

Sorularınız için: info@blogium.com
