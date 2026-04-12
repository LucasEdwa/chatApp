import React from 'react';

interface EmptyStateProps {
  searchTerm: string;
  message?: string;
  submessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  message,
  submessage
}) => {
  const defaultMessage = searchTerm ? 'No matching users' : 'No users online';
  const defaultSubmessage = searchTerm ? 'Try a different search term' : 'Waiting for users to join...';
  
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4">
          {searchTerm ? '🔍' : '👥'}
        </div>
        <p 
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          {message || defaultMessage}
        </p>
        <p 
          className="text-sm"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {submessage || defaultSubmessage}
        </p>
      </div>
    </div>
  );
};
