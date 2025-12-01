import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private readonly STORAGE_KEY = 'blogium_language';
  private readonly SUPPORTED_LANGUAGES = ['tr', 'en'];
  private readonly DEFAULT_LANGUAGE = 'en';

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    // Add supported languages
    this.translate.addLangs(this.SUPPORTED_LANGUAGES);

    // Get saved language or detect from browser
    const savedLang = this.getSavedLanguage();
    const browserLang = this.getBrowserLanguage();
    const defaultLang = savedLang || browserLang || this.DEFAULT_LANGUAGE;

    // Set default and current language
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);
    this.setLanguage(defaultLang);
  }

  private getSavedLanguage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  private getBrowserLanguage(): string {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      return this.SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : this.DEFAULT_LANGUAGE;
    }
    return this.DEFAULT_LANGUAGE;
  }

  setLanguage(lang: string): void {
    if (this.SUPPORTED_LANGUAGES.includes(lang)) {
      this.translate.use(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, lang);
      }
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANGUAGE;
  }

  getSupportedLanguages(): string[] {
    return this.SUPPORTED_LANGUAGES;
  }

  getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'tr': 'Türkçe',
      'en': 'English'
    };
    return names[code] || code;
  }

  // Optional: Detect user location via IP (requires external API)
  async detectLanguageByLocation(): Promise<string> {
    try {
      // You can use a service like ipapi.co or ipinfo.io
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Map country codes to languages
      const countryToLang: Record<string, string> = {
        'TR': 'tr',
        'US': 'en',
        'GB': 'en',
        'CA': 'en',
        'AU': 'en',
        // Add more country mappings as needed
      };

      const detectedLang = countryToLang[data.country_code] || this.DEFAULT_LANGUAGE;
      
      // Only auto-switch if user hasn't manually selected a language
      if (!this.getSavedLanguage()) {
        this.setLanguage(detectedLang);
      }
      
      return detectedLang;
    } catch (error) {
      console.error('Failed to detect language by location:', error);
      return this.getBrowserLanguage();
    }
  }
}
