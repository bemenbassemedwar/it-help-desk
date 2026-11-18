import { Injectable, inject } from '@angular/core';
import { Ticket, TicketComment, User } from '../../models/types';
import { MockDatabase } from './mock-database';

@Injectable({ providedIn: 'root' })
export class TicketAccessPolicy {
  private readonly db = inject(MockDatabase);

  canAccessTicket(ticket: Ticket, user: User): boolean {
    if (user.role === 'MANAGER') return true;
    if (user.role === 'ENGINEER') {
      if (ticket.assigneeId === user.id) return true;
      if (this.db.data.settings.engineersCanViewUnassigned && ticket.assigneeId === null) return true;
      return false;
    }
    return ticket.createdById === user.id;
  }

  filterTicketsForUser(tickets: Ticket[], user: User): Ticket[] {
    if (user.role === 'MANAGER') return tickets;
    if (user.role === 'ENGINEER') {
      const canViewUnassigned = this.db.data.settings.engineersCanViewUnassigned;
      return tickets.filter(t =>
        t.assigneeId === user.id || (canViewUnassigned && t.assigneeId === null),
      );
    }
    return tickets.filter(t => t.createdById === user.id);
  }

  filterCommentsForUser(comments: TicketComment[], user: User): TicketComment[] {
    if (user.role === 'EMPLOYEE') {
      return comments.filter(c => c.type !== 'WORK_NOTE');
    }
    return comments;
  }
}
