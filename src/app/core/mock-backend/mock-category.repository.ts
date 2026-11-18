import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { CategoryRepository } from '../../models/category.repository';
import { Category } from '../../models/types';
import { AppError } from '../../models/errors';

@Injectable()
export class MockCategoryRepository extends CategoryRepository {
  private readonly db = inject(MockDatabase);

  async getAll(): Promise<Category[]> {
    await this.db.simulateDelay();
    return [...this.db.data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getActive(): Promise<Category[]> {
    await this.db.simulateDelay();
    return this.db.data.categories
      .filter(c => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<Category | null> {
    await this.db.simulateDelay();
    return this.db.data.categories.find(c => c.id === id) ?? null;
  }

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    await this.db.simulateDelay();
    const category: Category = {
      ...data,
      id: this.db.generateId(),
    };
    this.db.data.categories.push(category);
    this.db.persist();
    return category;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    await this.db.simulateDelay();
    const idx = this.db.data.categories.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new AppError('NOT_FOUND', 'Category not found');
    }
    this.db.data.categories[idx] = { ...this.db.data.categories[idx], ...data };
    this.db.persist();
    return this.db.data.categories[idx];
  }

  async reorder(ids: string[]): Promise<void> {
    await this.db.simulateDelay();
    ids.forEach((id, index) => {
      const cat = this.db.data.categories.find(c => c.id === id);
      if (cat) {
        cat.sortOrder = index;
      }
    });
    this.db.persist();
  }
}
