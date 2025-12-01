import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="flex-1 py-4 md:py-8">
      <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <header class="mb-8">
          <h1 class="text-3xl font-extrabold text-slate-800">Settings</h1>
          <p class="mt-1 text-slate-500">Manage your account and profile settings.</p>
        </header>

        <div class="card-glass p-6 md:p-8">
          <form (ngSubmit)="onSubmit()">
            @if (successMessage()) {
              <div
                class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {{ successMessage() }}
              </div>
            }

            @if (errorMessage()) {
              <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {{ errorMessage() }}
              </div>
            }

            <!-- Profile Information Section -->
            <div class="space-y-6">
              <h2 class="text-xl font-bold text-slate-800 border-b border-slate-200/80 pb-3">
                Profile Information
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-[120px_1fr] items-start gap-4 md:gap-6">
                <label class="form-label mt-2">Profile Picture</label>
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-4">
                    <img [src]="getAvatarUrl()" alt="Avatar" class="w-20 h-20 rounded-full object-cover" />
                    @if (formData.image || selectedFile()) {
                      <button type="button" (click)="removeImage()" class="btn btn-secondary btn-sm">Remove</button>
                    }
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      #fileInput
                      accept="image/*"
                      (change)="onFileSelected($event)"
                      class="hidden" />
                    <button type="button" (click)="fileInput.click()" class="btn btn-secondary btn-sm">
                      Choose Image
                    </button>
                    <span class="text-sm text-slate-500">or</span>
                    <input
                      type="url"
                      [(ngModel)]="formData.image"
                      name="image"
                      placeholder="Enter image URL"
                      class="form-input form-input-sm flex-1 min-w-[150px]"
                      (input)="clearSelectedFile()" />
                  </div>
                  <p class="form-hint">Upload an image or enter a URL.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-4 md:gap-6">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  [(ngModel)]="formData.username"
                  name="username"
                  placeholder="Your username"
                  class="form-input"
                  required />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[120px_1fr] items-start gap-4 md:gap-6">
                <label for="bio" class="form-label mt-2">Bio</label>
                <div>
                  <textarea
                    id="bio"
                    [(ngModel)]="formData.bio"
                    name="bio"
                    placeholder="Tell us about yourself"
                    class="form-input"
                    rows="4"></textarea>
                  <p class="form-hint">Brief description for your profile.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[120px_1fr] items-center gap-4 md:gap-6">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  placeholder="you@example.com"
                  class="form-input"
                  required />
              </div>
            </div>

            <!-- Change Password Section -->
            <div class="mt-8 pt-6 border-t border-slate-200/80 space-y-6">
              <h2 class="text-xl font-bold text-slate-800 border-b border-slate-200/80 pb-3">Change Password</h2>
              <div class="grid grid-cols-1 md:grid-cols-[120px_1fr] items-start gap-4 md:gap-6">
                <label for="password" class="form-label mt-2">New Password</label>
                <div>
                  <input
                    type="password"
                    id="password"
                    [(ngModel)]="formData.password"
                    name="password"
                    placeholder="Leave blank to keep current"
                    class="form-input" />
                  <p class="form-hint">Leave blank if you don't want to change it.</p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="mt-8 pt-6 flex justify-between items-center border-t border-slate-200/80">
              <button type="button" (click)="logout()" class="btn btn-danger">Logout</button>
              <button type="submit" class="btn btn-primary" [disabled]="isSubmitting()">
                {{ isSubmitting() ? 'Saving...' : 'Update Settings' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .form-label {
        @apply text-sm font-medium text-slate-700;
      }
      .form-hint {
        @apply text-xs text-slate-500 mt-1.5;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected formData = {
    username: '',
    email: '',
    bio: '',
    image: '',
    password: ''
  };

  protected isSubmitting = signal(false);
  protected successMessage = signal('');
  protected errorMessage = signal('');
  protected selectedFile = signal<File | null>(null);
  protected previewUrl = signal<string>('');

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.formData = {
        username: user.username,
        email: user.email || '',
        bio: user.bio || '',
        image: user.image || '',
        password: ''
      };
    }
  }

  onSubmit(): void {
    if (this.isSubmitting()) return;

    // Clear previous messages
    this.successMessage.set('');
    this.errorMessage.set('');

    // Validate form
    if (!this.formData.username || this.formData.username.trim().length < 3) {
      this.errorMessage.set('Username must be at least 3 characters long');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!this.formData.email || !this.isValidEmail(this.formData.email)) {
      this.errorMessage.set('Please enter a valid email address');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (this.formData.password && this.formData.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (this.formData.bio && this.formData.bio.length > 500) {
      this.errorMessage.set('Bio cannot exceed 500 characters');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.isSubmitting.set(true);

    const updateData: Partial<User> = {
      username: this.formData.username.trim(),
      email: this.formData.email.trim(),
      bio: this.formData.bio?.trim() || '',
      image: this.formData.image || ''
    };

    // Add password if provided
    if (this.formData.password && this.formData.password.trim()) {
      (updateData as any).password = this.formData.password;
    }

    this.authService.updateUser(updateData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Settings updated successfully!');
        this.formData.password = '';
        this.selectedFile.set(null);
        this.previewUrl.set('');

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Update error:', error);

        // Parse error message
        let errorMsg = 'Failed to update settings. Please try again.';

        if (error?.error?.errors) {
          // Handle validation errors array
          if (Array.isArray(error.error.errors)) {
            errorMsg = error.error.errors.join(', ');
          } else if (typeof error.error.errors === 'object') {
            // Handle object with field-specific errors
            const errors = Object.values(error.error.errors).flat();
            errorMsg = errors.join(', ');
          }
        } else if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }

        this.errorMessage.set(errorMsg);

        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Clear previous error
      this.errorMessage.set('');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select an image file (JPG, PNG, GIF, etc.)');
        input.value = ''; // Reset input
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 5MB. Please choose a smaller image.');
        input.value = ''; // Reset input
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      this.selectedFile.set(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.previewUrl.set(result);
        this.formData.image = result; // Use base64 for now
        this.successMessage.set('Image selected successfully! Click "Update Settings" to save.');

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          if (this.successMessage() === 'Image selected successfully! Click "Update Settings" to save.') {
            this.successMessage.set('');
          }
        }, 3000);
      };
      reader.onerror = () => {
        this.errorMessage.set('Failed to read image file. Please try again.');
        input.value = ''; // Reset input
        this.selectedFile.set(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.formData.image = '';
    this.selectedFile.set(null);
    this.previewUrl.set('');
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set('');
  }

  getAvatarUrl(): string {
    if (this.previewUrl()) {
      return this.previewUrl();
    }
    if (this.formData.image) {
      return this.formData.image;
    }
    const user = this.authService.getCurrentUser();
    if (user?.image) {
      return user.image;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.formData.username || 'default'}`;
  }
}
