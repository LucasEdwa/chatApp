import React from 'react';

interface MessageBubbleProps {
  message: string;
  isOwnMessage: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  className = ''
}) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-2xl relative transition-all duration-200 hover:shadow-md
        ${isOwnMessage 
          ? 'rounded-br-md bg-gradient-to-br' 
          : 'rounded-bl-md bg-gradient-to-bl'
        } ${className}
      `}
      style={{
        backgroundColor: isOwnMessage 
          ? 'var(--color-messageSent)' 
          : 'var(--color-messageReceived)',
        color: isOwnMessage 
          ? 'var(--color-messageText)' 
          : 'var(--color-textPrimary)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="break-words leading-relaxed">{message}</div>
      
      {/* Message tail */}
      <div 
        className={`absolute bottom-0 w-0 h-0 ${
          isOwnMessage 
            ? 'right-0 translate-x-0 border-l-8 border-t-8 border-l-transparent' 
            : 'left-0 -translate-x-0 border-r-8 border-t-8 border-r-transparent'
        }`}
        style={{
          borderTopColor: isOwnMessage 
            ? 'var(--color-messageSent)' 
            : 'var(--color-messageReceived)'
        }}
      />
    </div>
  );
};
