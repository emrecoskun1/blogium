using Blogium.API.DTOs;
using Blogium.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Blogium.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IArticleService _articleService;

    public ArticlesController(IArticleService articleService)
    {
        _articleService = articleService;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
    }

    [HttpGet]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "limit", "offset", "tag", "author", "search" })]
    public async Task<ActionResult<ArticleListDto>> GetArticles(
        [FromQuery] int? limit = 20,
        [FromQuery] int? offset = 0,
        [FromQuery] string? tag = null,
        [FromQuery] string? author = null,
        [FromQuery] string? favorited = null,
        [FromQuery] string? search = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var articles = await _articleService.GetArticlesAsync(limit, offset, tag, author, favorited, search, userId);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult> GetArticle(string slug)
    {
        try
        {
            var userId = GetCurrentUserId();
            var article = await _articleService.GetArticleBySlugAsync(slug, userId);
            return Ok(new { article });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateArticle([FromBody] CreateArticleDto createDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var article = await _articleService.CreateArticleAsync(createDto, userId);
            return CreatedAtAction(nameof(GetArticle), new { slug = article.Slug }, new { article });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{slug}")]
    public async Task<ActionResult> UpdateArticle(string slug, [FromBody] UpdateArticleDto updateDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var article = await _articleService.UpdateArticleAsync(slug, updateDto, userId);
            return Ok(new { article });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{slug}")]
    public async Task<IActionResult> DeleteArticle(string slug)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _articleService.DeleteArticleAsync(slug, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("{slug}/favorite")]
    public async Task<ActionResult> FavoriteArticle(string slug)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var article = await _articleService.FavoriteArticleAsync(slug, userId);
            return Ok(new { article });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{slug}/favorite")]
    public async Task<ActionResult> UnfavoriteArticle(string slug)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var article = await _articleService.UnfavoriteArticleAsync(slug, userId);
            return Ok(new { article });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
