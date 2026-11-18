export type Role = 'EMPLOYEE' | 'ENGINEER' | 'MANAGER';

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'VERIFICATION' | 'CLOSED' | 'REOPENED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CommentType = 'PUBLIC' | 'WORK_NOTE' | 'RESOLUTION' | 'REOPEN_REASON' | 'INFO_REQUEST';

export type TicketAction =
  | 'ASSIGN'
  | 'REASSIGN'
  | 'START_WORK'
  | 'SUBMIT_VERIFICATION'
  | 'CONFIRM_RESOLUTION'
  | 'REOPEN'
  | 'SET_PRIORITY'
  | 'COMMENT'
  | 'WORK_NOTE'
  | 'REQUEST_INFO';

export type ReopenPolicy = 'RETURN_TO_ENGINEER' | 'RETURN_TO_MANAGER';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  VERIFICATION: 'Verification',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: 'Employee',
  ENGINEER: 'IT Engineer',
  MANAGER: 'IT Manager',
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'var(--status-open)',
  ASSIGNED: 'var(--status-assigned)',
  IN_PROGRESS: 'var(--status-in-progress)',
  VERIFICATION: 'var(--status-verification)',
  CLOSED: 'var(--status-closed)',
  REOPENED: 'var(--status-reopened)',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'var(--priority-low)',
  MEDIUM: 'var(--priority-medium)',
  HIGH: 'var(--priority-high)',
  CRITICAL: 'var(--priority-critical)',
};

export const STATUS_TEXT_COLORS: Record<TicketStatus, string> = {
  OPEN: 'var(--status-open-text, #fff)',
  ASSIGNED: 'var(--status-assigned-text, #fff)',
  IN_PROGRESS: 'var(--status-in-progress-text, #fff)',
  VERIFICATION: 'var(--status-verification-text, #422006)',
  CLOSED: 'var(--status-closed-text, #fff)',
  REOPENED: 'var(--status-reopened-text, #fff)',
};

export const STATUS_ICONS: Record<TicketStatus, string> = {
  OPEN: 'radio_button_unchecked',
  ASSIGNED: 'person_add',
  IN_PROGRESS: 'engineering',
  VERIFICATION: 'pending_actions',
  CLOSED: 'check_circle',
  REOPENED: 'replay',
};

export const PRIORITY_ICONS: Record<Priority, string> = {
  LOW: 'flag',
  MEDIUM: 'flag',
  HIGH: 'flag',
  CRITICAL: 'flag',
};
