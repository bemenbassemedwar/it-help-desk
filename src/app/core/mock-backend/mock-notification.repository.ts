import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { NotificationRepository } from '../../models/notification.repository';
import { AppNotification, PaginatedResult } from '../../models/types';

@Injectable()
export class MockNotificationRepository extends NotificationRepository {
  private readonly db = inject(MockDatabase);

  async getForUser(userId: string, page: number, pageSize: number): Promise<PaginatedResult<AppNotification>> {
    await this.db.simulateDelay();
    const all = this.db.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length,
      page,
      pageSize,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    await this.db.simulateDelay();
    return this.db.data.notifications.filter(n => n.userId === userId && n.readAt === null).length;
  }

  async markAsRead(id: string): Promise<void> {
    await this.db.simulateDelay();
    const notification = this.db.data.notifications.find(n => n.id === id);
    if (notification) {
      notification.readAt = new Date().toISOString();
      this.db.persist();
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db.simulateDelay();
    const now = new Date().toISOString();
    this.db.data.notifications
      .filter(n => n.userId === userId && n.readAt === null)
      .forEach(n => { n.readAt = now; });
    this.db.persist();
  }

  async getLatest(userId: string, limit: number): Promise<AppNotification[]> {
    await this.db.simulateDelay();
    return this.db.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}
