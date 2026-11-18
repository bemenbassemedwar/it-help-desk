import { Injectable } from '@angular/core';
import { User, Department, Category, Ticket, TicketComment, TicketActivity, Attachment, AppNotification, Settings } from '../../models/types';
import { Priority } from '../../models/enums';

const DB_KEY = 'it-helpdesk-db-v1';
const IDB_NAME = 'it-helpdesk-attachments';
const IDB_STORE = 'blobs';

export interface DatabaseTables {
  users: User[];
  departments: Department[];
  categories: Category[];
  tickets: Ticket[];
  comments: TicketComment[];
  activities: TicketActivity[];
  attachments: Attachment[];
  notifications: AppNotification[];
  settings: Settings;
  nextTicketNumber: number;
}

function defaultSettings(): Settings {
  return {
    reopenPolicy: 'RETURN_TO_ENGINEER',
    reopenWindowDays: 7,
    engineersCanSelfAssign: false,
    engineersCanViewUnassigned: true,
    slaHours: {
      CRITICAL: 4,
      HIGH: 8,
      MEDIUM: 24,
      LOW: 72,
    } as Record<Priority, number>,
  };
}

function emptyTables(): DatabaseTables {
  return {
    users: [],
    departments: [],
    categories: [],
    tickets: [],
    comments: [],
    activities: [],
    attachments: [],
    notifications: [],
    settings: defaultSettings(),
    nextTicketNumber: 1000,
  };
}

@Injectable({ providedIn: 'root' })
export class MockDatabase {
  private tables: DatabaseTables = emptyTables();
  private idb: IDBDatabase | null = null;

  get data(): DatabaseTables {
    return this.tables;
  }

  async initialize(): Promise<void> {
    this.loadFromStorage();
    await this.openIdb();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DatabaseTables;
        this.tables = { ...emptyTables(), ...parsed };
      }
    } catch {
      this.tables = emptyTables();
    }
  }

  persist(): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.tables));
    } catch {
      // storage full — silent
    }
  }

  reset(): void {
    this.tables = emptyTables();
    try {
      localStorage.removeItem(DB_KEY);
    } catch {
      // silent
    }
  }

  private async openIdb(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(IDB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          this.idb = request.result;
          resolve();
        };
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    if (!this.idb) return;
    return new Promise((resolve) => {
      const tx = this.idb!.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ id, blob });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getBlob(id: string): Promise<Blob | null> {
    if (!this.idb) return null;
    return new Promise((resolve) => {
      const tx = this.idb!.transaction(IDB_STORE, 'readonly');
      const request = tx.objectStore(IDB_STORE).get(id);
      request.onsuccess = () => {
        const result = request.result as { id: string; blob: Blob } | undefined;
        resolve(result?.blob ?? null);
      };
      request.onerror = () => resolve(null);
    });
  }

  async clearBlobs(): Promise<void> {
    if (!this.idb) return;
    return new Promise((resolve) => {
      const tx = this.idb!.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  getNextTicketNumber(): number {
    const num = this.tables.nextTicketNumber;
    this.tables.nextTicketNumber = num + 1;
    this.persist();
    return num;
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  async simulateDelay(): Promise<void> {
    const ms = 200 + Math.random() * 200;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  hasData(): boolean {
    return this.tables.users.length > 0;
  }
}
