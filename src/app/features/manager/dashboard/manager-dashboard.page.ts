import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslocoModule } from '@jsverse/transloco';
import { ManagerDashboardViewModel } from './manager-dashboard.view-model';
import { KpiCardComponent } from '../../../shared/ui/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge/priority-badge.component';
import { UserAvatarComponent } from '../../../shared/ui/user-avatar/user-avatar.component';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-manager-dashboard-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    TranslocoModule,
    KpiCardComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    UserAvatarComponent,
    SkeletonLoaderComponent,
    RelativeTimePipe,
  ],
  providers: [ManagerDashboardViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manager-dashboard.page.html',
  styleUrl: './manager-dashboard.page.scss',
})
export class ManagerDashboardPage implements OnInit {
  protected readonly vm = inject(ManagerDashboardViewModel);
  private readonly router = inject(Router);

  protected readonly displayedColumns = ['number', 'title', 'status', 'priority', 'assignee', 'created'];

  ngOnInit(): void {
    this.vm.load();
  }

  protected onTicketClick(ticketId: string): void {
    void this.router.navigate(['/tickets', ticketId]);
  }

  protected onPageEvent(event: PageEvent): void {
    this.vm.onPageChange(event.pageIndex + 1, event.pageSize);
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.onSearchChange(value);
  }
}
