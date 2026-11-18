import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { TicketAccessPolicy } from './ticket-access.policy';
import { TicketWorkflowService } from './ticket-workflow.service';
import { AuthStore } from '../auth/auth.store';
import { ReportRepository } from '../../models/report.repository';
import { ReportData, Ticket, TicketListItem } from '../../models/types';
import { TicketStatus, Priority } from '../../models/enums';

@Injectable()
export class MockReportRepository extends ReportRepository {
  private readonly db = inject(MockDatabase);
  private readonly auth = inject(AuthStore);
  private readonly accessPolicy = inject(TicketAccessPolicy);
  private readonly workflow = inject(TicketWorkflowService);

  async generate(dateFrom: string, dateTo: string): Promise<ReportData> {
    await this.db.simulateDelay();

    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();

    const allTickets = this.db.data.tickets.filter(t => {
      const created = new Date(t.createdAt).getTime();
      return created >= from && created <= to;
    });

    const ticketsCreatedOverTime = this.groupByDay(allTickets, 'createdAt');

    const closedTickets = allTickets.filter(t => t.closedAt !== null);
    const ticketsClosedOverTime = this.groupByDay(
      closedTickets.map(t => ({ ...t, _dateField: t.closedAt! })),
      '_dateField' as keyof Ticket,
    );

    const statuses: TicketStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'REOPENED'];
    const byStatus = statuses.map(status => ({
      status,
      count: allTickets.filter(t => t.status === status).length,
    }));

    const categoryMap = new Map<string, number>();
    for (const t of allTickets) {
      categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + 1);
    }
    const byCategory = Array.from(categoryMap.entries()).map(([catId, count]) => {
      const cat = this.db.data.categories.find(c => c.id === catId);
      return { categoryName: cat?.name ?? 'Unknown', count };
    });

    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const byPriority = priorities.map(priority => ({
      priority,
      count: allTickets.filter(t => t.priority === priority).length,
    }));

    const deptMap = new Map<string, number>();
    for (const t of allTickets) {
      const creator = this.db.data.users.find(u => u.id === t.createdById);
      if (creator) {
        deptMap.set(creator.departmentId, (deptMap.get(creator.departmentId) ?? 0) + 1);
      }
    }
    const byDepartment = Array.from(deptMap.entries()).map(([deptId, count]) => {
      const dept = this.db.data.departments.find(d => d.id === deptId);
      return { departmentName: dept?.name ?? 'Unknown', count };
    });

    let avgResolutionTime = 0;
    const resolvedTickets = allTickets.filter(t => t.closedAt && t.createdAt);
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const diff = new Date(t.closedAt!).getTime() - new Date(t.createdAt).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgResolutionTime = Math.round((totalHours / resolvedTickets.length) * 10) / 10;
    }

    const engineerMap = new Map<string, { totalHours: number; count: number }>();
    for (const t of resolvedTickets) {
      if (t.assigneeId) {
        const existing = engineerMap.get(t.assigneeId) ?? { totalHours: 0, count: 0 };
        const diff = new Date(t.closedAt!).getTime() - new Date(t.createdAt).getTime();
        existing.totalHours += diff / (1000 * 60 * 60);
        existing.count += 1;
        engineerMap.set(t.assigneeId, existing);
      }
    }
    const avgResolutionTimeByEngineer = Array.from(engineerMap.entries()).map(([engId, data]) => {
      const eng = this.db.data.users.find(u => u.id === engId);
      return {
        engineerName: eng?.name ?? 'Unknown',
        avgHours: Math.round((data.totalHours / data.count) * 10) / 10,
        ticketCount: data.count,
      };
    });

    const reopenedCount = allTickets.filter(t => t.reopenCount > 0).length;
    const reopenRate = allTickets.length > 0
      ? Math.round((reopenedCount / allTickets.length) * 100) / 100
      : 0;

    const now = Date.now();
    const user = this.auth.currentUser()!;
    const overdueTickets: TicketListItem[] = allTickets
      .filter(t => t.status !== 'VERIFICATION' && t.status !== 'CLOSED' && now > new Date(t.dueAt).getTime())
      .map(t => {
        const category = this.db.data.categories.find(c => c.id === t.categoryId);
        const createdBy = this.db.data.users.find(u => u.id === t.createdById);
        const assignee = t.assigneeId ? this.db.data.users.find(u => u.id === t.assigneeId) ?? null : null;
        return {
          ...t,
          allowedActions: this.workflow.computeAllowedActions(t, user),
          categoryName: category?.name ?? 'Unknown',
          createdByName: createdBy?.name ?? 'Unknown',
          assigneeName: assignee?.name ?? null,
          isOverdue: true,
        };
      });

    return {
      ticketsCreatedOverTime,
      ticketsClosedOverTime,
      byStatus,
      byCategory,
      byPriority,
      byDepartment,
      avgResolutionTime,
      avgResolutionTimeByEngineer,
      reopenRate,
      overdueTickets,
    };
  }

  async exportCsv(dateFrom: string, dateTo: string): Promise<string> {
    await this.db.simulateDelay();

    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();

    const tickets = this.db.data.tickets.filter(t => {
      const created = new Date(t.createdAt).getTime();
      return created >= from && created <= to;
    });

    const headers = ['Ticket #', 'Title', 'Status', 'Priority', 'Category', 'Created By', 'Assignee', 'Created', 'Due', 'Closed', 'Reopen Count'];
    const rows = tickets.map(t => {
      const cat = this.db.data.categories.find(c => c.id === t.categoryId);
      const creator = this.db.data.users.find(u => u.id === t.createdById);
      const assignee = t.assigneeId ? this.db.data.users.find(u => u.id === t.assigneeId) : null;
      return [
        `HD-${t.number}`,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        cat?.name ?? '',
        creator?.name ?? '',
        assignee?.name ?? '',
        t.createdAt,
        t.dueAt,
        t.closedAt ?? '',
        String(t.reopenCount),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  private groupByDay(tickets: Ticket[], dateField: keyof Ticket): { date: string; count: number }[] {
    const map = new Map<string, number>();
    for (const t of tickets) {
      const val = t[dateField];
      if (typeof val !== 'string') continue;
      const day = val.substring(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
