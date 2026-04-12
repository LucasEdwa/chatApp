import React, { useState } from 'react';
import { MessageAvatar } from './MessageAvatar';
import { MessageBubble } from './MessageBubble';
import { MessageTimestamp } from './MessageTimestamp';

interface UserMessageProps {
  message: string;
  userName: string;
  timestamp: Date;
  isOwnMessage: boolean;
  showRelativeTime?: boolean;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  userName,
  timestamp,
  isOwnMessage,
  showRelativeTime = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`flex mb-4 group transition-all duration-200 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && (
        <div className="mr-3 order-1">
          <MessageAvatar userName={userName} size="medium" />
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[75%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        <MessageBubble 
          message={message}
          isOwnMessage={isOwnMessage}
          className={isHovered ? 'scale-[1.02]' : ''}
        />
        
        <MessageTimestamp
          timestamp={timestamp}
          userName={!isOwnMessage ? userName : undefined}
          isOwnMessage={isOwnMessage}
          showRelativeTime={showRelativeTime}
          className={`${isHovered || isOwnMessage ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        />
      </div>

      {/* Message actions for own messages */}
      {isOwnMessage && (
        <div className={`ml-3 order-2 flex items-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ 
              backgroundColor: 'var(--color-backgroundSecondary)',
              color: 'var(--color-textMuted)'
            }}
            title="Message options"
            onClick={(e) => {
              e.stopPropagation();
              // Handle message actions (edit, delete, etc.)
            }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
