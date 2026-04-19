import { ITypingUser } from '../models/Interfaces';

/**
 * Repository abstraction for typing-indicator state.
 * Owns the timeout management to ensure consistent cleanup.
 */
export interface ITypingRepository {
  set(userId: string, data: { timeout: NodeJS.Timeout; user: ITypingUser }): void;
  get(userId: string): { timeout: NodeJS.Timeout; user: ITypingUser } | undefined;
  remove(userId: string): { timeout: NodeJS.Timeout; user: ITypingUser } | undefined;
  has(userId: string): boolean;
}

export class InMemoryTypingRepository implements ITypingRepository {
  private typingUsers = new Map<string, { timeout: NodeJS.Timeout; user: ITypingUser }>();

  set(userId: string, data: { timeout: NodeJS.Timeout; user: ITypingUser }): void {
    this.typingUsers.set(userId, data);
  }

  get(userId: string): { timeout: NodeJS.Timeout; user: ITypingUser } | undefined {
    return this.typingUsers.get(userId);
  }

  remove(userId: string): { timeout: NodeJS.Timeout; user: ITypingUser } | undefined {
    const data = this.typingUsers.get(userId);
    if (data) {
      clearTimeout(data.timeout);
      this.typingUsers.delete(userId);
    }
    return data;
  }

  has(userId: string): boolean {
    return this.typingUsers.has(userId);
  }
}
