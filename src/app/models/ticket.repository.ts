import { TicketAction } from './enums';
import { AssignTicketData, CreateTicketData, PaginatedResult, TicketDetail, TicketFilter, TicketListItem } from './types';

export abstract class TicketRepository {
  abstract create(data: CreateTicketData): Promise<TicketDetail>;
  abstract getById(id: string): Promise<TicketDetail | null>;
  abstract getByNumber(ticketNumber: number): Promise<TicketDetail | null>;
  abstract list(filter: TicketFilter, page: number, pageSize: number): Promise<PaginatedResult<TicketListItem>>;
  abstract performAction(ticketId: string, action: TicketAction, data?: Record<string, unknown>): Promise<TicketDetail>;
  abstract assign(data: AssignTicketData): Promise<TicketDetail>;
  abstract addComment(ticketId: string, body: string, type: string, attachmentIds?: string[]): Promise<TicketDetail>;
  abstract getTicketCounts(): Promise<Record<string, number>>;
}
