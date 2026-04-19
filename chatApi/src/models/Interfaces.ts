export interface IUser {
  id: string;
  name: string;
  lastSeen: Date;
}

export interface ITypingUser {
  id: string;
  name: string;
  roomId?: string; // For private chat typing
}

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface IMessage {
  message: string;
  userId?: string;
  timestamp: Date;
  userName: string;
  isSystemMessage?: boolean;
  roomId?: string; // For private chat support
  isPrivate?: boolean;
  clientMessageId?: string; // For ack-based delivery confirmation
  status?: MessageStatus;
}

export interface IPrivateChatRoom {
  id: string;
  participants: string[]; // Array of user IDs
  messages: IMessage[];
  createdAt: Date;
}

