using System;
using System.Collections.Generic;

namespace Blogium.API.TempModels;

public partial class Comment
{
    public int Id { get; set; }

    public string Body { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int ArticleId { get; set; }

    public int AuthorId { get; set; }

    public virtual Article Article { get; set; } = null!;

    public virtual User Author { get; set; } = null!;
}
