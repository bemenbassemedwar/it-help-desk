import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { TicketRepository } from '../../../models/ticket.repository';
import { UserRepository } from '../../../models/user.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { TicketDetail, TicketComment, TicketActivity, User } from '../../../models/types';
import { Priority, CommentType, TicketAction } from '../../../models/enums';

export interface TimelineItem {
  id: string;
  date: string;
  kind: 'comment' | 'activity';
  comment?: TicketComment;
  activity?: TicketActivity;
}

@Injectable()
export class TicketDetailViewModel {
  private readonly ticketRepo = inject(TicketRepository);
  private readonly userRepo = inject(UserRepository);
  private readonly router = inject(Router);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);
  readonly auth = inject(AuthStore);

  private readonly _ticket = signal<TicketDetail | null>(null);
  private readonly _loading = signal(false);
  private readonly _actionLoading = signal(false);
  private readonly _engineers = signal<User[]>([]);
  private readonly _userMap = signal<Map<string, User>>(new Map());

  readonly ticket = this._ticket.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly actionLoading = this._actionLoading.asReadonly();
  readonly engineers = this._engineers.asReadonly();
  readonly userMap = this._userMap.asReadonly();

  private currentId = '';

  async load(id: string): Promise<void> {
    this.currentId = id;
    this._loading.set(true);
    try {
      const [ticket, engineers] = await Promise.all([
        this.ticketRepo.getById(id),
        this.userRepo.getEngineers(),
      ]);
      if (!ticket) {
        this.feedback.error(this.transloco.translate('common.error'));
        await this.router.navigate(['/']);
        return;
      }
      this._ticket.set(ticket);
      this._engineers.set(engineers);
      await this.buildUserMap(ticket);
    } catch (e) {
      this.feedback.error(e instanceof Error ? e.message : this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  async performAction(action: TicketAction, data?: Record<string, unknown>): Promise<void> {
    this._actionLoading.set(true);
    try {
      const updated = await this.ticketRepo.performAction(this.currentId, action, data);
      this._ticket.set(updated);
      await this.buildUserMap(updated);
      this.feedback.success(this.getActionSuccessMessage(action));
    } catch (e) {
      this.feedback.error(e instanceof Error ? e.message : this.transloco.translate('common.error'));
    } finally {
      this._actionLoading.set(false);
    }
  }

  async assign(assigneeId: string): Promise<void> {
    await this.performAction('ASSIGN', { assigneeId });
  }

  async reassign(assigneeId: string): Promise<void> {
    await this.performAction('REASSIGN', { assigneeId });
  }

  async startWork(): Promise<void> {
    await this.performAction('START_WORK');
  }

  async submitVerification(resolutionNote: string): Promise<void> {
    await this.performAction('SUBMIT_VERIFICATION', { resolutionNote });
  }

  async confirmResolution(): Promise<void> {
    const confirmed = await this.feedback.confirm(
      'verification.confirmFix',
      'verification.confirmMessage',
    );
    if (!confirmed) return;
    await this.performAction('CONFIRM_RESOLUTION');
  }

  async reopen(reason: string): Promise<void> {
    await this.performAction('REOPEN', { reason });
  }

  async setPriority(priority: Priority): Promise<void> {
    await this.performAction('SET_PRIORITY', { priority });
  }

  async addComment(body: string, type: CommentType): Promise<void> {
    this._actionLoading.set(true);
    try {
      const updated = await this.ticketRepo.addComment(this.currentId, body, type);
      this._ticket.set(updated);
      await this.buildUserMap(updated);
    } catch (e) {
      this.feedback.error(e instanceof Error ? e.message : this.transloco.translate('common.error'));
    } finally {
      this._actionLoading.set(false);
    }
  }

  async requestInfo(body: string): Promise<void> {
    await this.performAction('REQUEST_INFO', { body });
  }

  hasAction(action: TicketAction): boolean {
    return this.ticket()?.allowedActions.includes(action) ?? false;
  }

  readonly isTicketCreator = computed(() =>
    this._ticket()?.createdById === this.auth.userId(),
  );

  readonly canWriteWorkNotes = computed(() => {
    const role = this.auth.userRole();
    return role === 'ENGINEER' || role === 'MANAGER';
  });

  readonly mergedTimeline = computed<TimelineItem[]>(() => {
    const ticket = this._ticket();
    if (!ticket) return [];
    return this.buildTimelineItems(ticket.comments, ticket.activities);
  });

  readonly commentsOnly = computed<TimelineItem[]>(() => {
    const ticket = this._ticket();
    if (!ticket) return [];
    return ticket.comments
      .map(c => ({ id: c.id, date: c.createdAt, kind: 'comment' as const, comment: c }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly activitiesOnly = computed<TimelineItem[]>(() => {
    const ticket = this._ticket();
    if (!ticket) return [];
    return ticket.activities
      .map(a => ({ id: a.id, date: a.createdAt, kind: 'activity' as const, activity: a }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly resolutionComment = computed<TicketComment | undefined>(() => {
    const comments = this._ticket()?.comments ?? [];
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].type === 'RESOLUTION') return comments[i];
    }
    return undefined;
  });

  getCommentAuthor(authorId: string): User | undefined {
    return this._userMap().get(authorId);
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      CREATED: 'add_circle',
      ASSIGNED: 'person_add',
      REASSIGNED: 'swap_horiz',
      STARTED_WORK: 'play_arrow',
      SUBMITTED_VERIFICATION: 'verified',
      CONFIRMED_RESOLUTION: 'check_circle',
      REOPENED: 'replay',
      PRIORITY_CHANGED: 'flag',
      COMMENT_ADDED: 'comment',
      WORK_NOTE_ADDED: 'note',
      INFO_REQUESTED: 'help',
    };
    return icons[action] ?? 'circle';
  }

  getActivityText(activity: TicketActivity): string {
    const key = `activity.${activity.action}`;
    const params: Record<string, string> = {};
    if (activity.details['assigneeName']) {
      params['assignee'] = activity.details['assigneeName'];
    }
    if (activity.details['toPriority']) {
      params['priority'] = this.transloco.translate(`priority.${activity.details['toPriority']}`);
    }
    return this.transloco.translate(key, params);
  }

  private readonly actionSuccessKeys: Record<TicketAction, string> = {
    ASSIGN: 'actions.success.assigned',
    REASSIGN: 'actions.success.reassigned',
    START_WORK: 'actions.success.startedWork',
    SUBMIT_VERIFICATION: 'actions.success.submittedVerification',
    CONFIRM_RESOLUTION: 'actions.success.confirmedResolution',
    REOPEN: 'actions.success.reopened',
    SET_PRIORITY: 'actions.success.priorityUpdated',
    COMMENT: 'actions.success.commentAdded',
    WORK_NOTE: 'actions.success.workNoteAdded',
    REQUEST_INFO: 'actions.success.infoRequested',
  };

  private buildTimelineItems(comments: TicketComment[], activities: TicketActivity[]): TimelineItem[] {
    const commentItems: TimelineItem[] = comments.map(c => ({
      id: c.id, date: c.createdAt, kind: 'comment' as const, comment: c,
    }));
    const activityItems: TimelineItem[] = activities.map(a => ({
      id: a.id, date: a.createdAt, kind: 'activity' as const, activity: a,
    }));
    return [...commentItems, ...activityItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  private async buildUserMap(ticket: TicketDetail): Promise<void> {
    const map = new Map<string, User>();
    map.set(ticket.createdBy.id, ticket.createdBy);
    if (ticket.assignee) {
      map.set(ticket.assignee.id, ticket.assignee);
    }
    const missingIds = new Set<string>();
    for (const comment of ticket.comments) {
      if (!map.has(comment.authorId)) {
        missingIds.add(comment.authorId);
      }
    }
    for (const activity of ticket.activities) {
      if (activity.actorId && !map.has(activity.actorId)) {
        missingIds.add(activity.actorId);
      }
    }
    const fetches = [...missingIds].map(id => this.userRepo.getById(id));
    const users = await Promise.all(fetches);
    for (const user of users) {
      if (user) map.set(user.id, user);
    }
    this._userMap.set(map);
  }

  private getActionSuccessMessage(action: TicketAction): string {
    return this.transloco.translate(this.actionSuccessKeys[action]);
  }
}
