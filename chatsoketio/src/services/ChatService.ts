import { io, Socket } from 'socket.io-client';
import { IMessage, IUser, ITypingUser } from '../models/Interfaces';

export class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: IMessage) => void)[] = [];
  private privateMessageCallbacks: ((message: IMessage) => void)[] = [];
  private connectionCallbacks: ((userId: string) => void)[] = [];
  private usersListCallbacks: ((users: IUser[]) => void)[] = [];
  private privateChatStartedCallbacks: ((data: { roomId: string, participant: IUser, messages: IMessage[] }) => void)[] = [];
  private privateChatInvitationCallbacks: ((data: { roomId: string, participant: IUser, messages: IMessage[] }) => void)[] = [];
  private userTypingCallbacks: ((user: ITypingUser) => void)[] = [];
  private userStoppedTypingCallbacks: ((data: { userId: string, roomId?: string }) => void)[] = [];

  connect(userName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(import.meta.env.VITE_CHAT_API_URL, {
          transports: ['websocket']
        });

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
        this.socket.on('private-message', this.handlePrivateMessage.bind(this));
        this.socket.on('private-chat-started', this.handlePrivateChatStarted.bind(this));
        this.socket.on('private-chat-invitation', this.handlePrivateChatInvitation.bind(this));
        this.socket.on('join-private-room', this.joinPrivateRoom.bind(this));
        this.socket.on('user-typing', this.handleUserTyping.bind(this));
        this.socket.on('user-stopped-typing', this.handleUserStoppedTyping.bind(this));

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

  private handlePrivateMessage(data: IMessage) {
    const message = {
      ...data,
      timestamp: new Date(data.timestamp)
    };
    this.privateMessageCallbacks.forEach(callback => callback(message));
  }

  private handleUsersList(users: IUser[]) {
    this.usersListCallbacks.forEach(callback => callback(users));
  }

  private handlePrivateChatStarted(data: { roomId: string, participant: IUser, messages: IMessage[] }) {
    this.privateChatStartedCallbacks.forEach(callback => callback(data));
  }

  private handlePrivateChatInvitation(data: { roomId: string, participant: IUser, messages: IMessage[] }) {
    this.privateChatInvitationCallbacks.forEach(callback => callback(data));
  }

  private handleUserTyping(user: ITypingUser) {
    this.userTypingCallbacks.forEach(callback => callback(user));
  }

  private handleUserStoppedTyping(data: { userId: string, roomId?: string }) {
    this.userStoppedTypingCallbacks.forEach(callback => callback(data));
  }

  private joinPrivateRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-private-room', roomId);
    }
  }

  sendMessage(message: IMessage): void {
    if (this.socket) {
      this.socket.emit('send-chat-message', message);
    }
  }

  startPrivateChat(targetUserId: string): void {
    if (this.socket) {
      this.socket.emit('start-private-chat', targetUserId);
    }
  }

  joinPrivateChatRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('join-private-room', roomId);
    }
  }

  startTyping(roomId?: string): void {
    if (this.socket) {
      this.socket.emit('typing-start', { roomId });
    }
  }

  stopTyping(roomId?: string): void {
    if (this.socket) {
      this.socket.emit('typing-stop', { roomId });
    }
  }

  onMessage(callback: (message: IMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  onPrivateMessage(callback: (message: IMessage) => void): void {
    this.privateMessageCallbacks.push(callback);
  }

  onConnection(callback: (userId: string) => void): void {
    this.connectionCallbacks.push(callback);
  }

  onUsersList(callback: (users: IUser[]) => void): void {
    this.usersListCallbacks.push(callback);
  }

  onPrivateChatStarted(callback: (data: { roomId: string, participant: IUser, messages: IMessage[] }) => void): void {
    this.privateChatStartedCallbacks.push(callback);
  }

  onPrivateChatInvitation(callback: (data: { roomId: string, participant: IUser, messages: IMessage[] }) => void): void {
    this.privateChatInvitationCallbacks.push(callback);
  }

  onUserTyping(callback: (user: ITypingUser) => void): void {
    this.userTypingCallbacks.push(callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string, roomId?: string }) => void): void {
    this.userStoppedTypingCallbacks.push(callback);
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