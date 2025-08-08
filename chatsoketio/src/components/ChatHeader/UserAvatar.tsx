import React from 'react';

interface UserAvatarProps {
  userName: string;
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  isConnected?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  userName,
  size = 'medium',
  showStatus = false,
  isConnected = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-lg',
    large: 'w-16 h-16 text-xl'
  };

  const statusSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-md transition-transform hover:scale-105`}
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        {userName.charAt(0).toUpperCase()}
      </div>
      
      {showStatus && (
        <div 
          className={`absolute -bottom-1 -right-1 ${statusSizes[size]} rounded-full border-2 transition-all duration-300`}
          style={{
            backgroundColor: isConnected ? 'var(--color-online)' : 'var(--color-error)',
            borderColor: 'var(--color-surface)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        ></div>
      )}
    </div>
  );
};
