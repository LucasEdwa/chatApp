import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { sanitizeUserName } from './sanitize';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  sub: string; // userName
  iat: number;
  exp: number;
}

export const generateToken = (userName: string): string => {
  return jwt.sign({ sub: userName }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Socket.IO middleware that validates the connection handshake.
 * Verifies JWT token if provided; falls back to username validation.
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const { userName, token } = socket.handshake.auth;

  // ── JWT verification ─────────────────────────────────────
  if (token) {
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication failed: invalid token'));
    }
    socket.data.userName = decoded.sub;
    return next();
  }

  // ── Username validation (fallback) ───────────────────────
  if (userName) {
    const clean = sanitizeUserName(userName);
    if (!clean) {
      return next(new Error('Invalid username'));
    }
    socket.data.userName = clean;
  }

  next();
};

/**
 * Per-socket event rate limiter.
 * Tracks event counts per socket within a sliding window.
 * If a socket exceeds the limit, events are silently dropped
 * and a warning is emitted to the client.
 */
export class SocketRateLimiter {
  private counters = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxEvents: number = 30,
    private readonly windowMs: number = 5000,
  ) {}

  /**
   * Returns true if the event should be allowed, false if rate-limited.
   */
  consume(socketId: string): boolean {
    const now = Date.now();
    const entry = this.counters.get(socketId);

    if (!entry || now > entry.resetAt) {
      this.counters.set(socketId, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    entry.count++;
    if (entry.count > this.maxEvents) {
      return false;
    }

    return true;
  }

  /**
   * Clean up state when a socket disconnects.
   */
  remove(socketId: string): void {
    this.counters.delete(socketId);
  }
}
