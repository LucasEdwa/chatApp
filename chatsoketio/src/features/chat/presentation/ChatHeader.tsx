import React from 'react';
import { LeftSection } from './ChatHeader/LeftSection';
import { RightSection } from './ChatHeader/RightSection';
import { HeaderGradient } from './ChatHeader/HeaderGradient';

interface ChatHeaderProps {
  userName: string;
  isConnected: boolean;
  onlineCount?: number;
  onToggleUsers?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  userName, 
  isConnected, 
  onlineCount,
  onToggleUsers
}) => {
  return (
    <header 
      className="relative border-b backdrop-blur-sm"
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Main Header Content */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Room Info */}
          <LeftSection 
            userName={userName}
            isConnected={isConnected}
            onlineCount={onlineCount}
          />

          {/* Right Section - Controls */}
          <RightSection
            userName={userName}
            onlineCount={onlineCount}
            onToggleUsers={onToggleUsers}
          />
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <HeaderGradient />
    </header>
  );
};
