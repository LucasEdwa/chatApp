import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  showIndicator?: boolean;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  showIndicator = true,
  className = ''
}) => {
  if (!showIndicator) return null;

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300
        ${isTyping ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-textSecondary)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center gap-1">
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            animationDelay: '0ms',
            animationDuration: '1000ms'
          }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            animationDelay: '200ms',
            animationDuration: '1000ms'
          }}
        />
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'var(--color-accent)',
            animationDelay: '400ms',
            animationDuration: '1000ms'
          }}
        />
      </div>
      <span className="text-xs font-medium">Typing...</span>
    </div>
  );
};
