import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { AuthStore } from '../auth/auth.store';
import { Ticket, TicketActivity, TicketComment, AppNotification, User, Settings } from '../../models/types';
import { TicketStatus, TicketAction, Priority, CommentType } from '../../models/enums';
import { AppError } from '../../models/errors';

@Injectable({ providedIn: 'root' })
export class TicketWorkflowService {
  private readonly db = inject(MockDatabase);
  private readonly auth = inject(AuthStore);

  createTicket(data: {
    title: string;
    description: string;
    categoryId: string;
    attachmentIds?: string[];
  }): Ticket {
    const user = this.requireUser();

    if (!data.title?.trim()) {
      throw new AppError('INVALID_INPUT', 'Title is required');
    }
    if (!data.description?.trim()) {
      throw new AppError('INVALID_INPUT', 'Description is required');
    }
    if (!data.categoryId) {
      throw new AppError('INVALID_INPUT', 'Category is required');
    }

    const category = this.db.data.categories.find(c => c.id === data.categoryId);
    if (!category) {
      throw new AppError('NOT_FOUND', 'Category not found');
    }

    const now = new Date().toISOString();
    const settings = this.db.data.settings;
    const priority: Priority = 'MEDIUM';
    const slaMs = settings.slaHours[priority] * 60 * 60 * 1000;
    const dueAt = new Date(Date.now() + slaMs).toISOString();

    const ticket: Ticket = {
      id: this.db.generateId(),
      number: this.db.getNextTicketNumber(),
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      priority,
      status: 'OPEN',
      createdById: user.id,
      assigneeId: null,
      awaitingEmployeeInfo: false,
      dueAt,
      resolvedAt: null,
      closedAt: null,
      employeeConfirmedAt: null,
      reopenCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.db.data.tickets.push(ticket);

    this.addActivity(ticket, user, 'CREATED', null, 'OPEN', {});

    this.notifyManagers(ticket, 'TICKET_CREATED', 'New Ticket',
      `${user.name} created ticket HD-${ticket.number}: ${ticket.title}`);

    this.db.persist();
    return ticket;
  }

  assign(ticketId: string, assigneeId: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);
    const settings = this.db.data.settings;

    if (!['OPEN', 'REOPENED'].includes(ticket.status)) {
      throw new AppError('INVALID_TRANSITION', `Cannot assign ticket in status ${ticket.status}`);
    }

    if (ticket.status === 'REOPENED' && ticket.assigneeId !== null) {
      throw new AppError('INVALID_TRANSITION', 'Reopened ticket already has an assignee. Use reassign.');
    }

    const assignee = this.db.data.users.find(u => u.id === assigneeId);
    if (!assignee) {
      throw new AppError('NOT_FOUND', 'Assignee not found');
    }
    if (assignee.role !== 'ENGINEER' && assignee.role !== 'MANAGER') {
      throw new AppError('INVALID_INPUT', 'Can only assign to engineers or managers');
    }

    if (user.role === 'ENGINEER') {
      if (!settings.engineersCanSelfAssign) {
        throw new AppError('SELF_ASSIGN_DISABLED', 'Engineer self-assignment is disabled');
      }
      if (assigneeId !== user.id) {
        throw new AppError('UNAUTHORIZED', 'Engineers can only assign tickets to themselves');
      }
    } else if (user.role !== 'MANAGER') {
      throw new AppError('UNAUTHORIZED', 'Only managers and engineers can assign tickets');
    }

    const fromStatus = ticket.status;
    ticket.assigneeId = assigneeId;
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = new Date().toISOString();

    this.addActivity(ticket, user, 'ASSIGNED', fromStatus, 'ASSIGNED', {
      assigneeName: assignee.name,
    });

    if (assigneeId !== user.id) {
      this.createNotification(assigneeId, ticket, 'ASSIGNED', 'Ticket Assigned',
        `You have been assigned ticket HD-${ticket.number}: ${ticket.title}`);
    }

    this.db.persist();
    return ticket;
  }

  reassign(ticketId: string, newAssigneeId: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (user.role !== 'MANAGER') {
      throw new AppError('UNAUTHORIZED', 'Only managers can reassign tickets');
    }

    if (!['ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(ticket.status)) {
      throw new AppError('INVALID_TRANSITION', `Cannot reassign ticket in status ${ticket.status}`);
    }

    const newAssignee = this.db.data.users.find(u => u.id === newAssigneeId);
    if (!newAssignee) {
      throw new AppError('NOT_FOUND', 'New assignee not found');
    }
    if (newAssignee.role !== 'ENGINEER' && newAssignee.role !== 'MANAGER') {
      throw new AppError('INVALID_INPUT', 'Can only assign to engineers or managers');
    }

    const previousAssigneeId = ticket.assigneeId;
    const fromStatus = ticket.status;
    ticket.assigneeId = newAssigneeId;
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = new Date().toISOString();

    this.addActivity(ticket, user, 'REASSIGNED', fromStatus, 'ASSIGNED', {
      assigneeName: newAssignee.name,
      previousAssigneeId: previousAssigneeId ?? '',
    });

    if (newAssigneeId !== user.id) {
      this.createNotification(newAssigneeId, ticket, 'REASSIGNED', 'Ticket Reassigned',
        `You have been assigned ticket HD-${ticket.number}: ${ticket.title}`);
    }
    if (previousAssigneeId && previousAssigneeId !== user.id && previousAssigneeId !== newAssigneeId) {
      this.createNotification(previousAssigneeId, ticket, 'REASSIGNED', 'Ticket Reassigned',
        `Ticket HD-${ticket.number} has been reassigned to ${newAssignee.name}`);
    }

    this.db.persist();
    return ticket;
  }

  startWork(ticketId: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (ticket.status === 'ASSIGNED' || (ticket.status === 'REOPENED' && ticket.assigneeId !== null)) {
      // ok
    } else {
      throw new AppError('INVALID_TRANSITION', `Cannot start work on ticket in status ${ticket.status}`);
    }

    if (ticket.assigneeId !== user.id) {
      throw new AppError('UNAUTHORIZED', 'Only the assignee can start work');
    }

    const fromStatus = ticket.status;
    ticket.status = 'IN_PROGRESS';
    ticket.updatedAt = new Date().toISOString();

    this.addActivity(ticket, user, 'STARTED_WORK', fromStatus, 'IN_PROGRESS', {});

    if (ticket.createdById !== user.id) {
      this.createNotification(ticket.createdById, ticket, 'WORK_STARTED', 'Work Started',
        `${user.name} has started working on your ticket HD-${ticket.number}`);
    }

    this.db.persist();
    return ticket;
  }

  submitForVerification(ticketId: string, resolutionNote: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (ticket.status !== 'IN_PROGRESS') {
      throw new AppError('INVALID_TRANSITION', 'Can only submit for verification from In Progress');
    }

    if (ticket.assigneeId !== user.id) {
      throw new AppError('UNAUTHORIZED', 'Only the assignee can submit for verification');
    }

    if (!resolutionNote || resolutionNote.trim().length < 20) {
      throw new AppError('RESOLUTION_NOTE_REQUIRED', 'Resolution note must be at least 20 characters');
    }

    const fromStatus = ticket.status;
    ticket.status = 'VERIFICATION';
    ticket.resolvedAt = new Date().toISOString();
    ticket.updatedAt = new Date().toISOString();
    ticket.awaitingEmployeeInfo = false;

    const comment: TicketComment = {
      id: this.db.generateId(),
      ticketId: ticket.id,
      authorId: user.id,
      type: 'RESOLUTION',
      body: resolutionNote.trim(),
      attachmentIds: [],
      createdAt: new Date().toISOString(),
    };
    this.db.data.comments.push(comment);

    this.addActivity(ticket, user, 'SUBMITTED_VERIFICATION', fromStatus, 'VERIFICATION', {
      resolutionNote: resolutionNote.trim(),
    });

    if (ticket.createdById !== user.id) {
      this.createNotification(ticket.createdById, ticket, 'VERIFICATION', 'Verification Required',
        `${user.name} has submitted a fix for your ticket HD-${ticket.number}. Please verify.`);
    }

    this.db.persist();
    return ticket;
  }

  confirmResolution(ticketId: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (ticket.status !== 'VERIFICATION') {
      throw new AppError('INVALID_TRANSITION', 'Can only confirm resolution from Verification');
    }

    if (ticket.createdById !== user.id) {
      throw new AppError('NOT_TICKET_OWNER', 'Only the ticket creator can confirm the resolution');
    }

    const now = new Date().toISOString();
    const fromStatus = ticket.status;
    ticket.status = 'CLOSED';
    ticket.closedAt = now;
    ticket.employeeConfirmedAt = now;
    ticket.updatedAt = now;

    this.addActivity(ticket, user, 'CONFIRMED_RESOLUTION', fromStatus, 'CLOSED', {});

    if (ticket.assigneeId && ticket.assigneeId !== user.id) {
      this.createNotification(ticket.assigneeId, ticket, 'CLOSED', 'Ticket Closed',
        `${user.name} has confirmed the fix for ticket HD-${ticket.number}`);
    }

    this.db.persist();
    return ticket;
  }

  reopen(ticketId: string, reason: string): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);
    const settings = this.db.data.settings;

    if (ticket.status !== 'VERIFICATION' && ticket.status !== 'CLOSED') {
      throw new AppError('INVALID_TRANSITION', `Cannot reopen ticket in status ${ticket.status}`);
    }

    if (ticket.createdById !== user.id) {
      throw new AppError('NOT_TICKET_OWNER', 'Only the ticket creator can reopen the ticket');
    }

    if (!reason || reason.trim().length < 10) {
      throw new AppError('REOPEN_REASON_REQUIRED', 'Reopen reason must be at least 10 characters');
    }

    if (ticket.status === 'CLOSED') {
      if (settings.reopenWindowDays === 0) {
        throw new AppError('REOPEN_WINDOW_EXPIRED', 'Reopening closed tickets is disabled');
      }
      const closedAt = new Date(ticket.closedAt!).getTime();
      const windowMs = settings.reopenWindowDays * 24 * 60 * 60 * 1000;
      if (Date.now() - closedAt > windowMs) {
        throw new AppError('REOPEN_WINDOW_EXPIRED',
          `Reopen window of ${settings.reopenWindowDays} days has expired`);
      }
    }

    const fromStatus = ticket.status;
    const previousAssigneeId = ticket.assigneeId;
    ticket.status = 'REOPENED';
    ticket.reopenCount += 1;
    ticket.closedAt = null;
    ticket.employeeConfirmedAt = null;
    ticket.resolvedAt = null;
    ticket.updatedAt = new Date().toISOString();

    if (settings.reopenPolicy === 'RETURN_TO_MANAGER') {
      ticket.assigneeId = null;
    }

    const comment: TicketComment = {
      id: this.db.generateId(),
      ticketId: ticket.id,
      authorId: user.id,
      type: 'REOPEN_REASON',
      body: reason.trim(),
      attachmentIds: [],
      createdAt: new Date().toISOString(),
    };
    this.db.data.comments.push(comment);

    this.addActivity(ticket, user, 'REOPENED', fromStatus, 'REOPENED', {
      reason: reason.trim(),
    });

    this.notifyManagers(ticket, 'REOPENED', 'Ticket Reopened',
      `${user.name} has reopened ticket HD-${ticket.number}: ${reason.trim()}`);

    if (previousAssigneeId && previousAssigneeId !== user.id) {
      this.createNotification(previousAssigneeId, ticket, 'REOPENED', 'Ticket Reopened',
        `${user.name} has reopened ticket HD-${ticket.number}: ${reason.trim()}`);
    }

    this.db.persist();
    return ticket;
  }

  setPriority(ticketId: string, priority: Priority): Ticket {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (user.role === 'MANAGER') {
      // managers can set priority on any ticket
    } else if (user.role === 'ENGINEER' && ticket.assigneeId === user.id) {
      // engineers can set priority on their assigned tickets
    } else {
      throw new AppError('UNAUTHORIZED', 'You do not have permission to set priority on this ticket');
    }

    const oldPriority = ticket.priority;
    ticket.priority = priority;
    ticket.updatedAt = new Date().toISOString();

    const settings = this.db.data.settings;
    const slaMs = settings.slaHours[priority] * 60 * 60 * 1000;
    ticket.dueAt = new Date(new Date(ticket.createdAt).getTime() + slaMs).toISOString();

    this.addActivity(ticket, user, 'PRIORITY_CHANGED', null, null, {
      fromPriority: oldPriority,
      toPriority: priority,
    });

    this.db.persist();
    return ticket;
  }

  addComment(ticketId: string, body: string, type: CommentType, attachmentIds: string[] = []): TicketComment {
    const user = this.requireUser();
    const ticket = this.findTicket(ticketId);

    if (!body?.trim()) {
      throw new AppError('INVALID_INPUT', 'Comment body is required');
    }

    if (type === 'WORK_NOTE' && user.role === 'EMPLOYEE') {
      throw new AppError('UNAUTHORIZED', 'Only IT staff can add work notes');
    }

    if (type === 'INFO_REQUEST') {
      if (ticket.status !== 'IN_PROGRESS') {
        throw new AppError('INVALID_TRANSITION', 'Can only request info on In Progress tickets');
      }
      if (ticket.assigneeId !== user.id) {
        throw new AppError('UNAUTHORIZED', 'Only the assignee can request info');
      }
      ticket.awaitingEmployeeInfo = true;
      ticket.updatedAt = new Date().toISOString();
    }

    if (type === 'PUBLIC' && user.role === 'EMPLOYEE' && user.id === ticket.createdById && ticket.awaitingEmployeeInfo) {
      ticket.awaitingEmployeeInfo = false;
      ticket.updatedAt = new Date().toISOString();
    }

    const comment: TicketComment = {
      id: this.db.generateId(),
      ticketId: ticket.id,
      authorId: user.id,
      type,
      body: body.trim(),
      attachmentIds,
      createdAt: new Date().toISOString(),
    };
    this.db.data.comments.push(comment);

    const actionName = type === 'INFO_REQUEST' ? 'INFO_REQUESTED'
      : type === 'WORK_NOTE' ? 'WORK_NOTE_ADDED'
      : 'COMMENT_ADDED';

    this.addActivity(ticket, user, actionName, null, null, {
      commentType: type,
    });

    if (type === 'INFO_REQUEST') {
      if (ticket.createdById !== user.id) {
        this.createNotification(ticket.createdById, ticket, 'INFO_REQUESTED', 'Information Requested',
          `${user.name} has requested additional information on ticket HD-${ticket.number}`);
      }
    } else if (type === 'WORK_NOTE') {
      const itStaff = this.getTicketParticipants(ticket).filter(
        u => u.id !== user.id && (u.role === 'ENGINEER' || u.role === 'MANAGER')
      );
      for (const staff of itStaff) {
        this.createNotification(staff.id, ticket, 'COMMENT_ADDED', 'New Work Note',
          `${user.name} added a work note on ticket HD-${ticket.number}`);
      }
    } else {
      const participants = this.getTicketParticipants(ticket).filter(u => u.id !== user.id);
      for (const p of participants) {
        this.createNotification(p.id, ticket, 'COMMENT_ADDED', 'New Comment',
          `${user.name} commented on ticket HD-${ticket.number}`);
      }
    }

    this.db.persist();
    return comment;
  }

  computeAllowedActions(ticket: Ticket, user: User): TicketAction[] {
    const actions: TicketAction[] = [];
    const settings = this.db.data.settings;

    switch (ticket.status) {
      case 'OPEN':
        if (user.role === 'MANAGER') {
          actions.push('ASSIGN');
          actions.push('SET_PRIORITY');
        }
        if (user.role === 'ENGINEER' && settings.engineersCanSelfAssign) {
          actions.push('ASSIGN');
        }
        break;

      case 'ASSIGNED':
        if (user.role === 'MANAGER') {
          actions.push('REASSIGN');
          actions.push('SET_PRIORITY');
        }
        if (ticket.assigneeId === user.id) {
          actions.push('START_WORK');
          if (user.role === 'ENGINEER' || user.role === 'MANAGER') {
            actions.push('SET_PRIORITY');
          }
        }
        break;

      case 'IN_PROGRESS':
        if (user.role === 'MANAGER') {
          if (ticket.assigneeId !== user.id) {
            actions.push('REASSIGN');
          }
          actions.push('SET_PRIORITY');
        }
        if (ticket.assigneeId === user.id) {
          actions.push('SUBMIT_VERIFICATION');
          actions.push('REQUEST_INFO');
          if (user.role === 'ENGINEER' || user.role === 'MANAGER') {
            actions.push('SET_PRIORITY');
          }
        }
        break;

      case 'VERIFICATION':
        if (ticket.createdById === user.id) {
          actions.push('CONFIRM_RESOLUTION');
          actions.push('REOPEN');
        }
        break;

      case 'CLOSED': {
        if (ticket.createdById === user.id) {
          const canReopen = this.canReopenClosed(ticket, settings);
          if (canReopen) {
            actions.push('REOPEN');
          }
        }
        break;
      }

      case 'REOPENED':
        if (user.role === 'MANAGER') {
          if (ticket.assigneeId === null) {
            actions.push('ASSIGN');
          } else {
            actions.push('REASSIGN');
          }
          actions.push('SET_PRIORITY');
        }
        if (user.role === 'ENGINEER' && ticket.assigneeId === null && settings.engineersCanSelfAssign) {
          actions.push('ASSIGN');
        }
        if (ticket.assigneeId === user.id) {
          actions.push('START_WORK');
          if (user.role === 'ENGINEER') {
            actions.push('SET_PRIORITY');
          }
        }
        break;
    }

    if (this.canViewTicket(ticket, user)) {
      actions.push('COMMENT');
    }

    if ((user.role === 'ENGINEER' || user.role === 'MANAGER') && this.canViewTicket(ticket, user)) {
      actions.push('WORK_NOTE');
    }

    return actions;
  }

  private canReopenClosed(ticket: Ticket, settings: Settings): boolean {
    if (settings.reopenWindowDays === 0) return false;
    if (!ticket.closedAt) return false;
    const closedAt = new Date(ticket.closedAt).getTime();
    const windowMs = settings.reopenWindowDays * 24 * 60 * 60 * 1000;
    return Date.now() - closedAt <= windowMs;
  }

  private canViewTicket(ticket: Ticket, user: User): boolean {
    if (user.role === 'MANAGER') return true;
    if (user.role === 'ENGINEER') {
      return ticket.assigneeId === user.id || this.db.data.settings.engineersCanViewUnassigned;
    }
    return ticket.createdById === user.id;
  }

  private requireUser(): User {
    const user = this.auth.currentUser();
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Not authenticated');
    }
    return user;
  }

  private findTicket(ticketId: string): Ticket {
    const ticket = this.db.data.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new AppError('NOT_FOUND', 'Ticket not found');
    }
    return ticket;
  }

  private addActivity(
    ticket: Ticket,
    actor: User,
    action: string,
    fromStatus: TicketStatus | null,
    toStatus: TicketStatus | null,
    details: Record<string, string>,
  ): void {
    const activity: TicketActivity = {
      id: this.db.generateId(),
      ticketId: ticket.id,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      fromStatus,
      toStatus,
      details,
      createdAt: new Date().toISOString(),
    };
    this.db.data.activities.push(activity);
  }

  private createNotification(
    userId: string,
    ticket: Ticket,
    type: string,
    title: string,
    body: string,
  ): void {
    const notification: AppNotification = {
      id: this.db.generateId(),
      userId,
      ticketId: ticket.id,
      type,
      title,
      body,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    this.db.data.notifications.push(notification);
  }

  private notifyManagers(ticket: Ticket, type: string, title: string, body: string): void {
    const currentUserId = this.auth.userId();
    const managers = this.db.data.users.filter(u => u.role === 'MANAGER' && u.isActive && u.id !== currentUserId);
    for (const manager of managers) {
      this.createNotification(manager.id, ticket, type, title, body);
    }
  }

  private getTicketParticipants(ticket: Ticket): User[] {
    const participantIds = new Set<string>();
    participantIds.add(ticket.createdById);
    if (ticket.assigneeId) {
      participantIds.add(ticket.assigneeId);
    }
    const commentAuthors = this.db.data.comments
      .filter(c => c.ticketId === ticket.id)
      .map(c => c.authorId);
    for (const id of commentAuthors) {
      participantIds.add(id);
    }
    return this.db.data.users.filter(u => participantIds.has(u.id) && u.isActive);
  }
}
