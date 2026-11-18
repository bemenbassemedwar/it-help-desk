import { Settings } from './types';

export abstract class SettingsRepository {
  abstract get(): Promise<Settings>;
  abstract update(data: Partial<Settings>): Promise<Settings>;
}
