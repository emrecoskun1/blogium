import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Article, Comment } from '../../shared/models/article.model';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { BookmarkService } from '../../core/services/bookmark.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AvatarHelper } from '../../shared/utils/avatar.helper';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingComponent, AsyncPipe],
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (article()) {
      <main class="flex-1 py-4 md:py-8">
        <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <!-- Article Header -->
          <header class="mb-8 md:mb-12">
            <div class="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              @if (article()!.tagList.length > 0) {
                <a class="text-primary-600 hover:underline" href="#">{{ article()!.tagList[0] }}</a>
                <span class="text-slate-400">/</span>
              }
              <span class="text-slate-700 truncate">{{ article()!.title }}</span>
            </div>

            <h1 class="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-800 md:text-4xl lg:text-5xl">
              {{ article()!.title }}
            </h1>

            <div class="mt-6 flex items-center gap-4">
              <a [routerLink]="['/profile', article()!.author.username]" class="flex items-center gap-3 group">
                <img
                  [src]="getAvatarUrl(article()!.author)"
                  alt="{{ article()!.author.username }}"
                  class="w-11 h-11 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary-500 transition-shadow" />
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ article()!.author.username }}</p>
                  <p class="text-xs text-slate-500">
                    {{ article()!.createdAt | date: 'MMM d, yyyy' }} · {{ article()!.readTime }} min read
                  </p>
                </div>
              </a>
            </div>
          </header>

          <!-- Floating Actions Bar -->
          <div
            class="sticky top-24 z-20 my-8 flex flex-wrap gap-3 sm:gap-4 rounded-full p-2 card-glass items-center justify-center max-w-sm mx-auto">
            <!-- Favorite Button (Heart) -->
            <button
              (click)="toggleFavorite()"
              [disabled]="!(isAuthenticated$ | async)"
              [attr.title]="
                (isAuthenticated$ | async)
                  ? (article()!.favorited ? 'Unfavorite' : 'Favorite')
                  : 'Log in to favorite'
              "
              class="btn btn-circle btn-secondary group"
              [class.btn-favorited]="article()!.favorited">
              <svg
                class="w-6 h-6 text-slate-500 group-hover:text-red-500 transition-colors"
                [class.text-red-500]="article()!.favorited"
                fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
              </svg>
              <span class="text-sm font-semibold" [class.text-red-500]="article()!.favorited">
                {{ article()!.favoritesCount }}
              </span>
            </button>

            <!-- Comments Count -->
            <a href="#comments" class="btn btn-circle btn-secondary group">
              <svg
                class="w-6 h-6 text-slate-500 group-hover:text-primary-600 transition-colors"
                fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path>
              </svg>
              <span class="text-sm font-semibold">{{ comments().length }}</span>
            </a>

            <!-- Bookmark Button (Save) -->
            <button
              (click)="toggleBookmark()"
              [disabled]="!(isAuthenticated$ | async)"
              [attr.title]="
                (isAuthenticated$ | async) ? (isBookmarked() ? 'Remove bookmark' : 'Bookmark article') : 'Log in to bookmark'
              "
              class="btn btn-circle btn-secondary group"
              [class.btn-bookmarked]="isBookmarked()">
              <svg
                class="w-6 h-6 text-slate-500 group-hover:text-primary-600 transition-colors"
                [class.text-primary-600]="isBookmarked()"
                fill="currentColor"
                viewBox="0 0 256 256">
                <path
                  d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"></path>
              </svg>
              <span class="text-sm font-semibold" [class.text-primary-600]="isBookmarked()"> Save </span>
            </button>

            <!-- Edit/Delete Actions for Owner -->
            @if (canModify()) {
              <button (click)="editArticle()" class="btn btn-circle btn-secondary group" title="Edit Article">
                <svg
                  class="w-6 h-6 text-slate-500 group-hover:text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button (click)="deleteArticle()" class="btn btn-circle btn-secondary group" title="Delete Article">
                <svg
                  class="w-6 h-6 text-slate-500 group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            }
          </div>

          <!-- Article Image -->
          @if (article()!.image) {
            <div class="my-8 w-full overflow-hidden rounded-2xl md:rounded-3xl shadow-lg">
              <div
                class="w-full bg-cover bg-center aspect-[16/9]"
                [style.background-image]="'url(' + article()!.image + ')'"></div>
            </div>
          }

          <!-- Article Content -->
          <div class="prose" [innerHTML]="formatBody(article()!.body)"></div>

          <!-- Tags -->
          @if (article()!.tagList && article()!.tagList.length > 0) {
            <div class="flex flex-wrap gap-2 mt-8 md:mt-12">
              @for (tag of article()!.tagList; track tag) {
                <span class="px-3 py-1.5 text-xs font-medium bg-slate-200/70 text-slate-700 rounded-full">
                  {{ tag }}
                </span>
              }
            </div>
          }

          <!-- Comments Section -->
          <div id="comments" class="mt-12 md:mt-16 pt-8 border-t border-slate-200/80">
            <h2 class="text-2xl font-bold text-slate-800">Responses ({{ comments().length }})</h2>

            <!-- Comment Form -->
            @if (isAuthenticated$ | async) {
              <div class="mt-6 card-glass p-4">
                <div class="flex items-start gap-3">
                  <img
                    [src]="getAvatarUrl(authService.getCurrentUser()!)"
                    class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div class="flex-1">
                    <textarea
                      [(ngModel)]="newComment"
                      placeholder="What are your thoughts?"
                      class="form-input w-full"
                      rows="4"></textarea>
                    <div class="mt-3 flex justify-end">
                      <button
                        (click)="submitComment()"
                        [disabled]="!newComment.trim()"
                        class="btn btn-primary">
                        Publish Response
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
              <div class="mt-6 text-center py-8 px-4 card-glass">
                <p class="text-slate-600">
                  <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline">Sign in</a>
                  or
                  <a routerLink="/auth/register" class="text-primary-600 font-medium hover:underline">sign up</a>
                  to leave a response.
                </p>
              </div>
            }

            <!-- Comments List -->
            <div class="mt-8 space-y-4">
              @if (comments().length === 0 && (isAuthenticated$ | async)) {
                <p class="text-center text-slate-500 py-8">No responses yet. Be the first to respond!</p>
              }
              @for (comment of comments(); track comment.id) {
                <div class="flex w-full flex-row items-start justify-start gap-4 p-4 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <img
                    [src]="getAvatarUrl(comment.author)"
                    alt="{{ comment.author.username }}"
                    class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div class="flex h-full flex-1 flex-col items-start justify-start">
                    <div class="flex w-full flex-row items-baseline justify-between gap-x-2">
                      <div class="flex items-baseline gap-2">
                        <a
                          [routerLink]="['/profile', comment.author.username]"
                          class="text-sm font-bold text-slate-800 hover:underline">
                          {{ comment.author.username }}
                        </a>
                        <p class="text-xs text-slate-500">{{ comment.createdAt | date: 'MMM d, yyyy' }}</p>
                      </div>
                      @if (canModifyComment(comment)) {
                        <button
                          (click)="deleteComment(comment.id)"
                          class="text-xs text-red-600 hover:text-red-800 font-medium">
                          Delete
                        </button>
                      }
                    </div>
                    <p class="mt-2 text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {{ comment.body }}
                    </p>
                  </div>
                </div>
              }
            </div>
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

      .btn-circle {
        @apply rounded-full px-2;
      }

      .btn-favorited {
        @apply bg-red-100/50 border-red-200/80;
      }

      .btn-bookmarked {
        @apply bg-blue-100/50 border-blue-200/80;
      }

      .comment-author-image {
        @apply bg-blue-500/50 border-blue-200/80;
      }
    `,
  ],
})
export class ArticleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  protected authService = inject(AuthService);
  private bookmarkService = inject(BookmarkService);
  private sanitizer = inject(DomSanitizer);

  protected article = signal<Article | null>(null);
  protected comments = signal<Comment[]>([]);
  protected loading = signal(true);
  protected newComment = '';
  protected isAuthenticated$ = this.authService.isAuthenticated$;
  protected currentUser = signal(this.authService.getCurrentUser());
  protected isBookmarked = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadArticle(params['slug']);
    });
  }

  loadArticle(slug: string): void {
    this.loading.set(true);

    this.articleService.getArticle(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.checkBookmarkStatus();
        this.loading.set(false);
        this.loadComments(slug);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  loadComments(slug: string): void {
    this.articleService.getComments(slug).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      }
    });
  }

  toggleFavorite(): void {
    const article = this.article();
    if (!article) return;

    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (article.favorited) {
      this.articleService.unfavoriteArticle(article.slug).subscribe({
        next: (updated) => {
          this.article.set(updated);
          console.log('Article unfavorited successfully');
        },
        error: (error) => {
          console.error('Failed to unfavorite article:', error);
        }
      });
    } else {
      this.articleService.favoriteArticle(article.slug).subscribe({
        next: (updated) => {
          this.article.set(updated);
          console.log('Article favorited successfully');
        },
        error: (error) => {
          console.error('Failed to favorite article:', error);
        }
      });
    }
  }

  toggleBookmark(): void {
    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const article = this.article();
    if (!article) return;

    const isNowBookmarked = this.bookmarkService.toggleBookmark(article.slug);
    this.isBookmarked.set(isNowBookmarked);

    console.log(isNowBookmarked ? 'Article bookmarked' : 'Bookmark removed');
  }

  private checkBookmarkStatus(): void {
    const article = this.article();
    if (!article) return;

    this.isBookmarked.set(this.bookmarkService.isBookmarked(article.slug));
  }

  canModify(): boolean {
    const article = this.article();
    const user = this.authService.getCurrentUser();
    return !!article && !!user && article.author.id === user.id;
  }

  editArticle(): void {
    const article = this.article();
    if (article) {
      this.router.navigate(['/editor', article.slug]);
    }
  }

  deleteArticle(): void {
    if (confirm('Are you sure you want to delete this article?')) {
      const article = this.article();
      if (article) {
        this.articleService.deleteArticle(article.slug).subscribe({
          next: () => {
            this.router.navigate(['/']);
          }
        });
      }
    }
  }

  submitComment(): void {
    if (!this.newComment.trim()) return;

    const article = this.article();
    if (article) {
      this.articleService.addComment(article.slug, this.newComment.trim()).subscribe({
        next: (comment) => {
          // Add comment to the beginning of the list
          this.comments.update(comments => [comment, ...comments]);
          this.newComment = '';

          // Show success message
          console.log('Comment added successfully');
        },
        error: (error) => {
          console.error('Failed to add comment:', error);
          alert('Failed to add comment. Please try again.');
        }
      });
    }
  }

  canModifyComment(comment: Comment): boolean {
    const user = this.authService.getCurrentUser();
    return !!user && comment.author.id === user.id;
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      const article = this.article();
      if (article) {
        this.articleService.deleteComment(article.slug, commentId).subscribe({
          next: () => {
            this.comments.update(comments => comments.filter(c => c.id !== commentId));
            console.log('Comment deleted successfully');
          },
          error: (error) => {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment. Please try again.');
          }
        });
      }
    }
  }

  getAvatarUrl(user: { username: string; image?: string | null }): string {
    return AvatarHelper.getAvatarUrl(user);
  }

  formatBody(body: string): SafeHtml {
    // If body already looks like HTML, sanitize and return it
    if (body.includes('<p>') || body.includes('<h1>') || body.includes('<div>')) {
      return this.sanitizer.sanitize(1, body) || '';
    }

    // Otherwise, convert simple markdown-like formatting
    const formatted = body
      .replace(/\n/g, '<br>')
      .replace(/#{3} (.+)/g, '<h3>$1</h3>')
      .replace(/#{2} (.+)/g, '<h2>$1</h2>')
      .replace(/#{1} (.+)/g, '<h1>$1</h1>');

    return this.sanitizer.sanitize(1, formatted) || '';
  }
}
