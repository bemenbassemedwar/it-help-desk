import { Injectable, inject, signal, computed } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ReportRepository } from '../../../models/report.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { ReportData } from '../../../models/types';

@Injectable()
export class ReportsViewModel {
  private readonly reportRepo = inject(ReportRepository);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);

  private readonly _reportData = signal<ReportData | null>(null);
  private readonly _loading = signal(false);

  readonly reportData = this._reportData.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly hasData = computed(() => this._reportData() !== null);

  readonly dateFrom = signal(this.defaultDateFrom());
  readonly dateTo = signal(this.formatDate(new Date()));

  async generate(): Promise<void> {
    this._loading.set(true);
    try {
      const data = await this.reportRepo.generate(this.dateFrom(), this.dateTo());
      this._reportData.set(data);
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  async exportCsv(): Promise<void> {
    try {
      const csv = await this.reportRepo.exportCsv(this.dateFrom(), this.dateTo());
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-report-${this.dateFrom()}-to-${this.dateTo()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.feedback.success(this.transloco.translate('reports.exported'));
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    }
  }

  private defaultDateFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return this.formatDate(d);
  }

  private formatDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }
}
