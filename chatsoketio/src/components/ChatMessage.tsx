import React from 'react';
import { IMessage } from '../models/Interfaces';
import { SystemMessage } from './ChatMessage/SystemMessage';
import { UserMessage } from './ChatMessage/UserMessage';

interface ChatMessageProps {
  message: IMessage;
  isOwnMessage: boolean;
  showRelativeTime?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isOwnMessage,
  showRelativeTime = false
}) => {
  // Handle system messages
  if (message.isSystemMessage) {
    return (
      <SystemMessage 
        message={message.message}
        icon={getSystemMessageIcon(message.message)}
      />
    );
  }

  // Handle user messages
  return (
    <UserMessage
      message={message.message}
      userName={message.userName}
      timestamp={message.timestamp}
      isOwnMessage={isOwnMessage}
      showRelativeTime={showRelativeTime}
    />
  );
};

// Helper function to determine system message icon
const getSystemMessageIcon = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('joined')) return '👋';
  if (lowerMessage.includes('left')) return '👋';
  if (lowerMessage.includes('connected')) return '🔗';
  if (lowerMessage.includes('disconnected')) return '⚡';
  if (lowerMessage.includes('typing')) return '✍️';
  
  return '💬';
};
