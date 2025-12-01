
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthUser, User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private platformId = inject(PLATFORM_ID);

  // (Removed duplicate implementation at top, keeping only the correct one below)
// (Removed duplicate misplaced AuthService class and imports)

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Session timeout: 24 hours
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  private sessionCheckInterval: any;

  constructor() {
    if (this.isBrowser()) {
      this.loadUserFromCookies();
      this.startSessionCheck();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadUserFromCookies(): void {
    if (!this.isBrowser()) return;

    const token = this.cookieService.getCookie('auth_token');
    const userStr = this.cookieService.getCookie('current_user');
    const lastActivity = this.cookieService.getCookie('last_activity');

    if (userStr && token && lastActivity) {
      // Check session timeout
      const lastActivityTime = parseInt(lastActivity, 10);
      const now = Date.now();

      if (now - lastActivityTime > this.SESSION_TIMEOUT) {
        console.log('Session expired');
        this.logout();
        return;
      }

      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.updateLastActivity();
      } catch (e) {
        console.error('Error parsing user from cookies', e);
        this.logout();
      }
    }
  }

  private updateLastActivity(): void {
    if (!this.isBrowser()) return;
    this.cookieService.setCookie('last_activity', Date.now().toString(), 7);
  }

  private startSessionCheck(): void {
    if (!this.isBrowser()) return;

    // Check session every 5 minutes
    this.sessionCheckInterval = setInterval(() => {
      const lastActivity = this.cookieService.getCookie('last_activity');
      if (lastActivity) {
        const lastActivityTime = parseInt(lastActivity, 10);
        const now = Date.now();

        if (now - lastActivityTime > this.SESSION_TIMEOUT) {
          console.log('Session timeout - logging out');
          this.logout();
        }
      }
    }, 5 * 60 * 1000);
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<{ user: AuthUser }>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      map(response => response.user),
      tap(user => {
        if (this.isBrowser()) {
          // Store in secure cookies (7 days)
          this.cookieService.setCookie('auth_token', user.token, 7);
          this.cookieService.setCookie('current_user', encodeURIComponent(JSON.stringify(user)), 7);
          this.updateLastActivity();
        }
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(username: string, email: string, password: string): Observable<AuthUser> {
    return this.http.post<{ user: AuthUser; message: string }>(`${environment.apiUrl}/auth/register`, {
      username,
      email,
      password
    }).pipe(
      map(response => response.user),
      tap(user => {
        // Kayıt işleminden sonra token olmayacak (email doğrulanmadı)
        // Token boş olduğu için localStorage'a kaydetmiyoruz
        console.log('Registration successful. Please verify your email.');
      }),
      catchError(error => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      // Clear all authentication cookies
      this.cookieService.deleteCookie('auth_token');
      this.cookieService.deleteCookie('current_user');
      this.cookieService.deleteCookie('last_activity');

      // Clear session check interval
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
      }
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    // Update activity on user access
    if (this.currentUserSubject.value && this.isBrowser()) {
      this.updateLastActivity();
    }
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    const token = this.cookieService.getCookie('auth_token');

    // Update activity when token is accessed
    if (token) {
      this.updateLastActivity();
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  updateUser(user: Partial<User>): Observable<User> {
    return this.http.put<AuthUser>(`${environment.apiUrl}/users`, user).pipe(
      tap(updatedUser => {
        if (this.isBrowser()) {
          this.cookieService.setCookie('current_user', encodeURIComponent(JSON.stringify(updatedUser)), 7);
          if (updatedUser.token) {
            this.cookieService.setCookie('auth_token', updatedUser.token, 7);
          }
          this.updateLastActivity();
        }
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Update user error:', error);
        throw error;
      })
    );
  }

  verifyEmail(email: string, code: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/verify-email`, {
      email,
      code
    }).pipe(
      catchError(error => {
        console.error('Verify email error:', error);
        throw error;
      })
    );
  }

  resendVerificationCode(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/resend-code`, {
      email
    }).pipe(
      catchError(error => {
        console.error('Resend code error:', error);
        throw error;
      })
    );
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email })
      .toPromise()
      .then(response => ({ message: response?.message || 'İşlem başarılı.' }))
      .catch(error => {
        console.error('Forgot password error:', error);
        throw error;
      });
  }

  resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      email,
      code,
      newPassword
    })
      .toPromise()
      .then(() => {})
      .catch(error => {
        console.error('Reset password error:', error);
        throw error;
      });
  }

  /**
   * Şifre sıfırlama için token ve yeni şifre ile backend'e istek atar
   */
  resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      token: token,
      newPassword: newPassword
    })
      .toPromise()
      .then(() => {})
      .catch((error: any) => {
        console.error('Reset password with token error:', error);
        throw error;
      });
  }
}
