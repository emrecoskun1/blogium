using Blogium.API.DTOs;

namespace Blogium.API.Services;

public interface INotificationService
{
    Task CreateNotificationAsync(int userId, string type, string message, int? articleId = null, int? actorId = null);
    Task<NotificationListDto> GetUserNotificationsAsync(int userId, bool unreadOnly = false);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
}
