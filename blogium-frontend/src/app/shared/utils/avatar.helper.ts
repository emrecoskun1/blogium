export class AvatarHelper {
  static getAvatarUrl(user: { username: string; image?: string | null }): string {
    if (user.image && user.image.trim()) {
      return user.image;
    }
    // Use DiceBear API for default avatars
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;
  }

  static getInitials(username: string): string {
    return username.substring(0, 2).toUpperCase();
  }
}
