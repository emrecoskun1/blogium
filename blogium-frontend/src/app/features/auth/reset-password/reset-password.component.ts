import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="container-auth">
        <div class="card-glass">
          <div class="card-header">
            <h1 class="title">Yeni Şifre Belirle</h1>
            <p class="subtitle">Lütfen yeni şifrenizi girin.</p>
          </div>

          <div *ngIf="success" class="alert alert-success">
            Şifreniz başarıyla sıfırlandı. Giriş sayfasına
            yönlendiriliyorsunuz...
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form
            *ngIf="!success"
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="card-body"
          >
            <fieldset [disabled]="loading">
              <div class="form-group">
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  placeholder="Yeni Şifre"
                  class="form-input"
                  [class.is-invalid]="
                    form.controls.newPassword.invalid &&
                    form.controls.newPassword.touched
                  "
                />
                <div
                  *ngIf="
                    form.controls.newPassword.invalid &&
                    form.controls.newPassword.touched
                  "
                  class="input-feedback"
                >
                  Şifre en az 6 karakter olmalıdır.
                </div>
              </div>

              <div class="form-group">
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Yeni Şifreyi Onayla"
                  class="form-input"
                  [class.is-invalid]="
                    (form.controls.confirmPassword.invalid &&
                      form.controls.confirmPassword.touched) ||
                    (form.hasError('passwordMismatch') &&
                      form.controls.confirmPassword.touched)
                  "
                />
                <div
                  *ngIf="
                    form.hasError('passwordMismatch') &&
                    form.controls.confirmPassword.touched
                  "
                  class="input-feedback"
                >
                  Şifreler eşleşmiyor.
                </div>
              </div>

              <button
                type="submit"
                [disabled]="form.invalid || loading"
                class="btn btn-primary w-full"
              >
                <span *ngIf="loading" class="loader"></span>
                <span *ngIf="!loading">Şifreyi Sıfırla</span>
              </button>
            </fieldset>
          </form>

          <div class="card-footer" *ngIf="!success">
            <p>
              Giriş ekranına geri dönmek için
              <a routerLink="/login" class="link">tıklayın</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  success = false;
  error: string | null = null;
  token: string | null = null;

  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMismatchValidator }
  );

  passwordMismatchValidator(form: any) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    return newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
      if (!this.token) {
        this.error = 'Geçersiz veya eksik şifre sıfırlama bağlantısı.';
      }
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Check for password mismatch specifically
      if (this.form.hasError('passwordMismatch')) {
        this.error = 'Şifreler eşleşmiyor.';
      } else {
        this.error = 'Lütfen formdaki hataları düzeltin.';
      }
      return;
    }

    if (!this.token) {
      this.error = 'Geçersiz veya eksik şifre sıfırlama bağlantısı.';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      await this.auth.resetPasswordWithToken(
        this.token,
        this.form.value.newPassword!
      );
      this.success = true;
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      this.error =
        err?.error?.message ||
        'Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.';
    }
    this.loading = false;
  }
}
