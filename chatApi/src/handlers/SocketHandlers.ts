import { Server, Socket } from 'socket.io';
import { IMessage, IUser, ITypingUser } from '../models/Interfaces';
import { users, privateChatRooms, typingUsers } from '../state/ChatState';
import { getCurrentUsersList, getOrCreatePrivateChatRoom } from '../utils/ChatUtils';
import { handleTypingStop } from '../utils/TypingUtils';

export const setupSocketHandlers = (io: Server, socket: Socket) => {
  // Send current users list to the newly connected client
  const currentUsersList = getCurrentUsersList();
  socket.emit('users-list', currentUsersList);

  socket.on('send-chat-message', (msg: IMessage) => {
    if (msg.isPrivate && msg.roomId) {
      // Handle private message
      const room = privateChatRooms.get(msg.roomId);
      if (room) {
        // Add message to room history
        room.messages.push(msg);
        
        // Send to participants only
        room.participants.forEach(participantId => {
          io.to(participantId).emit('private-message', msg);
        });
      }
    } else {
      // Handle public message
      io.emit('chat-message', msg);
    }
  });

  // Handle starting a private chat
  socket.on('start-private-chat', (targetUserId: string) => {
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
    
    // Send room info back to initiator
    socket.emit('private-chat-started', {
      roomId: room.id,
      participant: targetUser,
      messages: room.messages
    });
    
    // Notify target user about new private chat
    io.to(targetUserId).emit('private-chat-invitation', {
      roomId: room.id,
      participant: currentUser,
      messages: room.messages
    });
  });

  // Handle joining a private chat room
  socket.on('join-private-room', (roomId: string) => {
    socket.join(roomId);
  });

  // Handle getting private chat history
  socket.on('get-private-chat-history', (roomId: string) => {
    const room = privateChatRooms.get(roomId);
    if (room && room.participants.includes(socket.id)) {
      socket.emit('private-chat-history', {
        roomId: roomId,
        messages: room.messages
      });
    }
  });

  // Handle typing events
  socket.on('typing-start', (data: { roomId?: string }) => {
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
      // Private chat typing
      socket.to(data.roomId).emit('user-typing', typingUser);
    } else {
      // Public chat typing
      socket.broadcast.emit('user-typing', typingUser);
    }
  });

  socket.on('typing-stop', (data: { roomId?: string }) => {
    handleTypingStop(socket.id, data.roomId, io);
  });

  // Handle request for users list
  socket.on('get-users-list', () => {
    const usersList = getCurrentUsersList();
    socket.emit('users-list', usersList);
  });

  socket.on('user-connected', (userName: string) => {
    const user: IUser = {
      id: socket.id,
      name: userName
    };
    
    users.set(socket.id, user);
    
    // Send join message to all clients
    const joinMessage: IMessage = {
      message: `${userName} has joined the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    // Emit to everyone (including the joining user)
    io.emit('user-joined', joinMessage);
    
    // Send updated users list to all clients
    const usersList = getCurrentUsersList();
    io.emit('users-list', usersList);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    // Clean up typing status
    if (typingUsers.has(socket.id)) {
      const typingData = typingUsers.get(socket.id)!;
      clearTimeout(typingData.timeout);
      typingUsers.delete(socket.id);
      
      // Notify others that user stopped typing
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

    // Broadcast to everyone except the leaving user
    socket.broadcast.emit('user-left', leaveMessage);
    
    // Send updated users list to all remaining clients
    const usersList = getCurrentUsersList();
    io.emit('users-list', usersList);
  });
};
