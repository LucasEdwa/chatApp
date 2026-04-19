import { Server, Socket } from 'socket.io';
import { IMessage, IUser, ITypingUser } from '../models/Interfaces';
import { users, typingUsers } from '../state/ChatState';
import { getCurrentUsersList } from '../utils/ChatUtils';
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
import { MongoChatRepository } from '../repositories/MongoChatRepository';
import { UnreadRepository } from '../repositories/UnreadRepository';

const DEFAULT_PAGE_SIZE = 50;
const rateLimiter = new SocketRateLimiter(30, 5000);
const chatRepo = new MongoChatRepository();
const unreadRepo = new UnreadRepository();

export const setupSocketHandlers = (io: Server, socket: Socket) => {
  // Send current users list to the newly connected client
  const currentUsersList = getCurrentUsersList();
  socket.emit(SocketEvents.USERS_LIST, currentUsersList);

  // ── Message with Acknowledgment + DB Persistence ───────────
  socket.on(SocketEvents.SEND_MESSAGE, wrapSocketHandler(async (raw: unknown, ack?: (response: { status: string; clientMessageId?: string }) => void) => {
    const parsed = sendMessagePayload.safeParse(raw);
    if (!parsed.success) {
      if (ack) ack({ status: 'error' });
      return;
    }
    const msg = parsed.data;

    if (!rateLimiter.consume(socket.id)) {
      if (ack) ack({ status: 'error', clientMessageId: msg.clientMessageId });
      return;
    }

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
      // Persist private message to MongoDB
      await chatRepo.addMessage(sanitizedMsg.roomId, sanitizedMsg);

      // Increment unread for all room participants except sender
      const room = await chatRepo.getRoom(sanitizedMsg.roomId);
      if (room) {
        const senderUser = users.get(socket.id);
        for (const participantName of room.participants) {
          if (senderUser && participantName !== senderUser.name) {
            const newCount = await unreadRepo.increment(participantName, sanitizedMsg.roomId);
            for (const [sid, u] of users.entries()) {
              if (u.name === participantName) {
                io.to(sid).emit('unread-updated', { roomId: sanitizedMsg.roomId, count: newCount });
              }
            }
          }
        }
        for (const [socketId, user] of users.entries()) {
          if (room.participants.includes(user.name)) {
            io.to(socketId).emit(SocketEvents.PRIVATE_MESSAGE, sanitizedMsg);
          }
        }
      }
    } else {
      // Persist public message to MongoDB
      await chatRepo.addPublicMessage(sanitizedMsg);

      // Increment unread for all other connected users
      const senderUser = users.get(socket.id);
      for (const [sid, user] of users.entries()) {
        if (senderUser && user.name !== senderUser.name) {
          const newCount = await unreadRepo.increment(user.name, 'public');
          io.to(sid).emit('unread-updated', { roomId: 'public', count: newCount });
        }
      }

      io.emit(SocketEvents.CHAT_MESSAGE, sanitizedMsg);
    }

    if (ack) ack({ status: 'ok', clientMessageId: msg.clientMessageId });
  }));

  // ── Private Chat with DB Persistence ───────────────────────
  socket.on(SocketEvents.START_PRIVATE_CHAT, wrapSocketHandler(async (raw: unknown) => {
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

    // Deterministic room ID from sorted userNames (persists across sessions)
    const roomId = [currentUser.name, targetUser.name].sort().join('-');

    const existingRoom = await chatRepo.getRoom(roomId);
    if (!existingRoom) {
      await chatRepo.createRoom({
        id: roomId,
        participants: [currentUser.name, targetUser.name],
        messages: [],
        createdAt: new Date(),
      });
    }

    // Load last N messages from DB
    const messageCount = await chatRepo.getMessageCount(roomId);
    const startIdx = Math.max(0, messageCount - DEFAULT_PAGE_SIZE);
    const recentMessages = await chatRepo.getMessages(roomId, startIdx, messageCount);

    socket.join(roomId);
    io.to(targetUserId).emit(SocketEvents.JOIN_PRIVATE_ROOM, roomId);

    // Mark as read for the initiator
    await unreadRepo.markRead(currentUser.name, roomId);

    socket.emit(SocketEvents.PRIVATE_CHAT_STARTED, {
      roomId,
      participant: targetUser,
      messages: recentMessages,
    });

    io.to(targetUserId).emit(SocketEvents.PRIVATE_CHAT_INVITATION, {
      roomId,
      participant: currentUser,
      messages: recentMessages,
    });
  }));

  // Handle joining a private chat room
  socket.on(SocketEvents.JOIN_PRIVATE_ROOM, wrapSocketHandler((raw: unknown) => {
    const parsed = joinPrivateRoomPayload.safeParse(raw);
    if (!parsed.success) return;
    socket.join(parsed.data);
  }));

  // ── Paginated History from MongoDB ─────────────────────────
  socket.on(SocketEvents.GET_PRIVATE_HISTORY, wrapSocketHandler(async (raw: unknown) => {
    const parsed = getPrivateHistoryPayload.safeParse(raw);
    if (!parsed.success) return;
    const data = parsed.data;

    const totalCount = await chatRepo.getMessageCount(data.roomId);
    const limit = Math.min(data.limit || DEFAULT_PAGE_SIZE, 100);
    const endIndex = data.beforeIndex ?? totalCount;
    const startIndex = Math.max(0, endIndex - limit);

    const messages = await chatRepo.getMessages(data.roomId, startIndex, endIndex);

    socket.emit(SocketEvents.PRIVATE_CHAT_HISTORY, {
      roomId: data.roomId,
      messages,
      hasMore: startIndex > 0,
      nextCursor: startIndex > 0 ? startIndex : null,
    });
  }));

  // ── Mark as Read (server-side source of truth) ─────────────
  socket.on('mark-read', wrapSocketHandler(async (raw: unknown) => {
    const roomId = typeof raw === 'string' ? raw : null;
    if (!roomId) return;

    const user = users.get(socket.id);
    if (!user) return;

    await unreadRepo.markRead(user.name, roomId);
    socket.emit('unread-updated', { roomId, count: 0 });
  }));

  // ── Get Unread Counts (on connect / reconnect) ─────────────
  socket.on('get-unread-counts', wrapSocketHandler(async () => {
    const user = users.get(socket.id);
    if (!user) return;

    const counts = await unreadRepo.getUnreadCounts(user.name);
    socket.emit('unread-counts', Object.fromEntries(counts));
  }));

  // ── Get Public Chat History ────────────────────────────────
  socket.on('get-public-history', wrapSocketHandler(async (raw: unknown) => {
    const limit = typeof raw === 'number' ? Math.min(raw, 100) : DEFAULT_PAGE_SIZE;
    const messages = await chatRepo.getPublicMessages(limit);
    socket.emit('public-history', messages);
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

  // ── User Connected: Load persisted state from DB ───────────
  socket.on(SocketEvents.USER_CONNECTED, wrapSocketHandler(async (raw: unknown) => {
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

    // ── Hydrate client with persisted data ─────────────────
    const unreadCounts = await unreadRepo.getUnreadCounts(cleanName);
    socket.emit('unread-counts', Object.fromEntries(unreadCounts));

    const publicHistory = await chatRepo.getPublicMessages(DEFAULT_PAGE_SIZE);
    socket.emit('public-history', publicHistory);
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
