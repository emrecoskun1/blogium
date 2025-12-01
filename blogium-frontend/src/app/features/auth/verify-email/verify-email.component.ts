import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <!-- Icon -->
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
              </svg>
            </div>
          </div>

          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-900 mb-2">Email Doğrulama</h1>
            <p class="text-sm text-slate-600">
              <strong class="font-semibold">{{ email }}</strong> adresine gönderilen 6 haneli kodu girin
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ successMessage() }}</span>
              </div>
            }

            <!-- Code Input -->
            <div>
              <label for="code" class="block text-sm font-medium text-slate-700 mb-2">Doğrulama Kodu</label>
              <input
                type="text"
                id="code"
                [(ngModel)]="verificationCode"
                name="code"
                placeholder="000000"
                class="w-full px-4 py-3 text-center text-2xl font-semibold tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                maxlength="6"
                pattern="[0-9]{6}"
                required
                [disabled]="isSubmitting()" />
              <p class="mt-2 text-xs text-slate-500">6 haneli kodu email'inizden kontrol edin</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              [disabled]="isSubmitting() || verificationCode.length !== 6">
              {{ isSubmitting() ? 'Doğrulanıyor...' : 'Doğrula' }}
            </button>

            <!-- Resend Section -->
            <div class="text-center space-y-2">
              <p class="text-sm text-slate-600">Kodu almadınız mı?</p>
              <button
                type="button"
                (click)="resendCode()"
                class="text-sm font-semibold text-primary hover:text-primary/80 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                [disabled]="isResending() || resendCooldown() > 0">
                {{ isResending() ? 'Gönderiliyor...' : resendCooldown() > 0 ? resendCooldown() + ' saniye bekleyin' : 'Kodu Tekrar Gönder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class VerifyEmailComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected email = '';
  protected verificationCode = '';
  protected isSubmitting = signal(false);
  protected isResending = signal(false);
  protected errorMessage = signal('');
  protected successMessage = signal('');
  protected resendCooldown = signal(0);

  private cooldownInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.router.navigate(['/auth/login']);
    }
  }

  ngOnDestroy() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  onSubmit(): void {
    if (this.isSubmitting() || this.verificationCode.length !== 6) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.authService.verifyEmail(this.email, this.verificationCode).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Email başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Doğrulama başarısız. Lütfen tekrar deneyin.');
      }
    });
  }

  resendCode(): void {
    if (this.isResending() || this.resendCooldown() > 0) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isResending.set(true);

    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        this.isResending.set(false);
        this.successMessage.set('Yeni doğrulama kodu email adresinize gönderildi!');
        this.startCooldown();
      },
      error: (error: any) => {
        this.isResending.set(false);
        this.errorMessage.set(error.error?.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
      }
    });
  }

  private startCooldown(): void {
    this.resendCooldown.set(60); // 60 saniye bekleme
    this.cooldownInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        this.resendCooldown.set(0);
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
        }
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }
}
