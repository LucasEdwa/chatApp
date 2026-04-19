# Real-Time Chat Application

## Overview

A full-stack real-time chat application built with **TypeScript** end-to-end, featuring public group chat, private 1-on-1 messaging, typing indicators, browser notifications, theming, and mobile responsiveness. Communication is powered by **WebSockets** via Socket.IO.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Socket.IO Client, Tailwind CSS 4 |
| **Backend** | Node.js 20, Express, Socket.IO, TypeScript, Mongoose, JWT |
| **Database** | MongoDB 7 (message persistence, unread tracking) |
| **Auth** | JWT (jsonwebtoken) — token-based socket authentication |
| **Validation** | Zod (runtime schema validation on both client and server) |
| **Deployment** | Docker (multi-stage build), Google Cloud Run, GitHub Actions CI/CD |
| **Architecture** | Clean Architecture (frontend), Repository + Handler pattern (backend) |

---

## Backend (`chatApi/`)

An **Express + Socket.IO** server with **MongoDB persistence** and **JWT authentication**. Messages and chat rooms survive server restarts; unread counts are tracked server-side as the source of truth.

**Core responsibilities:**

- **User management** — Tracks connected users via socket IDs. On disconnect, cleans up state and notifies all clients.
- **Public chat** — Broadcasts messages to all connected clients. Messages are persisted to MongoDB. On reconnect, the client receives the last 50 messages from the database.
- **Private chat** — Generates **deterministic room IDs** by sorting **usernames** alphabetically (so `alice-bob` always equals `bob-alice`), ensuring rooms persist across sessions regardless of socket ID changes.
- **Message persistence** — All messages (public and private) are saved to MongoDB. Chat rooms and their participant lists are also persisted.
- **Unread tracking** — Server-side unread counts using atomic `$inc` operations in MongoDB. Counts survive page refreshes and server restarts. Pushed to clients in real-time via `unread-updated` events.
- **Typing indicators** — Tracks who is typing with a **3-second auto-timeout** to prevent stale indicators if a client disconnects unexpectedly.
- **JWT authentication** — `/auth/token` endpoint issues JWT tokens. Socket connections are authenticated at the handshake phase before a socket is ever opened.

**Architecture:**

```
handlers/SocketHandlers.ts  →  Event routing (all socket events + ack callbacks, async DB ops)
config/database.ts          →  MongoDB connection manager
models/MessageModel.ts      →  Mongoose schema for messages (indexed by roomId + timestamp)
models/ChatRoomModel.ts     →  Mongoose schema for chat rooms (indexed by participants)
models/UnreadModel.ts       →  Mongoose schema for server-side unread counts
repositories/MongoChatRepository.ts  →  MongoDB implementation of IChatRepository
repositories/UnreadRepository.ts     →  Atomic unread count operations ($inc, markRead)
repositories/ChatRepository.ts       →  IChatRepository interface (async-compatible)
state/ChatState.ts          →  In-memory Maps (online users, typing state)
utils/ChatUtils.ts          →  User list helpers
utils/TypingUtils.ts        →  Typing cleanup logic
models/Interfaces.ts        →  Shared type definitions
schemas/socketSchemas.ts    →  Zod schemas for all socket payloads
shared/SocketEvents.ts      →  Type-safe event name constants
middleware/errorHandler.ts  →  Centralized error handling (Express + Socket.IO, sync + async)
middleware/sanitize.ts      →  XSS sanitization (messages + usernames)
middleware/socketAuth.ts    →  JWT auth + handshake validation + per-socket rate limiter
```

**Deployment:** Multi-stage Docker build (compile TS → minimal Node Alpine production image). Deployed to **GCP Cloud Run** (europe-north1) with auto-scaling 0–10 instances.

---

## Frontend (`chatsoketio/`)

A **React 19** SPA structured using **Clean Architecture** with feature-based modules:

```
Presentation  (React components)
     ↓
Application   (Custom hooks: useChat, useMultiChat)
     ↓
Infrastructure (ChatService singleton, NotificationService)
     ↓
Domain         (TypeScript interfaces)
```

**Features organized into 3 feature modules:**

### 1. Chat Feature

- **ChatService** — Singleton wrapper around Socket.IO client. Manages connection lifecycle, event subscription via callbacks, and message sending.
- **useMultiChat hook** — The core state manager. Handles:
  - Separate state buckets for public messages (`array`) and private chats (`Map`)
  - Active chat context tracking with tab switching
  - **Unread message counts** per conversation (badges on tabs)
  - Typing indicator filtering by room
  - Browser notification dispatch when tab is hidden
- **Multi-tab UI** — `ChatTabs` component lets users switch between the public room and multiple private conversations, each with unread badges.
- **NotificationService** — Wraps the Browser Notification API. Requests permission on init, only fires when `document.hidden` is true, and uses tags to deduplicate.

### 2. Theme Feature

- Light/Dark themes defined as **CSS variable maps** (`--color-background`, `--color-accent`, etc.)
- Applied via `document.documentElement.style.setProperty()` — theme switches **without component re-renders**
- Persisted in `localStorage` via React Context

### 3. Users Feature

- **UserNameModal** — Entry point with 2–20 character validation
- **UsersList** — Searchable sidebar showing online users with action buttons to start private chats
- **useMobileOptimization hook** — Detects mobile breakpoint (`<768px`), implements **swipe-to-close** (>100px right swipe), and locks body scroll when sidebar is open

---

## Security Hardening

The backend implements several layers of defense following OWASP best practices:

| Measure | Implementation |
|---------|---------------|
| **HTTP Header Security** | `helmet` sets `X-Content-Type-Options`, `X-Frame-Options`, CSP, HSTS, and more out of the box |
| **XSS Prevention** | All user input (messages and usernames) is sanitized server-side via the `xss` library before broadcast |
| **CORS Lockdown** | Strict origin allowlist (no more `origin: '*'`); credentials enabled for cookie support |
| **Rate Limiting** | `express-rate-limit` — 100 requests per 15-minute window per IP on all HTTP endpoints |
| **Input Validation** | Messages capped at 2 000 chars; usernames 2–20 chars; both validated + sanitized before processing |
| **Graceful Shutdown** | `SIGTERM`/`SIGINT` handlers close Socket.IO and HTTP server cleanly (zero dropped connections on deploy) |

### Centralized Error Handling

Instead of scattered `try/catch` blocks, the backend uses:

- **`errorHandler` middleware** — A single Express error handler that catches all route errors and returns consistent JSON responses. Operational errors (`AppError`) return meaningful status codes; unexpected errors return `500` without leaking internals.
- **`wrapSocketHandler`** — A higher-order function that wraps every Socket.IO event handler with error boundary logic (supports both sync and async handlers), preventing one bad event from crashing the process.

```
src/middleware/
  errorHandler.ts   →  AppError class + Express error middleware + Socket.IO error wrapper
  sanitize.ts       →  XSS sanitization for messages and usernames
  socketAuth.ts     →  Handshake authentication middleware + per-socket rate limiter
```

### Socket-Level Rate Limiting

Beyond HTTP rate limiting, a **per-socket event throttler** (`SocketRateLimiter`) prevents a malicious client from flooding the server with events:

- **30 events per 5-second window** per socket
- Rate-limited events are silently dropped (message sends return `{ status: 'error' }` via ack)
- State is cleaned up on disconnect to prevent memory leaks

### Socket.IO Auth Middleware

Connections are validated at the **handshake phase** before a socket is ever opened:

- **JWT verification** — If a token is provided in `socket.handshake.auth`, it is verified using `jsonwebtoken`. Invalid or expired tokens are rejected with `next(new Error('Authentication failed'))` — the socket never connects
- **Fallback to username validation** — If no token is provided, the username is sanitized and used as identity
- Token issuance via `POST /auth/token` — the frontend fetches a JWT before connecting the socket

---

## Connection Resilience (Heartbeat & Reconnection)

Real-time apps need to survive unstable networks. The server and client are configured for this:

### Server-Side (Socket.IO)
- **`pingInterval: 25000`** — Server pings every 25s to verify the client is alive
- **`pingTimeout: 20000`** — Client has 20s to respond before being considered disconnected
- **`connectionStateRecovery`** — If a client reconnects within **30 seconds**, Socket.IO restores its rooms and buffered events automatically (no data loss on brief signal drops)

### Client-Side (Socket.IO Client)
- **`reconnection: true`** with up to **10 attempts**
- **Exponential backoff**: starts at 1s, caps at 10s between retries
- **Auto re-registration**: on reconnect, the client re-emits `user-connected` so the server rebuilds its presence state
- **Reconnect lifecycle hooks**: `reconnect`, `reconnect_attempt`, and `reconnect_failed` events are logged for observability

### Last Seen (Heartbeat-Based Presence)

- Client sends a `heartbeat` event every **30 seconds**
- Server updates `user.lastSeen` timestamp on each heartbeat
- Users list includes `lastSeen` for each user, enabling "Last seen 2 min ago" UI
- Heartbeat is started on connect and stopped on disconnect

**What this means in practice:** If a user loses Wi-Fi for 10 seconds, the client automatically reconnects, re-identifies itself, and the server recovers its room memberships. No manual refresh needed.

---

## Optimistic UI & Message Acknowledgments

Messages use a **three-phase delivery model** inspired by WhatsApp:

```
1. User hits Send  →  Message appears immediately (status: "sending", opacity reduced)
2. Server confirms →  Ack callback fires  →  Status upgrades to "sent" (checkmark)
3. If ack fails    →  Status becomes "failed" (error icon + red label)
```

**How it works:**

- Each message gets a `clientMessageId` (UUID-like) generated client-side
- `sendMessage` uses **Socket.IO acknowledgments** (`socket.emit('event', data, callback)`) — the server calls the callback with `{ status: 'ok' }` or `{ status: 'error' }`
- The optimistic message is inserted into React state **before** the server round-trip
- Server echoes are **deduplicated**: own messages received from the server are skipped since they're already in state
- The `MessageTimestamp` component renders a spinner for "sending", a checkmark for "sent", or an error icon for "failed"

---

## Message Pagination

Private chat history supports **cursor-based pagination** to prevent loading thousands of messages at once:

```
Event: get-private-chat-history
Payload: { roomId: string, beforeIndex?: number, limit?: number }

Response: {
  roomId: string,
  messages: IMessage[],       // Paginated slice
  hasMore: boolean,           // Are there older messages?
  nextCursor: number | null   // Pass as beforeIndex to load more
}
```

- Default page size: **50 messages**
- Maximum page size: **100 messages**
- When starting a private chat, only the **last 50 messages** are sent (not the full history)
- The client can implement "load more" by passing `nextCursor` as `beforeIndex`

---

| Decision | Rationale |
|----------|-----------|
| **MongoDB** | Persists messages, rooms, and unread counts across server restarts. Mongoose provides schema validation and indexed queries. |
| **JWT authentication** | Stateless token-based auth verified at the socket handshake phase. Graceful fallback to username-only auth for simplicity. |
| **Zod validation** | Runtime schema validation on both client and server prevents malformed payloads from corrupting state. |
| **Server-side unread counts** | Atomic `$inc` operations prevent race conditions. Counts survive page refresh and are pushed in real-time. |
| **Deterministic room IDs by username** | Sorting participant **names** (not socket IDs) ensures rooms persist across sessions and reconnections. |
| **Typing auto-timeout (3s)** | Handles edge cases where clients disconnect without sending `typing-stop`. |
| **Singleton services** | `ChatService` and `NotificationService` are instantiated once and shared, avoiding multiple socket connections. |
| **CSS variables for theming** | Avoids re-rendering the entire component tree on theme change — just updates CSS custom properties. |
| **Clean Architecture on frontend** | Clear separation of concerns: UI components never talk to Socket.IO directly, only through hooks that use services. |
| **GitHub Actions CI/CD** | Automated type-checking, linting, and deployment on push to `main`. Secrets for MongoDB URI and JWT are stored in GitHub Actions. |

---

## Socket Event Flow

```
Client                              Server
  │                                    │
  │── POST /auth/token ───────────────►│  ← Returns JWT
  │◄──────────────── { token } ────────┤
  │                                    │
  │── [handshake + JWT verification]──►│  ← Rejects invalid tokens
  │                                    │
  ├── user-connected ─────────────────►│
  │◄──────────────────── users-list ───┤
  │◄──────────────────── user-joined ──┤
  │◄──────────── unread-counts ────────┤  ← Persisted from MongoDB
  │◄──────────── public-history ───────┤  ← Last 50 messages from DB
  │                                    │
  ├── send-chat-message ──────────────►│  ← Rate-limited (30/5s)
  │◄──────────── ack({ status: 'ok' }) │  ← Acknowledgment callback
  │◄──────────────────── chat-message ─┤
  │◄──────────── unread-updated ───────┤  ← Pushed to other users
  │                                    │
  ├── start-private-chat ─────────────►│
  │◄────────── private-chat-started ───┤  ← Messages from MongoDB
  │◄────────── private-chat-invitation─┤  (to other user)
  │                                    │
  ├── mark-read ──────────────────────►│  ← Resets unread in MongoDB
  │◄──────────── unread-updated(0) ────┤
  │                                    │
  ├── typing-start ───────────────────►│  ← Rate-limited
  │◄──────────────────── user-typing ──┤
  │         (auto-clears after 3s)     │
  │                                    │
  ├── heartbeat ──────────────────────►│  ← Every 30s (updates lastSeen)
  │                                    │
  │◄──── [connectionStateRecovery] ────┤  ← Auto-resync within 30s
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+ (local or cloud)

### Quick Start with Docker Compose

```bash
docker compose up
```

This starts MongoDB, the backend (port 8080), and the frontend (port 5173).

### Manual Setup

**Backend:**
```bash
cd chatApi
npm install
# Set environment variables (or use defaults)
export MONGO_URI=mongodb://localhost:27017/chatapp
export JWT_SECRET=your-secret-here
npm run dev
```

**Frontend:**
```bash
cd chatsoketio
npm install
# Set the backend URL
echo "VITE_CHAT_API_URL=http://localhost:8080" > .env
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/chatapp` | MongoDB connection string |
| `JWT_SECRET` | `dev-secret-change-in-production` | Secret for signing JWT tokens |
| `PORT` | `8080` | Backend server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed origins |
| `VITE_CHAT_API_URL` | — | Backend URL for the frontend |

---

## CI/CD

The project uses **GitHub Actions** (`.github/workflows/ci.yml`) for automated CI/CD:

1. **On every push/PR to `main`**: TypeScript type-checking + build for both projects
2. **On merge to `main`**: Automated deployment to GCP Cloud Run with secret injection (`MONGO_URI`, `JWT_SECRET`)

Required GitHub Secrets: `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `MONGO_URI`, `JWT_SECRET`

---

## Future Improvements

- Add **Redis adapter** for horizontal scaling across multiple server instances
- Add **message read receipts** (double checkmark)
- Write **unit and integration tests**
- Add **file/image sharing** support
- Implement **user authentication with OAuth providers**
