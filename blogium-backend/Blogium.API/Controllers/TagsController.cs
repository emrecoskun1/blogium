using Blogium.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogium.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly IArticleService _articleService;

    public TagsController(IArticleService articleService)
    {
        _articleService = articleService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetTags()
    {
        try
        {
            var tags = await _articleService.GetTagsAsync();
            return Ok(new { tags });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
