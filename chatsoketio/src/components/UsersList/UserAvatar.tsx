import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  isOnline?: boolean;
  isCurrentUser?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'medium',
  isOnline = true,
  isCurrentUser = false,
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-lg'
  };

  const statusSizes = {
    small: 'w-2.5 h-2.5',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-md transition-transform group-hover:scale-105`}
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        {getInitials(name)}
      </div>
      
      {/* Online status indicator */}
      <div 
        className={`absolute -bottom-1 -right-1 ${statusSizes[size]} rounded-full border-2 ${isOnline ? 'animate-pulse' : ''}`}
        style={{
          backgroundColor: isOnline ? 'var(--color-online)' : 'var(--color-error)',
          borderColor: isCurrentUser ? 'var(--color-accent)' : 'var(--color-backgroundSecondary)'
        }}
      ></div>
    </div>
  );
};
