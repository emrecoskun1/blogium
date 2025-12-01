namespace Blogium.API.Models;

public class Article
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Image { get; set; }
    public int ReadTime { get; set; } = 5;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public bool IsPublished { get; set; } = true;
    public int ViewCount { get; set; } = 0;

    // Foreign keys
    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    // Navigation properties
    public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<ArticleFavorite> FavoritedBy { get; set; } = new List<ArticleFavorite>();
}
