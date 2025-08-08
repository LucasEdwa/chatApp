import React from 'react';
import { ITypingUser } from '../models/Interfaces';

interface TypingIndicatorProps {
  typingUsers: ITypingUser[];
  currentUserId: string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  typingUsers, 
  currentUserId 
}) => {
  // Filter out current user and get unique typing users
  const filteredTypingUsers = typingUsers.filter(
    user => user.id !== currentUserId
  );

  if (filteredTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (filteredTypingUsers.length === 1) {
      return `${filteredTypingUsers[0].name} is typing`;
    } else if (filteredTypingUsers.length === 2) {
      return `${filteredTypingUsers[0].name} and ${filteredTypingUsers[1].name} are typing`;
    } else {
      return `${filteredTypingUsers[0].name} and ${filteredTypingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              animationDelay: '0ms',
              animationDuration: '1400ms'
            }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              animationDelay: '150ms',
              animationDuration: '1400ms'
            }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              animationDelay: '300ms',
              animationDuration: '1400ms'
            }}
          ></div>
        </div>
        <span 
          className="text-sm italic"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {getTypingText()}...
        </span>
      </div>
    </div>
  );
};
