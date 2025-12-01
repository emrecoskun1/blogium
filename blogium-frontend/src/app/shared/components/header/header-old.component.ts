import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <nav class="navbar">
        <div class="container">
          <div class="navbar-content">
            <a routerLink="/" class="navbar-brand">
              <span class="brand-logo">B</span>
              <span class="brand-name">Blogium</span>
            </a>

            <div class="navbar-nav">
              @if (isAuthenticated$ | async) {
                <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
                  <i class="icon">🏠</i>
                  <span>Home</span>
                </a>
                <a routerLink="/editor" routerLinkActive="active" class="nav-link">
                  <i class="icon">✍️</i>
                  <span>Write</span>
                </a>
                <a routerLink="/settings" routerLinkActive="active" class="nav-link">
                  <i class="icon">⚙️</i>
                  <span>Settings</span>
                </a>
                <a [routerLink]="['/profile', (currentUser$ | async)?.username]" routerLinkActive="active" class="nav-link profile-link">
                  @if ((currentUser$ | async)?.image) {
                    <img [src]="(currentUser$ | async)!.image" [alt]="(currentUser$ | async)?.username" class="user-avatar" />
                  }
                  <span>{{ (currentUser$ | async)?.username }}</span>
                </a>
              } @else {
                <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
                  Home
                </a>
                <a routerLink="/auth/login" routerLinkActive="active" class="nav-link">
                  Sign in
                </a>
                <a routerLink="/auth/register" routerLinkActive="active" class="nav-link btn-primary">
                  Sign up
                </a>
              }
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      background: #fff;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
    }

    .navbar {
      padding: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #242424;
      font-weight: 700;
      font-size: 24px;
      transition: opacity 0.2s;
    }

    .navbar-brand:hover {
      opacity: 0.7;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 700;
    }

    .brand-name {
      letter-spacing: -0.5px;
    }

    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      color: #6b6b6b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      border-radius: 24px;
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: #242424;
      background: #f5f5f5;
    }

    .nav-link.active {
      color: #242424;
      background: #f0f0f0;
    }

    .icon {
      font-size: 16px;
      line-height: 1;
    }

    .btn-primary {
      background: #1a8917;
      color: white;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #156d13;
      color: white;
    }

    .profile-link {
      padding: 4px 12px 4px 4px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    @media (max-width: 768px) {
      .nav-link span {
        display: none;
      }

      .nav-link.profile-link span {
        display: inline;
      }

      .navbar-nav {
        gap: 2px;
      }

      .nav-link {
        padding: 8px 12px;
      }
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  protected currentUser$ = this.authService.currentUser$;
  protected isAuthenticated$ = this.authService.isAuthenticated$;
}
