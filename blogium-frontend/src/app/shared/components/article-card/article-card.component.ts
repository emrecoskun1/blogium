import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="article-card">
      <div class="article-header">
        <a [routerLink]="['/profile', article.author.username]" class="author-info">
          @if (article.author.image) {
            <img [src]="article.author.image" [alt]="article.author.username" class="author-avatar" />
          }
          <div class="author-details">
            <span class="author-name">{{ article.author.username }}</span>
            <span class="article-meta">
              {{ article.createdAt | date: 'MMM d' }} · {{ article.readTime }} min read
            </span>
          </div>
        </a>

        <button
          class="favorite-btn"
          [class.favorited]="article.favorited"
          (click)="onToggleFavorite()"
          type="button">
          <span class="heart-icon">{{ article.favorited ? '❤️' : '🤍' }}</span>
          <span class="favorite-count">{{ article.favoritesCount }}</span>
        </button>
      </div>

      <a [routerLink]="['/article', article.slug]" class="article-content">
        <div class="text-content">
          <h2 class="article-title">{{ article.title }}</h2>
          @if (article.subtitle) {
            <p class="article-subtitle">{{ article.subtitle }}</p>
          }
          <p class="article-description">{{ article.description }}</p>

          <div class="article-footer">
            <div class="tags">
              @for (tag of article.tagList.slice(0, 3); track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>
          </div>
        </div>

        @if (article.image) {
          <div class="article-image">
            <img [src]="article.image" [alt]="article.title" />
          </div>
        }
      </a>
    </article>
  `,
  styles: [`
    .article-card {
      padding: 24px 0;
      border-bottom: 1px solid #e6e6e6;
    }

    .article-card:last-child {
      border-bottom: none;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .author-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .author-name {
      font-size: 14px;
      font-weight: 500;
      color: #242424;
    }

    .article-meta {
      font-size: 13px;
      color: #6b6b6b;
    }

    .favorite-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid #e6e6e6;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 13px;
      color: #6b6b6b;
    }

    .favorite-btn:hover {
      border-color: #242424;
      background: #f5f5f5;
    }

    .favorite-btn.favorited {
      background: #fff0f0;
      border-color: #ff6b6b;
    }

    .heart-icon {
      font-size: 14px;
      line-height: 1;
    }

    .article-content {
      display: flex;
      gap: 32px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .text-content {
      flex: 1;
      min-width: 0;
    }

    .article-title {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 8px;
      color: #242424;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-subtitle {
      font-size: 16px;
      font-weight: 400;
      line-height: 1.4;
      margin: 0 0 8px;
      color: #6b6b6b;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-description {
      font-size: 16px;
      line-height: 1.5;
      color: #6b6b6b;
      margin: 0 0 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tag {
      padding: 4px 12px;
      background: #f2f2f2;
      border-radius: 16px;
      font-size: 13px;
      color: #6b6b6b;
      font-weight: 500;
    }

    .article-image {
      width: 200px;
      height: 134px;
      flex-shrink: 0;
    }

    .article-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .article-card {
        padding: 20px 0;
      }

      .article-content {
        gap: 20px;
      }

      .article-title {
        font-size: 18px;
      }

      .article-subtitle,
      .article-description {
        font-size: 14px;
      }

      .article-image {
        width: 100px;
        height: 100px;
      }

      .tag {
        font-size: 12px;
        padding: 3px 10px;
      }
    }
  `]
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
  @Output() toggleFavorite = new EventEmitter<Article>();
  @Output() favoriteChanged = new EventEmitter<{ article: Article, removed: boolean }>();

  onToggleFavorite(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.toggleFavorite.emit(this.article);
  }
}
