import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { IMessage, IUser } from './src/models/Interfaces';

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

// Helper function to get current users list
const getCurrentUsersList = (): IUser[] => {
  return Array.from(users.values());
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
    io.emit('chat-message', msg);
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
