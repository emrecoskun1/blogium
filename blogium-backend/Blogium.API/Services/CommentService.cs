using Blogium.API.Data;
using Blogium.API.DTOs;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.Services;

public class CommentService : ICommentService
{
    private readonly BlogiumDbContext _context;

    public CommentService(BlogiumDbContext context)
    {
        _context = context;
    }

    public async Task<CommentListDto> GetCommentsAsync(string articleSlug)
    {
        var article = await _context.Articles.FirstOrDefaultAsync(a => a.Slug == articleSlug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        // Use anonymous projection to avoid SqlNullValueException with OAuth users
        var commentsData = await _context.Comments
            .Where(c => c.ArticleId == article.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Body,
                c.CreatedAt,
                c.UpdatedAt,
                AuthorId = c.Author.Id,
                AuthorUsername = c.Author.Username ?? string.Empty,
                AuthorBio = c.Author.Bio,
                AuthorImage = c.Author.Image
            })
            .ToListAsync();

        var commentDtos = commentsData.Select(c => new CommentDto
        {
            Id = c.Id,
            Body = c.Body,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            Author = new AuthorDto
            {
                Id = c.AuthorId,
                Username = c.AuthorUsername,
                Bio = c.AuthorBio,
                Image = c.AuthorImage,
                Following = false // You can implement this if needed
            }
        }).ToList();

        return new CommentListDto
        {
            Comments = commentDtos
        };
    }

    public async Task<CommentDto> AddCommentAsync(string articleSlug, CreateCommentDto createDto, int authorId)
    {
        var article = await _context.Articles.FirstOrDefaultAsync(a => a.Slug == articleSlug);

        if (article == null)
        {
            throw new Exception("Article not found");
        }

        var comment = new Comment
        {
            Body = createDto.Body,
            ArticleId = article.Id,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // Use anonymous projection to avoid SqlNullValueException with OAuth users
        var authorData = await _context.Users
            .Where(u => u.Id == authorId)
            .Select(u => new
            {
                u.Id,
                Username = u.Username ?? string.Empty,
                u.Bio,
                u.Image
            })
            .FirstOrDefaultAsync();

        if (authorData == null)
        {
            throw new Exception("Author not found");
        }

        return new CommentDto
        {
            Id = comment.Id,
            Body = comment.Body,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            Author = new AuthorDto
            {
                Id = authorData.Id,
                Username = authorData.Username,
                Bio = authorData.Bio,
                Image = authorData.Image,
                Following = false
            }
        };
    }

    public async Task DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _context.Comments.FindAsync(commentId);

        if (comment == null)
        {
            throw new Exception("Comment not found");
        }

        if (comment.AuthorId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this comment");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }
}
