import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, NotificationDropdownComponent],
  template: `
    <header
      class="sticky top-0 z-50 transition-all duration-300"
      [class.header-scrolled]="isScrolled()"
      [class.header-top]="!isScrolled()">
      <div class="flex items-center justify-between px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3">
        <div class="flex items-center gap-3 sm:gap-6 lg:gap-8 flex-1 min-w-0">
          <a routerLink="/" class="flex items-center gap-2 sm:gap-3 text-slate-900 flex-shrink-0">
            <div class="h-5 w-5 sm:h-6 sm:w-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 class="text-lg sm:text-xl font-bold hidden xs:block">Blogium</h2>
          </a>
          <button class="lg:hidden ml-2" (click)="toggleMobileMenu()">
            <svg class="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav class="hidden lg:flex items-center gap-6 xl:gap-9">
            @if (isAuthenticated$ | async) {
              <a routerLink="/" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.HOME' | translate }}</a>
              <a routerLink="/editor" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.WRITE' | translate }}</a>
              <a routerLink="/import/medium" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.IMPORT_MEDIUM' | translate }}</a>
              <a routerLink="/stats" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.STATS' | translate }}</a>
              <a routerLink="/settings" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.SETTINGS' | translate }}</a>
            } @else {
              <a href="#" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">Our story</a>
              <a href="#" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">Membership</a>
              <a routerLink="/auth/register" class="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors whitespace-nowrap">{{ 'HEADER.WRITE' | translate }}</a>
            }
          </nav>
        </div>
        <!-- Mobil menü -->
        @if (showMobileMenu) {
          <div class="fixed inset-0 z-50 lg:hidden" (click)="toggleMobileMenu()">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <!-- Menu Panel -->
            <div class="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl" (click)="$event.stopPropagation()">
              <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-slate-200">
                  <h2 class="text-lg font-bold text-slate-900">{{ 'HEADER.MENU' | translate }}</h2>
                  <button (click)="toggleMobileMenu()" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Search -->
                                <!-- Search -->
                <div class="p-4 border-b border-slate-200">
                  <input
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="onSearch(); toggleMobileMenu()"
                    class="form-input w-full"
                    [placeholder]="'HEADER.SEARCH_PLACEHOLDER' | translate" />
                </div>

                <!-- Navigation -->
                <nav class="flex-1 overflow-y-auto p-4">
                  <div class="space-y-2">
                    @if (isAuthenticated$ | async) {
                      <a routerLink="/" (click)="toggleMobileMenu()" 
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.HOME' | translate }}</span>
                      </a>
                      <a routerLink="/editor" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.WRITE' | translate }}</span>
                      </a>
                      <a routerLink="/import/medium" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.IMPORT_MEDIUM' | translate }}</span>
                      </a>
                      <a routerLink="/stats" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.STATS' | translate }}</span>
                      </a>
                      <a routerLink="/settings" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z"/>
                          <path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.SETTINGS' | translate }}</span>
                      </a>
                    } @else {
                      <a routerLink="/" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.HOME' | translate }}</span>
                      </a>
                      <a routerLink="/auth/register" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-white bg-black hover:bg-slate-800 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z"/>
                        </svg>
                        <span class="font-medium">{{ 'HEADER.WRITE' | translate }}</span>
                      </a>
                      <a routerLink="/auth/login" (click)="toggleMobileMenu()"
                         class="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <span class="font-medium">{{ 'HEADER.SIGN_IN' | translate }}</span>
                      </a>
                    }
                  </div>
                </nav>
              </div>
            </div>
          </div>
        }
        <div class="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4">
          @if (isAuthenticated$ | async) {
            <app-notification-dropdown></app-notification-dropdown>
            
            <!-- Language Switcher -->
            <div class="relative language-switcher">
              <button (click)="toggleLanguageMenu(); $event.stopPropagation()"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
                <span class="hidden sm:inline">{{ currentLanguageName() }}</span>
              </button>
              @if (showLanguageMenu()) {
                <div class="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 py-2 z-50 animate-fadeIn">
                  @for (lang of supportedLanguages; track lang) {
                    <button
                      (click)="changeLanguage(lang)"
                      class="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors"
                      [class.bg-slate-50]="currentLanguage() === lang"
                      [class.font-semibold]="currentLanguage() === lang">
                      <span>{{ getLanguageName(lang) }}</span>
                      @if (currentLanguage() === lang) {
                        <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              }
            </div>

            <label class="relative hidden md:block w-40 lg:w-48 xl:w-64">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="text-slate-400 w-4 h-4" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <input
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                class="form-input w-full pl-9 pr-3"
                placeholder="Search..." />
            </label>
            <!-- Profile Dropdown -->
            <div class="relative profile-dropdown">
              <button (click)="toggleProfileMenu(); $event.stopPropagation()"
                      class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 sm:size-9 lg:size-10 cursor-pointer hover:ring-2 hover:ring-primary-500/30 transition-all flex-shrink-0"
                      [style.background-image]="(currentUser$ | async)?.image ? 'url(' + (currentUser$ | async)!.image + ')' : 'none'">
                @if (!(currentUser$ | async)?.image) {
                  <div class="w-full h-full rounded-full bg-primary-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    {{ ((currentUser$ | async)?.username || 'U').charAt(0).toUpperCase() }}
                  </div>
                }
              </button>
              @if (showProfileMenu()) {
                <div class="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 py-2 z-50 animate-fadeIn">
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                      @if ((currentUser$ | async)?.image) {
                        <img [src]="(currentUser$ | async)!.image" class="w-10 h-10 rounded-full" />
                      } @else {
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                          {{ ((currentUser$ | async)?.username || 'U').charAt(0).toUpperCase() }}
                        </div>
                      }
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-slate-900 truncate">{{ (currentUser$ | async)?.username }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ (currentUser$ | async)?.email }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Menu Items -->
                  <div class="py-2">
                    <a [routerLink]="['/profile', (currentUser$ | async)?.username]" (click)="showProfileMenu.set(false)"
                       class="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100/70 transition-all">
                      <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ 'HEADER.PROFILE' | translate }}</p>
                        <p class="text-xs text-slate-500">{{ 'PROFILE.VIEW_PROFILE' | translate }}</p>
                      </div>
                    </a>
                    <a routerLink="/stats" (click)="showProfileMenu.set(false)"
                       class="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100/70 transition-all">
                      <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ 'HEADER.STATS' | translate }}</p>
                        <p class="text-xs text-slate-500">{{ 'PROFILE.VIEW_ANALYTICS' | translate }}</p>
                      </div>
                    </a>
                    <a routerLink="/settings" (click)="showProfileMenu.set(false)"
                       class="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100/70 transition-all">
                      <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                        <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ 'HEADER.SETTINGS' | translate }}</p>
                        <p class="text-xs text-slate-500">{{ 'PROFILE.ACCOUNT_SETTINGS' | translate }}</p>
                      </div>
                    </a>
                  </div>

                  <!-- Logout -->
                  <div class="border-t border-slate-100 pt-2">
                    <button (click)="logout()"
                            [disabled]="isLoggingOut()"
                            class="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all w-full text-left disabled:opacity-50 disabled:cursor-not-allowed rounded-lg mx-2">
                      @if (isLoggingOut()) {
                        <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <span class="font-semibold">{{ 'HEADER.SIGNING_OUT' | translate }}</span>
                      } @else {
                        <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                          </svg>
                        </div>
                        <span class="font-semibold">{{ 'HEADER.SIGN_OUT' | translate }}</span>
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="hidden sm:flex items-center justify-center rounded-full h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm font-bold text-slate-700 hover:text-primary-500 transition-colors whitespace-nowrap">
              <span>{{ 'HEADER.SIGN_IN' | translate }}</span>
            </a>
            <a routerLink="/auth/register" class="flex items-center justify-center rounded-full h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-5 bg-primary-500 text-white text-xs sm:text-sm font-bold transition-colors hover:bg-primary-600 whitespace-nowrap">
              <span class="hidden sm:inline">{{ 'HEADER.GET_STARTED' | translate }}</span>
              <span class="sm:hidden">{{ 'AUTH.REGISTER' | translate }}</span>
            </a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* iOS 26-style transparent header */
    .header-top {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .header-scrolled {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    /* iOS-style smooth transitions */
    header {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class HeaderComponent {
  showMobileMenu = false;
  protected isScrolled = signal(false);

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Update scroll state for header transparency
    this.isScrolled.set(window.pageYOffset > 50);
  }
  private authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);

  protected isAuthenticated$ = this.authService.isAuthenticated$;
  protected currentUser$ = this.authService.currentUser$;
  protected showProfileMenu = signal(false);
  protected showLanguageMenu = signal(false);
  protected isLoggingOut = signal(false);
  protected searchQuery = '';
  
  // Language properties
  protected supportedLanguages = this.languageService.getSupportedLanguages();
  protected currentLanguage = signal(this.languageService.getCurrentLanguage());
  protected currentLanguageName = signal(this.languageService.getLanguageName(this.languageService.getCurrentLanguage()));

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu.update(val => !val);
    this.showLanguageMenu.set(false);
  }

  toggleLanguageMenu() {
    this.showLanguageMenu.update(val => !val);
    this.showProfileMenu.set(false);
  }

  changeLanguage(lang: string) {
    this.languageService.setLanguage(lang);
    this.currentLanguage.set(lang);
    this.currentLanguageName.set(this.languageService.getLanguageName(lang));
    this.showLanguageMenu.set(false);
  }

  getLanguageName(code: string): string {
    return this.languageService.getLanguageName(code);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.showProfileMenu.set(false);
    }
    if (!target.closest('.language-switcher')) {
      this.showLanguageMenu.set(false);
    }
  }

  logout() {
    this.isLoggingOut.set(true);
    // Kullanıcı deneyimi için kısa loading
    setTimeout(() => {
      this.authService.logout();
      this.showProfileMenu.set(false);
      this.isLoggingOut.set(false);
      this.router.navigate(['/']);
    }, 300);
  }
}
