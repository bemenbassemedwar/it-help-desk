import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { UserRepository } from '../../../models/user.repository';
import { DepartmentRepository } from '../../../models/department.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { User, Department } from '../../../models/types';
import { Role } from '../../../models/enums';

@Injectable()
export class UserManagementViewModel {
  private readonly userRepo = inject(UserRepository);
  private readonly deptRepo = inject(DepartmentRepository);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);

  private readonly _users = signal<User[]>([]);
  private readonly _departments = signal<Department[]>([]);
  private readonly _loading = signal(false);
  private readonly _editing = signal<User | null>(null);
  private readonly _showForm = signal(false);

  readonly users = this._users.asReadonly();
  readonly departments = this._departments.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly editing = this._editing.asReadonly();
  readonly showForm = this._showForm.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const [users, departments] = await Promise.all([
        this.userRepo.getAll(),
        this.deptRepo.getAll(),
      ]);
      this._users.set(users);
      this._departments.set(departments);
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  startEdit(user: User): void {
    this._editing.set(user);
    this._showForm.set(true);
  }

  startAdd(): void {
    this._editing.set(null);
    this._showForm.set(true);
  }

  cancelEdit(): void {
    this._editing.set(null);
    this._showForm.set(false);
  }

  async toggleActive(user: User): Promise<void> {
    try {
      await this.userRepo.update(user.id, { isActive: !user.isActive });
      this.feedback.success(
        this.transloco.translate(user.isActive ? 'management.users.deactivated' : 'management.users.activated'),
      );
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }

  async saveUser(data: {
    name: string;
    email: string;
    role: Role;
    departmentId: string;
  }): Promise<void> {
    try {
      const existing = this._editing();
      if (existing) {
        await this.userRepo.update(existing.id, data);
        this.feedback.success(this.transloco.translate('management.users.updated'));
      } else {
        await this.userRepo.create({
          ...data,
          passwordHash: 'demo123',
          isActive: true,
          avatarColor: this.randomColor(),
        });
        this.feedback.success(this.transloco.translate('management.users.saved'));
      }
      this._showForm.set(false);
      this._editing.set(null);
      await this.load();
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }

  getDepartmentName(deptId: string): string {
    return this._departments().find(d => d.id === deptId)?.name ?? '';
  }

  private randomColor(): string {
    const colors = ['#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00', '#0097a7', '#5d4037', '#455a64'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
