import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDoc extends Document {
  message: string;
  userName: string;
  userId?: string;
  timestamp: Date;
  isSystemMessage?: boolean;
  roomId?: string;
  isPrivate?: boolean;
  clientMessageId?: string;
  status?: 'sending' | 'sent' | 'failed';
}

const MessageSchema = new Schema<IMessageDoc>(
  {
    message:         { type: String, required: true, maxlength: 2000 },
    userName:        { type: String, required: true },
    userId:          { type: String },
    timestamp:       { type: Date, default: Date.now, index: true },
    isSystemMessage: { type: Boolean, default: false },
    roomId:          { type: String, index: true },
    isPrivate:       { type: Boolean, default: false },
    clientMessageId: { type: String },
    status:          { type: String, enum: ['sending', 'sent', 'failed'], default: 'sent' },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for efficient room-based queries with cursor pagination
MessageSchema.index({ roomId: 1, timestamp: -1 });

export const MessageModel = mongoose.model<IMessageDoc>('Message', MessageSchema);
