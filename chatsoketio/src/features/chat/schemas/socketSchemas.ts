import { z } from 'zod';

/**
 * Zod schemas for validating data received from the Socket.IO server.
 * Prevents malformed server payloads from corrupting client state.
 */

// ── Core schemas ─────────────────────────────────────────────

export const messageStatusSchema = z.enum(['sending', 'sent', 'failed']);

export const messageSchema = z.object({
  message: z.string(),
  userName: z.string(),
  timestamp: z.coerce.date(),
  userId: z.string().optional(),
  isSystemMessage: z.boolean().optional(),
  roomId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  clientMessageId: z.string().optional(),
  status: messageStatusSchema.optional(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  lastSeen: z.coerce.date().optional(),
});

export const typingUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  roomId: z.string().optional(),
});

export const stoppedTypingSchema = z.object({
  userId: z.string(),
  roomId: z.string().optional(),
});

// ── Server event payloads ────────────────────────────────────

export const usersListSchema = z.array(userSchema);

export const privateChatDataSchema = z.object({
  roomId: z.string(),
  participant: userSchema,
  messages: z.array(messageSchema),
});

export const ackResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  clientMessageId: z.string().optional(),
});

export const privateChatHistorySchema = z.object({
  roomId: z.string(),
  messages: z.array(messageSchema),
  hasMore: z.boolean(),
  nextCursor: z.number().nullable(),
});

// ── Type exports (inferred from schemas) ─────────────────────

export type MessageFromServer = z.infer<typeof messageSchema>;
export type UserFromServer = z.infer<typeof userSchema>;
export type TypingUserFromServer = z.infer<typeof typingUserSchema>;
export type AckResponse = z.infer<typeof ackResponseSchema>;
export type PrivateChatData = z.infer<typeof privateChatDataSchema>;
