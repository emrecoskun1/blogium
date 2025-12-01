import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Blogium - Where good ideas find you'
  },
  {
    path: 'article/:slug',
    loadComponent: () => import('./features/article/article.component').then(m => m.ArticleComponent),
    title: 'Article - Blogium'
  },
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard],
    title: 'New Story - Blogium'
  },
  {
    path: 'editor/:slug',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
    canActivate: [authGuard],
    title: 'Edit Article - Blogium'
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
    title: 'Settings - Blogium'
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile - Blogium'
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [authGuard],
    title: 'İstatistiklerim - Blogium'
  },
  {
    path: 'import/medium',
    loadComponent: () => import('./features/import/import-medium.component').then(m => m.ImportMediumComponent),
    canActivate: [authGuard],
    title: 'Medium Makalelerini Aktar - Blogium'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
    title: 'Sign In - Blogium'
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent),
    title: 'Processing Login - Blogium'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard],
    title: 'Sign Up - Blogium'
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Verify Email - Blogium'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [noAuthGuard],
    title: 'Şifremi Unuttum - Blogium'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [noAuthGuard],
    title: 'Şifre Sıfırlama - Blogium'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Şifre Sıfırlama - Blogium'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
