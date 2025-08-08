import React from 'react';
import { IUser } from '../models/Interfaces';

interface UsersListProps {
  users: IUser[];
  currentUserId: string | null;
  isVisible: boolean;
  onToggle: () => void;
  onStartPrivateChat?: (targetUserId: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  currentUserId, 
  isVisible,
  onStartPrivateChat
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleUserClick = (user: IUser) => {
    if (user.id !== currentUserId && onStartPrivateChat) {
      onStartPrivateChat(user.id);
    }
  };

  return (
    <div className={`
      border-l transition-all duration-300 ease-in-out overflow-hidden
      ${isVisible 
        ? 'w-80 opacity-100' 
        : 'w-0 opacity-0 border-l-0'
      }
    `}
    style={{
      backgroundColor: 'var(--color-background)',
      borderColor: 'var(--color-border)'
    }}>
      <div className="h-full flex flex-col w-80">
        {/* Header */}
        <div 
          className="p-4 border-b"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 
              className="font-semibold"
              style={{ color: 'var(--color-textPrimary)' }}
            >
              Online Users ({users.length})
            </h3>
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--color-textMuted)' }}
          >
            Click on a user to start a private chat
          </p>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  No users online
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-all duration-200 ${
                    user.id === currentUserId 
                      ? 'cursor-default' 
                      : 'cursor-pointer transform hover:scale-[1.02]'
                  }`}
                  style={{
                    backgroundColor: user.id === currentUserId 
                      ? 'var(--color-accent-light)' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (user.id !== currentUserId) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user.id !== currentUserId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: getAvatarColor(user.name) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-medium truncate"
                        style={{
                          color: user.id === currentUserId 
                            ? 'var(--color-accent)' 
                            : 'var(--color-textPrimary)'
                        }}
                      >
                        {user.name}
                        {user.id === currentUserId && (
                          <span 
                            className="text-xs ml-1"
                            style={{ color: 'var(--color-accent)' }}
                          >
                            (You)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--color-textMuted)' }}
                      >
                        Online
                      </span>
                      {user.id !== currentUserId && (
                        <span 
                          className="text-xs ml-2"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          Click to chat
                        </span>
                      )}
                    </div>
                  </div>
                  {user.id !== currentUserId && (
                    <div 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="text-center">
            <p 
              className="text-xs"
              style={{ color: 'var(--color-textMuted)' }}
            >
              {users.length} {users.length === 1 ? 'person' : 'people'} online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};