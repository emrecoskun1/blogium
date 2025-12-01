using System.ComponentModel.DataAnnotations;

namespace Blogium.API.DTOs;

public class ArticleDto
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Image { get; set; }
    public int ReadTime { get; set; }
    public List<string> TagList { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool Favorited { get; set; }
    public int FavoritesCount { get; set; }
    public AuthorDto Author { get; set; } = null!;
}

public class AuthorDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Image { get; set; }
    public bool Following { get; set; }
}

public class CreateArticleDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 200 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Description is required")]
    [StringLength(500, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 500 characters")]
    public string Description { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Body is required")]
    [MinLength(50, ErrorMessage = "Body must be at least 50 characters")]
    public string Body { get; set; } = string.Empty;
    
    // Removed [Url] validation to support base64 images
    public string? Image { get; set; }
    
    public List<string> TagList { get; set; } = new();
}

public class UpdateArticleDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Body { get; set; }
    public string? Image { get; set; }
    public List<string>? TagList { get; set; }
}

public class ArticleListDto
{
    public List<ArticleDto> Articles { get; set; } = new();
    public int ArticlesCount { get; set; }
}
