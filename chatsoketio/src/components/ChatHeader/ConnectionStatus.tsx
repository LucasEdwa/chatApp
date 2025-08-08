import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onlineCount?: number;
  showCount?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  onlineCount,
  showCount = true
}) => {
  return (
    <div className="flex items-center gap-3 mt-1">
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: isConnected ? 'var(--color-online)' : 'var(--color-error)'
          }}
        ></div>
        <span 
          className="text-sm font-medium"
          style={{ color: isConnected ? 'var(--color-online)' : 'var(--color-error)' }}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {showCount && onlineCount !== undefined && (
        <div className="flex items-center gap-1">
          <span 
            className="text-sm"
            style={{ color: 'var(--color-textMuted)' }}
          >
            •
          </span>
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {onlineCount} {onlineCount === 1 ? 'person' : 'people'} online
          </span>
        </div>
      )}
    </div>
  );
};
