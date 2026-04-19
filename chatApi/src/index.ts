import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupSocketHandlers } from './handlers/SocketHandlers';
import { errorHandler, AppError } from './middleware/errorHandler';
import { socketAuthMiddleware, generateToken } from './middleware/socketAuth';
import { connectDatabase } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const app = express();
const server = createServer(app);

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());                          // Secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(express.json({ limit: '16kb' }));   // Body parser with size limit

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,                        // Allow HTTP-only cookies
}));

// Rate limiting — protects health/API endpoints against abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── Socket.IO with Heartbeat & Reconnection Config ──────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 25000,    // Server sends a ping every 25s
  pingTimeout: 20000,     // Client has 20s to respond with pong
  connectionStateRecovery: {
    maxDisconnectionDuration: 30_000,  // Recover state if client reconnects within 30s
    skipMiddlewares: true,
  },
});

// ── Routes ───────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'Chat API is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ── JWT Auth Endpoint ────────────────────────────────────────
app.post('/auth/token', (req, res) => {
  const { userName } = req.body;
  if (!userName || typeof userName !== 'string' || userName.trim().length < 2 || userName.trim().length > 20) {
    res.status(400).json({ status: 'error', message: 'Invalid username. Must be 2–20 characters.' });
    return;
  }
  const token = generateToken(userName.trim());
  res.json({ token });
});

// 404 handler for undefined routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ── Centralized Error Handler (must be last middleware) ──────
app.use(errorHandler);

// ── Socket.IO Auth Middleware ─────────────────────────────────
io.use(socketAuthMiddleware);

// ── Socket.IO Connection ─────────────────────────────────────
io.on('connection', (socket: Socket) => {
  setupSocketHandlers(io, socket);
});

// ── Graceful Shutdown ────────────────────────────────────────
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  io.close();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ── Start Server with MongoDB ────────────────────────────────
connectDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`💓 Heartbeat: ping every 25s, timeout 20s`);
    console.log(`🔄 Connection recovery: 30s window`);
    console.log(`📦 MongoDB connected`);
  });
});
