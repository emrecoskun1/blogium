import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="container-auth">
        <div class="card-glass">
          <div class="card-header">
            <h1 class="title">Şifremi Unuttum</h1>
            <p class="subtitle">
              Şifrenizi sıfırlamak için e-posta adresinizi girin.
            </p>
          </div>

          <div *ngIf="success && successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="card-body">
            <fieldset [disabled]="loading">
              <div class="form-group">
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="E-posta Adresiniz"
                  class="form-input"
                  [class.is-invalid]="form.controls.email.invalid && form.controls.email.touched"
                />
                <div
                  *ngIf="form.controls.email.invalid && form.controls.email.touched"
                  class="input-feedback"
                >
                  Geçerli bir e-posta adresi girmeniz gerekiyor.
                </div>
              </div>

              <button
                type="submit"
                [disabled]="form.invalid || loading"
                class="btn btn-primary w-full"
              >
                <span *ngIf="loading" class="loader"></span>
                <span *ngIf="!loading">Sıfırlama Kodu Gönder</span>
              </button>
            </fieldset>
          </form>

          <div class="card-footer">
            <p>
              Giriş ekranına geri dönmek için
              <a routerLink="/login" class="link">tıklayın</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = false;
  success = false;
  successMessage: string | null = null;
  error: string | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit() {
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    try {
      const result = await this.auth.forgotPassword(this.form.value.email!);
      this.success = true;
      this.successMessage = result.message;
    } catch (err: any) {
      this.error = err?.error?.message || 'Bir hata oluştu.';
    }
    this.loading = false;
  }
}
