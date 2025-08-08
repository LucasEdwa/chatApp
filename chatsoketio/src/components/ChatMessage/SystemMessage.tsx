import React from 'react';

interface SystemMessageProps {
  message: string;
  icon?: string;
  className?: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  icon = '💬',
  className = ''
}) => {
  return (
    <div className={`flex justify-center my-6 ${className}`}>
      <div 
        className="group px-4 py-2 rounded-full text-sm italic relative transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--color-messageReceived)',
          color: 'var(--color-textMuted)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base opacity-75">{icon}</span>
          <span className="font-medium">{message}</span>
        </div>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>
    </div>
  );
};
