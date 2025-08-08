export interface IMessage {
  message: string;
  userName: string;
  timestamp: Date;
  userId?: string;
  isSystemMessage?: boolean;
}

export interface IUser {
  id: string;
  name: string;
}
