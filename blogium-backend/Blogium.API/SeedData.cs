using Blogium.API.Data;
using Blogium.API.Models;

namespace Blogium.API;

public static class SeedData
{
    private static readonly string[] FirstNames = {
        "Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Veli", "Zeynep", "Can", "Ece", "Deniz",
        "Burak", "Selin", "Kemal", "Elif", "Emre", "Yağmur", "Oğuz", "Nur", "Cem", "Gizem"
    };

    private static readonly string[] LastNames = {
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
        "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek"
    };

    private static readonly string[] ArticleTitles = {
        "Yazılım Geliştirmede En İyi Pratikler",
        "Modern Web Teknolojileri ve Geleceği",
        "Makine Öğrenmesine Giriş",
        "Veri Bilimi için Python",
        "React ile Uygulama Geliştirme",
        "Angular Framework Rehberi",
        "Veritabanı Optimizasyon Teknikleri",
        "Cloud Computing ve Avantajları",
        "Siber Güvenlik İpuçları",
        "Mobil Uygulama Geliştirme",
        "DevOps Kültürü ve Uygulamaları",
        "Mikroservis Mimarisi",
        "API Tasarımı En İyi Pratikler",
        "Test Driven Development",
        "Agile Metodolojileri",
        "Scrum ile Proje Yönetimi",
        "Git ve Version Control",
        "Docker ve Containerization",
        "Kubernetes Orchestration",
        "Blockchain Teknolojisi",
        "Yapay Zeka ve İş Dünyası",
        "IoT ve Akıllı Cihazlar",
        "5G Teknolojisi",
        "Quantum Computing",
        "AR ve VR Uygulamaları",
        "Big Data Analytics",
        "Clean Code Prensipleri",
        "Design Patterns",
        "SOLID Prensipleri",
        "Refactoring Teknikleri"
    };

    private static readonly string[] Tags = {
        "programming", "web-development", "machine-learning", "data-science", "python",
        "javascript", "react", "angular", "dotnet", "csharp", "database", "cloud",
        "security", "mobile", "devops", "testing", "agile", "architecture", "ai"
    };

    public static async Task InitializeAsync(BlogiumDbContext context)
    {
        // Eğer zaten makale varsa seed yapma
        if (context.Articles.Any())
        {
            return;
        }

        var random = new Random();

        // 20 kullanıcı oluştur
        var users = new List<User>();
        for (int i = 0; i < 20; i++)
        {
            var firstName = FirstNames[random.Next(FirstNames.Length)];
            var lastName = LastNames[random.Next(LastNames.Length)];
            var username = $"{firstName.ToLower()}{lastName.ToLower()}{i}";

            var user = new User
            {
                Username = username,
                Email = $"{username}@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Bio = $"Merhaba! Ben {firstName} {lastName}. Yazılım geliştirme ve teknoloji hakkında yazıyorum.",
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 365))
            };

            users.Add(user);
        }

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Tag'leri oluştur
        var tagEntities = new List<Tag>();
        foreach (var tagName in Tags)
        {
            tagEntities.Add(new Tag { Name = tagName });
        }
        context.Tags.AddRange(tagEntities);
        await context.SaveChangesAsync();

        // 1000 makale oluştur
        var articles = new List<Article>();
        for (int i = 0; i < 1000; i++)
        {
            var author = users[random.Next(users.Count)];
            var titleBase = ArticleTitles[random.Next(ArticleTitles.Length)];
            var title = $"{titleBase} - Bölüm {i + 1}";
            var slug = GenerateSlug(title);

            var article = new Article
            {
                Title = title,
                Slug = slug,
                Description = $"Bu makale {titleBase.ToLower()} konusunda detaylı bilgi içermektedir. Öğrenmek isteyenler için ideal bir kaynak.",
                Body = GenerateArticleBody(titleBase, i + 1),
                AuthorId = author.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 365)).AddHours(-random.Next(0, 24)),
                UpdatedAt = null
            };

            articles.Add(article);
        }

        context.Articles.AddRange(articles);
        await context.SaveChangesAsync();

        // Makalelere tag'ler ekle
        foreach (var article in articles)
        {
            var tagCount = random.Next(2, 5); // Her makaleye 2-4 tag
            var selectedTags = tagEntities.OrderBy(x => random.Next()).Take(tagCount);

            foreach (var tag in selectedTags)
            {
                context.ArticleTags.Add(new ArticleTag
                {
                    ArticleId = article.Id,
                    TagId = tag.Id
                });
            }
        }

        await context.SaveChangesAsync();

        // Rastgele yorumlar ekle
        for (int i = 0; i < 200; i++)
        {
            var user = users[random.Next(users.Count)];
            var article = articles[random.Next(articles.Count)];

            // Yorum ekle
            if (random.Next(0, 3) == 0)  // %33 şans
            {
                context.Comments.Add(new Comment
                {
                    Body = GenerateComment(),
                    ArticleId = article.Id,
                    AuthorId = user.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 30))
                });
            }
        }

        await context.SaveChangesAsync();
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLower()
            .Replace(" ", "-")
            .Replace("ı", "i")
            .Replace("ğ", "g")
            .Replace("ü", "u")
            .Replace("ş", "s")
            .Replace("ö", "o")
            .Replace("ç", "c");

        // Özel karakterleri temizle
        slug = new string(slug.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());

        return slug + "-" + Guid.NewGuid().ToString("N").Substring(0, 8);
    }

    private static string GenerateArticleBody(string topic, int partNumber)
    {
        return $@"# {topic} - Bölüm {partNumber}

## Giriş

Bu makalede {topic.ToLower()} konusunu detaylı bir şekilde inceleyeceğiz. Bu bölüm, konuyu anlamak için önemli temel bilgileri içermektedir.

## Ana Konular

### 1. Temel Kavramlar

{topic} ile çalışırken bilmeniz gereken temel kavramları burada bulabilirsiniz. Bu kavramlar, ileride karşılaşacağınız daha karmaşık konuları anlamanızı kolaylaştıracaktır.

### 2. Pratik Uygulamalar

Teorik bilgilerin yanı sıra, pratik uygulamalar da oldukça önemlidir. Bu bölümde gerçek dünya örnekleri üzerinden konuyu pekiştireceğiz.

### 3. İleri Seviye Teknikler

Temel kavramları öğrendikten sonra, daha ileri seviye tekniklere geçebiliriz. Bu teknikler, profesyonel projelerde kullanılabilecek düzeydedir.

## Sonuç

{topic} konusu, modern teknoloji dünyasında oldukça önemli bir yere sahiptir. Bu makalede öğrendiğiniz bilgiler, kariyerinizde size büyük avantajlar sağlayacaktır.

Bir sonraki bölümde, daha detaylı örnekler ve uygulamalar göreceğiz. Takipte kalın!

## Kaynaklar

- Resmi dokümantasyon
- Topluluk forumları
- Açık kaynak projeler
- Video eğitimler

*Bu makale Blogium platformunda yayınlanmıştır.*";
    }

    private static string GenerateComment()
    {
        var comments = new string[]
        {
            "Harika bir makale olmuş, teşekkürler!",
            "Çok faydalı bilgiler, eline sağlık.",
            "Bu konuyu merak ediyordum, tam zamanında geldi.",
            "Detaylı anlatım için teşekkürler.",
            "Örnekler çok açıklayıcı olmuş.",
            "Bir sonraki bölümü sabırsızlıkla bekliyorum.",
            "Bu bilgileri proje kullanacağım, süper!",
            "Çok iyi açıklamışsınız, elinize sağlık.",
            "Başlangıç seviyesi için ideal bir kaynak.",
            "İleri seviye teknikler bölümü çok faydalı.",
            "Öğretici ve anlaşılır bir anlatım.",
            "Kaynak önerileri için ayrıca teşekkürler.",
            "Bu tarz içerikler çok değerli.",
            "Paylaşım için teşekkürler!",
            "Çok şey öğrendim, harika!"
        };

        var random = new Random();
        return comments[random.Next(comments.Length)];
    }
}
