import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { TicketWorkflowService } from './ticket-workflow.service';
import { TicketAccessPolicy } from './ticket-access.policy';
import { AuthStore } from '../auth/auth.store';
import { TicketRepository } from '../../models/ticket.repository';
import {
  Ticket, TicketDetail, TicketListItem, TicketFilter,
  PaginatedResult, CreateTicketData, AssignTicketData,
} from '../../models/types';
import { TicketAction, CommentType } from '../../models/enums';

@Injectable()
export class MockTicketRepository extends TicketRepository {
  private readonly db = inject(MockDatabase);
  private readonly workflow = inject(TicketWorkflowService);
  private readonly accessPolicy = inject(TicketAccessPolicy);
  private readonly auth = inject(AuthStore);

  async create(data: CreateTicketData): Promise<TicketDetail> {
    await this.db.simulateDelay();
    const ticket = this.workflow.createTicket(data);
    return this.buildDetail(ticket);
  }

  async getById(id: string): Promise<TicketDetail | null> {
    await this.db.simulateDelay();
    const user = this.auth.currentUser();
    if (!user) return null;

    const ticket = this.db.data.tickets.find(t => t.id === id);
    if (!ticket) return null;
    if (!this.accessPolicy.canAccessTicket(ticket, user)) return null;

    return this.buildDetail(ticket);
  }

  async getByNumber(ticketNumber: number): Promise<TicketDetail | null> {
    await this.db.simulateDelay();
    const user = this.auth.currentUser();
    if (!user) return null;

    const ticket = this.db.data.tickets.find(t => t.number === ticketNumber);
    if (!ticket) return null;
    if (!this.accessPolicy.canAccessTicket(ticket, user)) return null;

    return this.buildDetail(ticket);
  }

  async list(filter: TicketFilter, page: number, pageSize: number): Promise<PaginatedResult<TicketListItem>> {
    await this.db.simulateDelay();
    const user = this.auth.currentUser();
    if (!user) return { items: [], total: 0, page, pageSize };

    let tickets = this.accessPolicy.filterTicketsForUser([...this.db.data.tickets], user);

    if (filter.status?.length) {
      tickets = tickets.filter(t => filter.status!.includes(t.status));
    }
    if (filter.priority?.length) {
      tickets = tickets.filter(t => filter.priority!.includes(t.priority));
    }
    if (filter.categoryId) {
      tickets = tickets.filter(t => t.categoryId === filter.categoryId);
    }
    if (filter.assigneeId) {
      tickets = tickets.filter(t => t.assigneeId === filter.assigneeId);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      tickets = tickets.filter(t =>
        t.title.toLowerCase().includes(s) ||
        `hd-${t.number}`.includes(s),
      );
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      tickets = tickets.filter(t => new Date(t.createdAt).getTime() >= from);
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      tickets = tickets.filter(t => new Date(t.createdAt).getTime() <= to);
    }

    tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const total = tickets.length;
    const start = (page - 1) * pageSize;
    const paged = tickets.slice(start, start + pageSize);

    const items = paged.map(t => this.buildListItem(t));

    return { items, total, page, pageSize };
  }

  async performAction(ticketId: string, action: TicketAction, data?: Record<string, unknown>): Promise<TicketDetail> {
    await this.db.simulateDelay();

    let ticket: Ticket;

    switch (action) {
      case 'ASSIGN':
        ticket = this.workflow.assign(ticketId, data?.['assigneeId'] as string);
        break;
      case 'REASSIGN':
        ticket = this.workflow.reassign(ticketId, data?.['assigneeId'] as string);
        break;
      case 'START_WORK':
        ticket = this.workflow.startWork(ticketId);
        break;
      case 'SUBMIT_VERIFICATION':
        ticket = this.workflow.submitForVerification(ticketId, data?.['resolutionNote'] as string);
        break;
      case 'CONFIRM_RESOLUTION':
        ticket = this.workflow.confirmResolution(ticketId);
        break;
      case 'REOPEN':
        ticket = this.workflow.reopen(ticketId, data?.['reason'] as string);
        break;
      case 'SET_PRIORITY':
        ticket = this.workflow.setPriority(ticketId, data?.['priority'] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL');
        break;
      case 'REQUEST_INFO':
        this.workflow.addComment(ticketId, data?.['body'] as string, 'INFO_REQUEST');
        ticket = this.db.data.tickets.find(t => t.id === ticketId)!;
        break;
      default:
        ticket = this.db.data.tickets.find(t => t.id === ticketId)!;
        break;
    }

    return this.buildDetail(ticket);
  }

  async assign(data: AssignTicketData): Promise<TicketDetail> {
    await this.db.simulateDelay();
    const ticket = this.workflow.assign(data.ticketId, data.assigneeId);
    return this.buildDetail(ticket);
  }

  async addComment(ticketId: string, body: string, type: string, attachmentIds?: string[]): Promise<TicketDetail> {
    await this.db.simulateDelay();
    this.workflow.addComment(ticketId, body, type as CommentType, attachmentIds ?? []);
    const ticket = this.db.data.tickets.find(t => t.id === ticketId)!;
    return this.buildDetail(ticket);
  }

  async getTicketCounts(): Promise<Record<string, number>> {
    await this.db.simulateDelay();
    const user = this.auth.currentUser();
    if (!user) return {};

    const tickets = this.accessPolicy.filterTicketsForUser([...this.db.data.tickets], user);

    const counts: Record<string, number> = {
      total: tickets.length,
      OPEN: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      VERIFICATION: 0,
      CLOSED: 0,
      REOPENED: 0,
      overdue: 0,
    };

    const now = Date.now();
    for (const t of tickets) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
      if (this.isOverdue(t, now)) {
        counts['overdue'] = (counts['overdue'] ?? 0) + 1;
      }
    }

    return counts;
  }

  private buildDetail(ticket: Ticket): TicketDetail {
    const user = this.auth.currentUser()!;
    const category = this.db.data.categories.find(c => c.id === ticket.categoryId)!;
    const createdBy = this.db.data.users.find(u => u.id === ticket.createdById)!;
    const assignee = ticket.assigneeId
      ? this.db.data.users.find(u => u.id === ticket.assigneeId) ?? null
      : null;

    const allComments = this.db.data.comments
      .filter(c => c.ticketId === ticket.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const comments = this.accessPolicy.filterCommentsForUser(allComments, user);

    const activities = this.db.data.activities
      .filter(a => a.ticketId === ticket.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const attachments = this.db.data.attachments.filter(a => a.ticketId === ticket.id);

    return {
      ...ticket,
      allowedActions: this.workflow.computeAllowedActions(ticket, user),
      category,
      createdBy,
      assignee,
      comments,
      activities,
      attachments,
      isOverdue: this.isOverdue(ticket, Date.now()),
    };
  }

  private buildListItem(ticket: Ticket): TicketListItem {
    const user = this.auth.currentUser()!;
    const category = this.db.data.categories.find(c => c.id === ticket.categoryId);
    const createdBy = this.db.data.users.find(u => u.id === ticket.createdById);
    const assignee = ticket.assigneeId
      ? this.db.data.users.find(u => u.id === ticket.assigneeId) ?? null
      : null;

    return {
      ...ticket,
      allowedActions: this.workflow.computeAllowedActions(ticket, user),
      categoryName: category?.name ?? 'Unknown',
      createdByName: createdBy?.name ?? 'Unknown',
      assigneeName: assignee?.name ?? null,
      isOverdue: this.isOverdue(ticket, Date.now()),
    };
  }

  private isOverdue(ticket: Ticket, now: number): boolean {
    if (ticket.status === 'VERIFICATION' || ticket.status === 'CLOSED') return false;
    return now > new Date(ticket.dueAt).getTime();
  }
}
