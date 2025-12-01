namespace Blogium.API.Models;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Type { get; set; } = string.Empty; // "article_favorited", "article_comment", "user_followed"
    public string Message { get; set; } = string.Empty;
    public int? ArticleId { get; set; }
    public Article? Article { get; set; }
    public int? ActorId { get; set; } // The user who performed the action
    public User? Actor { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}
