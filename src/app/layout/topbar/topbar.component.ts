import { ChangeDetectionStrategy, Component, inject, input, output, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { PreferencesStore, AppTheme } from '../../core/preferences/preferences.store';
import { MockDatabase } from '../../core/mock-backend/mock-database';
import { seedDatabase } from '../../core/mock-backend/seed';
import { UiFeedbackService } from '../../core/ui-feedback/ui-feedback.service';
import { NotificationRepository } from '../../models/notification.repository';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { UserAvatarComponent } from '../../shared/ui/user-avatar/user-avatar.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    TranslocoPipe,
    NotificationBellComponent,
    UserAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthStore);
  protected readonly prefs = inject(PreferencesStore);
  private readonly db = inject(MockDatabase);
  private readonly feedback = inject(UiFeedbackService);
  private readonly notificationRepo = inject(NotificationRepository);
  private readonly router = inject(Router);

  readonly unreadCount = signal(0);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  readonly showMenuButton = input(false);
  readonly toggleSidenav = output();

  ngOnInit(): void {
    this.refreshUnreadCount();
    this.pollTimer = setInterval(() => this.refreshUnreadCount(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  private refreshUnreadCount(): void {
    const userId = this.auth.userId();
    if (!userId) return;
    this.notificationRepo.getUnreadCount(userId).then(count => {
      this.unreadCount.set(count);
    });
  }

  onNotificationBellClick(): void {
    void this.router.navigate(['/notifications']);
  }

  readonly currentTheme = computed(() => this.prefs.theme());
  readonly currentLanguage = computed(() => this.prefs.language());

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

  onSetTheme(theme: AppTheme): void {
    this.prefs.setTheme(theme);
  }

  onToggleLanguage(): void {
    const next = this.prefs.language() === 'en' ? 'ar' : 'en';
    this.prefs.setLanguage(next);
    location.reload();
  }

  async onResetData(): Promise<void> {
    const confirmed = await this.feedback.confirm(
      'menu.resetDemoData',
      'menu.resetConfirm'
    );
    if (!confirmed) return;

    this.db.reset();
    seedDatabase(this.db);
    this.auth.logout();
    location.reload();
  }

  onLogout(): void {
    this.auth.logout();
  }
}
