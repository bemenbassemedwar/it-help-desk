import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SettingsRepository } from '../../../models/settings.repository';
import { UiFeedbackService } from '../../../core/ui-feedback/ui-feedback.service';
import { Settings } from '../../../models/types';

@Injectable()
export class SettingsViewModel {
  private readonly settingsRepo = inject(SettingsRepository);
  private readonly feedback = inject(UiFeedbackService);
  private readonly transloco = inject(TranslocoService);

  private readonly _settings = signal<Settings | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);

  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const s = await this.settingsRepo.get();
      this._settings.set(s);
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._loading.set(false);
    }
  }

  async save(data: Partial<Settings>): Promise<void> {
    this._saving.set(true);
    try {
      const updated = await this.settingsRepo.update(data);
      this._settings.set(updated);
      this.feedback.success(this.transloco.translate('management.settings.saved'));
    } catch {
      this.feedback.error(this.transloco.translate('common.error'));
    } finally {
      this._saving.set(false);
    }
  }
}
