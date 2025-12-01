import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Article, ArticleListConfig, Comment } from '../../shared/models/article.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);

  getArticles(config?: ArticleListConfig): Observable<{ articles: Article[], articlesCount: number }> {
    let params = new HttpParams();

    if (config?.filters) {
      const { tag, author, favorited, limit, offset, search } = config.filters;

      if (tag) params = params.set('tag', tag);
      if (author) params = params.set('author', author);
      if (favorited) params = params.set('favorited', favorited);
      if (limit) params = params.set('limit', limit.toString());
      if (offset) params = params.set('offset', offset.toString());
      if (search) params = params.set('search', search);
    }

    const endpoint = config?.type === 'feed'
      ? `${environment.apiUrl}/articles/feed`
      : `${environment.apiUrl}/articles`;

    return this.http.get<{ articles: Article[], articlesCount: number }>(endpoint, { params }).pipe(
      catchError(error => {
        console.error('Get articles error:', error);
        return of({ articles: [], articlesCount: 0 });
      })
    );
  }

  getArticle(slug: string): Observable<Article> {
    return this.http.get<{ article: Article }>(`${environment.apiUrl}/articles/${slug}`).pipe(
      map(response => response.article),
      catchError(error => {
        console.error('Get article error:', error);
        throw error;
      })
    );
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.http.post<{ article: Article }>(`${environment.apiUrl}/articles`, {
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList || [],
      image: article.image || null
    }).pipe(
      map(response => response.article),
      catchError(error => {
        console.error('Create article error:', error);
        throw error;
      })
    );
  }

  updateArticle(slug: string, article: Partial<Article>): Observable<Article> {
    return this.http.put<{ article: Article }>(`${environment.apiUrl}/articles/${slug}`, {
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList,
      image: article.image || null
    }).pipe(
      map(response => response.article),
      catchError(error => {
        console.error('Update article error:', error);
        throw error;
      })
    );
  }

  deleteArticle(slug: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/articles/${slug}`).pipe(
      catchError(error => {
        console.error('Delete article error:', error);
        throw error;
      })
    );
  }

  favoriteArticle(slug: string): Observable<Article> {
    return this.http.post<{ article: Article }>(`${environment.apiUrl}/articles/${slug}/favorite`, {}).pipe(
      map(response => response.article),
      catchError(error => {
        console.error('Favorite article error:', error);
        throw error;
      })
    );
  }

  unfavoriteArticle(slug: string): Observable<Article> {
    return this.http.delete<{ article: Article }>(`${environment.apiUrl}/articles/${slug}/favorite`).pipe(
      map(response => response.article),
      catchError(error => {
        console.error('Unfavorite article error:', error);
        throw error;
      })
    );
  }

  getComments(slug: string): Observable<Comment[]> {
    return this.http.get<{ comments: Comment[] }>(`${environment.apiUrl}/articles/${slug}/comments`).pipe(
      map(response => response.comments),
      catchError(error => {
        console.error('Get comments error:', error);
        return of([]);
      })
    );
  }

  addComment(slug: string, body: string): Observable<Comment> {
    return this.http.post<{ comment: Comment }>(`${environment.apiUrl}/articles/${slug}/comments`, {
      body: body
    }).pipe(
      map(response => response.comment),
      catchError(error => {
        console.error('Add comment error:', error);
        throw error;
      })
    );
  }

  deleteComment(slug: string, commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/articles/${slug}/comments/${commentId}`).pipe(
      catchError(error => {
        console.error('Delete comment error:', error);
        throw error;
      })
    );
  }

  getTags(): Observable<string[]> {
    return this.http.get<{ tags: string[] }>(`${environment.apiUrl}/tags`).pipe(
      map(response => response.tags),
      catchError(error => {
        console.error('Get tags error:', error);
        return of([]);
      })
    );
  }
}
