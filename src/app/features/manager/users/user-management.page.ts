import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';
import { UserManagementViewModel } from './user-management.view-model';
import { Role } from '../../../models/enums';
import { UserAvatarComponent } from '../../../shared/ui/user-avatar/user-avatar.component';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    TranslocoModule,
    UserAvatarComponent,
    SkeletonLoaderComponent,
  ],
  providers: [UserManagementViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-management.page.html',
  styleUrl: './user-management.page.scss',
})
export class UserManagementPage implements OnInit {
  protected readonly vm = inject(UserManagementViewModel);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['name', 'email', 'role', 'department', 'status', 'actions'];
  readonly roles: Role[] = ['EMPLOYEE', 'ENGINEER', 'MANAGER'];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['EMPLOYEE' as Role, Validators.required],
    departmentId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.vm.load();
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.vm.saveUser(this.form.getRawValue());
  }

  protected onStartEdit(): void {
    const editing = this.vm.editing();
    if (editing) {
      this.form.patchValue({
        name: editing.name,
        email: editing.email,
        role: editing.role,
        departmentId: editing.departmentId,
      });
    }
  }

  protected onStartAdd(): void {
    this.form.reset({ name: '', email: '', role: 'EMPLOYEE', departmentId: '' });
    this.vm.startAdd();
  }
}
