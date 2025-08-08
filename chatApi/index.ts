import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './src/handlers/SocketHandlers';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://9898942fd6e3.ngrok-free.app',
      'https://main.d1ae0lvinb3klh.amplifyapp.com'
    ],
    methods: ['GET', 'POST']
  }
});

app.use(cors());

io.on('connection', (socket: Socket) => {
  setupSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
