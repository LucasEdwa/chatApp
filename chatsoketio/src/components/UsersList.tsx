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
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleUserClick = (user: IUser) => {
    if (user.id !== currentUserId && onStartPrivateChat) {
      onStartPrivateChat(user.id);
    }
  };

  return (
    <div className={`
      bg-white border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden
      ${isVisible 
        ? 'w-80 opacity-100' 
        : 'w-0 opacity-0 border-l-0'
      }
    `}>
      <div className="h-full flex flex-col w-80">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-gray-800">
              Online Users ({users.length})
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click on a user to start a private chat
          </p>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm">No users online</p>
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
                      ? 'bg-blue-50 border border-blue-200 cursor-default' 
                      : 'hover:bg-gray-50 hover:shadow-sm cursor-pointer transform hover:scale-[1.02]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(user.name)}`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${
                        user.id === currentUserId ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {user.name}
                        {user.id === currentUserId && (
                          <span className="text-xs text-blue-500 ml-1">(You)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Online</span>
                      {user.id !== currentUserId && (
                        <span className="text-xs text-blue-500 ml-2">Click to chat</span>
                      )}
                    </div>
                  </div>
                  {user.id !== currentUserId && (
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {users.length} {users.length === 1 ? 'person' : 'people'} online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};