import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { NotificationsViewModel } from './notifications.view-model';
import { AppNotification } from '../../models/types';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../shared/ui/skeleton-loader/skeleton-loader.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    TranslocoModule,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    RelativeTimePipe,
  ],
  providers: [NotificationsViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss',
})
export class NotificationsPage implements OnInit {
  protected readonly vm = inject(NotificationsViewModel);

  ngOnInit(): void {
    this.vm.load();
  }

  protected onNotificationClick(notif: AppNotification): void {
    if (!notif.readAt) {
      this.vm.markAsRead(notif.id);
    }
    this.vm.goToTicket(notif.ticketId);
  }
}
