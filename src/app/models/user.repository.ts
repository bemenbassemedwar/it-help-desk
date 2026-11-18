import { Role } from './enums';
import { User } from './types';

export abstract class UserRepository {
  abstract getById(id: string): Promise<User | null>;
  abstract getAll(): Promise<User[]>;
  abstract getByRole(role: Role): Promise<User[]>;
  abstract getByEmail(email: string): Promise<User | null>;
  abstract create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract authenticate(email: string, password: string): Promise<User | null>;
  abstract getEngineers(): Promise<User[]>;
}
