# 1000 Makale Oluşturma - Hızlı Başlangıç

## Adım 1: Test Kullanıcısı Oluşturun

Tarayıcıda http://localhost:4200/register adresine gidin ve şu bilgilerle kayıt olun:

```
Username: testuser
Email: test@example.com
Password: test123
```

**VEYA** kendi bilgilerinizi kullanmak için:

`scripts/seed-articles.ts` dosyasını açın ve 28. satırdaki bilgileri güncelleyin:

```typescript
const TEST_USER = {
  email: 'sizin@email.com',    // Burası sizin emailiniz
  password: 'sizin-sifreniz'    // Burası sizin şifreniz
};
```

## Adım 2: Backend ve Frontend'in Çalıştığından Emin Olun

### Backend:
```bash
cd ../blogium-backend/Blogium.API
~/.dotnet/dotnet run
```

Backend şu adreste çalışmalı: http://localhost:5000

### Frontend:
```bash
cd /Users/yunusemrecoskun/Desktop/blogium
npm start
```

Frontend şu adreste çalışmalı: http://localhost:4200

## Adım 3: Script'i Çalıştırın

Yeni bir terminal açın ve:

### 1000 makale oluştur:
```bash
cd /Users/yunusemrecoskun/Desktop/blogium
npm run seed
```

### Veya daha az makale:
```bash
npm run seed:100    # 100 makale
npm run seed:500    # 500 makale
```

### Özel sayıda:
```bash
npx ts-node scripts/seed-articles.ts 250
```

## Beklenen Çıktı

```
🌱 Starting to seed 1000 articles...

🔐 Logging in...
✅ Logged in as testuser

📝 Created 50/1000 articles...
📝 Created 100/1000 articles...
📝 Created 150/1000 articles...
...
📝 Created 1000/1000 articles...

✅ Seeding complete!
   - Successfully created: 1000 articles
   - Failed: 0 articles
```

## Adım 4: Pagination'ı Test Edin

Script tamamlandıktan sonra:

1. http://localhost:4200 - Ana sayfa pagination
2. Sayfa numaralarına tıklayın
3. Farklı tag'lere tıklayın (`javascript`, `typescript`, `react`, vb.)
4. Profile sayfanıza gidin - makalelerinizi görün

## Sorun Giderme

### "Login failed" hatası
- Kullanıcı bilgilerini kontrol edin (email ve şifre doğru mu?)
- Backend çalışıyor mu? (`http://localhost:5000/api/users/login` test edin)

### "Failed to create article" hatası
- Token geçerli mi? (Script yeniden login yapıyor)
- Backend'de hata var mı? (Backend console'u kontrol edin)
- Validation kurallarını karşılıyor mu? (Title 3+, Description 10+, Body 50+ karakter)

### Script çok yavaş
- Batch size'ı artırabilirsiniz: `scripts/seed-articles.ts` dosyasında 223. satır:
  ```typescript
  const batchSize = 20; // 10'dan 20'ye çıkarın
  ```

### Database hatası
- Veritabanı kapasitesi dolu olabilir
- SQL Server çalışıyor mu kontrol edin

## Temizleme

Test sonrası tüm makaleleri silmek için veritabanını sıfırlayın:

```bash
cd ../blogium-backend/Blogium.API
~/.dotnet/dotnet ef database drop --force
~/.dotnet/dotnet ef database update
```

Sonra yeni kullanıcı kayıt edin ve tekrar test edin!
