import { User } from './user.model';

export interface Article {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  favoritesCount: number;
  author: User;
  readTime?: number;
  image?: string;
}

export interface ArticleListConfig {
  type?: 'all' | 'feed' | 'user' | 'favorited' | 'tag';
  filters?: {
    tag?: string;
    author?: string;
    favorited?: string;
    limit?: number;
    offset?: number;
    search?: string;
  };
}

export interface Comment {
  id: number;
  body: string;
  createdAt: Date;
  author: User;
}
