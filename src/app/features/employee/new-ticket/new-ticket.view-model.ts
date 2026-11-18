import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryRepository } from '../../../models/category.repository';
import { TicketRepository } from '../../../models/ticket.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { Category, CreateTicketData } from '../../../models/types';

@Injectable()
export class NewTicketViewModel {
  private readonly categoryRepo = inject(CategoryRepository);
  private readonly ticketRepo = inject(TicketRepository);
  private readonly router = inject(Router);
  private readonly feedback = inject(UiFeedbackService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const cats = await this.categoryRepo.getActive();
      this.categories.set(cats);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load categories');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(data: CreateTicketData): Promise<void> {
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.ticketRepo.create(data);
      this.feedback.success('Ticket submitted successfully');
      await this.router.navigate(['/employee/dashboard']);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create ticket';
      this.error.set(msg);
      this.feedback.error(msg);
    } finally {
      this.submitting.set(false);
    }
  }
}
