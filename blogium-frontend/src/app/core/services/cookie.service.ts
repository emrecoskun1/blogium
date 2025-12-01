import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Set a cookie with enhanced security for production
   */
  setCookie(name: string, value: string, days: number = 7, path: string = '/'): void {
    if (!this.isBrowser) return;

    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }

    // Production için secure ve SameSite ayarları
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? '; Secure' : '';
    const sameSite = '; SameSite=Strict';

    document.cookie = `${name}=${value || ''}${expires}; path=${path}${secureFlag}${sameSite}`;
  }

  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    if (!this.isBrowser) return null;

    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }

  /**
   * Delete a cookie
   */
  deleteCookie(name: string, path: string = '/'): void {
    if (!this.isBrowser) return;
    document.cookie = `${name}=; Max-Age=-99999999; path=${path}`;
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    if (!this.isBrowser) return false;
    return this.getCookie(name) !== null;
  }

  /**
   * Clear all cookies (for logout)
   */
  clearAllCookies(): void {
    if (!this.isBrowser) return;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      this.deleteCookie(name);
    }
  }

  /**
   * Get all cookies as object
   */
  getAllCookies(): { [key: string]: string } {
    if (!this.isBrowser) return {};

    const cookies: { [key: string]: string } = {};
    const ca = document.cookie.split(';');

    for (const cookie of ca) {
      const [name, value] = cookie.split('=').map(c => c.trim());
      if (name) {
        cookies[name] = value;
      }
    }

    return cookies;
  }
}
