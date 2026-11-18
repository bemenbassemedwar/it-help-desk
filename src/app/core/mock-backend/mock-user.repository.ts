import { Injectable, inject } from '@angular/core';
import { MockDatabase } from './mock-database';
import { UserRepository } from '../../models/user.repository';
import { User } from '../../models/types';
import { Role } from '../../models/enums';
import { AppError } from '../../models/errors';

@Injectable()
export class MockUserRepository extends UserRepository {
  private readonly db = inject(MockDatabase);

  async getById(id: string): Promise<User | null> {
    await this.db.simulateDelay();
    return this.db.data.users.find(u => u.id === id) ?? null;
  }

  async getAll(): Promise<User[]> {
    await this.db.simulateDelay();
    return [...this.db.data.users];
  }

  async getByRole(role: Role): Promise<User[]> {
    await this.db.simulateDelay();
    return this.db.data.users.filter(u => u.role === role);
  }

  async getByEmail(email: string): Promise<User | null> {
    await this.db.simulateDelay();
    return this.db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await this.db.simulateDelay();

    const existing = this.db.data.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new AppError('DUPLICATE_EMAIL', 'A user with this email already exists');
    }

    const user: User = {
      ...userData,
      id: this.db.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.db.data.users.push(user);
    this.db.persist();
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.db.simulateDelay();

    const idx = this.db.data.users.findIndex(u => u.id === id);
    if (idx === -1) {
      throw new AppError('NOT_FOUND', 'User not found');
    }

    if (data.email) {
      const existing = this.db.data.users.find(
        u => u.email.toLowerCase() === data.email!.toLowerCase() && u.id !== id,
      );
      if (existing) {
        throw new AppError('DUPLICATE_EMAIL', 'A user with this email already exists');
      }
    }

    this.db.data.users[idx] = { ...this.db.data.users[idx], ...data };
    this.db.persist();
    return this.db.data.users[idx];
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    await this.db.simulateDelay();
    const user = this.db.data.users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.isActive,
    );
    if (!user || user.passwordHash !== password) {
      return null;
    }
    return user;
  }

  async getEngineers(): Promise<User[]> {
    await this.db.simulateDelay();
    return this.db.data.users.filter(u => (u.role === 'ENGINEER' || u.role === 'MANAGER') && u.isActive);
  }
}
