import { Category } from './types';

export abstract class CategoryRepository {
  abstract getAll(): Promise<Category[]>;
  abstract getActive(): Promise<Category[]>;
  abstract getById(id: string): Promise<Category | null>;
  abstract create(data: Omit<Category, 'id'>): Promise<Category>;
  abstract update(id: string, data: Partial<Category>): Promise<Category>;
  abstract reorder(ids: string[]): Promise<void>;
}
