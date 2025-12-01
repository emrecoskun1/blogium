using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Blogium.API.DTOs;
using System.ServiceModel.Syndication;
using System.Xml;
using Blogium.API.Data;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Blogium.API.Controllers
{
    [ApiController]
    [Route("api/import")]
    [Authorize]
    public class ImportController : ControllerBase
    {
        private readonly BlogiumDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ImportController> _logger;

        public ImportController(BlogiumDbContext db, IHttpClientFactory httpClientFactory, ILogger<ImportController> logger)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // Step 1: Generate verification code for user
        // Step 1: Validate Medium username and show preview of articles
        [HttpPost("medium/generate-code")]
        public async Task<IActionResult> GenerateMediumVerificationCode([FromBody] MediumUsernameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest(new { message = "Medium kullanıcı adı gerekli." });

            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            // Clean username (remove @ if exists)
            var username = dto.Username.TrimStart('@');

            try
            {
                // Fetch Medium RSS to validate username and show preview
                var httpClient = _httpClientFactory.CreateClient();
                var rssUrl = $"https://medium.com/feed/@{username}";
                var rssResponse = await httpClient.GetStringAsync(rssUrl);
                
                using var reader = XmlReader.Create(new StringReader(rssResponse));
                var feed = SyndicationFeed.Load(reader);
                
                if (feed == null || !feed.Items.Any())
                    return BadRequest(new { message = "Bu Medium kullanıcı adına ait makale bulunamadı. Lütfen kullanıcı adınızı kontrol edin." });

                // Get article count and titles for preview
                var articleCount = feed.Items.Count();
                var articleTitles = feed.Items.Take(5).Select(i => i.Title.Text).ToList();

                // Generate verification code
                var verificationCode = new Random().Next(100000, 999999).ToString();

                // Check if user exists
                var userExists = await _db.Users
                    .Where(u => u.Id == int.Parse(userId))
                    .Select(u => u.Id)
                    .FirstOrDefaultAsync();
                    
                if (userExists == 0)
                    return NotFound(new { message = "Kullanıcı bulunamadı." });

                // Store verification code
                await _db.Users
                    .Where(u => u.Id == int.Parse(userId))
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(u => u.VerificationCode, $"MEDIUM_{username}_{verificationCode}")
                        .SetProperty(u => u.VerificationCodeExpiry, DateTime.UtcNow.AddMinutes(30)));

                return Ok(new { 
                    verificationCode = verificationCode,
                    username = username,
                    articleCount = articleCount,
                    sampleArticles = articleTitles,
                    instructions = $"Medium hesabınız doğrulandı! {articleCount} makale bulundu. Doğrulama kodu: {verificationCode}. Bu kodu bir sonraki adımda kullanın."
                });
            }
            catch (HttpRequestException)
            {
                return BadRequest(new { message = $"Medium kullanıcısı '@{username}' bulunamadı. Lütfen kullanıcı adınızı kontrol edin." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Medium RSS validation error");
                return BadRequest(new { message = "Doğrulama sırasında hata oluştu." });
            }
        }

        // Step 2: Verify with code (simple confirmation)
        [HttpPost("medium/verify")]
        public async Task<IActionResult> VerifyMediumOwnership([FromBody] MediumUsernameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest(new { message = "Medium kullanıcı adı gerekli." });

            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var username = dto.Username.TrimStart('@');
            
            // Get user data with projection
            var userData = await _db.Users
                .Where(u => u.Id == int.Parse(userId))
                .Select(u => new 
                { 
                    u.Id, 
                    u.VerificationCode, 
                    u.VerificationCodeExpiry,
                    u.Bio
                })
                .FirstOrDefaultAsync();
                
            if (userData == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            // Check if verification code exists and not expired
            if (string.IsNullOrEmpty(userData.VerificationCode) || 
                !userData.VerificationCode.StartsWith("MEDIUM_") ||
                userData.VerificationCodeExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Doğrulama kodu bulunamadı veya süresi dolmuş. Lütfen yeni kod oluşturun." });
            }

            var storedData = userData.VerificationCode.Split('_');
            if (storedData.Length != 3 || storedData[1] != username)
            {
                return BadRequest(new { message = "Kullanıcı adı eşleşmiyor." });
            }

            // Verification successful! Update user without loading full entity
            var currentBio = userData.Bio ?? "";
            var newBio = currentBio.Contains($"@{username}") 
                ? currentBio 
                : currentBio + $" | Medium: @{username}";

            await _db.Users
                .Where(u => u.Id == userData.Id)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(u => u.Bio, newBio)
                    .SetProperty(u => u.VerificationCode, (string?)null)
                    .SetProperty(u => u.VerificationCodeExpiry, (DateTime?)null));

            return Ok(new { 
                verified = true,
                message = $"Medium hesabınız (@{username}) doğrulandı! Artık makalelerinizi aktarabilirsiniz.",
                username = username
            });
        }

        // Step 3: Import articles after verification
        [HttpPost("medium/import")]
        public async Task<IActionResult> ImportMediumArticles([FromBody] MediumUsernameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username))
                return BadRequest(new { message = "Medium kullanıcı adı gerekli." });

            string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var username = dto.Username.TrimStart('@');
            
            // Get user data with projection
            var userData = await _db.Users
                .Where(u => u.Id == int.Parse(userId))
                .Select(u => new 
                { 
                    u.Id, 
                    u.Bio,
                    u.Username
                })
                .FirstOrDefaultAsync();
                
            if (userData == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            // Check if user has verified this Medium account
            if (userData.Bio == null || !userData.Bio.Contains($"@{username}"))
            {
                return BadRequest(new { message = "Bu Medium hesabı doğrulanmamış. Lütfen önce hesabınızı doğrulayın." });
            }

            List<string> importedTitles = new();
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var rssUrl = $"https://medium.com/feed/@{username}";
                var rssResponse = await httpClient.GetStringAsync(rssUrl);
                
                using var reader = XmlReader.Create(new StringReader(rssResponse));
                var feed = SyndicationFeed.Load(reader);
                if (feed == null)
                    return BadRequest(new { message = "Medium RSS okunamadı." });

                foreach (var item in feed.Items)
                {
                    // Skip verification test articles
                    if (item.Title.Text.Length == 6 && int.TryParse(item.Title.Text, out _))
                        continue;

                    // Aynı başlık varsa atla
                    bool exists = await _db.Articles.AnyAsync(a => a.Title == item.Title.Text && a.AuthorId == userData.Id);
                    if (exists) continue;

                    // Get full content from RSS (Medium uses content:encoded)
                    string fullContent = string.Empty;
                    foreach (var extension in item.ElementExtensions)
                    {
                        if (extension.OuterName == "encoded" && extension.OuterNamespace.Contains("content"))
                        {
                            fullContent = extension.GetObject<string>();
                            break;
                        }
                    }

                    // Fallback to item.Content or Summary
                    if (string.IsNullOrEmpty(fullContent))
                    {
                        fullContent = item.Content is TextSyndicationContent tc ? tc.Text : (item.Summary?.Text ?? string.Empty);
                    }

                    // Extract first image from content if available
                    string? imageUrl = null;
                    if (!string.IsNullOrEmpty(fullContent))
                    {
                        var imgMatch = System.Text.RegularExpressions.Regex.Match(fullContent, @"<img[^>]+src=""([^""]+)""");
                        if (imgMatch.Success)
                        {
                            imageUrl = imgMatch.Groups[1].Value;
                        }
                    }

                    var article = new Article
                    {
                        Title = item.Title.Text,
                        Slug = GenerateSlug(item.Title.Text),
                        Description = item.Summary?.Text ?? string.Empty,
                        Body = fullContent,
                        Image = imageUrl,
                        CreatedAt = item.PublishDate.UtcDateTime,
                        UpdatedAt = item.LastUpdatedTime.UtcDateTime,
                        AuthorId = userData.Id,
                        IsPublished = true,
                        ViewCount = 0,
                        ReadTime = CalculateReadTime(fullContent)
                    };
                    _db.Articles.Add(article);
                    importedTitles.Add(article.Title);
                }
                await _db.SaveChangesAsync();
                return Ok(new { message = $"{importedTitles.Count} makale aktarıldı.", imported = importedTitles });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Medium import error");
                return BadRequest(new { message = "Medium makaleleri aktarılırken hata oluştu.", error = ex.Message });
            }
        }

        private static string GenerateSlug(string title)
        {
            return title.ToLower().Replace(" ", "-").Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u").Replace("ş", "s").Replace("ö", "o").Replace("ç", "c");
        }

        private static int CalculateReadTime(string content)
        {
            // Remove HTML tags
            var plainText = System.Text.RegularExpressions.Regex.Replace(content, "<.*?>", string.Empty);
            // Count words (average reading speed: 200 words per minute)
            var wordCount = plainText.Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries).Length;
            var readTime = (int)Math.Ceiling(wordCount / 200.0);
            return readTime > 0 ? readTime : 1;
        }
    }
}
