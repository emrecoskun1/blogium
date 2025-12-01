# OAuth Kurulum Kılavuzu

Bu dokümanda Google ve Github OAuth entegrasyonu için gerekli adımları bulabilirsiniz.

## 🔑 Google OAuth Kurulumu

### 1. Google Cloud Console'a Git
https://console.cloud.google.com/

### 2. Yeni Proje Oluştur (veya mevcut projeyi seç)
- Sol üst köşeden "Select a project" > "New Project"
- Proje adı: `Blogium` (veya istediğiniz isim)
- "Create" butonuna tıklayın

### 3. OAuth Consent Screen Ayarları
1. Sol menüden `APIs & Services` > `OAuth consent screen`
2. **User Type**: "External" seçin > "Create"
3. Bilgileri doldurun:
   - **App name**: Blogium
   - **User support email**: Email adresiniz
   - **Developer contact**: Email adresiniz
4. "Save and Continue"
5. **Scopes**: `Add or Remove Scopes`
   - `.../auth/userinfo.email` seçin
   - `.../auth/userinfo.profile` seçin
   - "Update" > "Save and Continue"
6. **Test users**: Email adresinizi ekleyin (development için)
7. "Save and Continue"

### 4. Credentials Oluştur
1. Sol menüden `Credentials` > `Create Credentials` > `OAuth client ID`
2. **Application type**: "Web application"
3. **Name**: Blogium Web Client
4. **Authorized JavaScript origins**:
   - `http://localhost:5000`
   - `http://localhost:4200`
5. **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
6. "Create" butonuna tıklayın

### 5. Client ID ve Secret'i Kopyalayın
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

Bu bilgileri `launchSettings.json` veya environment variables'a ekleyin (aşağıda açıklanmıştır).

---

## 🐙 Github OAuth Kurulumu

### 1. GitHub Settings'e Git
https://github.com/settings/developers

### 2. New OAuth App
1. `OAuth Apps` > `New OAuth App` (veya `Register a new application`)
2. Bilgileri doldurun:
   - **Application name**: Blogium
   - **Homepage URL**: `http://localhost:4200`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
3. "Register application" butonuna tıklayın

### 3. Client ID ve Secret Oluştur
1. **Client ID** otomatik görünür
2. `Generate a new client secret` butonuna tıklayın
3. **Client Secret**'i kopyalayın (bir daha gösterilmez!)

### 4. Client ID ve Secret'i Kopyalayın
- **Client ID**: `Iv1.abc123def456`
- **Client Secret**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

---

## ⚙️ Backend Konfigürasyonu

### Yöntem 1: launchSettings.json (Önerilen - Development)

`Properties/launchSettings.json` dosyasını açın ve `environmentVariables` bölümüne ekleyin:

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "GOOGLE_CLIENT_ID": "123456789-abc.apps.googleusercontent.com",
        "GOOGLE_CLIENT_SECRET": "GOCSPX-xxxxxxxxxxxxx",
        "GITHUB_CLIENT_ID": "Iv1.abc123def456",
        "GITHUB_CLIENT_SECRET": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
        "FRONTEND_URL": "http://localhost:4200"
      }
    }
  }
}
```

### Yöntem 2: appsettings.Development.json (Alternatif)

**⚠️ DİKKAT: Bu dosyayı git'e eklemeyin!**

```json
{
  "OAuth": {
    "Google": {
      "ClientId": "123456789-abc.apps.googleusercontent.com",
      "ClientSecret": "GOCSPX-xxxxxxxxxxxxx"
    },
    "Github": {
      "ClientId": "Iv1.abc123def456",
      "ClientSecret": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
    }
  },
  "Frontend": {
    "Url": "http://localhost:4200"
  }
}
```

Bu durumda `AuthController.cs` ve `ImportController.cs` dosyalarındaki şu satırları değiştirin:

```csharp
// Eski:
var clientId = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") ?? "";

// Yeni:
var clientId = builder.Configuration["OAuth:Google:ClientId"] ?? "";
```

### Yöntem 3: User Secrets (En Güvenli - Development)

```bash
cd Blogium.API
dotnet user-secrets init
dotnet user-secrets set "OAuth:Google:ClientId" "123456789-abc.apps.googleusercontent.com"
dotnet user-secrets set "OAuth:Google:ClientSecret" "GOCSPX-xxxxxxxxxxxxx"
dotnet user-secrets set "OAuth:Github:ClientId" "Iv1.abc123def456"
dotnet user-secrets set "OAuth:Github:ClientSecret" "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

---

## 🌐 Frontend Konfigürasyonu

Frontend için herhangi bir değişiklik gerekmez. OAuth akışı backend tarafından yönetilir.

---

## ✅ Test Etme

### 1. Backend'i Çalıştırın
```bash
cd blogium-backend/Blogium.API
dotnet run
```

Backend `http://localhost:5000` adresinde çalışmalı.

### 2. Frontend'i Çalıştırın
```bash
cd blogium-frontend
npm start
```

Frontend `http://localhost:4200` adresinde çalışmalı.

### 3. Login Sayfasını Test Edin

1. `http://localhost:4200/login` adresine gidin
2. "Sign in with Google" butonuna tıklayın
3. Google ile giriş yapın
4. Otomatik olarak ana sayfaya yönlendirilmelisiniz

Veya:

1. "Sign in with Github" butonuna tıklayın
2. Github ile giriş yapın
3. Otomatik olarak ana sayfaya yönlendirilmelisiniz

---

## 🚨 Sık Karşılaşılan Hatalar

### Hata: "redirect_uri_mismatch"
**Çözüm**: OAuth provider'da (Google/Github) kayıtlı redirect URI'yi kontrol edin:
- Google: `http://localhost:5000/api/auth/google/callback`
- Github: `http://localhost:5000/api/auth/github/callback`

### Hata: "invalid_client"
**Çözüm**: Client ID ve Secret'in doğru olduğundan emin olun. Boşluk veya yanlış karakter olabilir.

### Hata: "Access blocked: This app's request is invalid"
**Çözüm**: Google OAuth Consent Screen'de email scope'unu ekleyin.

### Hata: OAuth çalışıyor ama kullanıcı oluşturulmuyor
**Çözüm**: `User` modelindeki `PasswordHash` nullable olmalı:
```csharp
public string? PasswordHash { get; set; }
```

---

## 🔒 Production Deployment

Production ortamında:

1. **Environment Variables** kullanın (Azure, AWS, Heroku, etc.)
2. **Redirect URIs** güncelleyin:
   - `https://yourdomain.com/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/github/callback`
3. **FRONTEND_URL** güncelleyin:
   - `https://yourdomain.com`
4. **OAuth Consent Screen** "External" ise yayına alın (Google)
5. **CORS** ayarlarını production domain'iniz ile güncelleyin

---

## 📞 Destek

Sorun yaşarsanız:
1. Backend log'larını kontrol edin
2. Browser console'da hata var mı bakın
3. Network tab'da OAuth callback'i kontrol edin
4. Environment variable'ların doğru yüklendiğini kontrol edin:
   ```csharp
   Console.WriteLine($"Google Client ID: {Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID")}");
   ```
