import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { Article } from '../../shared/models/article.model';
import { RichTextEditorComponent } from '../../shared/components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  template: `
    <div class="editor-page">
      <!-- Header with glassmorphism -->
      <div class="editor-header">
        <div class="header-content">
          <div class="header-left">
            <button type="button" class="back-btn" (click)="goBack()" title="Geri Dön">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <div class="header-title">
              <h1>{{ isEditMode() ? 'Makaleyi Düzenle' : 'Yeni Makale' }}</h1>
              <p class="header-subtitle">{{ articleData.title || 'Başlıksız' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button
              type="button"
              class="btn-icon btn-preview"
              title="Önizleme">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            <button
              type="button"
              class="btn btn-primary btn-publish"
              [disabled]="submitting()"
              (click)="submitArticle()">
              <svg *ngIf="submitting()" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ submitting() ? 'Yayınlanıyor...' : (isEditMode() ? 'Güncelle' : 'Yayınla') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Editor Content -->
      <div class="editor-container">
        <div class="editor-main">
          <form (ngSubmit)="submitArticle()" class="editor-form">
            <fieldset [disabled]="submitting()" class="editor-fieldset">

              <!-- Title Input -->
              <div class="title-wrapper">
                <textarea
                  [(ngModel)]="articleData.title"
                  name="title"
                  placeholder="Makale başlığı..."
                  class="title-input"
                  rows="1"
                  (input)="autoResizeTitle($event)"
                  required></textarea>
              </div>

              <!-- Description Input -->
              <div class="description-wrapper">
                <textarea
                  [(ngModel)]="articleData.description"
                  name="description"
                  placeholder="Kısa bir açıklama ekleyin (SEO ve önizlemeler için)..."
                  class="description-input"
                  rows="2"
                  (input)="autoResizeDescription($event)"
                  required></textarea>
              </div>

              <!-- Featured Image Section -->
              <div class="image-section" *ngIf="articleData.image || showImageUpload">
                <div class="image-upload-card" *ngIf="!articleData.image">
                  <input
                    type="file"
                    #imageInput
                    accept="image/*"
                    (change)="onImageSelected($event)"
                    hidden />
                  <div class="upload-area" (click)="imageInput.click()">
                    <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p class="upload-text">Görsel yüklemek için tıklayın</p>
                    <p class="upload-hint">veya URL yapıştırın</p>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="imageUrl"
                    name="imageUrl"
                    (paste)="onImagePaste($event)"
                    (blur)="applyImageUrl()"
                    placeholder="https://example.com/image.jpg"
                    class="url-input" />
                </div>

                <div class="image-preview-card" *ngIf="articleData.image">
                  <img [src]="articleData.image" alt="Önizleme" class="preview-image" />
                  <button type="button" class="remove-image-btn" (click)="removeImage()" title="Görseli Kaldır">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="button"
                *ngIf="!articleData.image && !showImageUpload"
                class="add-image-btn"
                (click)="showImageUpload = true">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Öne çıkan görsel ekle</span>
              </button>

              <!-- Rich Text Editor -->
              <div class="editor-body">
                <app-rich-text-editor
                  [(ngModel)]="articleData.body"
                  name="body"
                  required>
                </app-rich-text-editor>
              </div>

            </fieldset>
          </form>
        </div>

        <!-- Sidebar -->
        <aside class="editor-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">Etiketler</h3>
            <div class="tags-input-group">
              <input
                type="text"
                [(ngModel)]="currentTag"
                (keydown.enter)="addTag($event)"
                placeholder="Etiket ekle..."
                class="tag-input" />
              <button
                type="button"
                class="btn-add-tag"
                (click)="addTag($event, true)"
                [disabled]="!currentTag.trim()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>

            <div class="tags-cloud" *ngIf="articleData.tagList.length > 0">
              <span class="tag-chip" *ngFor="let tag of articleData.tagList">
                {{ tag }}
                <button type="button" class="tag-remove" (click)="removeTag(tag)">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            </div>
            <p class="tags-hint" *ngIf="articleData.tagList.length === 0">
              Makalenizi keşfedilebilir yapmak için etiket ekleyin
            </p>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">İstatistikler</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Kelime</span>
                <span class="stat-value">{{ getWordCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Karakter</span>
                <span class="stat-value">{{ getCharCount() }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Okuma</span>
                <span class="stat-value">{{ getReadTime() }} dk</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private authService = inject(AuthService);

  protected articleData = {
    title: '',
    description: '',
    body: '',
    tagList: [] as string[],
    image: ''
  };

  protected currentTag = '';
  protected submitting = signal(false);
  protected isEditMode = signal(false);
  protected showImageUpload = false;
  protected imageUrl = '';
  private editSlug: string | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.isEditMode.set(true);
        this.editSlug = params['slug'];
        this.loadArticle(params['slug']);
      }
    });
  }

  loadArticle(slug: string): void {
    this.articleService.getArticle(slug).subscribe({
      next: (article) => {
        this.articleData = {
          title: article.title,
          description: article.description,
          body: article.body,
          tagList: [...article.tagList],
          image: article.image || ''
        };
      },
      error: () => {
        this.router.navigate(['/editor']); // Redirect to new editor on error
      }
    });
  }

  addTag(event: Event, fromButton = false): void {
    event.preventDefault();
    if (fromButton || (event as KeyboardEvent).key === 'Enter') {
      const tag = this.currentTag.trim();
      if (tag && !this.articleData.tagList.includes(tag)) {
        this.articleData.tagList.push(tag);
        this.currentTag = '';
      }
    }
  }

  removeTag(tag: string): void {
    this.articleData.tagList = this.articleData.tagList.filter(t => t !== tag);
  }

  submitArticle(): void {
    if (this.submitting()) return;

    // Client-side validation
    const validationErrors: string[] = [];

    if (!this.articleData.title || this.articleData.title.trim().length < 3) {
      validationErrors.push('• Başlık en az 3 karakter olmalıdır');
    } else if (this.articleData.title.length > 200) {
      validationErrors.push('• Başlık 200 karakteri geçmemelidir');
    }

    if (!this.articleData.description || this.articleData.description.trim().length < 10) {
      validationErrors.push('• Açıklama en az 10 karakter olmalıdır');
    } else if (this.articleData.description.length > 500) {
      validationErrors.push('• Açıklama 500 karakteri geçmemelidir');
    }

    if (!this.articleData.body || this.articleData.body.trim().length < 50) {
      validationErrors.push('• Makale içeriği en az 50 karakter olmalıdır');
    }

    // More flexible image validation - accept http://, https://, or base64 data URLs
    if (this.articleData.image && this.articleData.image.trim()) {
      const imageUrl = this.articleData.image.trim();
      const isValidUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
      const isBase64 = imageUrl.startsWith('data:image/');

      if (!isValidUrl && !isBase64) {
        validationErrors.push('• Görsel bir URL (http:// veya https://) veya base64 veri URL\'si olmalıdır');
      }
    }

    if (validationErrors.length > 0) {
      alert('Lütfen aşağıdaki hataları düzeltin:\n\n' + validationErrors.join('\n'));
      return;
    }

    this.submitting.set(true);

    const articleData = {
      title: this.articleData.title.trim(),
      description: this.articleData.description.trim(),
      body: this.articleData.body.trim(),
      tagList: this.articleData.tagList,
      image: this.articleData.image.trim() || undefined
    };

    const operation = this.isEditMode() && this.editSlug
      ? this.articleService.updateArticle(this.editSlug, articleData)
      : this.articleService.createArticle(articleData);

    operation.subscribe({
      next: (article) => {
        this.submitting.set(false);
        this.router.navigate(['/article', article.slug]);
      },
      error: (error) => {
        this.submitting.set(false);
        console.error('Gönderme hatası:', error);

        let errorMsg = 'Makale yayınlanamadı. Lütfen tekrar deneyin.';

        if (error?.error) {
          if (error.error.errors && Array.isArray(error.error.errors)) {
            errorMsg = 'Doğrulama hataları:\n\n• ' + error.error.errors.join('\n• ');
          } else if (error.error.message) {
            errorMsg = error.error.message;
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          }
        }

        alert(errorMsg);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Lütfen bir resim dosyası seçin');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Resim boyutu 10MB\'den küçük olmalıdır');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.articleData.image = result; // Use base64
      };
      reader.readAsDataURL(file);
    }
  }

  onImagePaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://'))) {
      this.articleData.image = pastedText;
      event.preventDefault();
    }
  }

  applyImageUrl(): void {
    if (this.imageUrl && (this.imageUrl.startsWith('http://') || this.imageUrl.startsWith('https://'))) {
      this.articleData.image = this.imageUrl;
      this.imageUrl = '';
      this.showImageUpload = false;
    }
  }

  autoResizeTitle(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  autoResizeDescription(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  getWordCount(): number {
    if (!this.articleData.body) return 0;
    const text = this.articleData.body.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getCharCount(): number {
    if (!this.articleData.body) return 0;
    const text = this.articleData.body.replace(/<[^>]*>/g, '');
    return text.length;
  }

  getReadTime(): number {
    const words = this.getWordCount();
    return Math.ceil(words / 200); // Ortalama okuma hızı: 200 kelime/dakika
  }

  removeImage(): void {
    this.articleData.image = '';
  }

  clearImageFile(): void {
    // Clear any file input when URL is manually entered
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
