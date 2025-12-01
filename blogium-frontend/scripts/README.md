# Article Seeding Script

Bu script, pagination sistemini test etmek için otomatik olarak çok sayıda makale oluşturur.

## Kurulum

1. Gerekli paketi yükleyin:
```bash
npm install
```

## Kullanım

### 1. Test Kullanıcısı Oluşturun

Öncelikle uygulamada bir test kullanıcısı kayıt edin:
- Email: `test@example.com`
- Password: `test123`

Veya `scripts/seed-articles.ts` dosyasındaki `TEST_USER` sabitini kendi kullanıcı bilgilerinizle güncelleyin.

### 2. Backend Çalıştırın

Backend'in çalıştığından emin olun:
```bash
cd ../blogium-backend/Blogium.API
dotnet run
```

Backend URL'i: `http://localhost:5000`

### 3. Script'i Çalıştırın

#### 1000 makale oluştur (varsayılan):
```bash
npm run seed
```

#### 100 makale oluştur:
```bash
npm run seed:100
```

#### 500 makale oluştur:
```bash
npm run seed:500
```

#### Özel sayıda makale:
```bash
npm run seed -- 250
```

## Script Özellikleri

- ✅ **40 farklı başlık şablonu** - JavaScript, TypeScript, React, Angular, Docker, Kubernetes, vb.
- ✅ **10 farklı açıklama varyasyonu**
- ✅ **20 farklı tag kombinasyonu** - programming, web, backend, frontend, devops, vb.
- ✅ **5 farklı örnek görsel** - Unsplash'ten profesyonel görüntüler
- ✅ **Zengin içerik** - Her makale başlıklar, paragraflar, kod örnekleri içerir
- ✅ **Toplu işlem** - 10'ar makale gruplarında oluşturur
- ✅ **İlerleme göstergesi** - Her 50 makalede bir durum raporu
- ✅ **Hata yönetimi** - Başarısız istekleri loglar ve devam eder

## Çıktı Örneği

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

## Oluşturulan İçerik

Her makale şunları içerir:

### Başlık
```
Understanding JavaScript Closures - Part 1
Understanding JavaScript Closures - Part 2
...
```

### Açıklama
```
A comprehensive guide to mastering this important concept (Article #1)
```

### İçerik
- Başlık ve giriş
- Ana içerik bölümü
- 5 maddelik liste
- Kod örneği
- Sonuç
- Kaynaklar listesi

### Minimum 50 karakter body gereksinimi karşılanır ✅

### Tags
```javascript
['javascript', 'programming', 'web']
['typescript', 'javascript', 'types']
['nodejs', 'backend', 'api']
...
```

### Görsel
Unsplash'ten profesyonel kodlama/teknoloji görselleri

## Performans

- **Batch size**: 10 makale/batch
- **Delay**: 100ms batch'ler arası
- **Ortalama hız**: ~50-100 makale/saniye (sunucu performansına bağlı)
- **1000 makale**: ~10-20 saniye

## Troubleshooting

### "Login failed" hatası
- Kullanıcı bilgilerini kontrol edin
- Backend'in çalıştığından emin olun
- `scripts/seed-articles.ts` dosyasındaki `TEST_USER` bilgilerini güncelleyin

### "Failed to create article" hatası
- Token'ın geçerli olduğundan emin olun
- Backend loglarını kontrol edin
- API endpoint'lerinin doğru olduğunu kontrol edin

### Port hatası
- Backend'in 5000 portunda çalıştığından emin olun
- Gerekirse `scripts/seed-articles.ts` dosyasındaki `API_URL` değişkenini güncelleyin

## Test Senaryoları

Script'i çalıştırdıktan sonra şunları test edebilirsiniz:

1. **Home page pagination** - `/` sayfasında sayfalama
2. **Tag filtering** - `/tag/javascript` gibi tag sayfalarında filtreleme
3. **Author filtering** - `/profile/username` sayfasında yazar filtreleme
4. **Search** - Arama işlevselliği
5. **Performance** - Büyük veri setleriyle performans
6. **Infinite scroll** - Eğer implemente edilmişse
7. **Loading states** - Yükleme animasyonları

## Temizleme

Test sonrası verileri temizlemek için:

1. Veritabanını sıfırlayın
2. Veya manuel olarak makaleleri silin
3. Veya migration'ları yeniden çalıştırın

```bash
cd ../blogium-backend/Blogium.API
dotnet ef database drop
dotnet ef database update
```
