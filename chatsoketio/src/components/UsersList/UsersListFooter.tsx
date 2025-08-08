import React from 'react';
import { OnlineIndicator } from './OnlineIndicator';

interface UsersListFooterProps {
  filteredCount: number;
  totalCount: number;
  searchTerm: string;
  onClearSearch: () => void;
}

export const UsersListFooter: React.FC<UsersListFooterProps> = ({
  filteredCount,
  totalCount,
  searchTerm,
  onClearSearch
}) => {
  return (
    <footer 
      className="p-3 md:p-4 border-t safe-area-inset-bottom"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <OnlineIndicator size="small" />
          <span 
            className="text-xs md:text-sm font-medium"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            {filteredCount} of {totalCount}
          </span>
        </div>
        <button
          onClick={onClearSearch}
          className={`text-xs px-2 md:px-3 py-1.5 rounded-lg transition-all duration-200 touch-manipulation ${
            searchTerm ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-messageText)',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          Clear
        </button>
      </div>
    </footer>
  );
};
