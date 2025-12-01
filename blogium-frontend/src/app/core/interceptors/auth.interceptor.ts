import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone request and add auth header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Add timeout and error handling
  return next(req).pipe(
    timeout(environment.apiTimeout || 30000),
    catchError((error: HttpErrorResponse) => {
      // Log errors in development
      if (environment.enableLogging) {
        console.error('HTTP Error:', error);
      }

      // Handle 401 Unauthorized
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('Access forbidden');
      }

      // Handle timeout (checking error name more safely)
      if (error.message?.includes('Timeout') || error.statusText === 'Unknown Error') {
        console.error('Request timeout or network error');
      }

      return throwError(() => error);
    })
  );
};
