import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DepartmentRepository } from '../../../models/department.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { Department } from '../../../models/types';

@Injectable()
export class DepartmentManagementViewModel {
  private readonly deptRepo = inject(DepartmentRepository);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);

  private readonly _departments = signal<Department[]>([]);
  private readonly _loading = signal(false);
  private readonly _editingId = signal<string | null>(null);

  readonly departments = this._departments.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly editingId = this._editingId.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const depts = await this.deptRepo.getAll();
      this._departments.set(depts);
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  async add(name: string): Promise<void> {
    if (!name.trim()) return;
    try {
      await this.deptRepo.create(name.trim());
      this.feedback.success(this.transloco.translate('management.departments.created'));
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }

  startEdit(id: string): void {
    this._editingId.set(id);
  }

  cancelEdit(): void {
    this._editingId.set(null);
  }

  async update(id: string, name: string): Promise<void> {
    if (!name.trim()) return;
    try {
      await this.deptRepo.update(id, name.trim());
      this._editingId.set(null);
      this.feedback.success(this.transloco.translate('management.departments.updated'));
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }
}
