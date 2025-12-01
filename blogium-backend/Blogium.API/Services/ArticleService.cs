using Blogium.API.Data;
using Blogium.API.DTOs;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Blogium.API.Services;

public class ArticleService : IArticleService
{
    private readonly BlogiumDbContext _context;
    private readonly INotificationService _notificationService;

    public ArticleService(BlogiumDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ArticleListDto> GetArticlesAsync(int? limit = null, int? offset = null, string? tag = null, string? author = null, string? favorited = null, string? search = null, int? userId = null)
    {
        // Build query with filters but without Include to avoid SqlNullValueException
        var query = _context.Articles.AsQueryable();

        // Filter by search term
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(a => 
                a.Title.ToLower().Contains(searchLower) || 
                a.Description.ToLower().Contains(searchLower) ||
                a.Body.ToLower().Contains(searchLower) ||
                a.Author.Username.ToLower().Contains(searchLower)
            );
        }

        // Filter by tag
        if (!string.IsNullOrEmpty(tag))
        {
            query = query.Where(a => a.ArticleTags.Any(at => at.Tag.Name == tag));
        }

        // Filter by author
        if (!string.IsNullOrEmpty(author))
        {
            query = query.Where(a => a.Author.Username == author);
        }

        // Filter by favorited user
        if (!string.IsNullOrEmpty(favorited))
        {
            query = query.Where(a => a.FavoritedBy.Any(f => f.User.Username == favorited));
        }

        var totalCount = await query.CountAsync();

        // Apply pagination and project to anonymous type
        IQueryable<Article> articlesQuery = query.OrderByDescending(a => a.CreatedAt);
        
        if (offset.HasValue)
        {
            articlesQuery = articlesQuery.Skip(offset.Value);
        }

        if (limit.HasValue)
        {
            articlesQuery = articlesQuery.Take(limit.Value);
        }

        var articlesData = await articlesQuery
            .Select(a => new
            {
                a.Id,
                a.Slug,
                a.Title,
                a.Description,
                a.Body,
                a.Image,
                a.ReadTime,
                a.CreatedAt,
                a.UpdatedAt,
                AuthorId = a.Author.Id,
                AuthorUsername = a.Author.Username ?? string.Empty,
                AuthorBio = a.Author.Bio,
                AuthorImage = a.Author.Image,
                Tags = a.ArticleTags.Select(at => at.Tag.Name).ToList(),
                FavoriteCount = a.FavoritedBy.Count,
                FavoritedByUser = userId.HasValue && a.FavoritedBy.Any(f => f.UserId == userId.Value)
            })
            .ToListAsync();

        // Get following status for all authors if user is logged in
        Dictionary<int, bool> followingStatus = new();
        if (userId.HasValue)
        {
            var authorIds = articlesData.Select(a => a.AuthorId).Distinct().ToList();
            var followings = await _context.UserFollows
                .Where(uf => uf.FollowerId == userId.Value && authorIds.Contains(uf.FollowingId))
                .Select(uf => uf.FollowingId)
                .ToListAsync();
            followingStatus = authorIds.ToDictionary(id => id, id => followings.Contains(id));
        }

        var articleDtos = articlesData.Select(a => new ArticleDto
        {
            Id = a.Id,
            Slug = a.Slug,
            Title = a.Title,
            Description = a.Description,
            Body = a.Body,
            Image = a.Image,
            ReadTime = a.ReadTime,
            TagList = a.Tags,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt,
            Favorited = a.FavoritedByUser,
            FavoritesCount = a.FavoriteCount,
            Author = new AuthorDto
            {
                Id = a.AuthorId,
                Username = a.AuthorUsername,
                Bio = a.AuthorBio,
                Image = a.AuthorImage,
                Following = userId.HasValue && followingStatus.GetValueOrDefault(a.AuthorId, false)
            }
        }).ToList();

        return new ArticleListDto
        {
            Articles = articleDtos,
            ArticlesCount = totalCount
        };
    }

    public async Task<ArticleDto> GetArticleBySlugAsync(string slug, int? userId = null)
    {
        // Use anonymous projection to avoid SqlNullValueException with OAuth users
        var articleData = await _context.Articles
            .Where(a => a.Slug == slug)
            .Select(a => new
            {
                a.Id,
                a.Slug,
                a.Title,
                a.Description,
                a.Body,
                a.Image,
                a.ReadTime,
                a.CreatedAt,
                a.UpdatedAt,
                AuthorId = a.Author.Id,
                AuthorUsername = a.Author.Username ?? string.Empty,
                AuthorBio = a.Author.Bio,
                AuthorImage = a.Author.Image,
                Tags = a.ArticleTags.Select(at => at.Tag.Name).ToList(),
                FavoriteCount = a.FavoritedBy.Count,
                FavoritedByUser = userId.HasValue && a.FavoritedBy.Any(f => f.UserId == userId.Value)
            })
            .FirstOrDefaultAsync();

        if (articleData == null)
        {
            throw new Exception("Article not found");
        }

        // Check if current user follows the author
        bool isFollowing = false;
        if (userId.HasValue)
        {
            isFollowing = await _context.UserFollows
                .AnyAsync(uf => uf.FollowerId == userId.Value && uf.FollowingId == articleData.AuthorId);
        }

        return new ArticleDto
        {
            Id = articleData.Id,
            Slug = articleData.Slug,
            Title = articleData.Title,
            Description = articleData.Description,
            Body = articleData.Body,
            Image = articleData.Image,
            ReadTime = articleData.ReadTime,
            TagList = articleData.Tags,
            CreatedAt = articleData.CreatedAt,
            UpdatedAt = articleData.UpdatedAt,
            Favorited = articleData.FavoritedByUser,
            FavoritesCount = articleData.FavoriteCount,
            Author = new AuthorDto
            {
                Id = articleData.AuthorId,
                Username = articleData.AuthorUsername,
                Bio = articleData.AuthorBio,
                Image = articleData.AuthorImage,
                Following = isFollowing
            }
        };
    }

    public async Task<ArticleDto> CreateArticleAsync(CreateArticleDto createDto, int authorId)
    {
        var slug = GenerateSlug(createDto.Title);

        // Ensure slug is unique
        var existingSlug = await _context.Articles.FirstOrDefaultAsync(a => a.Slug == slug);
        if (existingSlug != null)
        {
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";
        }

        var article = new Article
        {
            Title = createDto.Title,
            Slug = slug,
            Description = createDto.Description,
            Body = createDto.Body,
            Image = createDto.Image,
            ReadTime = CalculateReadTime(createDto.Body),
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        // Add tags
        if (createDto.TagList.Any())
        {
            await AddTagsToArticleAsync(article.Id, createDto.TagList);
        }

        return await GetArticleBySlugAsync(slug, authorId);
    }

    public async Task<ArticleDto> UpdateArticleAsync(string slug, UpdateArticleDto updateDto, int userId)
    {
        var article = await _context.Articles
            .Include(a => a.ArticleTags)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        if (article.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to update this article");
        }

        // Update fields
        if (!string.IsNullOrEmpty(updateDto.Title))
        {
            article.Title = updateDto.Title;
            article.Slug = GenerateSlug(updateDto.Title);
        }

        if (!string.IsNullOrEmpty(updateDto.Description))
        {
            article.Description = updateDto.Description;
        }

        if (!string.IsNullOrEmpty(updateDto.Body))
        {
            article.Body = updateDto.Body;
            article.ReadTime = CalculateReadTime(updateDto.Body);
        }

        if (updateDto.Image != null)
        {
            article.Image = updateDto.Image;
        }

        article.UpdatedAt = DateTime.UtcNow;

        // Update tags if provided
        if (updateDto.TagList != null)
        {
            _context.ArticleTags.RemoveRange(article.ArticleTags);
            await _context.SaveChangesAsync();
            await AddTagsToArticleAsync(article.Id, updateDto.TagList);
        }

        await _context.SaveChangesAsync();

        return await GetArticleBySlugAsync(article.Slug, userId);
    }

    public async Task DeleteArticleAsync(string slug, int userId)
    {
        var article = await _context.Articles.FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        if (article.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this article");
        }

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();
    }

    public async Task<ArticleDto> FavoriteArticleAsync(string slug, int userId)
    {
        var article = await _context.Articles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        var existingFavorite = await _context.ArticleFavorites
            .FirstOrDefaultAsync(af => af.ArticleId == article.Id && af.UserId == userId);

        if (existingFavorite == null)
        {
            _context.ArticleFavorites.Add(new ArticleFavorite
            {
                ArticleId = article.Id,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Create notification for article author
            var user = await _context.Users.FindAsync(userId);
            if (user != null && article.AuthorId != userId)
            {
                await _notificationService.CreateNotificationAsync(
                    article.AuthorId,
                    "article_favorited",
                    $"{user.Username} makalenizi beğendi",
                    article.Id,
                    userId
                );
            }
        }

        return await GetArticleBySlugAsync(slug, userId);
    }

    public async Task<ArticleDto> UnfavoriteArticleAsync(string slug, int userId)
    {
        var article = await _context.Articles.FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        var favorite = await _context.ArticleFavorites
            .FirstOrDefaultAsync(af => af.ArticleId == article.Id && af.UserId == userId);

        if (favorite != null)
        {
            _context.ArticleFavorites.Remove(favorite);
            await _context.SaveChangesAsync();
        }

        return await GetArticleBySlugAsync(slug, userId);
    }

    public async Task<List<string>> GetTagsAsync()
    {
        return await _context.Tags
            .OrderBy(t => t.Name)
            .Select(t => t.Name)
            .ToListAsync();
    }

    // Helper methods
    private ArticleDto MapToArticleDto(Article article, int? userId)
    {
        var isFollowing = false;
        if (userId.HasValue)
        {
            isFollowing = _context.UserFollows
                .Any(uf => uf.FollowerId == userId.Value && uf.FollowingId == article.AuthorId);
        }

        return new ArticleDto
        {
            Id = article.Id,
            Slug = article.Slug,
            Title = article.Title,
            Description = article.Description,
            Body = article.Body,
            Image = article.Image,
            ReadTime = article.ReadTime,
            TagList = article.ArticleTags.Select(at => at.Tag.Name).ToList(),
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt,
            Favorited = userId.HasValue && article.FavoritedBy.Any(f => f.UserId == userId.Value),
            FavoritesCount = article.FavoritedBy.Count,
            Author = new AuthorDto
            {
                Id = article.Author.Id,
                Username = article.Author.Username,
                Bio = article.Author.Bio,
                Image = article.Author.Image,
                Following = isFollowing
            }
        };
    }

    private async Task AddTagsToArticleAsync(int articleId, List<string> tagNames)
    {
        foreach (var tagName in tagNames)
        {
            var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
            
            if (tag == null)
            {
                tag = new Tag { Name = tagName };
                _context.Tags.Add(tag);
                await _context.SaveChangesAsync();
            }

            _context.ArticleTags.Add(new ArticleTag
            {
                ArticleId = articleId,
                TagId = tag.Id
            });
        }

        await _context.SaveChangesAsync();
    }

    private string GenerateSlug(string title)
    {
        // Convert to lowercase
        var slug = title.ToLowerInvariant();

        // Replace Turkish characters
        slug = slug.Replace("ı", "i")
                   .Replace("ğ", "g")
                   .Replace("ü", "u")
                   .Replace("ş", "s")
                   .Replace("ö", "o")
                   .Replace("ç", "c");

        // Remove invalid characters
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");

        // Replace spaces with hyphens
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

        // Remove consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");

        return slug;
    }

    private int CalculateReadTime(string body)
    {
        // Average reading speed: 200 words per minute
        var wordCount = body.Split(new[] { ' ', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;
        var readTime = (int)Math.Ceiling(wordCount / 200.0);
        return Math.Max(1, readTime); // Minimum 1 minute
    }
}
