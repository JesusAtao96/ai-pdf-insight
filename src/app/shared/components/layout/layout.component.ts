import { Component, inject, signal, effect, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage],
  template: `
    <!-- Sidebar Navigation -->
    <nav class="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-100 dark:bg-slate-900 border-r-0 z-50 transition-colors duration-300">
      <div class="flex flex-col h-full py-6">
        <div class="px-6 mb-10">
          <span class="text-lg font-bold tracking-tight text-blue-700 dark:text-blue-400 font-manrope uppercase text-[10px] letter-spacing-widest">AI-Powered</span>
          <div class="text-2xl font-bold font-manrope text-slate-800 dark:text-slate-100 mt-1">Document Insight</div>
        </div>
        
        <div class="flex-1 space-y-2">
          <a routerLink="/upload" routerLinkActive="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold scale-[0.98]" 
             class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mx-2 transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">description</span>
            <span class="font-body text-sm font-medium">Process Document</span>
          </a>
          <a routerLink="/history" routerLinkActive="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold scale-[0.98]"
             class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mx-2 transition-all duration-200 rounded-lg">
            <span class="material-symbols-outlined">history</span>
            <span class="font-body text-sm font-medium">History</span>
          </a>
        </div>


        <div class="mt-auto px-2">
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200">
            <span class="material-symbols-outlined">logout</span>
            <span class="font-body text-sm font-medium">Logout</span>
          </button>
          
          @if (user()) {
            <div class="mt-4 px-4 flex items-center gap-3">
              <img [ngSrc]="user()?.photoURL || 'https://lh3.googleusercontent.com/a/default-user'" 
                   width="32" height="32"
                   class="w-8 h-8 rounded-full object-cover" alt="User profile">
              <div class="overflow-hidden">
                <p class="text-xs font-bold font-headline truncate text-slate-800 dark:text-white">{{ user()?.displayName }}</p>
                <p class="text-[10px] text-slate-500 truncate">Premium Tier</p>
              </div>
            </div>
          }
        </div>
      </div>
    </nav>

    <!-- Top Navigation Bar -->
    <header class="h-16 w-[calc(100%-16rem)] sticky top-0 z-40 ml-64 bg-slate-50 dark:bg-slate-950 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div class="flex items-center gap-4">
        <h1 class="font-manrope font-semibold text-xl text-slate-900 dark:text-slate-50">{{ pageTitle() }}</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex gap-4 items-center">
          <button (click)="toggleTheme()" 
                  class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                  [title]="isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span class="material-symbols-outlined">
              {{ isDarkMode() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>
          <button class="material-symbols-outlined text-slate-500 hover:text-blue-600 transition-colors">notifications</button>
          <button class="material-symbols-outlined text-slate-500 hover:text-blue-600 transition-colors">settings</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="ml-64 p-12 min-h-[calc(100vh-4rem)] bg-background dark:bg-black transition-colors duration-300">
      <router-outlet></router-outlet>
    </main>
  `
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly user = this.authService.user;
  
  readonly isDarkMode = signal<boolean>(
    localStorage.getItem('theme') === 'dark'
  );

  readonly pageTitle = computed(() => {
    const url = this.router.url;
    if (url.includes('upload')) return 'Process New Document';
    if (url.includes('history')) return 'Intelligence History';
    if (url.includes('documents')) return 'Detailed Insight';
    return 'Document Insight';
  });

  constructor() {
    // Reactive sync between signal and DOM
    effect(() => {
      const isDark = this.isDarkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleTheme() {
    this.isDarkMode.update((prev: boolean) => !prev);
  }
}


