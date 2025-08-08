import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { OnlineUsersButton } from './OnlineUsersButton';
import { UserInfo } from './UserInfo';

interface RightSectionProps {
  userName: string;
  onlineCount?: number;
  onToggleUsers?: () => void;
}

export const RightSection: React.FC<RightSectionProps> = ({
  userName,
  onlineCount,
  onToggleUsers
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Online Users Button */}
      {onToggleUsers && onlineCount !== undefined && (
        <OnlineUsersButton
          onlineCount={onlineCount}
          onClick={onToggleUsers}
        />
      )}
      
      {/* Theme Toggle */}
      <div className="p-1 rounded-lg" style={{ backgroundColor: 'var(--color-backgroundSecondary)' }}>
        <ThemeToggle />
      </div>
      
      {/* User Info */}
      <UserInfo userName={userName} />
    </div>
  );
};
