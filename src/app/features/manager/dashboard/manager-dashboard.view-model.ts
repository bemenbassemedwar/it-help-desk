import { Injectable, inject, signal, computed } from '@angular/core';
import { TicketRepository } from '../../../models/ticket.repository';
import { UserRepository } from '../../../models/user.repository';
import { AuthStore } from '../../../core/auth/auth.store';
import { TicketListItem, User, TicketFilter, PaginatedResult } from '../../../models/types';
import { TicketStatus, Priority } from '../../../models/enums';

export interface EngineerWorkload {
  engineer: User;
  ticketCount: number;
}

@Injectable()
export class ManagerDashboardViewModel {
  private readonly ticketRepo = inject(TicketRepository);
  private readonly userRepo = inject(UserRepository);
  private readonly auth = inject(AuthStore);

  private readonly _counts = signal<Record<string, number>>({});
  private readonly _ticketResult = signal<PaginatedResult<TicketListItem>>({ items: [], total: 0, page: 1, pageSize: 15 });
  private readonly _engineers = signal<User[]>([]);
  private readonly _engineerWorkload = signal<EngineerWorkload[]>([]);
  private readonly _overdueTickets = signal<TicketListItem[]>([]);
  private readonly _loading = signal(false);
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(15);
  private readonly _statusFilter = signal<TicketStatus[]>([]);
  private readonly _priorityFilter = signal<Priority[]>([]);
  private readonly _searchQuery = signal('');

  readonly counts = this._counts.asReadonly();
  readonly engineers = this._engineers.asReadonly();
  readonly engineerWorkload = this._engineerWorkload.asReadonly();
  readonly overdueTickets = this._overdueTickets.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly tickets = computed(() => this._ticketResult().items);
  readonly totalTickets = computed(() => this._ticketResult().total);

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const [countsResult, engList] = await Promise.all([
        this.ticketRepo.getTicketCounts(),
        this.userRepo.getEngineers(),
      ]);

      this._counts.set(countsResult);
      this._engineers.set(engList);

      await Promise.all([
        this.loadTickets(),
        this.loadOverdueAndWorkload(engList),
      ]);
    } finally {
      this._loading.set(false);
    }
  }

  async loadTickets(): Promise<void> {
    const filter: TicketFilter = {};
    if (this._statusFilter().length > 0) filter.status = this._statusFilter();
    if (this._priorityFilter().length > 0) filter.priority = this._priorityFilter();
    if (this._searchQuery().trim()) filter.search = this._searchQuery().trim();

    const result = await this.ticketRepo.list(filter, this._currentPage(), this._pageSize());
    this._ticketResult.set(result);
  }

  async onPageChange(page: number, pageSize: number): Promise<void> {
    this._currentPage.set(page);
    this._pageSize.set(pageSize);
    await this.loadTickets();
  }

  async onStatusFilterChange(statuses: TicketStatus[]): Promise<void> {
    this._statusFilter.set(statuses);
    this._currentPage.set(1);
    await this.loadTickets();
  }

  async onSearchChange(query: string): Promise<void> {
    this._searchQuery.set(query);
    this._currentPage.set(1);
    await this.loadTickets();
  }

  private async loadOverdueAndWorkload(engList: User[]): Promise<void> {
    const result = await this.ticketRepo.list({}, 1, 500);
    this._overdueTickets.set(result.items.filter(t => t.isOverdue));
    this.computeWorkload(engList, result.items);
  }

  private computeWorkload(engList: User[], allTickets: TicketListItem[]): void {
    const countMap = new Map<string, number>();
    for (const eng of engList) {
      countMap.set(eng.id, 0);
    }

    for (const t of allTickets) {
      if (t.assigneeId && countMap.has(t.assigneeId)) {
        countMap.set(t.assigneeId, (countMap.get(t.assigneeId) ?? 0) + 1);
      }
    }

    this._engineerWorkload.set(
      engList.map(eng => ({
        engineer: eng,
        ticketCount: countMap.get(eng.id) ?? 0,
      })),
    );
  }
}
