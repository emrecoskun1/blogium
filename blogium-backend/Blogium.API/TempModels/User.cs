using System;
using System.Collections.Generic;

namespace Blogium.API.TempModels;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Bio { get; set; }

    public string? Image { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool EmailVerified { get; set; }

    public string? VerificationCode { get; set; }

    public DateTime? VerificationCodeExpiry { get; set; }

    public virtual ICollection<ArticleFavorite> ArticleFavorites { get; set; } = new List<ArticleFavorite>();

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<UserFollow> UserFollowFollowers { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserFollow> UserFollowFollowings { get; set; } = new List<UserFollow>();
}
