import { IMessage, IPrivateChatRoom } from '../models/Interfaces';
import { IChatRepository } from './ChatRepository';
import { MessageModel } from '../models/MessageModel';
import { ChatRoomModel } from '../models/ChatRoomModel';

/**
 * MongoDB implementation of IChatRepository.
 * Persists messages and rooms across server restarts.
 *
 * Uses async methods internally — the interface is extended
 * to return Promises so handlers can await.
 */
export class MongoChatRepository implements IChatRepository {
  async getRoom(roomId: string): Promise<IPrivateChatRoom | undefined> {
    const doc = await ChatRoomModel.findOne({ roomId }).lean();
    if (!doc) return undefined;

    const messages = await MessageModel
      .find({ roomId })
      .sort({ timestamp: 1 })
      .lean();

    return {
      id: doc.roomId,
      participants: doc.participants,
      messages: messages.map(this.toMessage),
      createdAt: doc.createdAt,
    };
  }

  async createRoom(room: IPrivateChatRoom): Promise<void> {
    await ChatRoomModel.findOneAndUpdate(
      { roomId: room.id },
      {
        roomId: room.id,
        participants: room.participants,
        createdAt: room.createdAt,
      },
      { upsert: true, new: true }
    );
  }

  async hasRoom(roomId: string): Promise<boolean> {
    const count = await ChatRoomModel.countDocuments({ roomId });
    return count > 0;
  }

  async isParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = await ChatRoomModel.findOne({ roomId, participants: userId }).lean();
    return room !== null;
  }

  async addMessage(roomId: string, message: IMessage): Promise<void> {
    await MessageModel.create({
      message: message.message,
      userName: message.userName,
      userId: message.userId,
      timestamp: message.timestamp,
      isSystemMessage: message.isSystemMessage,
      roomId,
      isPrivate: message.isPrivate,
      clientMessageId: message.clientMessageId,
      status: message.status,
    });
  }

  async getMessages(roomId: string, startIndex: number, endIndex: number): Promise<IMessage[]> {
    const limit = endIndex - startIndex;
    const skip = startIndex;

    const docs = await MessageModel
      .find({ roomId })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return docs.map(this.toMessage);
  }

  async getMessageCount(roomId: string): Promise<number> {
    return MessageModel.countDocuments({ roomId });
  }

  /**
   * Get paginated messages for public chat (no roomId).
   */
  async getPublicMessages(limit: number, beforeTimestamp?: Date): Promise<IMessage[]> {
    const query: Record<string, unknown> = {
      $or: [{ roomId: { $exists: false } }, { roomId: null }, { isPrivate: { $ne: true } }],
    };
    if (beforeTimestamp) {
      query.timestamp = { $lt: beforeTimestamp };
    }

    const docs = await MessageModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return docs.map(this.toMessage).reverse();
  }

  /**
   * Save a public message (no room association).
   */
  async addPublicMessage(message: IMessage): Promise<void> {
    await MessageModel.create({
      message: message.message,
      userName: message.userName,
      userId: message.userId,
      timestamp: message.timestamp,
      isSystemMessage: message.isSystemMessage,
      isPrivate: false,
      clientMessageId: message.clientMessageId,
      status: message.status,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toMessage(doc: any): IMessage {
    return {
      message: doc.message as string,
      userName: doc.userName as string,
      userId: doc.userId as string | undefined,
      timestamp: new Date(doc.timestamp as string | number | Date),
      isSystemMessage: doc.isSystemMessage as boolean | undefined,
      roomId: doc.roomId as string | undefined,
      isPrivate: doc.isPrivate as boolean | undefined,
      clientMessageId: doc.clientMessageId as string | undefined,
      status: doc.status as IMessage['status'],
    };
  }
}
