import React from 'react';

interface MessageAvatarProps {
  userName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const MessageAvatar: React.FC<MessageAvatarProps> = ({
  userName,
  size = 'medium',
  className = ''
}) => {
  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-10 h-10 text-base'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm transition-transform hover:scale-105 ${className}`}
      style={{ backgroundColor: getAvatarColor(userName) }}
    >
      {userName.charAt(0).toUpperCase()}
    </div>
  );
};
