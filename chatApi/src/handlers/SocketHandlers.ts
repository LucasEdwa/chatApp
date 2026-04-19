import { Server, Socket } from 'socket.io';
import { IMessage, IUser, ITypingUser } from '../models/Interfaces';
import { users, privateChatRooms, typingUsers } from '../state/ChatState';
import { getCurrentUsersList, getOrCreatePrivateChatRoom } from '../utils/ChatUtils';
import { handleTypingStop } from '../utils/TypingUtils';
import { wrapSocketHandler } from '../middleware/errorHandler';
import { sanitizeMessage, sanitizeUserName } from '../middleware/sanitize';
import { SocketRateLimiter } from '../middleware/socketAuth';
import { SocketEvents } from '../shared/SocketEvents';
import {
  sendMessagePayload,
  startPrivateChatPayload,
  joinPrivateRoomPayload,
  getPrivateHistoryPayload,
  typingPayload,
  userConnectedPayload,
} from '../schemas/socketSchemas';

const DEFAULT_PAGE_SIZE = 50;
const rateLimiter = new SocketRateLimiter(30, 5000); // 30 events per 5s per socket

export const setupSocketHandlers = (io: Server, socket: Socket) => {
  // Send current users list to the newly connected client
  const currentUsersList = getCurrentUsersList();
  socket.emit(SocketEvents.USERS_LIST, currentUsersList);

  // ── Message with Acknowledgment ────────────────────────────
  // The client passes a callback as the last argument of emit().
  // We call it with { status: 'ok', ... } or { status: 'error', ... }
  // so the client knows for sure the server processed the message.
  socket.on(SocketEvents.SEND_MESSAGE, wrapSocketHandler((raw: unknown, ack?: (response: { status: string; clientMessageId?: string }) => void) => {
    // Validate payload structure with Zod
    const parsed = sendMessagePayload.safeParse(raw);
    if (!parsed.success) {
      if (ack) ack({ status: 'error' });
      return;
    }
    const msg = parsed.data;

    // Per-socket rate limiting
    if (!rateLimiter.consume(socket.id)) {
      if (ack) ack({ status: 'error', clientMessageId: msg.clientMessageId });
      return;
    }

    // Sanitize message content to prevent XSS
    const cleanMessage = sanitizeMessage(msg.message);
    if (!cleanMessage) {
      if (ack) ack({ status: 'error', clientMessageId: msg.clientMessageId });
      return;
    }

    const sanitizedMsg: IMessage = {
      ...msg,
      message: cleanMessage,
      timestamp: new Date(),
      status: 'sent',
    };

    if (sanitizedMsg.isPrivate && sanitizedMsg.roomId) {
      const room = privateChatRooms.get(sanitizedMsg.roomId);
      if (room) {
        room.messages.push(sanitizedMsg);
        room.participants.forEach(participantId => {
          io.to(participantId).emit(SocketEvents.PRIVATE_MESSAGE, sanitizedMsg);
        });
      }
    } else {
      io.emit(SocketEvents.CHAT_MESSAGE, sanitizedMsg);
    }

    // Acknowledge delivery to the sender
    if (ack) ack({ status: 'ok', clientMessageId: msg.clientMessageId });
  }));

  // Handle starting a private chat
  socket.on(SocketEvents.START_PRIVATE_CHAT, wrapSocketHandler((raw: unknown) => {
    const parsed = startPrivateChatPayload.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SocketEvents.ERROR, 'Invalid target user ID');
      return;
    }
    const targetUserId = parsed.data;

    const currentUser = users.get(socket.id);
    const targetUser = users.get(targetUserId);
    
    if (!currentUser || !targetUser) {
      socket.emit(SocketEvents.ERROR, 'User not found');
      return;
    }
    
    const room = getOrCreatePrivateChatRoom(socket.id, targetUserId);
    
    socket.join(room.id);
    io.to(targetUserId).emit(SocketEvents.JOIN_PRIVATE_ROOM, room.id);
    
    socket.emit(SocketEvents.PRIVATE_CHAT_STARTED, {
      roomId: room.id,
      participant: targetUser,
      messages: room.messages.slice(-DEFAULT_PAGE_SIZE),
    });
    
    io.to(targetUserId).emit(SocketEvents.PRIVATE_CHAT_INVITATION, {
      roomId: room.id,
      participant: currentUser,
      messages: room.messages.slice(-DEFAULT_PAGE_SIZE),
    });
  }));

  // Handle joining a private chat room
  socket.on(SocketEvents.JOIN_PRIVATE_ROOM, wrapSocketHandler((raw: unknown) => {
    const parsed = joinPrivateRoomPayload.safeParse(raw);
    if (!parsed.success) return;
    socket.join(parsed.data);
  }));

  // Handle getting private chat history with cursor-based pagination
  socket.on(SocketEvents.GET_PRIVATE_HISTORY, wrapSocketHandler((raw: unknown) => {
    const parsed = getPrivateHistoryPayload.safeParse(raw);
    if (!parsed.success) return;
    const data = parsed.data;

    const room = privateChatRooms.get(data.roomId);
    if (!room || !room.participants.includes(socket.id)) return;

    const limit = Math.min(data.limit || DEFAULT_PAGE_SIZE, 100);
    const endIndex = data.beforeIndex ?? room.messages.length;
    const startIndex = Math.max(0, endIndex - limit);

    socket.emit(SocketEvents.PRIVATE_CHAT_HISTORY, {
      roomId: data.roomId,
      messages: room.messages.slice(startIndex, endIndex),
      hasMore: startIndex > 0,
      nextCursor: startIndex > 0 ? startIndex : null,
    });
  }));

  // Handle typing events
  socket.on(SocketEvents.TYPING_START, wrapSocketHandler((raw: unknown) => {
    if (!rateLimiter.consume(socket.id)) return;

    const parsed = typingPayload.safeParse(raw);
    if (!parsed.success) return;
    const data = parsed.data;

    const user = users.get(socket.id);
    if (!user) return;

    const typingUser: ITypingUser = {
      id: socket.id,
      name: user.name,
      roomId: data.roomId
    };

    if (typingUsers.has(socket.id)) {
      clearTimeout(typingUsers.get(socket.id)!.timeout);
    }

    const timeout = setTimeout(() => {
      handleTypingStop(socket.id, data.roomId, io);
    }, 3000);

    typingUsers.set(socket.id, { timeout, user: typingUser });

    if (data.roomId) {
      socket.to(data.roomId).emit(SocketEvents.USER_TYPING, typingUser);
    } else {
      socket.broadcast.emit(SocketEvents.USER_TYPING, typingUser);
    }
  }));

  socket.on(SocketEvents.TYPING_STOP, wrapSocketHandler((raw: unknown) => {
    const parsed = typingPayload.safeParse(raw);
    if (!parsed.success) return;
    handleTypingStop(socket.id, parsed.data.roomId, io);
  }));

  // Handle request for users list
  socket.on(SocketEvents.GET_USERS_LIST, wrapSocketHandler(() => {
    const usersList = getCurrentUsersList();
    socket.emit(SocketEvents.USERS_LIST, usersList);
  }));

  // ── Heartbeat: "Last Seen" ─────────────────────────────────
  // Client pings periodically; server updates the user's lastSeen.
  socket.on(SocketEvents.HEARTBEAT, wrapSocketHandler(() => {
    const user = users.get(socket.id);
    if (user) {
      user.lastSeen = new Date();
    }
  }));

  socket.on(SocketEvents.USER_CONNECTED, wrapSocketHandler((raw: unknown) => {
    const parsed = userConnectedPayload.safeParse(raw);
    if (!parsed.success) {
      socket.emit(SocketEvents.ERROR, 'Invalid username. Must be 2–20 characters.');
      return;
    }

    const cleanName = sanitizeUserName(parsed.data);
    if (!cleanName) {
      socket.emit(SocketEvents.ERROR, 'Invalid username. Must be 2–20 characters.');
      return;
    }

    const user: IUser = {
      id: socket.id,
      name: cleanName,
      lastSeen: new Date(),
    };
    
    users.set(socket.id, user);
    
    const joinMessage: IMessage = {
      message: `${cleanName} has joined the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    io.emit(SocketEvents.USER_JOINED, joinMessage);
    
    const usersList = getCurrentUsersList();
    io.emit(SocketEvents.USERS_LIST, usersList);
  }));

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    // Clean up typing status
    if (typingUsers.has(socket.id)) {
      const typingData = typingUsers.get(socket.id)!;
      clearTimeout(typingData.timeout);
      typingUsers.delete(socket.id);
      
      if (typingData.user.roomId) {
        io.to(typingData.user.roomId).emit(SocketEvents.USER_STOPPED_TYPING, { userId: socket.id, roomId: typingData.user.roomId });
      } else {
        io.emit(SocketEvents.USER_STOPPED_TYPING, { userId: socket.id });
      }
    }

    // Clean up rate limiter state
    rateLimiter.remove(socket.id);
    
    users.delete(socket.id);
    
    const leaveMessage: IMessage = {
      message: `${user.name} has left the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    socket.broadcast.emit(SocketEvents.USER_LEFT, leaveMessage);
    
    const usersList = getCurrentUsersList();
    io.emit(SocketEvents.USERS_LIST, usersList);
  });
};
