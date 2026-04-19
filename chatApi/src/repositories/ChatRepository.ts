import { IMessage, IPrivateChatRoom } from '../models/Interfaces';

/**
 * Repository abstraction for chat rooms and messages.
 * Encapsulates all private-chat persistence — swap to MongoDB
 * by implementing a new class with the same interface.
 */
export interface IChatRepository {
  getRoom(roomId: string): IPrivateChatRoom | undefined;
  createRoom(room: IPrivateChatRoom): void;
  hasRoom(roomId: string): boolean;
  isParticipant(roomId: string, userId: string): boolean;
  addMessage(roomId: string, message: IMessage): void;
  getMessages(roomId: string, startIndex: number, endIndex: number): IMessage[];
  getMessageCount(roomId: string): number;
}

export class InMemoryChatRepository implements IChatRepository {
  private rooms = new Map<string, IPrivateChatRoom>();

  getRoom(roomId: string): IPrivateChatRoom | undefined {
    return this.rooms.get(roomId);
  }

  createRoom(room: IPrivateChatRoom): void {
    this.rooms.set(room.id, room);
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  isParticipant(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.participants.includes(userId) : false;
  }

  addMessage(roomId: string, message: IMessage): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages.push(message);
    }
  }

  getMessages(roomId: string, startIndex: number, endIndex: number): IMessage[] {
    const room = this.rooms.get(roomId);
    return room ? room.messages.slice(startIndex, endIndex) : [];
  }

  getMessageCount(roomId: string): number {
    const room = this.rooms.get(roomId);
    return room ? room.messages.length : 0;
  }
}
