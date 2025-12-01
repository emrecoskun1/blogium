import { Injectable } from '@angular/core';
import { Article } from '../../shared/models/article.model';

interface CachedArticles {
  data: Article[];
  timestamp: number;
  params: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleCacheService {
  private readonly CACHE_KEY = 'blogium_articles_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private memoryCache = new Map<string, CachedArticles>();

  constructor() {}

  /**
   * Get cached articles if valid
   */
  get(params: Record<string, any>): Article[] | null {
    const cacheKey = this.getCacheKey(params);

    // Check memory cache only (localStorage disabled due to quota issues)
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && this.isValid(memCached.timestamp)) {
      return memCached.data;
    }

    return null;
  }

  /**
   * Store articles in cache
   */
  set(params: Record<string, any>, articles: Article[]): void {
    const cacheKey = this.getCacheKey(params);

    // Only cache in memory to avoid localStorage quota issues
    const cached: CachedArticles = {
      data: articles,
      timestamp: Date.now(),
      params: cacheKey
    };

    this.memoryCache.set(cacheKey, cached);

    // Limit memory cache size to prevent memory leaks
    if (this.memoryCache.size > 20) {
      // Remove oldest entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      // Remove oldest 5 entries
      for (let i = 0; i < 5; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear();
    // Don't clear localStorage to avoid unnecessary operations
  }

  /**
   * Clear expired caches
   */
  clearOldCaches(): void {
    // Only clear expired memory cache entries
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (!this.isValid(value.timestamp)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Invalidate cache for specific params
   */
  invalidate(params: Record<string, any>): void {
    const cacheKey = this.getCacheKey(params);
    this.memoryCache.delete(cacheKey);
  }

  /**
   * Generate cache key from params
   */
  private getCacheKey(params: Record<string, any>): string {
    // Sort keys for consistent cache keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    return JSON.stringify(sortedParams);
  }

  /**
   * Check if cache is still valid
   */
  private isValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }
}
