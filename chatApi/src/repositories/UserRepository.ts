import { IUser } from '../models/Interfaces';

/**
 * Repository abstraction for user state.
 * Decouples business logic from storage — swap to Redis/MongoDB
 * by implementing a new class with the same interface.
 */
export interface IUserRepository {
  add(id: string, user: IUser): void;
  get(id: string): IUser | undefined;
  remove(id: string): boolean;
  getAll(): IUser[];
  has(id: string): boolean;
}

export class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, IUser>();

  add(id: string, user: IUser): void {
    this.users.set(id, user);
  }

  get(id: string): IUser | undefined {
    return this.users.get(id);
  }

  remove(id: string): boolean {
    return this.users.delete(id);
  }

  getAll(): IUser[] {
    return Array.from(this.users.values());
  }

  has(id: string): boolean {
    return this.users.has(id);
  }
}
