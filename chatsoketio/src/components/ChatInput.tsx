import React, { useState, FormEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      className="border-t p-4"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)'
      }}
    >
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent resize-none disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-textPrimary)',
              '--tw-ring-color': 'var(--color-accent)'
            } as React.CSSProperties}
            autoComplete="off"
            maxLength={1000}
          />
          <div 
            className="absolute right-3 bottom-3 text-xs"
            style={{ color: 'var(--color-textMuted)' }}
          >
            {message.length}/1000
          </div>
        </div>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white'
          }}
          title="Send message (Enter)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};
