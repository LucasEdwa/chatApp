import React from 'react';
import { OnlineIndicator } from './OnlineIndicator';

interface UsersListHeaderProps {
  userCount: number;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const UsersListHeader: React.FC<UsersListHeaderProps> = ({
  userCount,
  onToggle,
  children
}) => {
  return (
    <header 
      className="p-4 md:p-6 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <OnlineIndicator size="medium" />
          <h3 
            className="text-base md:text-lg font-bold"
            style={{ color: 'var(--color-textPrimary)' }}
          >
            👥 Online ({userCount})
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="p-2 md:p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
          style={{ 
            backgroundColor: 'var(--color-backgroundSecondary)',
            color: 'var(--color-textSecondary)',
            WebkitTapHighlightColor: 'transparent'
          }}
          title="Close users list"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {children}

      <p 
        className="text-xs mt-2 md:mt-3 text-center"
        style={{ color: 'var(--color-textMuted)' }}
      >
        💬 <span className="hidden sm:inline">Click</span><span className="sm:hidden">Tap</span> on a user to start chatting
      </p>
    </header>
  );
};
