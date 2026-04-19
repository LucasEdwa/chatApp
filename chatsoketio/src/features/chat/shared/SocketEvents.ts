/**
 * Type-safe Socket.IO event name constants.
 * Mirrors the backend SocketEvents — single source of truth
 * for event strings on the client side.
 */
export const SocketEvents = {
  // ── Client → Server ────────────────────────────────────────
  SEND_MESSAGE:          'send-chat-message',
  START_PRIVATE_CHAT:    'start-private-chat',
  JOIN_PRIVATE_ROOM:     'join-private-room',
  GET_PRIVATE_HISTORY:   'get-private-chat-history',
  TYPING_START:          'typing-start',
  TYPING_STOP:           'typing-stop',
  GET_USERS_LIST:        'get-users-list',
  HEARTBEAT:             'heartbeat',
  USER_CONNECTED:        'user-connected',

  // ── Server → Client ────────────────────────────────────────
  CHAT_MESSAGE:          'chat-message',
  PRIVATE_MESSAGE:       'private-message',
  USER_JOINED:           'user-joined',
  USER_LEFT:             'user-left',
  USERS_LIST:            'users-list',
  PRIVATE_CHAT_STARTED:  'private-chat-started',
  PRIVATE_CHAT_INVITATION: 'private-chat-invitation',
  PRIVATE_CHAT_HISTORY:  'private-chat-history',
  USER_TYPING:           'user-typing',
  USER_STOPPED_TYPING:   'user-stopped-typing',
  ERROR:                 'error',
} as const;
