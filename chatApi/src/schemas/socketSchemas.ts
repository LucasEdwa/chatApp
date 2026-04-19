import { z } from 'zod';

/**
 * Zod schemas for validating incoming Socket.IO event payloads.
 * These run at the system boundary — every client payload is
 * validated before business logic touches it.
 */

// ── Primitives ───────────────────────────────────────────────

export const userNameSchema = z
  .string()
  .trim()
  .min(2, 'Username must be at least 2 characters')
  .max(20, 'Username must be at most 20 characters');

export const roomIdSchema = z.string().min(1).max(200);

export const socketIdSchema = z.string().min(1);

// ── Client → Server payloads ─────────────────────────────────

export const sendMessagePayload = z.object({
  message: z.string().min(1).max(2000),
  userName: z.string(),
  timestamp: z.coerce.date(),
  userId: z.string().optional(),
  isSystemMessage: z.boolean().optional(),
  roomId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  clientMessageId: z.string().max(100).optional(),
  status: z.enum(['sending', 'sent', 'failed']).optional(),
});

export const startPrivateChatPayload = z.string().min(1, 'Target user ID required');

export const joinPrivateRoomPayload = z.string().min(1, 'Room ID required');

export const getPrivateHistoryPayload = z.object({
  roomId: roomIdSchema,
  beforeIndex: z.number().int().nonnegative().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const typingPayload = z.object({
  roomId: z.string().optional(),
});

export const userConnectedPayload = userNameSchema;

// ── Server → Client payloads (for outbound consistency) ──────

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
  lastSeen: z.coerce.date(),
});

export const ackResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  clientMessageId: z.string().optional(),
});

// ── Type exports (inferred from schemas) ─────────────────────

export type SendMessagePayload = z.infer<typeof sendMessagePayload>;
export type GetPrivateHistoryPayload = z.infer<typeof getPrivateHistoryPayload>;
export type TypingPayload = z.infer<typeof typingPayload>;
export type AckResponse = z.infer<typeof ackResponseSchema>;
