import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';
import { CategoryManagementViewModel } from './category-management.view-model';
import { Category } from '../../../models/types';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-category-management-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    TranslocoModule,
    SkeletonLoaderComponent,
  ],
  providers: [CategoryManagementViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-management.page.html',
  styleUrl: './category-management.page.scss',
})
export class CategoryManagementPage implements OnInit {
  protected readonly vm = inject(CategoryManagementViewModel);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['icon', 'name', 'description', 'status', 'actions'];

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    icon: ['help', Validators.required],
  });

  ngOnInit(): void {
    this.vm.load();
  }

  protected onStartAdd(): void {
    this.form.reset({ name: '', description: '', icon: 'help' });
    this.vm.startAdd();
  }

  protected onStartEdit(cat: Category): void {
    this.form.patchValue({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
    });
    this.vm.startEdit(cat);
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.vm.save(this.form.getRawValue());
  }
}
