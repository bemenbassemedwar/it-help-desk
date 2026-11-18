import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationRepository } from '../../models/notification.repository';
import { AuthStore } from '../../core/auth/auth.store';
import { UiFeedbackService } from '../../core/ui-feedback/ui-feedback.service';
import { AppNotification } from '../../models/types';

@Injectable()
export class NotificationsViewModel {
  private readonly notifRepo = inject(NotificationRepository);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly feedback = inject(UiFeedbackService);

  readonly notifications = signal<AppNotification[]>([]);
  readonly loading = signal(false);
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly pageSize = 20;

  readonly hasMore = computed(() => this.notifications().length < this.totalCount());
  readonly unreadCount = computed(() => this.notifications().filter(n => n.readAt === null).length);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const userId = this.auth.userId();
      if (!userId) return;
      const result = await this.notifRepo.getForUser(userId, 1, this.pageSize);
      this.notifications.set(result.items);
      this.totalCount.set(result.total);
      this.page.set(1);
    } catch {
      this.feedback.error('Failed to load notifications');
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;
    const nextPage = this.page() + 1;
    try {
      const result = await this.notifRepo.getForUser(userId, nextPage, this.pageSize);
      this.notifications.update(prev => [...prev, ...result.items]);
      this.page.set(nextPage);
    } catch {
      this.feedback.error('Failed to load more notifications');
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.notifRepo.markAsRead(id);
      this.notifications.update(prev =>
        prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n),
      );
    } catch {
      this.feedback.error('Failed to mark as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;
    try {
      await this.notifRepo.markAllAsRead(userId);
      const now = new Date().toISOString();
      this.notifications.update(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt ?? now })),
      );
      this.feedback.success('All notifications marked as read');
    } catch {
      this.feedback.error('Failed to mark all as read');
    }
  }

  goToTicket(ticketId: string): void {
    this.router.navigate(['/tickets', ticketId]);
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      TICKET_CREATED: 'confirmation_number',
      ASSIGNED: 'person_add',
      REASSIGNED: 'swap_horiz',
      WORK_STARTED: 'engineering',
      VERIFICATION: 'pending_actions',
      CLOSED: 'check_circle',
      REOPENED: 'replay',
      COMMENT_ADDED: 'chat',
      INFO_REQUESTED: 'help',
    };
    return icons[type] ?? 'notifications';
  }
}
