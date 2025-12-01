using System;
using System.Collections.Generic;

namespace Blogium.API.TempModels;

public partial class Article
{
    public int Id { get; set; }

    public string Slug { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Body { get; set; } = null!;

    public string? Image { get; set; }

    public int ReadTime { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int AuthorId { get; set; }

    public virtual ICollection<ArticleFavorite> ArticleFavorites { get; set; } = new List<ArticleFavorite>();

    public virtual User Author { get; set; } = null!;

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
