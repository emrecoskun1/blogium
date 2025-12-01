import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-md space-y-8">
        <header class="text-center">
          <h1 class="text-3xl font-extrabold text-slate-800">{{ 'AUTH.WELCOME' | translate }}</h1>
          <p class="mt-2 text-slate-500">{{ 'AUTH.SIGN_IN_SUBTITLE' | translate }}</p>
        </header>

        <div class="card-glass p-6 md:p-8">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div *ngIf="errorMessage()" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {{ errorMessage() }}
            </div>

            <div class="space-y-4">
              <div>
                <label for="email-address" class="sr-only">{{ 'AUTH.EMAIL' | translate }}</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="formData.email"
                  class="form-input w-full"
                  [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" />
              </div>

              <div>
                <label for="password" class="sr-only">{{ 'AUTH.PASSWORD' | translate }}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  [(ngModel)]="formData.password"
                  class="form-input w-full"
                  [placeholder]="'AUTH.PASSWORD_PLACEHOLDER' | translate" />
              </div>
            </div>

            <div class="text-center">
              <a
                routerLink="/auth/forgot-password"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                {{ 'AUTH.FORGOT_PASSWORD' | translate }}
              </a>
            </div>

            <div>
              <button type="submit" class="btn btn-primary w-full" [disabled]="isSubmitting()">
                {{ isSubmitting() ? ('AUTH.LOGGING_IN' | translate) : ('AUTH.LOGIN' | translate) }}
              </button>
            </div>

            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-300/60"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-white/50 px-2 text-slate-500 backdrop-blur-sm">{{ 'AUTH.OR_CONTINUE' | translate }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" (click)="loginWithGoogle()" class="btn btn-secondary">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5" />
                Google
              </button>
              <button type="button" (click)="loginWithGithub()" class="btn btn-secondary">
                <img src="https://www.svgrepo.com/show/394174/github.svg" alt="Github" class="w-5 h-5" />
                Github
              </button>
            </div>
          </form>
        </div>

        <footer class="text-center space-y-2">
          <p class="text-sm text-slate-600">
            {{ 'AUTH.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="font-medium text-primary-600 hover:underline"> {{ 'AUTH.SIGN_UP_LINK' | translate }} </a>
          </p>
          <p class="text-xs text-slate-500">
            {{ 'AUTH.TERMS_AGREEMENT' | translate }}
            <a href="#" class="font-medium text-primary-600 hover:underline">{{ 'AUTH.TERMS' | translate }}</a>
            {{ 'AUTH.AND' | translate }}
            <a href="#" class="font-medium text-primary-600 hover:underline">{{ 'AUTH.PRIVACY_POLICY' | translate }}</a>.
          </p>
        </footer>
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LoginComponent {
  loginWithGithub() {
    window.location.href = 'http://localhost:5000/api/auth/github';
  }
  loginWithGoogle() {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }
  private authService = inject(AuthService);
  private router = inject(Router);

  protected formData = {
    email: '',
    password: ''
  };

  protected isSubmitting = signal(false);
  protected errorMessage = signal('');

  onSubmit(): void {
    if (this.isSubmitting()) return;

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService.login(this.formData.email, this.formData.password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const errorMsg = error?.error?.message || error?.error?.errors?.join(', ') || 'Invalid email or password. Please try again.';
        this.errorMessage.set(errorMsg);
      }
    });
  }
}
