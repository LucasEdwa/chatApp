import React, { forwardRef } from 'react';

interface MessageInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const MessageInputField = forwardRef<HTMLInputElement, MessageInputFieldProps>(({
  value,
  onChange,
  onKeyPress,
  placeholder = "Type your message...",
  disabled = false,
  maxLength = 1000,
  className = ''
}, ref) => {
  const hasContent = value.trim().length > 0;
  const isNearLimit = value.length > maxLength * 0.8;

  return (
    <div className={`flex-1 relative ${className}`}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 pr-16 border rounded-2xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent focus:scale-[1.02]
          disabled:cursor-not-allowed disabled:opacity-50
          ${hasContent ? 'bg-opacity-100' : 'bg-opacity-95'}
        `}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: hasContent ? 'var(--color-accent)' : 'var(--color-border)',
          color: 'var(--color-textPrimary)',
          boxShadow: hasContent ? '0 0 0 1px var(--color-accent)' : 'none'
        }}
        autoComplete="off"
        maxLength={maxLength}
      />
      
      {/* Character counter */}
      <div 
        className={`absolute right-3 bottom-3 text-xs transition-colors duration-200 ${
          isNearLimit ? 'font-semibold' : ''
        }`}
        style={{ 
          color: isNearLimit 
            ? 'var(--color-error)' 
            : hasContent 
              ? 'var(--color-textSecondary)' 
              : 'var(--color-textMuted)' 
        }}
      >
        {value.length}/{maxLength}
      </div>

      {/* Input glow effect */}
      {hasContent && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-20 transition-opacity duration-200"
          style={{
            background: `linear-gradient(135deg, transparent, var(--color-accent), transparent)`,
            filter: 'blur(1px)'
          }}
        />
      )}
    </div>
  );
});

MessageInputField.displayName = 'MessageInputField';
