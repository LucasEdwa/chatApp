export interface IUser {
  id: string;
  name: string;
}

export interface IMessage {
  message: string;
  userId?: string;
  timestamp: Date;
  userName: string;
  isSystemMessage?: boolean;
  roomId?: string; // For private chat support
  isPrivate?: boolean;
}

export interface IPrivateChatRoom {
  id: string;
  participants: string[]; // Array of user IDs
  messages: IMessage[];
  createdAt: Date;
}

