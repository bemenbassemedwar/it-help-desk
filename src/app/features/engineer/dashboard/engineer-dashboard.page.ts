import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { EngineerDashboardViewModel } from './engineer-dashboard.view-model';
import { KpiCardComponent } from '../../../shared/ui/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge/priority-badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TicketStatus } from '../../../models/enums';

interface FilterTab {
  labelKey: string;
  value: TicketStatus | 'ALL';
}

@Component({
  selector: 'app-engineer-dashboard-page',
  standalone: true,
  imports: [
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
  providers: [EngineerDashboardViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './engineer-dashboard.page.html',
  styleUrl: './engineer-dashboard.page.scss',
})
export class EngineerDashboardPage implements OnInit {
  protected readonly vm = inject(EngineerDashboardViewModel);
  private readonly router = inject(Router);

  protected readonly filterTabs: FilterTab[] = [
    { labelKey: 'comments.all', value: 'ALL' },
    { labelKey: 'status.ASSIGNED', value: 'ASSIGNED' },
    { labelKey: 'status.IN_PROGRESS', value: 'IN_PROGRESS' },
    { labelKey: 'status.VERIFICATION', value: 'VERIFICATION' },
    { labelKey: 'status.REOPENED', value: 'REOPENED' },
  ];

  ngOnInit(): void {
    this.vm.load();
  }

  protected onTicketClick(ticketId: string): void {
    void this.router.navigate(['/tickets', ticketId]);
  }

  protected onStartWork(event: Event, ticketId: string): void {
    event.stopPropagation();
    this.vm.startWork(ticketId);
  }
}
