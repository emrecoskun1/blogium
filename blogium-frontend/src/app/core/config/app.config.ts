import { environment } from '../../../environments/environment';

/**
 * Production-ready configuration helper
 */
export class AppConfig {
  /**
   * Check if app is running in production mode
   */
  static isProduction(): boolean {
    return environment.production;
  }

  /**
   * Get API URL
   */
  static getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Check if logging is enabled
   */
  static isLoggingEnabled(): boolean {
    return environment.enableLogging;
  }

  /**
   * Log message only in development
   */
  static log(message: string, ...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.log(`[Blogium] ${message}`, ...args);
    }
  }

  /**
   * Log error (always logged)
   */
  static error(message: string, error?: any): void {
    console.error(`[Blogium Error] ${message}`, error);
  }

  /**
   * Log warning
   */
  static warn(message: string, ...args: any[]): void {
    if (this.isLoggingEnabled()) {
      console.warn(`[Blogium Warning] ${message}`, ...args);
    }
  }

  /**
   * Get session timeout in milliseconds
   */
  static getSessionTimeout(): number {
    return environment.sessionTimeout;
  }

  /**
   * Get API timeout in milliseconds
   */
  static getApiTimeout(): number {
    return environment.apiTimeout;
  }

  /**
   * Check if cookies should be secure (HTTPS only)
   */
  static isCookieSecure(): boolean {
    return environment.cookieSecure;
  }

  /**
   * Get cache timeout
   */
  static getCacheTimeout(): number {
    return environment.cacheTimeout;
  }
}
