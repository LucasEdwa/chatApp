import { Socket } from 'socket.io';
import { sanitizeUserName } from './sanitize';

/**
 * Socket.IO middleware that validates the connection handshake.
 * Rejects connections that don't provide valid auth credentials.
 *
 * Currently validates the username from handshake auth.
 * When JWT is added, this is where token verification goes —
 * invalid tokens never get a socket connection.
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const { userName, token } = socket.handshake.auth;

  // ── JWT placeholder ──────────────────────────────────────
  // When auth is implemented, verify the token here:
  //
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  //   socket.data.userId = decoded.sub;
  //   socket.data.userName = decoded.name;
  // } catch {
  //   return next(new Error('Authentication failed'));
  // }

  // ── Username validation (current auth model) ─────────────
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
