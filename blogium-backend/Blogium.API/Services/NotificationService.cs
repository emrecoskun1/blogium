using Blogium.API.Data;
using Blogium.API.DTOs;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.Services;

public class NotificationService : INotificationService
{
    private readonly BlogiumDbContext _context;

    public NotificationService(BlogiumDbContext context)
    {
        _context = context;
    }

    public async Task CreateNotificationAsync(int userId, string type, string message, int? articleId = null, int? actorId = null)
    {
        // Don't create notification if user is notifying themselves
        if (actorId.HasValue && actorId.Value == userId)
            return;

        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Message = message,
            ArticleId = articleId,
            ActorId = actorId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task<NotificationListDto> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
    {
        // Project to anonymous type first to avoid NULL issues
        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notificationsData = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50) // Limit to last 50 notifications
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.Message,
                n.ArticleId,
                ArticleSlug = n.Article != null ? n.Article.Slug : null,
                ArticleTitle = n.Article != null ? n.Article.Title : null,
                ActorId = n.Actor != null ? (int?)n.Actor.Id : null,
                ActorUsername = n.Actor != null ? n.Actor.Username : null,
                ActorImage = n.Actor != null ? n.Actor.Image : null,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync();

        var unreadCount = await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        return new NotificationListDto
        {
            Notifications = notificationsData.Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Message = n.Message,
                ArticleId = n.ArticleId,
                ArticleSlug = n.ArticleSlug,
                ArticleTitle = n.ArticleTitle,
                Actor = n.ActorId.HasValue ? new ActorDto
                {
                    Id = n.ActorId.Value,
                    Username = n.ActorUsername ?? "",
                    Image = n.ActorImage
                } : null,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToList(),
            UnreadCount = unreadCount
        };
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }
}
