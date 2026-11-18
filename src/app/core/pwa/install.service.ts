import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private readonly _canInstall = signal(false);
  private readonly _isIos = signal(false);

  readonly canInstall = this._canInstall.asReadonly();
  readonly isIos = this._isIos.asReadonly();

  initialize(): void {
    this._isIos.set(this.checkIsIos());

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this._canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this._canInstall.set(false);
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this._canInstall.set(false);
    return result.outcome === 'accepted';
  }

  private checkIsIos(): boolean {
    const ua = navigator.userAgent;
    return /iphone|ipad|ipod/i.test(ua) && !('standalone' in navigator);
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
