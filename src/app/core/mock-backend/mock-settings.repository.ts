import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { SettingsRepository } from '../../models/settings.repository';
import { Settings } from '../../models/types';

@Injectable()
export class MockSettingsRepository extends SettingsRepository {
  private readonly db = inject(MockDatabase);

  async get(): Promise<Settings> {
    await this.db.simulateDelay();
    return { ...this.db.data.settings };
  }

  async update(data: Partial<Settings>): Promise<Settings> {
    await this.db.simulateDelay();
    this.db.data.settings = { ...this.db.data.settings, ...data };
    this.db.persist();
    return { ...this.db.data.settings };
  }
}
