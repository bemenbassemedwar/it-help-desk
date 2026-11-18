import { Injectable, inject, signal } from '@angular/core';
import { TicketRepository } from '../../../models/ticket.repository';
import { AuthStore } from '../../../core/auth/auth.store';
import { TicketListItem } from '../../../models/types';

@Injectable()
export class EmployeeDashboardViewModel {
  private readonly ticketRepo = inject(TicketRepository);
  private readonly auth = inject(AuthStore);

  private readonly _tickets = signal<TicketListItem[]>([]);
  private readonly _counts = signal<Record<string, number>>({});
  private readonly _loading = signal(false);

  readonly tickets = this._tickets.asReadonly();
  readonly counts = this._counts.asReadonly();
  readonly loading = this._loading.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const [countsResult, listResult] = await Promise.all([
        this.ticketRepo.getTicketCounts(),
        this.ticketRepo.list({}, 1, 50),
      ]);
      this._counts.set(countsResult);
      this._tickets.set(listResult.items);
    } finally {
      this._loading.set(false);
    }
  }
}
