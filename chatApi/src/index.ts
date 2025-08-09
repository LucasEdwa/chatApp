import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './handlers/SocketHandlers';
// Importing the environment variables
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 8080; 

const app = express();
const server = createServer(app);
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

// Add a basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Chat API is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

io.on('connection', (socket: Socket) => {
  setupSocketHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
