import { ChangeDetectionStrategy, Component, inject, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthStore } from '../../core/auth/auth.store';
import { PreferencesStore } from '../../core/preferences/preferences.store';
import { Role } from '../../models/enums';
import { UserAvatarComponent } from '../../shared/ui/user-avatar/user-avatar.component';

interface NavLink {
  labelKey: string;
  icon: string;
  route: string;
}

const NAV_LINKS: Record<Role, NavLink[]> = {
  EMPLOYEE: [
    { labelKey: 'nav.dashboard', icon: 'dashboard', route: '/employee/dashboard' },
    { labelKey: 'nav.newTicket', icon: 'add_circle', route: '/employee/new-ticket' },
    { labelKey: 'nav.notifications', icon: 'notifications', route: '/notifications' },
  ],
  ENGINEER: [
    { labelKey: 'nav.dashboard', icon: 'dashboard', route: '/engineer/dashboard' },
    { labelKey: 'nav.notifications', icon: 'notifications', route: '/notifications' },
  ],
  MANAGER: [
    { labelKey: 'nav.dashboard', icon: 'dashboard', route: '/manager/dashboard' },
    { labelKey: 'nav.users', icon: 'people', route: '/manager/users' },
    { labelKey: 'nav.departments', icon: 'business', route: '/manager/departments' },
    { labelKey: 'nav.categories', icon: 'category', route: '/manager/categories' },
    { labelKey: 'nav.settings', icon: 'settings', route: '/manager/settings' },
    { labelKey: 'nav.reports', icon: 'bar_chart', route: '/manager/reports' },
    { labelKey: 'nav.notifications', icon: 'notifications', route: '/notifications' },
  ],
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    TranslocoPipe,
    UserAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthStore);
  protected readonly prefs = inject(PreferencesStore);

  readonly collapsed = input(false);
  readonly linkClicked = output();

  readonly currentUser = this.auth.currentUser;
  readonly navLinks = computed(() => {
    const role = this.auth.userRole();
    return role ? NAV_LINKS[role] : [];
  });

  onLinkClick(): void {
    this.linkClicked.emit();
  }

  onLogout(): void {
    this.auth.logout();
  }

  onToggleCollapse(): void {
    this.prefs.toggleSidebar();
  }
}
