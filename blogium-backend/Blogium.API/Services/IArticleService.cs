using Blogium.API.DTOs;

namespace Blogium.API.Services;

public interface IArticleService
{
    Task<ArticleListDto> GetArticlesAsync(int? limit = null, int? offset = null, string? tag = null, string? author = null, string? favorited = null, string? search = null, int? userId = null);
    Task<ArticleDto> GetArticleBySlugAsync(string slug, int? userId = null);
    Task<ArticleDto> CreateArticleAsync(CreateArticleDto createDto, int authorId);
    Task<ArticleDto> UpdateArticleAsync(string slug, UpdateArticleDto updateDto, int userId);
    Task DeleteArticleAsync(string slug, int userId);
    Task<ArticleDto> FavoriteArticleAsync(string slug, int userId);
    Task<ArticleDto> UnfavoriteArticleAsync(string slug, int userId);
    Task<List<string>> GetTagsAsync();
}
