import { io, Socket } from 'socket.io-client';
import { IMessage, IUser } from '../models/Interfaces';

export class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: IMessage) => void)[] = [];
  private connectionCallbacks: ((userId: string) => void)[] = [];
  private usersListCallbacks: ((users: IUser[]) => void)[] = [];

  connect(userName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
          const socketId = this.socket?.id;
          if (socketId) {
            this.connectionCallbacks.forEach(callback => callback(socketId));
            resolve(socketId);
          }
        });

        this.socket.on('chat-message', this.handleMessage.bind(this));
        this.socket.on('user-joined', this.handleMessage.bind(this));
        this.socket.on('user-left', this.handleMessage.bind(this));
        this.socket.on('users-list', this.handleUsersList.bind(this));

        this.socket.emit('user-connected', userName);
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: IMessage) {
    const message = {
      ...data,
      timestamp: new Date(data.timestamp)
    };
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private handleUsersList(users: IUser[]) {
    this.usersListCallbacks.forEach(callback => callback(users));
  }

  sendMessage(message: IMessage): void {
    if (this.socket) {
      this.socket.emit('send-chat-message', message);
    }
  }

  onMessage(callback: (message: IMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onConnection(callback: (userId: string) => void): void {
    this.connectionCallbacks.push(callback);
  }

  onUsersList(callback: (users: IUser[]) => void): void {
    this.usersListCallbacks.push(callback);
  }

  requestUsersList(): void {
    if (this.socket) {
      this.socket.emit('get-users-list');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getUserId(): string | null {
    return this.socket?.id || null;
  }
}

export const chatService = new ChatService();
