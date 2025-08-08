export interface IMessage {
  message: string;
  userName: string;
  timestamp: Date;
  userId?: string;
  isSystemMessage?: boolean;
  roomId?: string; // For private chat support
  isPrivate?: boolean;
}

export interface IUser {
  id: string;
  name: string;
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
