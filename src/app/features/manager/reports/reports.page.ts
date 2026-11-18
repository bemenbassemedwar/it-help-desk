import { ChangeDetectionStrategy, Component, inject, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';

import { TranslocoPipe } from '@jsverse/transloco';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportsViewModel } from './reports.view-model';
import { KpiCardComponent } from '../../../shared/ui/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge/priority-badge.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatNativeDateModule,
    TranslocoPipe,
    BaseChartDirective,
    KpiCardComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
  ],
  providers: [ReportsViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.page.html',
  styleUrl: './reports.page.scss',
})
export class ReportsPage implements OnInit {
  protected readonly vm = inject(ReportsViewModel);
  private readonly router = inject(Router);

  readonly overdueColumns = ['id', 'title', 'status', 'priority', 'assignee', 'dueDate'];
  readonly engineerColumns = ['engineer', 'avgHours', 'ticketCount'];

  private isDark(): boolean {
    return document.documentElement.classList.contains('dark-theme');
  }

  private gridColor(): string {
    return this.isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  }

  private tickColor(): string {
    return this.isDark() ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  }

  readonly lineChartData = computed<ChartData<'line'>>(() => {
    const data = this.vm.reportData();
    if (!data) return { labels: [], datasets: [] };
    const allDates = new Set([
      ...data.ticketsCreatedOverTime.map(d => d.date),
      ...data.ticketsClosedOverTime.map(d => d.date),
    ]);
    const labels = Array.from(allDates).sort();
    const createdMap = new Map(data.ticketsCreatedOverTime.map(d => [d.date, d.count]));
    const closedMap = new Map(data.ticketsClosedOverTime.map(d => [d.date, d.count]));
    return {
      labels,
      datasets: [
        {
          label: 'Created',
          data: labels.map(l => createdMap.get(l) ?? 0),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
        {
          label: 'Closed',
          data: labels.map(l => closedMap.get(l) ?? 0),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    };
  });

  readonly lineChartOptions = computed<ChartConfiguration<'line'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { labels: { color: this.tickColor() } } },
    scales: {
      x: { grid: { color: this.gridColor() }, ticks: { color: this.tickColor() } },
      y: { grid: { color: this.gridColor() }, ticks: { color: this.tickColor() }, beginAtZero: true },
    },
  }));

  readonly statusChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.vm.reportData();
    if (!data) return { labels: [], datasets: [] };
    const colors: Record<string, string> = {
      OPEN: '#3b82f6', ASSIGNED: '#8b5cf6', IN_PROGRESS: '#f97316',
      VERIFICATION: '#eab308', CLOSED: '#22c55e', REOPENED: '#ef4444',
    };
    return {
      labels: data.byStatus.map(s => s.status),
      datasets: [{
        data: data.byStatus.map(s => s.count),
        backgroundColor: data.byStatus.map(s => colors[s.status] ?? '#6b7280'),
        borderWidth: 0,
      }],
    };
  });

  readonly doughnutOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { color: this.tickColor(), padding: 12 } } },
  }));

  readonly priorityChartData = computed<ChartData<'bar'>>(() => {
    const data = this.vm.reportData();
    if (!data) return { labels: [], datasets: [] };
    const colors: Record<string, string> = {
      LOW: '#6b7280', MEDIUM: '#3b82f6', HIGH: '#f97316', CRITICAL: '#ef4444',
    };
    return {
      labels: data.byPriority.map(p => p.priority),
      datasets: [{
        data: data.byPriority.map(p => p.count),
        backgroundColor: data.byPriority.map(p => colors[p.priority] ?? '#6b7280'),
        borderWidth: 0,
      }],
    };
  });

  readonly barOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: this.gridColor() }, ticks: { color: this.tickColor() }, beginAtZero: true },
      y: { grid: { display: false }, ticks: { color: this.tickColor() } },
    },
  }));

  readonly categoryChartData = computed<ChartData<'bar'>>(() => {
    const data = this.vm.reportData();
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.byCategory.map(c => c.categoryName),
      datasets: [{
        data: data.byCategory.map(c => c.count),
        backgroundColor: '#3b82f6',
        borderWidth: 0,
      }],
    };
  });

  readonly verticalBarOptions = computed<ChartConfiguration<'bar'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: this.tickColor() } },
      y: { grid: { color: this.gridColor() }, ticks: { color: this.tickColor() }, beginAtZero: true },
    },
  }));

  readonly departmentChartData = computed<ChartData<'bar'>>(() => {
    const data = this.vm.reportData();
    if (!data) return { labels: [], datasets: [] };
    return {
      labels: data.byDepartment.map(d => d.departmentName),
      datasets: [{
        data: data.byDepartment.map(d => d.count),
        backgroundColor: '#0284c7',
        borderWidth: 0,
      }],
    };
  });

  ngOnInit(): void {
    void this.vm.generate();
  }

  onDateFromChange(value: Date | null): void {
    if (value) {
      this.vm.dateFrom.set(value.toISOString().substring(0, 10));
    }
  }

  onDateToChange(value: Date | null): void {
    if (value) {
      this.vm.dateTo.set(value.toISOString().substring(0, 10));
    }
  }

  navigateToTicket(ticketId: string): void {
    void this.router.navigate(['/tickets', ticketId]);
  }
}
