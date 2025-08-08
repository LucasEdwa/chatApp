import { useRef, useCallback } from 'react';

interface UseTypingIndicatorOptions {
  onTypingStart?: (roomId?: string) => void;
  onTypingStop?: (roomId?: string) => void;
  roomId?: string;
  typingTimeout?: number;
}

export const useTypingIndicator = ({
  onTypingStart,
  onTypingStop,
  roomId,
  typingTimeout = 1000
}: UseTypingIndicatorOptions = {}) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.(roomId);
    }
  }, [onTypingStart, roomId]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.(roomId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [onTypingStop, roomId]);

  const handleTyping = useCallback((value: string) => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // If input has content and not already typing, start typing
    if (value.trim() && !isTypingRef.current) {
      startTyping();
    }

    // If input is empty, immediately stop typing
    if (!value.trim()) {
      stopTyping();
      return;
    }

    // Set new timeout to stop typing after inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, typingTimeout);
  }, [startTyping, stopTyping, typingTimeout]);

  const cleanup = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  return {
    handleTyping,
    stopTyping,
    cleanup,
    isTyping: isTypingRef.current
  };
};
