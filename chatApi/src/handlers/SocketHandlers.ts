import { Server, Socket } from 'socket.io';
import { IMessage, IUser, ITypingUser } from '../models/Interfaces';
import { users, privateChatRooms, typingUsers } from '../state/ChatState';
import { getCurrentUsersList, getOrCreatePrivateChatRoom } from '../utils/ChatUtils';
import { handleTypingStop } from '../utils/TypingUtils';
import { wrapSocketHandler } from '../middleware/errorHandler';
import { sanitizeMessage, sanitizeUserName } from '../middleware/sanitize';

const DEFAULT_PAGE_SIZE = 50;

export const setupSocketHandlers = (io: Server, socket: Socket) => {
  // Send current users list to the newly connected client
  const currentUsersList = getCurrentUsersList();
  socket.emit('users-list', currentUsersList);

  socket.on('send-chat-message', wrapSocketHandler((msg: IMessage) => {
    // Sanitize message content to prevent XSS
    const cleanMessage = sanitizeMessage(msg.message);
    if (!cleanMessage) return;

    const sanitizedMsg: IMessage = {
      ...msg,
      message: cleanMessage,
      timestamp: new Date(),
    };

    if (sanitizedMsg.isPrivate && sanitizedMsg.roomId) {
      // Handle private message
      const room = privateChatRooms.get(sanitizedMsg.roomId);
      if (room) {
        room.messages.push(sanitizedMsg);
        room.participants.forEach(participantId => {
          io.to(participantId).emit('private-message', sanitizedMsg);
        });
      }
    } else {
      // Handle public message
      io.emit('chat-message', sanitizedMsg);
    }
  }));

  // Handle starting a private chat
  socket.on('start-private-chat', wrapSocketHandler((targetUserId: string) => {
    const currentUser = users.get(socket.id);
    const targetUser = users.get(targetUserId);
    
    if (!currentUser || !targetUser) {
      socket.emit('error', 'User not found');
      return;
    }
    
    const room = getOrCreatePrivateChatRoom(socket.id, targetUserId);
    
    // Join both users to the room
    socket.join(room.id);
    io.to(targetUserId).emit('join-private-room', room.id);
    
    // Send room info back to initiator (paginated — last N messages)
    socket.emit('private-chat-started', {
      roomId: room.id,
      participant: targetUser,
      messages: room.messages.slice(-DEFAULT_PAGE_SIZE),
    });
    
    // Notify target user about new private chat
    io.to(targetUserId).emit('private-chat-invitation', {
      roomId: room.id,
      participant: currentUser,
      messages: room.messages.slice(-DEFAULT_PAGE_SIZE),
    });
  }));

  // Handle joining a private chat room
  socket.on('join-private-room', wrapSocketHandler((roomId: string) => {
    socket.join(roomId);
  }));

  // Handle getting private chat history with cursor-based pagination
  socket.on('get-private-chat-history', wrapSocketHandler((data: { roomId: string; beforeIndex?: number; limit?: number }) => {
    const roomId = typeof data === 'string' ? data : data.roomId;
    const room = privateChatRooms.get(roomId);

    if (!room || !room.participants.includes(socket.id)) return;

    const limit = Math.min(data.limit || DEFAULT_PAGE_SIZE, 100);
    const endIndex = data.beforeIndex ?? room.messages.length;
    const startIndex = Math.max(0, endIndex - limit);

    socket.emit('private-chat-history', {
      roomId,
      messages: room.messages.slice(startIndex, endIndex),
      hasMore: startIndex > 0,
      nextCursor: startIndex > 0 ? startIndex : null,
    });
  }));

  // Handle typing events
  socket.on('typing-start', wrapSocketHandler((data: { roomId?: string }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const typingUser: ITypingUser = {
      id: socket.id,
      name: user.name,
      roomId: data.roomId
    };

    // Clear existing timeout if user was already typing
    if (typingUsers.has(socket.id)) {
      clearTimeout(typingUsers.get(socket.id)!.timeout);
    }

    // Set new timeout to auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      handleTypingStop(socket.id, data.roomId, io);
    }, 3000);

    typingUsers.set(socket.id, { timeout, user: typingUser });

    // Emit typing status to appropriate users
    if (data.roomId) {
      socket.to(data.roomId).emit('user-typing', typingUser);
    } else {
      socket.broadcast.emit('user-typing', typingUser);
    }
  }));

  socket.on('typing-stop', wrapSocketHandler((data: { roomId?: string }) => {
    handleTypingStop(socket.id, data.roomId, io);
  }));

  // Handle request for users list
  socket.on('get-users-list', wrapSocketHandler(() => {
    const usersList = getCurrentUsersList();
    socket.emit('users-list', usersList);
  }));

  socket.on('user-connected', wrapSocketHandler((userName: string) => {
    // Sanitize username to prevent XSS
    const cleanName = sanitizeUserName(userName);
    if (!cleanName) {
      socket.emit('error', 'Invalid username. Must be 2–20 characters.');
      return;
    }

    const user: IUser = {
      id: socket.id,
      name: cleanName,
    };
    
    users.set(socket.id, user);
    
    const joinMessage: IMessage = {
      message: `${cleanName} has joined the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    io.emit('user-joined', joinMessage);
    
    const usersList = getCurrentUsersList();
    io.emit('users-list', usersList);
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
        io.to(typingData.user.roomId).emit('user-stopped-typing', { userId: socket.id, roomId: typingData.user.roomId });
      } else {
        io.emit('user-stopped-typing', { userId: socket.id });
      }
    }
    
    users.delete(socket.id);
    
    const leaveMessage: IMessage = {
      message: `${user.name} has left the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    socket.broadcast.emit('user-left', leaveMessage);
    
    const usersList = getCurrentUsersList();
    io.emit('users-list', usersList);
  });
};
