export interface IUser {
  id: string;
  name: string;
  email: string;
  messages: IMessage[];
}

export interface IMessage {
  message: string;
  userId: string;
  timestamp?: Date;
  userName: string;
  isSystemMessage?: boolean;
}

