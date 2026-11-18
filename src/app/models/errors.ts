export type AppErrorCode =
  | 'INVALID_TRANSITION'
  | 'RESOLUTION_NOTE_REQUIRED'
  | 'REOPEN_REASON_REQUIRED'
  | 'NOT_TICKET_OWNER'
  | 'REOPEN_WINDOW_EXPIRED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'ASSIGNEE_REQUIRED'
  | 'TICKET_NOT_ASSIGNED'
  | 'SELF_ASSIGN_DISABLED'
  | 'DUPLICATE_EMAIL';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
