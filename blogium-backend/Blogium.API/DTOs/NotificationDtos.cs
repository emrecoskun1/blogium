namespace Blogium.API.DTOs;

public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? ArticleId { get; set; }
    public string? ArticleSlug { get; set; }
    public string? ArticleTitle { get; set; }
    public ActorDto? Actor { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ActorDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Image { get; set; }
}

public class NotificationListDto
{
    public List<NotificationDto> Notifications { get; set; } = new();
    public int UnreadCount { get; set; }
}
