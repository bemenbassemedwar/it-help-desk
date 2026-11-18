import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export type AppLanguage = 'en' | 'ar';
export type AppTheme = 'light' | 'dark' | 'system';

interface Preferences {
  language: AppLanguage;
  theme: AppTheme;
  sidebarCollapsed: boolean;
}

const PREFS_KEY = 'it-helpdesk-prefs';

const DEFAULTS: Preferences = {
  language: 'en',
  theme: 'system',
  sidebarCollapsed: false,
};

@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _language = signal<AppLanguage>(DEFAULTS.language);
  private readonly _theme = signal<AppTheme>(DEFAULTS.theme);
  private readonly _sidebarCollapsed = signal<boolean>(DEFAULTS.sidebarCollapsed);

  readonly language = this._language.asReadonly();
  readonly theme = this._theme.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  readonly isRtl = computed(() => this._language() === 'ar');
  readonly effectiveTheme = computed<'light' | 'dark'>(() => {
    const t = this._theme();
    if (t !== 'system') return t;
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  constructor() {
    this.loadFromStorage();

    effect(() => {
      this.applyLanguage(this._language());
    });

    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });

    effect(() => {
      this.persist();
    });
  }

  setLanguage(lang: AppLanguage): void {
    this._language.set(lang);
  }

  setTheme(theme: AppTheme): void {
    this._theme.set(theme);
  }

  toggleSidebar(): void {
    this._sidebarCollapsed.update(v => !v);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._sidebarCollapsed.set(collapsed);
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw) as Partial<Preferences>;
        if (prefs.language === 'en' || prefs.language === 'ar') {
          this._language.set(prefs.language);
        }
        if (prefs.theme === 'light' || prefs.theme === 'dark' || prefs.theme === 'system') {
          this._theme.set(prefs.theme);
        }
        if (typeof prefs.sidebarCollapsed === 'boolean') {
          this._sidebarCollapsed.set(prefs.sidebarCollapsed);
        }
      }
    } catch {
      // corrupted — use defaults
    }

    this.applyLanguage(this._language());
    this.applyTheme(this.effectiveTheme());
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const prefs: Preferences = {
      language: this._language(),
      theme: this._theme(),
      sidebarCollapsed: this._sidebarCollapsed(),
    };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // storage full — silent
    }
  }

  private applyLanguage(lang: AppLanguage): void {
    const html = this.doc.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const html = this.doc.documentElement;
    html.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      html.classList.add('dark-theme');
      html.classList.remove('light-theme');
    } else {
      html.classList.add('light-theme');
      html.classList.remove('dark-theme');
    }
  }
}
