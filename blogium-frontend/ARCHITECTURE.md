# Blogium - Frontend Architecture

## 📁 Proje Yapısı

```
src/app/
├── app.ts                          # Ana uygulama component'i
├── app.html                        # Ana layout (Header + Router + Footer)
├── app.routes.ts                   # Route tanımlamaları
├── app.config.ts                   # Uygulama konfigürasyonu
│
├── core/                           # Temel servisler ve global functionality
│   ├── guards/
│   │   └── auth.guard.ts          # Route koruma (authGuard, noAuthGuard)
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # HTTP isteklerine JWT token ekleme
│   └── services/
│       ├── auth.service.ts        # Kimlik doğrulama servisi
│       ├── user.service.ts        # Kullanıcı profil servisi
│       └── article.service.ts     # Makale CRUD servisi
│
├── shared/                         # Paylaşılan componentler ve modeller
│   ├── components/
│   │   ├── header/
│   │   │   └── header.component.ts     # Global header (tüm sayfalarda görünür)
│   │   ├── footer/
│   │   │   └── footer.component.ts     # Global footer
│   │   ├── loading/
│   │   │   └── loading.component.ts    # Loading spinner
│   │   └── article-card/
│   │       └── article-card.component.ts
│   └── models/
│       ├── article.model.ts       # Article, Comment interface'leri
│       └── user.model.ts          # User, Profile interface'leri
│
└── features/                       # Feature modülleri (lazy-loaded)
    ├── home/
    │   └── home.component.ts      # Ana sayfa (makale listesi)
    ├── article/
    │   └── article.component.ts   # Makale detay sayfası
    ├── editor/
    │   └── editor.component.ts    # Makale oluşturma/düzenleme
    ├── auth/
    │   ├── login/
    │   │   └── login.component.ts        # Giriş formu
    │   ├── register/
    │   │   └── register.component.ts     # Kayıt formu
    │   └── verify-email/
    │       └── verify-email.component.ts # Email doğrulama (OTP)
    ├── profile/
    │   └── profile.component.ts   # Kullanıcı profil sayfası
    └── settings/
        └── settings.component.ts  # Ayarlar sayfası
```

## 🎯 Mimari Prensipler

### 1. **Modüler Yapı**
- **Core**: Singleton servisler, guards, interceptors
- **Shared**: Tüm feature'larda kullanılabilecek componentler
- **Features**: İzole, lazy-loaded feature modülleri

### 2. **Smart/Dumb Component Pattern**
- **Smart Components** (Container): Business logic, servisleri inject eder
  - Örnek: `home.component.ts`, `article.component.ts`
- **Dumb Components** (Presentational): Sadece @Input/@Output, UI odaklı
  - Örnek: `article-card.component.ts`, `loading.component.ts`

### 3. **Standalone Components**
- Angular 20 standalone component yapısı kullanılıyor
- NgModules yok, her component kendi import'larını yönetiyor

### 4. **Lazy Loading**
- Tüm feature component'leri lazy-loaded
- `app.routes.ts` içinde `loadComponent()` ile yüklenir

### 5. **Reactive Programming**
- RxJS Observables ve Signals kullanımı
- Signal-based state management
- BehaviorSubject için auth state

## 🔐 Authentication Flow

```
1. Login/Register → AuthService.login() / register()
2. Backend JWT token döndürür
3. AuthService token'ı localStorage'a kaydeder
4. AuthInterceptor her HTTP isteğine token ekler
5. AuthGuard protected route'ları kontrol eder
6. Email verification (OTP) için verify-email component'i
```

## 🎨 Design System

### Renk Paleti
```css
--primary: #1173d4          /* Mavi */
--background-light: #f6f7f8 /* Açık gri */
--slate-900: #0f172a        /* Koyu metin */
--slate-600: #475569        /* Orta ton metin */
--slate-200: #e2e8f0        /* Açık border */
```

### Typography
- **Font**: Newsreader (display başlıklar)
- **Sans-serif**: Inter (body text)

### Component Design
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Clean, minimal, Medium-inspired UI

## 📡 API Integration

### Backend URL
```typescript
environment.apiUrl = 'http://localhost:5000/api'
```

### API Response Format
Tüm API response'lar wrapped:
```typescript
// Articles
{ article: ArticleDto }
{ articles: ArticleDto[], articlesCount: number }

// Comments
{ comment: CommentDto }
{ comments: CommentDto[] }

// Auth
{ user: UserDto, token: string }
```

### HTTP Interceptor
```typescript
AuthInterceptor → Her isteğe Authorization: Bearer <token> ekler
```

## 🚀 State Management

### Global State
- **AuthService**: `isAuthenticated$` (BehaviorSubject)
- **CurrentUser**: localStorage + signal

### Local State
- Component-level signals
- Form data ve UI state

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Strategy
- Flexbox ve CSS Grid
- Tailwind responsive utilities (sm:, md:, lg:)
- Mobile-first approach

## 🔄 Routing Strategy

### Public Routes
- `/` - Home
- `/article/:slug` - Article detail
- `/profile/:username` - User profile

### Auth-Only Routes (authGuard)
- `/editor` - Create article
- `/editor/:slug` - Edit article
- `/settings` - User settings

### Guest-Only Routes (noAuthGuard)
- `/auth/login` - Login
- `/auth/register` - Register

### Special Routes
- `/auth/verify-email` - Email verification (OTP)

## 🎯 Best Practices

1. **Single Responsibility**: Her component tek bir işe odaklı
2. **DRY**: Shared component'ler için tekrar kullanım
3. **Type Safety**: TypeScript strict mode
4. **Error Handling**: Try-catch ve RxJS error operators
5. **Performance**: Lazy loading, OnPush change detection
6. **Security**: JWT tokens, route guards, HTTP-only cookies (backend)

## 🐛 Known Issues & Solutions

### Issue: Duplicate Headers
**Problem**: Auth sayfalarında iki header görünüyor
**Solution**: Auth component'lerinden header kaldırıldı, sadece app.html'de global header

### Issue: API Response Mismatch
**Problem**: Frontend `response.article` bekliyor, backend direkt `article` dönüyordu
**Solution**: Backend controller'larda `new { article }` wrapper eklendi

## 📚 Dependencies

```json
{
  "@angular/core": "^20.0.0",
  "@angular/common": "^20.0.0",
  "@angular/router": "^20.0.0",
  "rxjs": "^7.8.0",
  "tailwindcss": "^3.4.0"
}
```

## 🔮 Future Improvements

1. **State Management**: NgRx veya Signals-based state library
2. **Testing**: Unit tests (Jasmine/Karma) ve E2E tests (Cypress)
3. **PWA**: Service workers, offline support
4. **Internationalization**: i18n support
5. **Analytics**: Google Analytics entegrasyonu
6. **SEO**: Server-side rendering optimizasyonları
7. **Accessibility**: ARIA labels, keyboard navigation
8. **Performance**: Image lazy loading, bundle optimization

---
Last updated: 2025-10-18
