using Blogium.API.DTOs;

namespace Blogium.API.Services;

public interface ICommentService
{
    Task<CommentListDto> GetCommentsAsync(string articleSlug);
    Task<CommentDto> AddCommentAsync(string articleSlug, CreateCommentDto createDto, int authorId);
    Task DeleteCommentAsync(int commentId, int userId);
}
