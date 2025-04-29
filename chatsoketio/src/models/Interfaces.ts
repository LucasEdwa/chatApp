export interface IMessage {
  message: string;
  userName: string;
  timestamp: Date;
  userId?: string;
  isSystemMessage?: boolean;
}
