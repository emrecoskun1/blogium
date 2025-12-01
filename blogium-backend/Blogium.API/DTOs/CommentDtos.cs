namespace Blogium.API.DTOs;

public class CommentDto
{
    public int Id { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public AuthorDto Author { get; set; } = null!;
}

public class CreateCommentDto
{
    public string Body { get; set; } = string.Empty;
}

public class CommentListDto
{
    public List<CommentDto> Comments { get; set; } = new();
}
