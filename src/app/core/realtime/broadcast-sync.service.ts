import { Injectable, signal } from '@angular/core';

export interface SyncMessage {
  type: 'DATA_CHANGED' | 'NOTIFICATION_ADDED';
  table?: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class BroadcastSyncService {
  private channel: BroadcastChannel | null = null;
  private readonly _lastSync = signal<SyncMessage | null>(null);

  readonly lastSync = this._lastSync.asReadonly();

  initialize(): void {
    try {
      this.channel = new BroadcastChannel('it-helpdesk-sync');
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        this._lastSync.set(event.data);
      };
    } catch {
      // BroadcastChannel not supported
    }
  }

  notifyDataChanged(table?: string): void {
    this.broadcast({
      type: 'DATA_CHANGED',
      table,
      timestamp: Date.now(),
    });
  }

  notifyNotificationAdded(): void {
    this.broadcast({
      type: 'NOTIFICATION_ADDED',
      timestamp: Date.now(),
    });
  }

  private broadcast(message: SyncMessage): void {
    try {
      this.channel?.postMessage(message);
    } catch {
      // silent
    }
  }

  destroy(): void {
    this.channel?.close();
    this.channel = null;
  }
}
