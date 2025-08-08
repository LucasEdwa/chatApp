import React from 'react';
import { IMessage } from '../models/Interfaces';

interface ChatMessageProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div 
          className="px-4 py-2 rounded-full text-sm italic"
          style={{
            backgroundColor: 'var(--color-messageReceived)',
            color: 'var(--color-textMuted)'
          }}
        >
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}
          style={{
            backgroundColor: isOwnMessage 
              ? 'var(--color-messageSent)' 
              : 'var(--color-messageReceived)',
            color: isOwnMessage 
              ? 'var(--color-messageText)' 
              : 'var(--color-textPrimary)'
          }}
        >
          <div className="break-words">{message.message}</div>
        </div>
        <div className={`flex items-center mt-1 gap-2 text-xs ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`} style={{ color: 'var(--color-textMuted)' }}>
          <span>{formatTime(message.timestamp)}</span>
          {!isOwnMessage && (
            <span 
              className="font-medium"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              {message.userName}
            </span>
          )}
        </div>
      </div>
      {!isOwnMessage && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 order-1 flex-shrink-0"
          style={{ backgroundColor: getAvatarColor(message.userName) }}
        >
          {message.userName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
