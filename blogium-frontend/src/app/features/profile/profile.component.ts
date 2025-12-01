import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../core/services/user.service';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { BookmarkService } from '../../core/services/bookmark.service';
import { ArticleCacheService } from '../../core/services/article-cache.service';

import { User } from '../../shared/models/user.model';
import { Article, ArticleListConfig } from '../../shared/models/article.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

type TabType = 'articles' | 'favorites' | 'bookmarks';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, LoadingComponent],
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (profile()) {
      <main class="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <!-- Hero Section with Glass Effect -->
        <div class="relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white border-b border-slate-200/50">
          <!-- Animated Background -->
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>

          <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div class="flex flex-col md:flex-row items-center gap-8">
              <!-- Avatar with Ring -->
              <div class="relative group">
                @if (profile()!.image) {
                  <div class="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-all"></div>
                  <img
                    [src]="profile()!.image"
                    alt="Profile image"
                    class="relative size-32 md:size-40 rounded-full object-cover ring-4 ring-white shadow-2xl" />
                } @else {
                  <div class="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full blur opacity-50 group-hover:opacity-75 transition-all"></div>
                  <div class="relative flex items-center justify-center size-32 md:size-40 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 ring-4 ring-white shadow-2xl">
                    <span class="text-6xl md:text-7xl font-bold text-white">{{ profile()!.username.charAt(0).toUpperCase() }}</span>
                  </div>
                }
              </div>

              <!-- Profile Info -->
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-3xl md:text-5xl font-bold mb-3 text-slate-900">{{ profile()!.username }}</h1>
                @if (profile()!.bio) {
                  <p class="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl">{{ profile()!.bio }}</p>
                }

                <!-- Stats Cards -->
                <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                  <div class="px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all">
                    <div class="text-2xl font-bold text-slate-900">{{ profile()!.followersCount || 0 }}</div>
                    <div class="text-sm text-slate-600">Followers</div>
                  </div>
                  <div class="px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all">
                    <div class="text-2xl font-bold text-slate-900">{{ articles().length }}</div>
                    <div class="text-sm text-slate-600">Posts</div>
                  </div>
                  <div class="px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg hover:shadow-xl transition-all">
                    <div class="text-2xl font-bold text-slate-900">{{ totalViews }}</div>
                    <div class="text-sm text-slate-600">Views</div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-3 justify-center md:justify-start">
                  @if (isOwnProfile()) {
                    <a routerLink="/settings"
                       class="px-8 py-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                      Edit Profile
                    </a>
                    <a routerLink="/stats"
                       class="px-8 py-3 bg-white text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all border border-slate-300 shadow-sm">
                      View Stats
                    </a>
                  } @else {
                    <button (click)="toggleFollow()"
                            class="px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            [class.bg-primary-600]="!profile()!.following"
                            [class.text-white]="!profile()!.following"
                            [class.hover:bg-primary-700]="!profile()!.following"
                            [class.bg-white]="profile()!.following"
                            [class.text-slate-700]="profile()!.following"
                            [class.border]="profile()!.following"
                            [class.border-slate-300]="profile()!.following">
                      {{ profile()!.following ? 'Following' : 'Follow' }}
                    </button>
                    <button class="px-8 py-3 bg-white text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-all border border-slate-300 shadow-sm">
                      Message
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <!-- Tabs with Glass Effect -->
          <div class="mb-8 overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-slate-200/50 shadow-xl">
            <nav class="flex px-2">
              <button
                (click)="setActiveTab('articles')"
                class="flex-1 py-4 text-sm font-bold transition-all relative"
                [class.text-primary-600]="activeTab() === 'articles'"
                [class.text-slate-500]="activeTab() !== 'articles'">
                <span class="relative z-10">Posts</span>
                @if (activeTab() === 'articles') {
                  <div class="absolute inset-0 bg-white rounded-xl shadow-sm m-1"></div>
                }
              </button>
              @if (isOwnProfile()) {
                <button
                  (click)="setActiveTab('favorites')"
                  class="flex-1 py-4 text-sm font-bold transition-all relative"
                  [class.text-primary-600]="activeTab() === 'favorites'"
                  [class.text-slate-500]="activeTab() !== 'favorites'">
                  <span class="relative z-10">Favorites</span>
                  @if (activeTab() === 'favorites') {
                    <div class="absolute inset-0 bg-white rounded-xl shadow-sm m-1"></div>
                  }
                </button>
                <button
                  (click)="setActiveTab('bookmarks')"
                  class="flex-1 py-4 text-sm font-bold transition-all relative"
                  [class.text-primary-600]="activeTab() === 'bookmarks'"
                  [class.text-slate-500]="activeTab() !== 'bookmarks'">
                  <span class="relative z-10">Bookmarks</span>
                  @if (activeTab() === 'bookmarks') {
                    <div class="absolute inset-0 bg-white rounded-xl shadow-sm m-1"></div>
                  }
                </button>
              }
            </nav>
          </div>

          <!-- Search and Content -->
          <div class="space-y-6">
            <div class="flex justify-end">
              <div class="relative w-full max-w-md">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Search articles..."
                  class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-white/80 backdrop-blur-sm" />
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            @if (articlesLoading()) {
              <div class="grid gap-6 md:grid-cols-2">
                @for (i of [1,2,3,4]; track i) {
                  <div class="skeleton h-64 rounded-2xl"></div>
                }
              </div>
            } @else {
              @if (filteredArticles().length > 0) {
                <div class="grid gap-6 md:grid-cols-2">
                  @for (article of filteredArticles(); track article.slug) {
                    <article class="group">
                      <a [routerLink]="['/article', article.slug]"
                         class="block h-full rounded-2xl overflow-hidden bg-white/60 backdrop-blur-xl border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        @if (article.image) {
                          <div class="relative h-48 overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                            <img
                              [src]="article.image"
                              [alt]="article.title"
                              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        } @else {
                          <div class="h-48 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600"></div>
                        }

                        <div class="p-6">
                          <div class="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                              <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
                            </svg>
                            <span>{{ article.createdAt | date: 'MMM d, yyyy' }}</span>
                            <span>•</span>
                            <span>{{ article.readTime || 5 }} min read</span>
                          </div>

                          <h3 class="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {{ article.title }}
                          </h3>

                          <p class="text-slate-600 text-sm line-clamp-3 mb-4">
                            {{ article.description }}
                          </p>

                          @if (article.tagList && article.tagList.length > 0) {
                            <div class="flex flex-wrap gap-2">
                              @for (tag of article.tagList.slice(0, 3); track tag) {
                                <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                  {{ tag }}
                                </span>
                              }
                            </div>
                          }
                        </div>
                      </a>
                    </article>
                  }
                </div>

                @if (totalPages() > 1) {
                  <div class="flex justify-center items-center gap-2 pt-8">
                    <button
                      (click)="goToPage(currentPage() - 1)"
                      [disabled]="currentPage() === 1"
                      class="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/60 backdrop-blur-xl border border-slate-200/50 hover:bg-white hover:shadow-lg">
                      <span class="hidden sm:inline">Previous</span>
                      <span class="sm:hidden">‹</span>
                    </button>

                    @for (page of getVisiblePages(); track $index) {
                      @if (page === -1) {
                        <span class="px-2 text-slate-400">...</span>
                      } @else {
                        <button
                          (click)="goToPage(page)"
                          class="w-10 h-10 rounded-lg font-medium transition-all"
                          [class.bg-primary-500]="currentPage() === page"
                          [class.text-white]="currentPage() === page"
                          [class.shadow-lg]="currentPage() === page"
                          [class.bg-white/60]="currentPage() !== page"
                          [class.backdrop-blur-xl]="currentPage() !== page"
                          [class.border]="currentPage() !== page"
                          [class.border-slate-200/50]="currentPage() !== page"
                          [class.hover:bg-white]="currentPage() !== page"
                          [class.hover:shadow-lg]="currentPage() !== page">
                          {{ page }}
                        </button>
                      }
                    }

                    <button
                      (click)="goToPage(currentPage() + 1)"
                      [disabled]="currentPage() === totalPages()"
                      class="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/60 backdrop-blur-xl border border-slate-200/50 hover:bg-white hover:shadow-lg">
                      <span class="hidden sm:inline">Next</span>
                      <span class="sm:hidden">›</span>
                    </button>
                  </div>
                }
              } @else {
                <div class="p-12 text-center rounded-2xl bg-white/60 backdrop-blur-xl border border-slate-200/50">
                  <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
                  </svg>
                  <p class="text-lg text-slate-600 font-medium">
                    @if (activeTab() === 'articles') {
                      No articles yet
                    } @else if (activeTab() === 'favorites') {
                      No favorites yet
                    } @else {
                      No bookmarks yet
                    }
                  </p>
                  @if (activeTab() === 'articles' && isOwnProfile()) {
                    <a routerLink="/editor" class="inline-block mt-4 px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl">
                      Write your first article
                    </a>
                  }
                </div>
              }
            }
          </div>
        </div>
      </main>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  searchTerm = '';

  filteredArticles(): Article[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.articles();
    return this.articles().filter(a => a.title.toLowerCase().includes(term));
  }
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private bookmarkService = inject(BookmarkService);
  private cacheService = inject(ArticleCacheService);

  profile = signal<User | null>(null);
  articles = signal<Article[]>([]);
  loading = signal(true);
  articlesLoading = signal(false);
  isLoadingMore = signal(false);
  hasMore = signal(true);
  activeTab = signal<TabType>('articles');
  currentUser = signal<User | null>(null);
  totalViews = 0;

  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 20;

  isOwnProfile = computed(() => {
    const user = this.currentUser();
    const profile = this.profile();
    return user?.username === profile?.username;
  });

  constructor() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser.set(user);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight - 300 && !this.isLoadingMore() && this.hasMore()) {
      this.loadMoreArticles();
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const username = params['username'];
      if (username) {
        this.loadProfile(username);
      }
    });
  }

  loadProfile(username: string): void {
    this.loading.set(true);
    this.userService.getProfile(username).subscribe({
      next: (profile: User) => {
        this.profile.set(profile);
        this.loading.set(false);
        this.loadArticles();
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.loading.set(false);
        this.router.navigate(['/']);
      },
    });
  }

  loadArticles(): void {
    const profile = this.profile();
    if (!profile) return;

    this.articlesLoading.set(true);
    this.currentPage.set(1);
    this.hasMore.set(true);

    // Bookmarks tab için özel işlem
    if (this.activeTab() === 'bookmarks') {
      this.loadBookmarkedArticles();
      return;
    }

    const config: ArticleListConfig = {
      filters: {
        author: this.activeTab() === 'articles' ? profile.username : undefined,
        favorited: this.activeTab() === 'favorites' ? profile.username : undefined,
        limit: this.pageSize,
        offset: 0,
      }
    };

    // Check cache first
    const cacheKey = {
      ...config.filters,
      tab: this.activeTab(),
      username: profile.username
    };
    const cachedArticles = this.cacheService.get(cacheKey);

    if (cachedArticles) {
      this.articles.set(cachedArticles);
      this.articlesLoading.set(false);
      this.hasMore.set(cachedArticles.length >= this.pageSize);
      return;
    }

    this.articleService.getArticles(config).subscribe({
      next: (response) => {
        this.articles.set(response.articles);
        this.totalPages.set(Math.ceil(response.articlesCount / this.pageSize));
        this.hasMore.set(response.articles.length >= this.pageSize);
        this.articlesLoading.set(false);

        // Cache the results
        this.cacheService.set(cacheKey, response.articles);
      },
      error: (error: any) => {
        console.error('Error loading articles:', error);
        this.articlesLoading.set(false);
      },
    });
  }

  loadMoreArticles(): void {
    if (this.isLoadingMore() || !this.hasMore() || this.activeTab() === 'bookmarks') return;

    const profile = this.profile();
    if (!profile) return;

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    const config: ArticleListConfig = {
      filters: {
        author: this.activeTab() === 'articles' ? profile.username : undefined,
        favorited: this.activeTab() === 'favorites' ? profile.username : undefined,
        limit: this.pageSize,
        offset: (nextPage - 1) * this.pageSize,
      }
    };

    this.articleService.getArticles(config).subscribe({
      next: (response) => {
        const newArticles = response.articles;

        if (newArticles.length === 0) {
          this.hasMore.set(false);
        } else {
          this.articles.update(current => [...current, ...newArticles]);
          this.currentPage.set(nextPage);
          this.hasMore.set(newArticles.length >= this.pageSize);
        }

        this.isLoadingMore.set(false);
      },
      error: (error: any) => {
        console.error('Error loading more articles:', error);
        this.isLoadingMore.set(false);
      },
    });
  }

  onToggleFavorite(article: Article): void {
    const wasFavorited = article.favorited;

    if (wasFavorited) {
      this.articleService.unfavoriteArticle(article.slug).subscribe({
        next: (updatedArticle) => {
          // If we're on favorites tab and article was unfavorited, remove from list
          if (this.activeTab() === 'favorites') {
            const filtered = this.articles().filter(a => a.slug !== article.slug);
            this.articles.set(filtered);

            // If list is empty, reload to show "no articles" message
            if (filtered.length === 0) {
              this.loadArticles();
            }
          } else {
            // Update article in the list for other tabs
            const index = this.articles().findIndex(a => a.slug === article.slug);
            if (index !== -1) {
              const updated = [...this.articles()];
              updated[index] = updatedArticle;
              this.articles.set(updated);
            }
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

  loadBookmarkedArticles(): void {
    const bookmarks = this.bookmarkService.getBookmarks();

    if (bookmarks.length === 0) {
      this.articles.set([]);
      this.totalPages.set(1);
      this.articlesLoading.set(false);
      return;
    }

    // Her bookmark için article çek
    const articleRequests = bookmarks.map(slug =>
      this.articleService.getArticle(slug)
    );

    // Paralel olarak tüm article'ları çek
    import('rxjs').then(rxjs => {
      rxjs.forkJoin(articleRequests).subscribe({
        next: (articles) => {
          this.articles.set(articles);
          this.totalPages.set(1);
          this.articlesLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading bookmarked articles:', error);
          this.articlesLoading.set(false);
        }
      });
    });
  }

  setActiveTab(tab: TabType): void {
    if (this.activeTab() !== tab) {
      this.activeTab.set(tab);
      this.currentPage.set(1);
      this.hasMore.set(true);
      this.articles.set([]); // Clear articles when switching tabs
      this.loadArticles();
    }
  }

  toggleFollow(): void {
    const profile = this.profile();
    if (!profile) return;

    const action = profile.following
      ? this.userService.unfollowUser(profile.username)
      : this.userService.followUser(profile.username);

    action.subscribe({
      next: (updatedProfile: User) => {
        this.profile.set(updatedProfile);
      },
      error: (error: any) => {
        console.error('Error toggling follow:', error);
      },
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadArticles();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }
}
