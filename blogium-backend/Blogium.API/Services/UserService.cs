using Blogium.API.Data;
using Blogium.API.DTOs;
using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.Services;

public class UserService : IUserService
{
    private readonly BlogiumDbContext _context;
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;

    public UserService(BlogiumDbContext context, IAuthService authService, IEmailService emailService)
    {
        _context = context;
        _authService = authService;
        _emailService = emailService;
    }

    public async Task<UserDto> GetUserByIdAsync(int userId)
    {
        Console.WriteLine($"[UserService] Fetching user with ID: {userId}");
        
        try
        {
            // Project directly to an anonymous type to avoid NULL issues
            var userInfo = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    Username = u.Username ?? string.Empty,
                    Email = u.Email ?? string.Empty,
                    u.Bio,
                    u.Image,
                    u.EmailVerified,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            Console.WriteLine($"[UserService] User found: {userInfo != null}");
            
            if (userInfo == null)
            {
                Console.WriteLine($"[UserService] User with ID {userId} not found in database");
                throw new Exception("User not found");
            }

            Console.WriteLine($"[UserService] User details - Username: {userInfo.Username}, Email: {userInfo.Email}");

            // Create a User object for token generation
            var userForToken = new User
            {
                Id = userInfo.Id,
                Username = userInfo.Username,
                Email = userInfo.Email,
                EmailVerified = userInfo.EmailVerified,
                CreatedAt = userInfo.CreatedAt
            };

            return new UserDto
            {
                Id = userInfo.Id,
                Username = userInfo.Username,
                Email = userInfo.Email,
                Bio = userInfo.Bio,
                Image = userInfo.Image,
                Token = _authService.GenerateJwtToken(userForToken)
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserService] ERROR: {ex.GetType().Name}: {ex.Message}");
            Console.WriteLine($"[UserService] Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<UserProfileDto> GetUserProfileAsync(string username, int? currentUserId = null)
    {
        // Project to anonymous type first to avoid NULL issues with PasswordHash
        var userInfo = await _context.Users
            .Where(u => u.Username == username)
            .Select(u => new
            {
                u.Id,
                Username = u.Username ?? string.Empty,
                u.Bio,
                u.Image,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Following.Count
            })
            .FirstOrDefaultAsync();

        if (userInfo == null)
        {
            throw new Exception("User not found");
        }

        var following = false;
        if (currentUserId.HasValue)
        {
            following = await _context.UserFollows
                .AnyAsync(uf => uf.FollowerId == currentUserId.Value && uf.FollowingId == userInfo.Id);
        }

        return new UserProfileDto
        {
            Id = userInfo.Id,
            Username = userInfo.Username,
            Bio = userInfo.Bio,
            Image = userInfo.Image,
            Following = following,
            FollowersCount = userInfo.FollowersCount,
            FollowingCount = userInfo.FollowingCount
        };
    }

    public async Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto updateDto)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            throw new Exception("User not found");
        }

        // Update fields
        if (!string.IsNullOrEmpty(updateDto.Username))
        {
            if (await _context.Users.AnyAsync(u => u.Username == updateDto.Username && u.Id != userId))
            {
                throw new Exception("Username already exists");
            }
            user.Username = updateDto.Username;
        }

        if (!string.IsNullOrEmpty(updateDto.Email))
        {
            if (await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.Id != userId))
            {
                throw new Exception("Email already exists");
            }
            user.Email = updateDto.Email;
        }

        if (updateDto.Bio != null)
        {
            user.Bio = updateDto.Bio;
        }

        if (updateDto.Image != null)
        {
            user.Image = updateDto.Image;
        }

        if (!string.IsNullOrEmpty(updateDto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Password);
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var token = _authService.GenerateJwtToken(user);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio,
            Image = user.Image,
            Token = token
        };
    }

    public async Task<UserProfileDto> FollowUserAsync(string username, int followerId)
    {
        var userToFollow = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (userToFollow == null)
        {
            throw new Exception("User not found");
        }

        if (userToFollow.Id == followerId)
        {
            throw new Exception("You cannot follow yourself");
        }

        var existingFollow = await _context.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowingId == userToFollow.Id);

        if (existingFollow == null)
        {
            _context.UserFollows.Add(new UserFollow
            {
                FollowerId = followerId,
                FollowingId = userToFollow.Id,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Get follower info and send notification email
            var follower = await _context.Users.FindAsync(followerId);
            if (follower != null && !string.IsNullOrEmpty(userToFollow.Email))
            {
                try
                {
                    var profileUrl = $"https://blogium.yunusemrecoskun.xyz/profile/{follower.Username}";
                    await _emailService.SendFollowerNotificationAsync(
                        userToFollow.Email,
                        follower.Username,
                        profileUrl
                    );
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the follow operation
                    Console.WriteLine($"Failed to send follow notification: {ex.Message}");
                }
            }
        }

        return await GetUserProfileAsync(username, followerId);
    }

    public async Task<UserProfileDto> UnfollowUserAsync(string username, int followerId)
    {
        var userToUnfollow = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (userToUnfollow == null)
        {
            throw new Exception("User not found");
        }

        var follow = await _context.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowingId == userToUnfollow.Id);

        if (follow != null)
        {
            _context.UserFollows.Remove(follow);
            await _context.SaveChangesAsync();
        }

        return await GetUserProfileAsync(username, followerId);
    }
}
