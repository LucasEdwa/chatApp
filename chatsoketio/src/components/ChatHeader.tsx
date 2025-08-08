import React from 'react';

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
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Chat Room</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {onlineCount !== undefined && (
                <span className="text-sm text-gray-500">
                  • {onlineCount} online
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3">
            {onToggleUsers && (
              <button
                onClick={onToggleUsers}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                title="View online users"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.25 2.25 0 01-2.25 2.25H15" />
                </svg>
                {onlineCount || 0}
              </button>
            )}
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome,</p>
              <p className="font-semibold text-gray-800">{userName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
