import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/types';
import { Role } from '../../models/enums';
import { UserRepository } from '../../models/user.repository';

const SESSION_KEY = 'it-helpdesk-session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly userRepo = inject(UserRepository);

  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly userId = computed(() => this._currentUser()?.id ?? null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isManager = computed(() => this._currentUser()?.role === 'MANAGER');
  readonly isEngineer = computed(() => this._currentUser()?.role === 'ENGINEER');
  readonly isEmployee = computed(() => this._currentUser()?.role === 'EMPLOYEE');

  login(user: User): void {
    this._currentUser.set(user);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    } catch {
      // sessionStorage unavailable
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.authenticate(email, password);
    if (!user) return null;
    this.login(user);
    return user;
  }

  logout(): void {
    this._currentUser.set(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // silent
    }
    void this.router.navigate(['/login']);
  }

  async restoreSession(): Promise<User | null> {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as { userId: string };
      const user = await this.userRepo.getById(session.userId);
      if (user?.isActive) {
        this._currentUser.set(user);
        return user;
      }
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return null;
  }

  async refreshCurrentUser(): Promise<void> {
    const userId = this._currentUser()?.id;
    if (!userId) return;
    const user = await this.userRepo.getById(userId);
    if (user) {
      this._currentUser.set(user);
    }
  }

  hasRole(role: Role): boolean {
    return this._currentUser()?.role === role;
  }
}
