namespace Blogium.API.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();
}
