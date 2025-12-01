import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-import-medium',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-medium.component.html',
  styleUrls: ['./import-medium.component.scss']
})
export class ImportMediumComponent {
  mediumUsername = '';
  loading = false;
  result: string | null = null;
  error: string | null = null;

  // Verification flow
  step: 'input' | 'verify' | 'verified' = 'input';
  verificationCode: string | null = null;
  instructions: string | null = null;
  articleCount: number = 0;
  sampleArticles: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Step 1: Validate username and show preview
  generateCode() {
    if (!this.mediumUsername.trim()) {
      this.error = 'Lütfen Medium kullanıcı adınızı girin.';
      return;
    }

    this.loading = true;
    this.result = null;
    this.error = null;

    const username = this.mediumUsername.trim().replace('@', '');

    this.http.post<any>(`${environment.apiUrl}/import/medium/generate-code`, { username }).subscribe({
      next: (res) => {
        this.verificationCode = res.verificationCode;
        this.instructions = res.instructions;
        this.articleCount = res.articleCount;
        this.sampleArticles = res.sampleArticles || [];
        this.step = 'verify';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Medium hesabı doğrulanamadı.';
        this.loading = false;
      }
    });
  }

  // Step 2: Verify ownership
  verifyOwnership() {
    this.loading = true;
    this.result = null;
    this.error = null;

    const username = this.mediumUsername.trim().replace('@', '');

    this.http.post<any>(`${environment.apiUrl}/import/medium/verify`, { username }).subscribe({
      next: (res) => {
        if (res.verified) {
          this.result = res.message;
          this.step = 'verified';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Doğrulama başarısız oldu.';
        this.loading = false;
      }
    });
  }

  // Step 3: Import articles
  importArticles() {
    this.loading = true;
    this.result = null;
    this.error = null;

    const username = this.mediumUsername.trim().replace('@', '');

    this.http.post<any>(`${environment.apiUrl}/import/medium/import`, { username }).subscribe({
      next: (res) => {
        this.result = res.message;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Makaleler aktarılamadı.';
        this.loading = false;
      }
    });
  }

  // Reset flow
  reset() {
    this.step = 'input';
    this.mediumUsername = '';
    this.verificationCode = null;
    this.instructions = null;
    this.articleCount = 0;
    this.sampleArticles = [];
    this.result = null;
    this.error = null;
  }

  // Copy verification code to clipboard
  copyCode() {
    if (this.verificationCode) {
      navigator.clipboard.writeText(this.verificationCode);
    }
  }
}
