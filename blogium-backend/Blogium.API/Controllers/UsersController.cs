using Blogium.API.DTOs;
using Blogium.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Blogium.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [Authorize]
    [HttpGet("current")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogWarning("NameIdentifier claim not found in token");
                return Unauthorized(new { message = "Invalid token: user ID not found" });
            }

            var userId = int.Parse(userIdClaim.Value);
            _logger.LogInformation("Fetching current user with ID: {UserId}", userId);
            
            var user = await _userService.GetUserByIdAsync(userId);
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching current user");
            return BadRequest(new { message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
    }

    [HttpGet("{username}")]
    [ResponseCache(Duration = 30, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "username" })]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(string username)
    {
        try
        {
            _logger.LogInformation("Fetching profile for username: {Username}", username);
            var currentUserId = GetCurrentUserId();
            var profile = await _userService.GetUserProfileAsync(username, currentUserId);
            _logger.LogInformation("Profile found for {Username}", username);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching profile for username: {Username}", username);
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult<UserDto>> UpdateUser([FromBody] UpdateUserDto updateDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _userService.UpdateUserAsync(userId, updateDto);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("{username}/follow")]
    public async Task<ActionResult<UserProfileDto>> FollowUser(string username)
    {
        try
        {
            var followerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var profile = await _userService.FollowUserAsync(username, followerId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{username}/follow")]
    public async Task<ActionResult<UserProfileDto>> UnfollowUser(string username)
    {
        try
        {
            var followerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var profile = await _userService.UnfollowUserAsync(username, followerId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
