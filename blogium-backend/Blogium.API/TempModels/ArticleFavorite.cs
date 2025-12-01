using System;
using System.Collections.Generic;

namespace Blogium.API.TempModels;

public partial class ArticleFavorite
{
    public int UserId { get; set; }

    public int ArticleId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Article Article { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
