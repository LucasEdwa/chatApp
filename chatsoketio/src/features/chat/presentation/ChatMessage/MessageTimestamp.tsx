import React from 'react';
import { MessageStatus } from '../../domain/Interfaces';

interface MessageTimestampProps {
  timestamp: Date;
  userName?: string;
  isOwnMessage: boolean;
  showRelativeTime?: boolean;
  status?: MessageStatus;
  className?: string;
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({
  timestamp,
  userName,
  isOwnMessage,
  showRelativeTime = false,
  status,
  className = ''
}) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div 
      className={`
        flex items-center mt-2 gap-2 text-xs transition-opacity hover:opacity-100
        ${isOwnMessage ? 'justify-end' : 'justify-start'} 
        ${className}
      `} 
      style={{ color: 'var(--color-textMuted)' }}
    >
      {showRelativeTime ? (
        <span className="opacity-75">{formatRelativeTime(timestamp)}</span>
      ) : (
        <span className="opacity-75">{formatTime(timestamp)}</span>
      )}
      
      {!isOwnMessage && userName && (
        <>
          <span className="opacity-50">•</span>
          <span 
            className="font-medium opacity-90 hover:opacity-100 transition-opacity cursor-default"
            style={{ color: 'var(--color-textSecondary)' }}
            title={`Message from ${userName}`}
          >
            {userName}
          </span>
        </>
      )}
      
      {isOwnMessage && (
        <div className="flex items-center gap-1 opacity-60">
          {(!status || status === 'sent') && (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-medium">Sent</span>
            </>
          )}
          {status === 'sending' && (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-[10px] font-medium">Sending...</span>
            </>
          )}
          {status === 'failed' && (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--color-error)' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-medium" style={{ color: 'var(--color-error)' }}>Failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
