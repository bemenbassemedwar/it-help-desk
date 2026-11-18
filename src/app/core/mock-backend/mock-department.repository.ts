import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { DepartmentRepository } from '../../models/department.repository';
import { Department } from '../../models/types';
import { AppError } from '../../models/errors';

@Injectable()
export class MockDepartmentRepository extends DepartmentRepository {
  private readonly db = inject(MockDatabase);

  async getAll(): Promise<Department[]> {
    await this.db.simulateDelay();
    return [...this.db.data.departments];
  }

  async getById(id: string): Promise<Department | null> {
    await this.db.simulateDelay();
    return this.db.data.departments.find(d => d.id === id) ?? null;
  }

  async create(name: string): Promise<Department> {
    await this.db.simulateDelay();
    const department: Department = {
      id: this.db.generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    this.db.data.departments.push(department);
    this.db.persist();
    return department;
  }

  async update(id: string, name: string): Promise<Department> {
    await this.db.simulateDelay();
    const idx = this.db.data.departments.findIndex(d => d.id === id);
    if (idx === -1) {
      throw new AppError('NOT_FOUND', 'Department not found');
    }
    this.db.data.departments[idx] = { ...this.db.data.departments[idx], name };
    this.db.persist();
    return this.db.data.departments[idx];
  }
}
