import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { User, Department } from '../../../models/types';
import { AuthStore } from '../../../core/auth/auth.store';
import { getRoleHomePath } from '../../../core/auth/role.guard';
import { UserRepository } from '../../../models/user.repository';
import { DepartmentRepository } from '../../../models/department.repository';

@Injectable()
export class LoginViewModel {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly userRepo = inject(UserRepository);
  private readonly deptRepo = inject(DepartmentRepository);

  private readonly _users = signal<User[]>([]);
  private readonly _departments = signal<Department[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly managers = computed(() => this._users().filter(u => u.role === 'MANAGER'));
  readonly engineers = computed(() => this._users().filter(u => u.role === 'ENGINEER'));
  readonly employees = computed(() => this._users().filter(u => u.role === 'EMPLOYEE'));

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const [users, departments] = await Promise.all([
        this.userRepo.getAll(),
        this.deptRepo.getAll(),
      ]);
      this._users.set(users.filter(u => u.isActive));
      this._departments.set(departments);
    } catch {
      this._error.set(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  loginAs(user: User): void {
    this.auth.login(user);
    void this.router.navigate([getRoleHomePath(user.role)]);
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const user = await this.auth.loginWithCredentials(email, password);
      if (user) {
        void this.router.navigate([getRoleHomePath(user.role)]);
      } else {
        this._error.set(this.transloco.translate('auth.invalidCredentials'));
      }
    } catch {
      this._error.set(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  getDepartmentName(departmentId: string): string {
    return this._departments().find(d => d.id === departmentId)?.name ?? '';
  }
}
