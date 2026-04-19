# Real-Time Chat Application

## Overview

A full-stack real-time chat application built with **TypeScript** end-to-end, featuring public group chat, private 1-on-1 messaging, typing indicators, browser notifications, theming, and mobile responsiveness. Communication is powered by **WebSockets** via Socket.IO.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Socket.IO Client, Tailwind CSS 4 |
| **Backend** | Node.js 20, Express, Socket.IO, TypeScript |
| **Deployment** | Docker (multi-stage build), Google Cloud Run |
| **Architecture** | Clean Architecture (frontend), Handler-based (backend) |

---

## Backend (`chatApi/`)

An **Express + Socket.IO** server that manages all real-time communication. There is no database — all state is held **in-memory** using `Map` structures, making it session-based.

**Core responsibilities:**

- **User management** — Tracks connected users via socket IDs. On disconnect, cleans up state and notifies all clients.
- **Public chat** — Broadcasts messages to all connected clients. System messages announce when users join or leave.
- **Private chat** — Generates **deterministic room IDs** by sorting user IDs alphabetically (so `userA-userB` always equals `userB-userA`), preventing duplicate rooms. Message history persists in memory for the session.
- **Typing indicators** — Tracks who is typing with a **3-second auto-timeout** to prevent stale indicators if a client disconnects unexpectedly.

**Architecture:**

```
handlers/SocketHandlers.ts  →  Event routing (all socket events)
state/ChatState.ts          →  In-memory Maps (users, rooms, typing)
utils/ChatUtils.ts          →  Room creation, user list helpers
utils/TypingUtils.ts        →  Typing cleanup logic
models/Interfaces.ts        →  Shared type definitions
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
- **`wrapSocketHandler`** — A higher-order function that wraps every Socket.IO event handler with error boundary logic, preventing one bad event from crashing the process.

```
src/middleware/
  errorHandler.ts   →  AppError class + Express error middleware + Socket.IO error wrapper
  sanitize.ts       →  XSS sanitization for messages and usernames
```

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

**What this means in practice:** If a user loses Wi-Fi for 10 seconds, the client automatically reconnects, re-identifies itself, and the server recovers its room memberships. No manual refresh needed.

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
| **No database** | Keeps the project lightweight and focused on real-time communication patterns. Data is session-scoped. |
| **No auth** | Socket ID serves as user identity. Simplifies the scope while demonstrating WebSocket concepts. |
| **Deterministic room IDs** | Sorting participant IDs prevents duplicate private rooms regardless of who initiates. |
| **Typing auto-timeout (3s)** | Handles edge cases where clients disconnect without sending `typing-stop`. |
| **Singleton services** | `ChatService` and `NotificationService` are instantiated once and shared, avoiding multiple socket connections. |
| **CSS variables for theming** | Avoids re-rendering the entire component tree on theme change — just updates CSS custom properties. |
| **Clean Architecture on frontend** | Clear separation of concerns: UI components never talk to Socket.IO directly, only through hooks that use services. |

---

## Socket Event Flow

```
Client                              Server
  │                                    │
  ├── user-connected ─────────────────►│
  │◄──────────────────── users-list ───┤
  │◄──────────────────── user-joined ──┤
  │                                    │
  ├── send-chat-message ──────────────►│
  │◄──────────────────── chat-message ─┤
  │                                    │
  ├── start-private-chat ─────────────►│
  │◄────────── private-chat-started ───┤
  │◄────────── private-chat-invitation─┤  (to other user)
  │                                    │
  ├── typing-start ───────────────────►│
  │◄──────────────────── user-typing ──┤
  │         (auto-clears after 3s)     │
```

---

## Getting Started

### Backend

```bash
cd chatApi
npm install
npm run dev
```

### Frontend

```bash
cd chatsoketio
npm install
npm run dev
```

Set `VITE_CHAT_API_URL` in the frontend `.env` to point to the backend URL.

---

## Future Improvements

- Add a **persistence layer** (Redis or a database) so messages survive server restarts
- Implement **authentication** (JWT with HTTP-only cookies)
- Add **message read receipts**
- Migrate to **cursor-based pagination with database** (current in-memory pagination is index-based)
- Add **Redis adapter** for horizontal scaling across multiple server instances
- Write **unit and integration tests**
- Add **rate limiting** on the backend to prevent spam
