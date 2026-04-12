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

## Key Design Decisions

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
- Implement **authentication** (JWT or OAuth)
- Add **message read receipts**
- Write **unit and integration tests**
- Add **rate limiting** on the backend to prevent spam
