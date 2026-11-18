import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { CategoryRepository } from '../../../models/category.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { Category } from '../../../models/types';

@Injectable()
export class CategoryManagementViewModel {
  private readonly catRepo = inject(CategoryRepository);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal(false);
  private readonly _editing = signal<Category | null>(null);
  private readonly _showForm = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly editing = this._editing.asReadonly();
  readonly showForm = this._showForm.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const cats = await this.catRepo.getAll();
      this._categories.set(cats);
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  startAdd(): void {
    this._editing.set(null);
    this._showForm.set(true);
  }

  startEdit(cat: Category): void {
    this._editing.set(cat);
    this._showForm.set(true);
  }

  cancelEdit(): void {
    this._editing.set(null);
    this._showForm.set(false);
  }

  async save(data: { name: string; description: string; icon: string }): Promise<void> {
    try {
      const existing = this._editing();
      if (existing) {
        await this.catRepo.update(existing.id, data);
        this.feedback.success(this.transloco.translate('management.categories.updated'));
      } else {
        await this.catRepo.create({
          ...data,
          isActive: true,
          sortOrder: this._categories().length,
        });
        this.feedback.success(this.transloco.translate('management.categories.saved'));
      }
      this._showForm.set(false);
      this._editing.set(null);
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }

  async toggleActive(cat: Category): Promise<void> {
    try {
      await this.catRepo.update(cat.id, { isActive: !cat.isActive });
      this.feedback.success(
        this.transloco.translate(cat.isActive ? 'management.categories.deactivated' : 'management.categories.activated'),
      );
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }
}
