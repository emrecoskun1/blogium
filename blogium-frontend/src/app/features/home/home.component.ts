import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { ArticleCacheService } from '../../core/services/article-cache.service';
import { Article } from '../../shared/models/article.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <main class="flex-1 bg-white min-h-screen">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-amber-400 to-amber-500 border-b border-amber-600/20">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div class="max-w-2xl mx-auto text-center">
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-black mb-6 drop-shadow-sm">
              {{ 'HOME.HERO_TITLE' | translate }}
            </h1>
            <p class="text-lg md:text-xl text-black/90 mb-10 max-w-xl mx-auto">
              {{ 'HOME.HERO_SUBTITLE' | translate }}
            </p>
            <button
              routerLink="/auth/register"
              class="px-10 py-3.5 bg-black text-white rounded-full text-base font-medium hover:bg-slate-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
              {{ 'HOME.START_READING' | translate }}
            </button>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-8">
            <div class="border-b border-slate-200 mb-8">
              <nav class="flex gap-8 overflow-x-auto">
                <button
                  (click)="selectCategory('all')"
                  class="py-4 text-sm whitespace-nowrap border-b transition-colors"
                  [class.border-black]="activeCategory() === 'all'"
                  [class.text-black]="activeCategory() === 'all'"
                  [class.border-transparent]="activeCategory() !== 'all'"
                  [class.text-slate-500]="activeCategory() !== 'all'">
                  {{ 'HOME.FOR_YOU' | translate }}
                </button>
                @for (category of categories.slice(0, 6); track category) {
                  <button
                    (click)="selectCategory(category)"
                    class="py-4 text-sm whitespace-nowrap border-b transition-colors capitalize"
                    [class.border-black]="activeCategory() === category"
                    [class.text-black]="activeCategory() === category"
                    [class.border-transparent]="activeCategory() !== category"
                    [class.text-slate-500]="activeCategory() !== category">
                    {{ category }}
                  </button>
                }
              </nav>
            </div>

            @if (isLoading() && articles().length === 0) {
              <div class="space-y-6">
                @for (i of [1,2,3]; track i) {
                  <div class="skeleton h-32 w-full"></div>
                }
              </div>
            } @else {
              <div class="space-y-8">
                @for (article of articles(); track article.id) {
                  <article class="py-6 border-b border-slate-200">
                    <div class="flex gap-6">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-3">
                          @if (article.author.image) {
                            <img [src]="article.author.image" [alt]="article.author.username"
                              class="w-5 h-5 rounded-full" />
                          } @else {
                            <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                              <span class="text-xs">{{ article.author.username.charAt(0).toUpperCase() }}</span>
                            </div>
                          }
                          <span class="text-sm font-medium">{{ article.author.username }}</span>
                        </div>

                        <a [routerLink]="['/article', article.slug]" class="block mb-2">
                          <h2 class="text-xl md:text-2xl font-bold text-slate-900 hover:text-slate-700 line-clamp-2">
                            {{ article.title }}
                          </h2>
                        </a>

                        @if (article.description) {
                          <p class="text-slate-600 mb-4 line-clamp-2 hidden md:block">
                            {{ article.description }}
                          </p>
                        }

                        <div class="flex items-center gap-4 text-sm text-slate-500">
                          <time [dateTime]="article.createdAt">
                            {{ article.createdAt | date: 'MMM d' }}
                          </time>
                          @if (article.tagList && article.tagList.length > 0) {
                            <span class="px-2 py-1 bg-slate-100 rounded-full text-xs">
                              {{ article.tagList[0] }}
                            </span>
                          }
                        </div>
                      </div>

                      @if (article.image) {
                        <a [routerLink]="['/article', article.slug]">
                          <div class="w-28 h-28 md:w-36 md:h-36 bg-cover bg-center rounded"
                            [style.background-image]="'url(' + article.image + ')'"></div>
                        </a>
                      }
                    </div>
                  </article>
                }
              </div>

              @if (isLoadingMore()) {
                <div class="py-8 flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-black"></div>
                </div>
              }

              @if (!hasMore() && articles().length > 0) {
                <div class="py-8 text-center text-slate-500">
                  {{ 'HOME.END_OF_FEED' | translate }}
                </div>
              }
            }
          </div>

          <aside class="hidden lg:block lg:col-span-4">
            <div class="sticky top-20">
              <h3 class="text-sm font-bold mb-4">{{ 'HOME.STAFF_PICKS' | translate }}</h3>
              <div class="space-y-4 mb-8">
                @for (article of trendingArticles(); track article.id) {
                  <a [routerLink]="['/article', article.slug]" class="block group">
                    <div class="flex gap-3">
                      @if (article.author.image) {
                        <img [src]="article.author.image" [alt]="article.author.username"
                          class="w-5 h-5 rounded-full" />
                      } @else {
                        <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                          <span class="text-[10px]">{{ article.author.username.charAt(0).toUpperCase() }}</span>
                        </div>
                      }
                      <div class="flex-1">
                        <p class="text-sm font-medium mb-1">{{ article.author.username }}</p>
                        <h4 class="text-sm font-bold group-hover:text-slate-600 line-clamp-2">
                          {{ article.title }}
                        </h4>
                      </div>
                    </div>
                  </a>
                }
              </div>

              <h3 class="text-sm font-bold mb-4">{{ 'HOME.RECOMMENDED_TOPICS' | translate }}</h3>
              <div class="flex flex-wrap gap-2 mb-8">
                @for (category of categories.slice(0, 7); track category) {
                  <button (click)="selectCategory(category)"
                    class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-sm rounded-full capitalize">
                    {{ category }}
                  </button>
                }
              </div>

              <div class="pt-4 border-t border-slate-200">
                <div class="flex flex-wrap gap-4 text-xs text-slate-500">
                  <a href="#" class="hover:text-slate-900">{{ 'HOME.HELP' | translate }}</a>
                  <a href="#" class="hover:text-slate-900">{{ 'HOME.STATUS' | translate }}</a>
                  <a href="#" class="hover:text-slate-900">{{ 'HOME.ABOUT' | translate }}</a>
                  <a href="#" class="hover:text-slate-900">{{ 'HOME.PRIVACY' | translate }}</a>
                  <a href="#" class="hover:text-slate-900">{{ 'HOME.TERMS' | translate }}</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);
  private cacheService = inject(ArticleCacheService);
  private route = inject(ActivatedRoute);

  protected articles = signal<Article[]>([]);
  protected activeCategory = signal<string>('all');
  protected isLoading = signal<boolean>(false);
  protected isLoadingMore = signal<boolean>(false);
  protected searchQuery = signal<string>('');
  protected currentPage = signal<number>(1);
  protected articlesPerPage = 20;
  protected hasMore = signal<boolean>(true);

  categories: string[] = [];

  trendingArticles = computed(() => {
    return this.articles().slice(0, 6);
  });

  ngOnInit(): void {
    this.cacheService.clearOldCaches();
    this.loadTags();

    this.route.queryParams.subscribe(params => {
      const search = params['search'];
      if (search) {
        this.searchQuery.set(search);
      }
      this.loadArticles();
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

  loadTags(): void {
    const cachedTags = sessionStorage.getItem('blogium_tags');
    if (cachedTags) {
      try {
        this.categories = JSON.parse(cachedTags).slice(0, 10);
        return;
      } catch (error) {
        console.error('Error parsing cached tags:', error);
      }
    }

    this.articleService.getTags().subscribe({
      next: (tags) => {
        this.categories = tags.slice(0, 10);
        try {
          sessionStorage.setItem('blogium_tags', JSON.stringify(tags));
        } catch (error) {
          console.error('Error caching tags:', error);
        }
      },
      error: (error) => {
        console.error('Failed to load tags:', error);
      }
    });
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.currentPage.set(1);

    const filters: any = {
      limit: this.articlesPerPage,
      offset: 0
    };

    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    if (this.activeCategory() !== 'all') {
      filters.tag = this.activeCategory();
    }

    const cacheKey = {
      ...filters,
      category: this.activeCategory()
    };
    const cachedArticles = this.cacheService.get(cacheKey);

    if (cachedArticles) {
      this.articles.set(cachedArticles);
      this.isLoading.set(false);
      this.hasMore.set(cachedArticles.length >= this.articlesPerPage);
      return;
    }

    this.articleService.getArticles({ filters }).subscribe({
      next: (response) => {
        this.articles.set(response.articles);
        this.hasMore.set(response.articles.length >= this.articlesPerPage);
        this.isLoading.set(false);
        this.cacheService.set(cacheKey, response.articles);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadMoreArticles(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;

    const filters: any = {
      limit: this.articlesPerPage,
      offset: (nextPage - 1) * this.articlesPerPage
    };

    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    if (this.activeCategory() !== 'all') {
      filters.tag = this.activeCategory();
    }

    this.articleService.getArticles({ filters }).subscribe({
      next: (response) => {
        const newArticles = response.articles;

        if (newArticles.length === 0) {
          this.hasMore.set(false);
        } else {
          this.articles.update(current => [...current, ...newArticles]);
          this.currentPage.set(nextPage);
          this.hasMore.set(newArticles.length >= this.articlesPerPage);
        }

        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
      }
    });
  }

  selectCategory(category: string): void {
    this.activeCategory.set(category);
    this.currentPage.set(1);
    this.hasMore.set(true);
    this.loadArticles();
  }
}
