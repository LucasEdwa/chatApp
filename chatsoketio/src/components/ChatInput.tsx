import React from 'react';
import { MessageInputField } from './ChatInput/MessageInputField';
import { SendButton } from './ChatInput/SendButton';
import { TypingIndicator } from './ChatInput/TypingIndicator';
import { QuickActions } from './ChatInput/QuickActions';
import { useMessageInput } from './ChatInput/useMessageInput';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTypingStart?: (roomId?: string) => void;
  onTypingStop?: (roomId?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  roomId?: string;
  showTypingIndicator?: boolean;
  showQuickActions?: boolean;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false, 
  placeholder = "Type your message...",
  roomId,
  showTypingIndicator = true,
  showQuickActions = false,
  maxLength = 1000
}) => {
  const {
    message,
    isTyping,
    inputRef,
    handleInputChange,
    handleSubmit,
    handleKeyPress,
    hasMessage,
    characterCount,
    isNearLimit
  } = useMessageInput({
    onSendMessage,
    onTypingStart,
    onTypingStop,
    roomId,
    disabled,
    maxLength
  });

  return (
    <div 
      className="relative border-t backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Typing Indicator */}
      {showTypingIndicator && (
        <div className="absolute -top-12 left-4 z-10">
          <TypingIndicator isTyping={isTyping} />
        </div>
      )}

      {/* Input Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          {/* Quick Actions */}
          {showQuickActions && (
            <QuickActions
              disabled={disabled}
              showEmoji={true}
              showAttachment={false}
              showVoice={false}
            />
          )}

          {/* Message Input */}
          <MessageInputField
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
          />

          {/* Send Button */}
          <SendButton
            disabled={disabled}
            hasMessage={hasMessage}
          />
        </form>

        {/* Character limit warning */}
        {isNearLimit && (
          <div 
            className="mt-2 text-xs text-center transition-all duration-200"
            style={{ color: 'var(--color-error)' }}
          >
            {maxLength - characterCount} characters remaining
          </div>
        )}
      </div>

      {/* Enhanced gradient border */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${
            hasMessage ? 'var(--color-accent)' : 'var(--color-border)'
          }, transparent)`,
          opacity: hasMessage ? 0.8 : 0.3
        }}
      />
    </div>
  );
};
