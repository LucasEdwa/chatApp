import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface ChatHeaderProps {
  userName: string;
  isConnected: boolean;
  onlineCount?: number;
  onToggleUsers?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  userName, 
  isConnected, 
  onlineCount,
  onToggleUsers
}) => {
  return (
    <div 
      className="border-b p-4"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Chat Room
            </h1>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isConnected ? 'var(--color-online)' : 'var(--color-error)'
                }}
              ></div>
              <span 
                className="text-sm"
                style={{ color: 'var(--color-textSecondary)' }}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {onlineCount !== undefined && (
                <span 
                  className="text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  • {onlineCount} online
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {onToggleUsers && (
            <button
              onClick={onToggleUsers}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-messageText)'
              }}
              title="View online users"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.25 2.25 0 01-2.25 2.25H15" />
              </svg>
              {onlineCount || 0}
            </button>
          )}
          <div className="text-right">
            <p 
              className="text-sm"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              Welcome,
            </p>
            <p 
              className="font-semibold"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              {userName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
