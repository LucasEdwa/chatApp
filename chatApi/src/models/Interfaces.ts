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
}

