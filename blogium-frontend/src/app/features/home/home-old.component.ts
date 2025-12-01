import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { Article } from '../../shared/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent, LoadingComponent],
  template: `
    <div class="home-page">
      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="container">
          <h1 class="hero-title">Stay curious.</h1>
          <p class="hero-subtitle">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <button class="hero-btn" (click)="scrollToContent()">Start reading</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container main-content">
        <div class="content-grid">
          <!-- Articles Feed -->
          <div class="articles-section">
            <!-- Feed Toggle -->
            @if (isAuthenticated$ | async) {
              <div class="feed-toggle">
                <button
                  class="toggle-btn"
                  [class.active]="activeTab() === 'feed'"
                  (click)="setActiveTab('feed')">
                  Your feed
                </button>
                <button
                  class="toggle-btn"
                  [class.active]="activeTab() === 'global'"
                  (click)="setActiveTab('global')">
                  Discover
                </button>
              </div>
            }

            <!-- Articles List -->
            @if (loading()) {
              <app-loading />
            } @else {
              @if (articles().length > 0) {
                <div class="articles-list">
                  @for (article of articles(); track article.id) {
                    <app-article-card
                      [article]="article"
                      (toggleFavorite)="onToggleFavorite($event)" />
                  }
                </div>
              } @else {
                <div class="no-articles">
                  <p>No articles yet. Start following authors to see their posts here.</p>
                </div>
              }
            }
          </div>

          <!-- Sidebar -->
          <aside class="sidebar">
            <!-- Popular Tags -->
            <div class="sidebar-widget">
              <h3 class="widget-title">Recommended topics</h3>
              @if (tags().length > 0) {
                <div class="tags-cloud">
                  @for (tag of tags(); track tag) {
                    <button
                      class="tag-chip"
                      [class.active]="selectedTag() === tag"
                      (click)="filterByTag(tag)">
                      {{ tag }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Staff Picks -->
            <div class="sidebar-widget">
              <h3 class="widget-title">Staff picks</h3>
              <div class="staff-picks">
                @for (article of featuredArticles(); track article.id) {
                  <div class="pick-item">
                    <div class="pick-author">
                      <img [src]="article.author.image" [alt]="article.author.username" />
                      <span>{{ article.author.username }}</span>
                    </div>
                    <h4 class="pick-title">{{ article.title }}</h4>
                  </div>
                }
              </div>
            </div>

            <!-- Footer Links -->
            <div class="sidebar-footer">
              <a href="#">Help</a>
              <a href="#">Status</a>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 0;
      margin-bottom: 48px;
    }

    .hero-title {
      font-size: 80px;
      font-weight: 700;
      margin: 0 0 16px;
      letter-spacing: -2px;
    }

    .hero-subtitle {
      font-size: 24px;
      margin: 0 0 32px;
      opacity: 0.95;
      font-weight: 400;
    }

    .hero-btn {
      padding: 12px 32px;
      background: white;
      color: #242424;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .hero-btn:hover {
      transform: translateY(-2px);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .main-content {
      padding-bottom: 60px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 48px;
    }

    .articles-section {
      min-width: 0;
    }

    .feed-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 32px;
      border-bottom: 1px solid #e6e6e6;
    }

    .toggle-btn {
      padding: 12px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 14px;
      font-weight: 500;
      color: #6b6b6b;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: -1px;
    }

    .toggle-btn:hover {
      color: #242424;
    }

    .toggle-btn.active {
      color: #242424;
      border-bottom-color: #242424;
    }

    .articles-list {
      display: flex;
      flex-direction: column;
    }

    .no-articles {
      text-align: center;
      padding: 60px 20px;
      color: #6b6b6b;
    }

    .sidebar {
      position: sticky;
      top: 80px;
      height: fit-content;
    }

    .sidebar-widget {
      margin-bottom: 40px;
    }

    .widget-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0 0 16px;
      color: #242424;
    }

    .tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-chip {
      padding: 8px 16px;
      background: #f2f2f2;
      border: 1px solid #e6e6e6;
      border-radius: 20px;
      font-size: 14px;
      color: #6b6b6b;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .tag-chip:hover {
      background: #e6e6e6;
      color: #242424;
    }

    .tag-chip.active {
      background: #242424;
      color: white;
      border-color: #242424;
    }

    .staff-picks {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .pick-item {
      cursor: pointer;
    }

    .pick-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .pick-author img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .pick-author span {
      font-size: 13px;
      color: #6b6b6b;
    }

    .pick-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
      color: #242424;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sidebar-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid #e6e6e6;
    }

    .sidebar-footer a {
      font-size: 13px;
      color: #6b6b6b;
      text-decoration: none;
    }

    .sidebar-footer a:hover {
      color: #242424;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .hero-banner {
        padding: 60px 0;
      }

      .hero-title {
        font-size: 48px;
      }

      .hero-subtitle {
        font-size: 18px;
      }

      .feed-toggle {
        margin-bottom: 24px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);

  protected articles = signal<Article[]>([]);
  protected featuredArticles = signal<Article[]>([]);
  protected tags = signal<string[]>([]);
  protected loading = signal(false);
  protected activeTab = signal<'feed' | 'global'>('global');
  protected selectedTag = signal<string | null>(null);
  protected isAuthenticated$ = this.authService.isAuthenticated$;

  ngOnInit(): void {
    this.loadArticles();
    this.loadTags();
  }

  loadArticles(): void {
    this.loading.set(true);
    this.articleService.getArticles({
      type: this.activeTab() === 'feed' ? 'feed' : 'all',
      filters: this.selectedTag() ? { tag: this.selectedTag()! } : undefined
    }).subscribe({
      next: (data) => {
        this.articles.set(data.articles);
        this.featuredArticles.set(data.articles.slice(0, 3));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadTags(): void {
    this.articleService.getTags().subscribe({
      next: (tags) => {
        this.tags.set(tags);
      }
    });
  }

  setActiveTab(tab: 'feed' | 'global'): void {
    this.activeTab.set(tab);
    this.selectedTag.set(null);
    this.loadArticles();
  }

  filterByTag(tag: string): void {
    if (this.selectedTag() === tag) {
      this.selectedTag.set(null);
    } else {
      this.selectedTag.set(tag);
    }
    this.loadArticles();
  }

  onToggleFavorite(article: Article): void {
    const wasFavorited = article.favorited;

    if (wasFavorited) {
      this.articleService.unfavoriteArticle(article.slug).subscribe({
        next: (updatedArticle) => {
          // Update article in the list
          const index = this.articles().findIndex(a => a.slug === article.slug);
          if (index !== -1) {
            const updated = [...this.articles()];
            updated[index] = updatedArticle;
            this.articles.set(updated);
          }
        },
        error: (error) => {
          console.error('Failed to unfavorite article:', error);
        }
      });
    } else {
      this.articleService.favoriteArticle(article.slug).subscribe({
        next: (updatedArticle) => {
          // Update article in the list
          const index = this.articles().findIndex(a => a.slug === article.slug);
          if (index !== -1) {
            const updated = [...this.articles()];
            updated[index] = updatedArticle;
            this.articles.set(updated);
          }
        },
        error: (error) => {
          console.error('Failed to favorite article:', error);
        }
      });
    }
  }

  scrollToContent(): void {
    window.scrollTo({ top: 500, behavior: 'smooth' });
  }
}
