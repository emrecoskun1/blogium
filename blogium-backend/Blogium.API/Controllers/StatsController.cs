using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Blogium.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Blogium.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly BlogiumDbContext _context;
    private readonly ILogger<StatsController> _logger;

    public StatsController(BlogiumDbContext context, ILogger<StatsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetUserStats()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // Get basic stats using efficient projections (no Include)
            var articleStats = await _context.Articles
                .Where(a => a.AuthorId == userId)
                .AsNoTracking()
                .Select(a => new
                {
                    a.Id,
                    a.Slug,
                    a.Title,
                    a.CreatedAt,
                    a.ViewCount,
                    a.ReadTime,
                    FavoritesCount = _context.ArticleFavorites.Count(f => f.ArticleId == a.Id),
                    CommentsCount = _context.Comments.Count(c => c.ArticleId == a.Id)
                })
                .ToListAsync();

            // Calculate summary stats
            var totalArticles = articleStats.Count;
            var totalViews = articleStats.Sum(a => a.ViewCount);
            var totalFavorites = articleStats.Sum(a => a.FavoritesCount);
            var totalComments = articleStats.Sum(a => a.CommentsCount);

            // Get followers/following counts
            var followersCount = await _context.UserFollows
                .AsNoTracking()
                .CountAsync(f => f.FollowingId == userId);

            var followingCount = await _context.UserFollows
                .AsNoTracking()
                .CountAsync(f => f.FollowerId == userId);

            // Recent articles (last 30 days)
            var recentArticles = articleStats
                .Where(a => a.CreatedAt >= thirtyDaysAgo)
                .Select(a => new
                {
                    id = a.Id,
                    slug = a.Slug,
                    title = a.Title,
                    createdAt = a.CreatedAt,
                    views = a.ViewCount,
                    favorites = a.FavoritesCount,
                    comments = a.CommentsCount,
                    readTime = a.ReadTime
                })
                .OrderByDescending(a => a.createdAt)
                .Take(10)
                .ToList();

            // Top articles by views
            var topArticlesByViews = articleStats
                .OrderByDescending(a => a.ViewCount)
                .Take(5)
                .Select(a => new
                {
                    id = a.Id,
                    slug = a.Slug,
                    title = a.Title,
                    views = a.ViewCount,
                    favorites = a.FavoritesCount,
                    comments = a.CommentsCount
                })
                .ToList();

            // Daily stats for chart (last 30 days)
            var dailyStats = articleStats
                .Where(a => a.CreatedAt >= thirtyDaysAgo)
                .GroupBy(a => a.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key,
                    articles = g.Count(),
                    views = g.Sum(a => a.ViewCount),
                    favorites = g.Sum(a => a.FavoritesCount),
                    comments = g.Sum(a => a.CommentsCount)
                })
                .OrderBy(s => s.date)
                .ToList();

            return Ok(new
            {
                summary = new
                {
                    totalArticles,
                    totalViews,
                    totalFavorites,
                    totalComments,
                    followersCount,
                    followingCount
                },
                recentArticles,
                topArticles = topArticlesByViews,
                dailyStats
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user stats");
            return StatusCode(500, new { message = "An error occurred while fetching stats" });
        }
    }
}
