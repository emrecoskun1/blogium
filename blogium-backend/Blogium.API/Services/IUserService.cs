using Blogium.API.DTOs;

namespace Blogium.API.Services;

public interface IUserService
{
    Task<UserDto> GetUserByIdAsync(int userId);
    Task<UserProfileDto> GetUserProfileAsync(string username, int? currentUserId = null);
    Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateDto);
    Task<UserProfileDto> FollowUserAsync(string username, int followerId);
    Task<UserProfileDto> UnfollowUserAsync(string username, int followerId);
}
