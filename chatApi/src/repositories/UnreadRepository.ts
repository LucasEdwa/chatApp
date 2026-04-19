import { UnreadModel } from '../models/UnreadModel';

/**
 * Server-side unread tracking.
 * Stores unread counts per (userName, roomId) in MongoDB.
 * This is the "source of truth" — survives server restarts and reconnections.
 */
export class UnreadRepository {
  async increment(userName: string, roomId: string): Promise<number> {
    const doc = await UnreadModel.findOneAndUpdate(
      { userName, roomId },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    return doc.count;
  }

  async markRead(userName: string, roomId: string): Promise<void> {
    await UnreadModel.findOneAndUpdate(
      { userName, roomId },
      { count: 0, lastReadAt: new Date() },
      { upsert: true }
    );
  }

  async getUnreadCounts(userName: string): Promise<Map<string, number>> {
    const docs = await UnreadModel.find({ userName, count: { $gt: 0 } }).lean();
    const map = new Map<string, number>();
    for (const doc of docs) {
      map.set(doc.roomId, doc.count);
    }
    return map;
  }

  async getUnreadCount(userName: string, roomId: string): Promise<number> {
    const doc = await UnreadModel.findOne({ userName, roomId }).lean();
    return doc?.count ?? 0;
  }
}
