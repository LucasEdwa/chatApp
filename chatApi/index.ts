import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { IMessage } from './src/models/Interfaces';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Keep track of connected users
const users = new Map<string, string>();

app.use(cors());

io.on('connection', (socket: Socket) => {
  console.log('👤 User connected:', socket.id);
  
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
  socket.on('user-connected', (userName: string) => {
    users.set(socket.id, userName);
    console.log('👋 User joined:', userName);
    // i make a join message object that implements the IMessage interface
    // the join message is a message that is sent to the client when they join the chat
  
    const joinMessage: IMessage = {
      message: `${userName} has joined the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    // Emit to everyone (including the joining user)
    io.emit('user-joined', joinMessage);
  });

  socket.on('disconnect', () => {
    const userName = users.get(socket.id);
    if (!userName) return;
    
    users.delete(socket.id);
    console.log('👋 User disconnected:', userName);
    
    const leaveMessage: IMessage = {
      message: `${userName} has left the chat.`,
      userName: 'System',
      timestamp: new Date(),
      userId: socket.id,
      isSystemMessage: true
    };

    // Broadcast to everyone except the leaving user
    socket.broadcast.emit('user-left', leaveMessage);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
