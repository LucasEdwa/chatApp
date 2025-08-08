import React, { useState } from 'react';
import { IUser } from '../../models/Interfaces';
import { UserAvatar } from './UserAvatar';
import { OnlineIndicator } from './OnlineIndicator';

interface UserCardProps {
  user: IUser;
  isCurrentUser: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isCurrentUser,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const [isTouched, setIsTouched] = useState(false);

  const handleTouchStart = () => {
    setIsTouched(true);
    onMouseEnter();
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
    onMouseLeave();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        group relative flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl 
        transition-all duration-200 select-none
        ${isCurrentUser 
          ? 'cursor-default ring-2' 
          : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation'
        }
        ${isTouched && !isCurrentUser ? 'scale-[0.98]' : ''}
      `}
      style={{
        backgroundColor: isCurrentUser 
          ? 'var(--color-accent)' 
          : (isHovered || isTouched)
            ? 'var(--color-surface)'
            : 'var(--color-backgroundSecondary)',
        boxShadow: isCurrentUser 
          ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
          : undefined,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Avatar with status indicator */}
      <UserAvatar 
        name={user.name}
        size="medium"
        isOnline={true}
        isCurrentUser={isCurrentUser}
      />

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="font-bold text-sm md:text-base truncate"
            style={{
              color: isCurrentUser 
                ? 'var(--color-messageText)' 
                : 'var(--color-textPrimary)'
            }}
          >
            {user.name}
          </span>
          {isCurrentUser && (
            <span 
              className="px-1.5 md:px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ 
                backgroundColor: 'var(--color-messageText)',
                color: 'var(--color-accent)'
              }}
            >
              YOU
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <OnlineIndicator size="small" animated={false} />
          <span 
            className="text-xs md:text-sm font-medium"
            style={{ 
              color: isCurrentUser 
                ? 'var(--color-messageText)' 
                : 'var(--color-online)' 
            }}
          >
            Online
          </span>
          {!isCurrentUser && (isHovered || isTouched) && (
            <span 
              className="text-xs md:text-sm font-medium animate-pulse hidden sm:inline"
              style={{ color: 'var(--color-accent)' }}
            >
              • Tap to chat
            </span>
          )}
        </div>
      </div>

      {/* Action indicator */}
      {!isCurrentUser && (
        <div 
          className={`transition-all duration-200 ${
            (isHovered || isTouched) ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
          }`}
          style={{ color: 'var(--color-accent)' }}
        >
          <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      )}

      {/* Ripple effect for current user */}
      {isCurrentUser && (
        <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
      )}

      {/* Touch feedback overlay */}
      {!isCurrentUser && isTouched && (
        <div className="absolute inset-0 rounded-xl bg-white opacity-10 pointer-events-none"></div>
      )}
    </div>
  );
};
