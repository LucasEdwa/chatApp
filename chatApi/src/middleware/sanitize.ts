import xss from 'xss';

/**
 * Sanitizes user-provided strings to prevent XSS attacks.
 * Strips HTML tags and dangerous attributes from input.
 */
export const sanitize = (input: string): string => {
  return xss(input, {
    whiteList: {},          // Allow no HTML tags
    stripIgnoreTag: true,   // Strip all unknown tags
    stripIgnoreTagBody: ['script', 'style'],
  });
};

/**
 * Validates and sanitizes a chat message.
 * Returns null if the message is invalid.
 */
export const sanitizeMessage = (text: string): string | null => {
  if (typeof text !== 'string') return null;

  const cleaned = sanitize(text.trim());
  if (cleaned.length === 0 || cleaned.length > 2000) return null;

  return cleaned;
};

/**
 * Validates and sanitizes a username.
 * Returns null if the username is invalid.
 */
export const sanitizeUserName = (name: string): string | null => {
  if (typeof name !== 'string') return null;

  const cleaned = sanitize(name.trim());
  if (cleaned.length < 2 || cleaned.length > 20) return null;

  return cleaned;
};
