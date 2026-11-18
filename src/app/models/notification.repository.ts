import { AppNotification, PaginatedResult } from './types';

export abstract class NotificationRepository {
  abstract getForUser(userId: string, page: number, pageSize: number): Promise<PaginatedResult<AppNotification>>;
  abstract getUnreadCount(userId: string): Promise<number>;
  abstract markAsRead(id: string): Promise<void>;
  abstract markAllAsRead(userId: string): Promise<void>;
  abstract getLatest(userId: string, limit: number): Promise<AppNotification[]>;
}
