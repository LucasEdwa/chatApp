import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './handlers/SocketHandlers';
// Importing the environment variables
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.use(cors());

io.on('connection', (socket: Socket) => {
  setupSocketHandlers(io, socket);
});

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
