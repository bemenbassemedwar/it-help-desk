import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { EmployeeDashboardViewModel } from './employee-dashboard.view-model';
import { KpiCardComponent } from '../../../shared/ui/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge/priority-badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-employee-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    TranslocoModule,
    KpiCardComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    RelativeTimePipe,
  ],
  providers: [EmployeeDashboardViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-dashboard.page.html',
  styleUrl: './employee-dashboard.page.scss',
})
export class EmployeeDashboardPage implements OnInit {
  protected readonly vm = inject(EmployeeDashboardViewModel);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.vm.load();
  }

  protected onTicketClick(ticketId: string): void {
    void this.router.navigate(['/tickets', ticketId]);
  }

  protected onCreateTicket(): void {
    void this.router.navigate(['/employee/new-ticket']);
  }
}
