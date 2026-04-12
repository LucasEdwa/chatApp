import { useState, useRef, useEffect, useCallback } from 'react';

interface UseMessageInputOptions {
  onSendMessage: (message: string) => void;
  onTypingStart?: (roomId?: string) => void;
  onTypingStop?: (roomId?: string) => void;
  roomId?: string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
}

export const useMessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  roomId,
  disabled = false,
  maxLength = 1000,
  autoFocus = true
}: UseMessageInputOptions) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, autoFocus]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onTypingStop?.(roomId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [isTyping, onTypingStop, roomId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Enforce max length
    if (value.length > maxLength) return;
    
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.(roomId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.(roomId);
      }
    }, 1000);

    // If input is empty, immediately stop typing
    if (!value.trim() && isTyping) {
      stopTyping();
    }
  }, [isTyping, maxLength, onTypingStart, onTypingStop, roomId, stopTyping]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;
    
    // Stop typing when sending message
    stopTyping();
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Refocus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [message, disabled, stopTyping, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return {
    message,
    setMessage,
    isTyping,
    inputRef,
    handleInputChange,
    handleSubmit,
    handleKeyPress,
    hasMessage: message.trim().length > 0,
    characterCount: message.length,
    isNearLimit: message.length > maxLength * 0.8
  };
};
