import React from 'react';

interface OnlineIndicatorProps {
  isOnline?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline = true,
  size = 'small',
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${animated ? 'animate-pulse' : ''} ${className}`}
      style={{ 
        backgroundColor: isOnline ? 'var(--color-online)' : 'var(--color-error)' 
      }}
    />
  );
};
