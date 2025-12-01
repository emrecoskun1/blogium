export interface User {
  id: number;
  username: string;
  email?: string;
  bio?: string;
  image?: string;
  following?: boolean;
  followersCount?: number;
  followingCount?: number;
  createdAt?: Date;
}

export interface AuthUser extends User {
  token: string;
}

export interface UserProfile {
  user: User;
  articlesCount: number;
  favoriteArticlesCount: number;
}
