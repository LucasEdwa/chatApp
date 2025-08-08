import React from 'react';

interface RoomTitleProps {
  title?: string;
  emoji?: string;
  className?: string;
}

export const RoomTitle: React.FC<RoomTitleProps> = ({
  title = "Chat Room",
  emoji = "💬",
  className = ''
}) => {
  return (
    <h1 
      className={`text-2xl font-bold tracking-tight ${className}`}
      style={{ color: 'var(--color-textPrimary)' }}
    >
      {emoji} {title}
    </h1>
  );
};
