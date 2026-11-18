import { CommentType, Priority, Role, TicketAction, TicketStatus, ReopenPolicy } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  departmentId: string;
  isActive: boolean;
  avatarColor: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Ticket {
  id: string;
  number: number;
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  status: TicketStatus;
  createdById: string;
  assigneeId: string | null;
  awaitingEmployeeInfo: boolean;
  dueAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  employeeConfirmedAt: string | null;
  reopenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  type: CommentType;
  body: string;
  attachmentIds: string[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus | null;
  details: Record<string, string>;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  ticketId: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface Settings {
  reopenPolicy: ReopenPolicy;
  reopenWindowDays: number;
  engineersCanSelfAssign: boolean;
  engineersCanViewUnassigned: boolean;
  slaHours: Record<Priority, number>;
}

export interface TicketDetail extends Ticket {
  allowedActions: TicketAction[];
  category: Category;
  createdBy: User;
  assignee: User | null;
  comments: TicketComment[];
  activities: TicketActivity[];
  attachments: Attachment[];
  isOverdue: boolean;
}

export interface TicketListItem extends Ticket {
  allowedActions: TicketAction[];
  categoryName: string;
  createdByName: string;
  assigneeName: string | null;
  isOverdue: boolean;
}

export interface CreateTicketData {
  title: string;
  description: string;
  categoryId: string;
  attachmentIds?: string[];
}

export interface AssignTicketData {
  ticketId: string;
  assigneeId: string;
}

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: Priority[];
  categoryId?: string;
  assigneeId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportData {
  ticketsCreatedOverTime: { date: string; count: number }[];
  ticketsClosedOverTime: { date: string; count: number }[];
  byStatus: { status: TicketStatus; count: number }[];
  byCategory: { categoryName: string; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  byDepartment: { departmentName: string; count: number }[];
  avgResolutionTime: number;
  avgResolutionTimeByEngineer: { engineerName: string; avgHours: number; ticketCount: number }[];
  reopenRate: number;
  overdueTickets: TicketListItem[];
}
