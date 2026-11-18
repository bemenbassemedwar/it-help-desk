import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatBadgeModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      [matBadge]="unreadCount() > 0 ? unreadCount() : null"
      matBadgeColor="warn"
      matBadgeSize="small"
      (click)="clicked.emit()"
      [attr.aria-label]="'nav.notifications' | transloco"
    >
      <mat-icon>{{ unreadCount() > 0 ? 'notifications_active' : 'notifications' }}</mat-icon>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
  `],
})
export class NotificationBellComponent {
  readonly unreadCount = input(0);
  readonly clicked = output();
}
