namespace Blogium.API.Models;

public class Comment
{
    public int Id { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int ArticleId { get; set; }
    public Article Article { get; set; } = null!;

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;
}
