using System;
using System.Collections.Generic;

namespace Blogium.API.TempModels;

public partial class Tag
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
}
