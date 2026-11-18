import { Department } from './types';

export abstract class DepartmentRepository {
  abstract getAll(): Promise<Department[]>;
  abstract getById(id: string): Promise<Department | null>;
  abstract create(name: string): Promise<Department>;
  abstract update(id: string, name: string): Promise<Department>;
}
