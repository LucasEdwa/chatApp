import mongoose, { Schema, Document } from 'mongoose';

export interface IUnreadDoc extends Document {
  userName: string;
  roomId: string;   // 'public' for main chat, or private room ID
  count: number;
  lastReadAt: Date;
}

const UnreadSchema = new Schema<IUnreadDoc>(
  {
    userName:   { type: String, required: true },
    roomId:     { type: String, required: true },
    count:      { type: Number, default: 0 },
    lastReadAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// One unread record per user per room
UnreadSchema.index({ userName: 1, roomId: 1 }, { unique: true });

export const UnreadModel = mongoose.model<IUnreadDoc>('Unread', UnreadSchema);
