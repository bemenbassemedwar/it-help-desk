import { ReportData } from './types';

export abstract class ReportRepository {
  abstract generate(dateFrom: string, dateTo: string): Promise<ReportData>;
  abstract exportCsv(dateFrom: string, dateTo: string): Promise<string>;
}
