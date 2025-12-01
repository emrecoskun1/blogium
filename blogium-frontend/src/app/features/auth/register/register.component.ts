import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-md space-y-8">
        <header class="text-center">
          <h1 class="text-3xl font-extrabold text-slate-800">{{ 'AUTH.REGISTER_TITLE' | translate }}</h1>
          <p class="mt-2 text-slate-500">{{ 'AUTH.SIGN_UP_SUBTITLE' | translate }}</p>
        </header>

        <div class="card-glass p-6 md:p-8">
          <form class="space-y-6" (ngSubmit)="onSubmit()">
            @if (errorMessage()) {
              <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <div class="space-y-4">
              <div>
                <label for="username" class="sr-only">{{ 'AUTH.USERNAME' | translate }}</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autocomplete="username"
                  required
                  [(ngModel)]="formData.username"
                  class="form-input w-full"
                  [class.border-red-500]="validationErrors()['username']"
                  [placeholder]="'AUTH.USERNAME_PLACEHOLDER' | translate" />
                @if (validationErrors()['username']) {
                  <p class="mt-1.5 text-xs text-red-600">{{ validationErrors()['username'] }}</p>
                }
              </div>

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
                  [class.border-red-500]="validationErrors()['email']"
                  [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" />
                @if (validationErrors()['email']) {
                  <p class="mt-1.5 text-xs text-red-600">{{ validationErrors()['email'] }}</p>
                }
              </div>

              <div>
                <label for="password" class="sr-only">{{ 'AUTH.PASSWORD' | translate }}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="formData.password"
                  class="form-input w-full"
                  [class.border-red-500]="validationErrors()['password']"
                  [placeholder]="'AUTH.CREATE_PASSWORD' | translate" />
                @if (validationErrors()['password']) {
                  <p class="mt-1.5 text-xs text-red-600">{{ validationErrors()['password'] }}</p>
                } @else {
                  <p class="mt-1.5 text-xs text-slate-500">
                    {{ 'AUTH.PASSWORD_REQUIREMENTS' | translate }}
                  </p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="sr-only">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  [(ngModel)]="formData.confirmPassword"
                  class="form-input w-full"
                  [class.border-red-500]="validationErrors()['confirmPassword']"
                  [placeholder]="'AUTH.CONFIRM_PASSWORD_PLACEHOLDER' | translate" />
                @if (validationErrors()['confirmPassword']) {
                  <p class="mt-1.5 text-xs text-red-600">{{ validationErrors()['confirmPassword'] }}</p>
                }
              </div>
            </div>

            <div>
              <button type="submit" class="btn btn-primary w-full" [disabled]="isSubmitting()">
                {{ isSubmitting() ? ('AUTH.REGISTERING' | translate) : ('AUTH.CONTINUE' | translate) }}
              </button>
            </div>
          </form>
        </div>

        <footer class="text-center space-y-2">
          <p class="text-sm text-slate-600">
            {{ 'AUTH.HAVE_ACCOUNT' | translate }}
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:underline"> {{ 'AUTH.SIGN_IN_LINK' | translate }} </a>
          </p>
          <p class="text-xs text-slate-500">
            {{ 'AUTH.SIGN_UP_AGREEMENT' | translate }}
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
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  protected isSubmitting = signal(false);
  protected errorMessage = signal('');
  protected validationErrors = signal<{ [key: string]: string }>({});

  private validateForm(): boolean {
    const errors: { [key: string]: string } = {};

    // Username validation
    if (!this.formData.username.trim()) {
      errors['username'] = 'Kullanıcı adı gereklidir';
    } else if (this.formData.username.length < 3) {
      errors['username'] = 'Kullanıcı adı en az 3 karakter olmalıdır';
    } else if (this.formData.username.length > 20) {
      errors['username'] = 'Kullanıcı adı en fazla 20 karakter olabilir';
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.formData.username)) {
      errors['username'] = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    // Email validation
    if (!this.formData.email.trim()) {
      errors['email'] = 'Email gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      errors['email'] = 'Geçerli bir email adresi giriniz';
    }

    // Password validation
    if (!this.formData.password) {
      errors['password'] = 'Şifre gereklidir';
    } else if (this.formData.password.length < 6) {
      errors['password'] = 'Şifre en az 6 karakter olmalıdır';
    } else if (this.formData.password.length > 100) {
      errors['password'] = 'Şifre en fazla 100 karakter olabilir';
    } else if (!/(?=.*[a-z])/.test(this.formData.password)) {
      errors['password'] = 'Şifre en az bir küçük harf içermelidir';
    } else if (!/(?=.*[A-Z])/.test(this.formData.password)) {
      errors['password'] = 'Şifre en az bir büyük harf içermelidir';
    } else if (!/(?=.*\d)/.test(this.formData.password)) {
      errors['password'] = 'Şifre en az bir rakam içermelidir';
    }

    // Confirm password validation
    if (!this.formData.confirmPassword) {
      errors['confirmPassword'] = 'Şifre tekrarı gereklidir';
    } else if (this.formData.password !== this.formData.confirmPassword) {
      errors['confirmPassword'] = 'Şifreler eşleşmiyor';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    this.errorMessage.set('');

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register(
      this.formData.username,
      this.formData.email,
      this.formData.password
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Yeni kayıtlarda email doğrulama sayfasına yönlendir
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: this.formData.email }
        });
      },
      error: (error: any) => {
        this.isSubmitting.set(false);
        const errorMsg = error?.error?.message || error?.error?.errors?.join(', ') || error?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.';
        this.errorMessage.set(errorMsg);
      }
    });
  }
}
