namespace Blogium.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // Nullable for OAuth users
    public string? Bio { get; set; }
    public string? Image { get; set; }
    
    // Email Verification
    public bool EmailVerified { get; set; } = false;
    public string? VerificationCode { get; set; }
    public DateTime? VerificationCodeExpiry { get; set; }
    
    // Password Reset
    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetCodeExpiry { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Article> Articles { get; set; } = new List<Article>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<ArticleFavorite> FavoriteArticles { get; set; } = new List<ArticleFavorite>();
    public ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>();
    public ICollection<UserFollow> Following { get; set; } = new List<UserFollow>();
}
