import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { TranslocoModule } from '@jsverse/transloco';
import { DepartmentManagementViewModel } from './department-management.view-model';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-department-management-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    TranslocoModule,
    SkeletonLoaderComponent,
  ],
  providers: [DepartmentManagementViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './department-management.page.html',
  styleUrl: './department-management.page.scss',
})
export class DepartmentManagementPage implements OnInit {
  protected readonly vm = inject(DepartmentManagementViewModel);
  readonly newDeptInput = viewChild<ElementRef<HTMLInputElement>>('newDeptInput');

  ngOnInit(): void {
    this.vm.load();
  }

  protected onAdd(): void {
    const input = this.newDeptInput();
    if (input) {
      this.vm.add(input.nativeElement.value);
      input.nativeElement.value = '';
    }
  }
}
