import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { IMessage, IUser, IPrivateChatRoom } from './src/models/Interfaces';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Keep track of connected users with their details
const users = new Map<string, IUser>();
// Keep track of private chat rooms
const privateChatRooms = new Map<string, IPrivateChatRoom>();

// Helper function to get current users list
const getCurrentUsersList = (): IUser[] => {
  return Array.from(users.values());
};

// Helper function to generate private chat room ID
const generatePrivateChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-');
};

// Helper function to get or create private chat room
const getOrCreatePrivateChatRoom = (userId1: string, userId2: string): IPrivateChatRoom => {
  const roomId = generatePrivateChatRoomId(userId1, userId2);
  
  if (!privateChatRooms.has(roomId)) {
    const newRoom: IPrivateChatRoom = {
      id: roomId,
      participants: [userId1, userId2],
      messages: [],
      createdAt: new Date()
    };
    privateChatRooms.set(roomId, newRoom);
    console.log('💬 Created new private chat room:', roomId);
  }
  
  return privateChatRooms.get(roomId)!;
};

app.use(cors());

io.on('connection', (socket: Socket) => {
  console.log('👤 User connected:', socket.id, 'Total connections:', users.size + 1);
  
  // Send current users list to the newly connected client
  const currentUsersList = getCurrentUsersList();
  socket.emit('users-list', currentUsersList);
  console.log('📤 Sent current users list to new connection:', currentUsersList);
  
  // on user connected i want to send a message to the user using IMessage interface
  // socket.on makes it a client side event listener and it will be triggered when the client sends a message to the server
  // the msg is the message that the client sends to the server
  // the msg is an object that implements the IMessage interface
  // the IMessage interface is defined in the src/models/Interfaces.ts file
  // the IMessage interface is used to define the structure of the message that the client sends to the server
  // the IMessage interface is used to define the structure of the message that the server sends to the client
  //io.emit is used to emit a message to all the clients

  socket.on('send-chat-message', (msg: IMessage) => {
    console.log('📨 Received message:', msg);
    
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
        
        console.log('🔒 Private message sent to room:', msg.roomId);
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
    
    console.log('💬 Private chat started between:', currentUser.name, 'and', targetUser.name);
  });

  // Handle joining a private chat room
  socket.on('join-private-room', (roomId: string) => {
    socket.join(roomId);
    console.log('🔑 User joined private room:', roomId);
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

  // Handle request for users list
  socket.on('get-users-list', () => {
    const usersList = getCurrentUsersList();
    socket.emit('users-list', usersList);
    console.log('📤 Sent users list on request:', usersList);
  });

  socket.on('user-connected', (userName: string) => {
    const user: IUser = {
      id: socket.id,
      name: userName
    };
    
    users.set(socket.id, user);
    console.log('👋 User joined:', userName, 'Total users:', users.size);
    
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
    console.log('📤 Sending users list:', usersList);
    io.emit('users-list', usersList);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (!user) return;
    
    users.delete(socket.id);
    console.log('👋 User disconnected:', user.name, 'Remaining users:', users.size);
    
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
    console.log('📤 Sending updated users list:', usersList);
    io.emit('users-list', usersList);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
