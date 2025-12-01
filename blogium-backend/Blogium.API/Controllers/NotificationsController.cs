using Blogium.API.DTOs;
using Blogium.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Blogium.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    [HttpGet]
    public async Task<ActionResult<NotificationListDto>> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkAsRead(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            await _notificationService.MarkAsReadAsync(id, userId);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
