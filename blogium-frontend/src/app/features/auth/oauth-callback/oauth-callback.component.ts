import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from '../../../core/services/cookie.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-gray-600">Processing OAuth login...</p>
        <p class="mt-2 text-sm text-gray-500" *ngIf="debugMessage">{{ debugMessage }}</p>
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cookieService = inject(CookieService);
  private http = inject(HttpClient);

  debugMessage = '';

  ngOnInit() {
    console.log('OAuth Callback component initialized');

    // Get token from URL query parameter
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      const token = params['token'];

      if (token) {
        this.debugMessage = 'Token received, processing...';
        console.log('Token received:', token.substring(0, 20) + '...');

        // Store token in cookie first
        this.cookieService.setCookie('auth_token', token, 7);
        console.log('Token stored in cookie');

        // Fetch current user info with the token in header
        this.debugMessage = 'Fetching user info...';
        this.http.get<any>(`${environment.apiUrl}/users/current`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).subscribe({
          next: (response) => {
            console.log('User info received:', response);
            this.debugMessage = 'User info received, redirecting...';

            // Store user data in cookie (response is the user object directly)
            this.cookieService.setCookie('current_user', encodeURIComponent(JSON.stringify(response)), 7);
            this.cookieService.setCookie('last_activity', Date.now().toString(), 7);

            console.log('Cookies set, redirecting to home');

            // Redirect to home with full page reload
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
          },
          error: (err) => {
            console.error('Failed to fetch user:', err);
            console.error('Error details:', err.error);
            this.debugMessage = 'Error: ' + (err.error?.message || err.message || 'Unknown error');

            // If token is invalid, redirect to login
            this.cookieService.deleteCookie('auth_token');
            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { error: 'oauth_failed' }
              });
            }, 2000);
          }
        });
      } else {
        console.error('No token in URL');
        this.debugMessage = 'No token received';

        // No token, redirect to login
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { error: 'oauth_failed' }
          });
        }, 2000);
      }
    });
  }
}
