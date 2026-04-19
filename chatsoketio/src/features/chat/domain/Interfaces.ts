export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface IMessage {
  message: string;
  userName: string;
  timestamp: Date;
  userId?: string;
  isSystemMessage?: boolean;
  roomId?: string; // For private chat support
  isPrivate?: boolean;
  clientMessageId?: string; // For ack-based delivery confirmation
  status?: MessageStatus;
}

export interface ITypingUser {
  id: string;
  name: string;
  roomId?: string; // For private chat typing
}

export interface IPrivateChatRoom {
  id: string;
  participants: string[]; // Array of user IDs
  messages: IMessage[];
  createdAt: Date;
}

export interface IChatContext {
  id: string;
  name: string;
  isPrivate: boolean;
  participantId?: string; // For private chats
  unreadCount?: number;
}
