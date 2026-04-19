import { io, Socket } from 'socket.io-client';
import { IMessage, ITypingUser } from '../domain/Interfaces';
import { IUser } from '../../users/domain/Interfaces';
import { SocketEvents } from '../shared/SocketEvents';
import {
  messageSchema,
  usersListSchema,
  privateChatDataSchema,
  typingUserSchema,
  stoppedTypingSchema,
  ackResponseSchema,
} from '../schemas/socketSchemas';

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

  private messageAckCallbacks: ((data: { status: string; clientMessageId?: string }) => void)[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectCallbacks: (() => void)[] = [];

  connect(userName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(import.meta.env.VITE_CHAT_API_URL, {
          transports: ['websocket'],
          secure: true,
          // ── Reconnection & Heartbeat ──────────────────────
          reconnection: true,              // Auto-reconnect on signal drop
          reconnectionAttempts: 10,        // Try up to 10 times
          reconnectionDelay: 1000,         // Start with 1s delay
          reconnectionDelayMax: 10000,     // Cap at 10s between attempts
          timeout: 20000,                  // 20s connection timeout
          extraHeaders: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        this.socket.on('connect', () => {
          const socketId = this.socket?.id;
          if (socketId) {
            this.connectionCallbacks.forEach(callback => callback(socketId));
            resolve(socketId);
          }
        });

        // Handle reconnection events for UI feedback
        this.socket.io.on('reconnect', (attempt: number) => {
          console.log(`Reconnected after ${attempt} attempt(s)`);
          // Re-register user on reconnect so server knows who we are
          this.socket?.emit(SocketEvents.USER_CONNECTED, userName);
        });

        this.socket.io.on('reconnect_attempt', (attempt: number) => {
          console.log(`Reconnection attempt ${attempt}...`);
        });

        this.socket.io.on('reconnect_failed', () => {
          console.error('Reconnection failed after all attempts');
        });

        // Start heartbeat — updates "lastSeen" on server every 30s
        this.startHeartbeat();

        this.socket.on(SocketEvents.CHAT_MESSAGE, (raw: unknown) => {
          const parsed = messageSchema.safeParse(raw);
          if (parsed.success) this.handleMessage(parsed.data as IMessage);
        });
        this.socket.on(SocketEvents.USER_JOINED, (raw: unknown) => {
          const parsed = messageSchema.safeParse(raw);
          if (parsed.success) this.handleMessage(parsed.data as IMessage);
        });
        this.socket.on(SocketEvents.USER_LEFT, (raw: unknown) => {
          const parsed = messageSchema.safeParse(raw);
          if (parsed.success) this.handleMessage(parsed.data as IMessage);
        });
        this.socket.on(SocketEvents.USERS_LIST, (raw: unknown) => {
          const parsed = usersListSchema.safeParse(raw);
          if (parsed.success) this.handleUsersList(parsed.data as IUser[]);
        });
        this.socket.on(SocketEvents.PRIVATE_MESSAGE, (raw: unknown) => {
          const parsed = messageSchema.safeParse(raw);
          if (parsed.success) this.handlePrivateMessage(parsed.data as IMessage);
        });
        this.socket.on(SocketEvents.PRIVATE_CHAT_STARTED, (raw: unknown) => {
          const parsed = privateChatDataSchema.safeParse(raw);
          if (parsed.success) this.handlePrivateChatStarted(parsed.data as { roomId: string, participant: IUser, messages: IMessage[] });
        });
        this.socket.on(SocketEvents.PRIVATE_CHAT_INVITATION, (raw: unknown) => {
          const parsed = privateChatDataSchema.safeParse(raw);
          if (parsed.success) this.handlePrivateChatInvitation(parsed.data as { roomId: string, participant: IUser, messages: IMessage[] });
        });
        this.socket.on(SocketEvents.JOIN_PRIVATE_ROOM, (raw: unknown) => {
          if (typeof raw === 'string') this.joinPrivateRoom(raw);
        });
        this.socket.on(SocketEvents.USER_TYPING, (raw: unknown) => {
          const parsed = typingUserSchema.safeParse(raw);
          if (parsed.success) this.handleUserTyping(parsed.data as ITypingUser);
        });
        this.socket.on(SocketEvents.USER_STOPPED_TYPING, (raw: unknown) => {
          const parsed = stoppedTypingSchema.safeParse(raw);
          if (parsed.success) this.handleUserStoppedTyping(parsed.data);
        });

        this.socket.emit(SocketEvents.USER_CONNECTED, userName);
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
      this.socket.emit(SocketEvents.JOIN_PRIVATE_ROOM, roomId);
    }
  }

  sendMessage(message: IMessage): void {
    if (this.socket) {
      // Use Socket.IO acknowledgment — server calls this callback
      // when it has processed the message, confirming delivery.
      this.socket.emit(SocketEvents.SEND_MESSAGE, message, (raw: unknown) => {
        const parsed = ackResponseSchema.safeParse(raw);
        if (parsed.success) {
          this.messageAckCallbacks.forEach(cb => cb(parsed.data));
        }
      });
    }
  }

  startPrivateChat(targetUserId: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.START_PRIVATE_CHAT, targetUserId);
    }
  }

  joinPrivateChatRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.JOIN_PRIVATE_ROOM, roomId);
    }
  }

  startTyping(roomId?: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.TYPING_START, { roomId });
    }
  }

  stopTyping(roomId?: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.TYPING_STOP, { roomId });
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

  onMessageAck(callback: (data: { status: string; clientMessageId?: string }) => void): void {
    this.messageAckCallbacks.push(callback);
  }

  onReconnect(callback: () => void): void {
    this.reconnectCallbacks.push(callback);
  }

  requestUsersList(): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.GET_USERS_LIST);
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
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

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit(SocketEvents.HEARTBEAT);
      }
    }, 30_000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
export const chatService = new ChatService();
