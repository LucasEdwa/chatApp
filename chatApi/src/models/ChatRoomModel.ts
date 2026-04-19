import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoomDoc extends Document {
  roomId: string;
  participants: string[];  // userNames (persistent across sessions)
  createdAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoomDoc>(
  {
    roomId:       { type: String, required: true, unique: true },
    participants: [{ type: String }],
    createdAt:    { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ChatRoomSchema.index({ participants: 1 });

export const ChatRoomModel = mongoose.model<IChatRoomDoc>('ChatRoom', ChatRoomSchema);
