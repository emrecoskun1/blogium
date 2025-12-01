# 🚀 OAuth Hızlı Kurulum (5 Dakika)

Google ve Github ile giriş yapabilmek için aşağıdaki adımları izleyin.

## ✅ Adım 1: Google OAuth (2 dakika)

### 1. Google Cloud Console'a git
https://console.cloud.google.com/

### 2. Yeni Proje Oluştur
- "Select a project" → "New Project" → "Blogium" → Create

### 3. OAuth Consent Screen
- `APIs & Services` → `OAuth consent screen`
- **User Type**: External → Create
- **App name**: Blogium
- **User support email**: email@example.com
- **Developer contact**: email@example.com
- Save and Continue
- **Scopes**: Add → `userinfo.email` ve `userinfo.profile` seç → Update
- Save and Continue
- **Test users**: Email adresinizi ekleyin → Add → Save and Continue

### 4. Credentials Oluştur
- `Credentials` → `Create Credentials` → `OAuth client ID`
- **Application type**: Web application
- **Name**: Blogium Web
- **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
- Create

### 5. Client ID ve Secret'i Kopyala
```
Client ID: 123456789-abc.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxx
```

---

## ✅ Adım 2: Github OAuth (1 dakika)

### 1. GitHub Settings'e git
https://github.com/settings/developers

### 2. New OAuth App
- `OAuth Apps` → `New OAuth App`
- **Application name**: Blogium
- **Homepage URL**: `http://localhost:4200`
- **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
- Register application

### 3. Client Secret Oluştur
- `Generate a new client secret` → Kopyala

### 4. Client ID ve Secret'i Kopyala
```
Client ID: Iv1.abc123def456
Client Secret: a1b2c3d4...
```

---

## ✅ Adım 3: launchSettings.json Güncelle (1 dakika)

Dosya: `blogium-backend/Blogium.API/Properties/launchSettings.json`

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
        "GOOGLE_CLIENT_ID": "BURAYA-GOOGLE-CLIENT-ID-YAPIŞTIR",
        "GOOGLE_CLIENT_SECRET": "BURAYA-GOOGLE-CLIENT-SECRET-YAPIŞTIR",
        "GITHUB_CLIENT_ID": "BURAYA-GITHUB-CLIENT-ID-YAPIŞTIR",
        "GITHUB_CLIENT_SECRET": "BURAYA-GITHUB-CLIENT-SECRET-YAPIŞTIR",
        "FRONTEND_URL": "http://localhost:4200"
      }
    }
  }
}
```

**Değiştirmeniz gereken yerler:**
- `BURAYA-GOOGLE-CLIENT-ID-YAPIŞTIR` → Google Client ID
- `BURAYA-GOOGLE-CLIENT-SECRET-YAPIŞTIR` → Google Client Secret
- `BURAYA-GITHUB-CLIENT-ID-YAPIŞTIR` → Github Client ID
- `BURAYA-GITHUB-CLIENT-SECRET-YAPIŞTIR` → Github Client Secret

---

## ✅ Adım 4: Backend'i Yeniden Başlat (10 saniye)

```bash
cd blogium-backend/Blogium.API
dotnet run
```

Backend `http://localhost:5000` adresinde çalışacak.

---

## ✅ Adım 5: Test Et (10 saniye)

1. `http://localhost:4200/login` sayfasına git
2. "Google ile Giriş Yap" butonuna tıkla
3. Google hesabınla giriş yap
4. ✅ Ana sayfaya yönlendirileceksin!

Veya:

1. "Github ile Giriş Yap" butonuna tıkla  
2. Github hesabınla giriş yap
3. ✅ Ana sayfaya yönlendirileceksin!

---

## 🚨 Sorun mu var?

### "redirect_uri_mismatch" hatası
**Çözüm**: OAuth provider'da redirect URI'yi kontrol et:
- Google: `http://localhost:5000/api/auth/google/callback`
- Github: `http://localhost:5000/api/auth/github/callback`

### "invalid_client" hatası
**Çözüm**: Client ID ve Secret'i tekrar kontrol et. Boşluk olmamalı.

### Backend'i yeniden başlat
```bash
# Ctrl+C ile durdur
# Tekrar başlat
dotnet run
```

### Daha fazla bilgi için
`OAUTH_SETUP.md` dosyasına bakın (detaylı açıklamalar).

---

## 📋 Özet Checklist

- [ ] Google Cloud Console'da proje oluştur
- [ ] OAuth Consent Screen ayarla
- [ ] Google Credentials oluştur (Client ID + Secret)
- [ ] Github OAuth App oluştur (Client ID + Secret)
- [ ] launchSettings.json'a yapıştır
- [ ] Backend'i yeniden başlat
- [ ] Test et!

**Toplam süre: ~5 dakika** ⏱️
