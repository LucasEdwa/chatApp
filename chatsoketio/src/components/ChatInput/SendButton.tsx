import React from 'react';

interface SendButtonProps {
  disabled?: boolean;
  hasMessage?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SendButton: React.FC<SendButtonProps> = ({
  disabled = false,
  hasMessage = false,
  onClick,
  className = ''
}) => {
  const isActive = hasMessage && !disabled;

  return (
    <button
      type="submit"
      disabled={disabled || !hasMessage}
      onClick={onClick}
      className={`
        group relative p-3 rounded-full transition-all duration-200 
        transform hover:scale-105 active:scale-95 
        disabled:cursor-not-allowed disabled:scale-100
        ${isActive ? 'shadow-lg hover:shadow-xl' : 'opacity-50'}
        ${className}
      `}
      style={{
        backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-textMuted)',
        color: 'white'
      }}
      title={isActive ? "Send message (Enter)" : "Type a message to send"}
    >
      {/* Send icon with animation */}
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${
          isActive ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>

      {/* Ripple effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-opacity duration-150" />
      )}

      {/* Pulse effect when active */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse opacity-75"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      )}
    </button>
  );
};
