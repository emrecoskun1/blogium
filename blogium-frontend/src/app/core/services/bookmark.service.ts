import { Injectable, inject } from '@angular/core';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private cookieService = inject(CookieService);
  private readonly BOOKMARK_KEY = 'user_bookmarks';

  /**
   * Get all bookmarked article slugs
   */
  getBookmarks(): string[] {
    const bookmarksStr = this.cookieService.getCookie(this.BOOKMARK_KEY);
    if (!bookmarksStr) return [];

    try {
      return JSON.parse(decodeURIComponent(bookmarksStr));
    } catch (e) {
      console.error('Error parsing bookmarks:', e);
      return [];
    }
  }

  /**
   * Add article to bookmarks
   */
  addBookmark(slug: string): boolean {
    const bookmarks = this.getBookmarks();

    if (bookmarks.includes(slug)) {
      return false; // Already bookmarked
    }

    bookmarks.push(slug);
    this.saveBookmarks(bookmarks);
    return true;
  }

  /**
   * Remove article from bookmarks
   */
  removeBookmark(slug: string): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(slug);

    if (index === -1) {
      return false; // Not found
    }

    bookmarks.splice(index, 1);
    this.saveBookmarks(bookmarks);
    return true;
  }

  /**
   * Check if article is bookmarked
   */
  isBookmarked(slug: string): boolean {
    return this.getBookmarks().includes(slug);
  }

  /**
   * Toggle bookmark status
   */
  toggleBookmark(slug: string): boolean {
    const isCurrentlyBookmarked = this.isBookmarked(slug);

    if (isCurrentlyBookmarked) {
      this.removeBookmark(slug);
      return false;
    } else {
      this.addBookmark(slug);
      return true;
    }
  }

  /**
   * Clear all bookmarks
   */
  clearBookmarks(): void {
    this.cookieService.deleteCookie(this.BOOKMARK_KEY);
  }

  /**
   * Get bookmark count
   */
  getBookmarkCount(): number {
    return this.getBookmarks().length;
  }

  /**
   * Save bookmarks to cookie
   */
  private saveBookmarks(bookmarks: string[]): void {
    const bookmarksStr = encodeURIComponent(JSON.stringify(bookmarks));
    // Store for 365 days
    this.cookieService.setCookie(this.BOOKMARK_KEY, bookmarksStr, 365);
  }
}
