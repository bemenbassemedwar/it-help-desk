import { Injectable, inject, signal, computed } from '@angular/core';
import { TicketRepository } from '../../../models/ticket.repository';
import { AuthStore } from '../../../core/auth/auth.store';
import { TicketListItem } from '../../../models/types';
import { TicketStatus } from '../../../models/enums';

@Injectable()
export class EngineerDashboardViewModel {
  private readonly ticketRepo = inject(TicketRepository);
  private readonly auth = inject(AuthStore);

  private readonly _allTickets = signal<TicketListItem[]>([]);
  private readonly _counts = signal<Record<string, number>>({});
  private readonly _loading = signal(false);
  private readonly _activeFilter = signal<TicketStatus | 'ALL'>('ALL');

  readonly allTickets = this._allTickets.asReadonly();
  readonly counts = this._counts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();

  readonly filteredTickets = computed(() => {
    const filter = this._activeFilter();
    const tickets = this._allTickets();
    if (filter === 'ALL') return tickets;
    return tickets.filter(t => t.status === filter);
  });

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const [countsResult, listResult] = await Promise.all([
        this.ticketRepo.getTicketCounts(),
        this.ticketRepo.list({}, 1, 100),
      ]);
      this._counts.set(countsResult);
      this._allTickets.set(listResult.items);
    } finally {
      this._loading.set(false);
    }
  }

  setFilter(filter: TicketStatus | 'ALL'): void {
    this._activeFilter.set(filter);
  }

  canStartWork(ticket: TicketListItem): boolean {
    return ticket.allowedActions.includes('START_WORK');
  }

  async startWork(ticketId: string): Promise<void> {
    await this.ticketRepo.performAction(ticketId, 'START_WORK');
    await this.load();
  }
}
