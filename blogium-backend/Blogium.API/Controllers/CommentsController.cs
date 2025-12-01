using Blogium.API.DTOs;
using Blogium.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Blogium.API.Controllers;

[ApiController]
[Route("api/articles/{slug}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<ActionResult> GetComments(string slug)
    {
        try
        {
            var result = await _commentService.GetCommentsAsync(slug);
            return Ok(new { comments = result.Comments });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> AddComment(string slug, [FromBody] CreateCommentDto createDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var comment = await _commentService.AddCommentAsync(slug, createDto, userId);
            return CreatedAtAction(nameof(GetComments), new { slug }, new { comment });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(string slug, int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _commentService.DeleteCommentAsync(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
