import React from 'react';
import { UserAvatar } from './UserAvatar';

interface UserInfoProps {
  userName: string;
  greeting?: string;
  showAvatar?: boolean;
  className?: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  userName,
  greeting = "Welcome back",
  showAvatar = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 pl-3 border-l ${className}`} style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-right">
        <p 
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--color-textMuted)' }}
        >
          {greeting}
        </p>
        <p 
          className="font-bold text-lg"
          style={{ color: 'var(--color-textPrimary)' }}
        >
          {userName}
        </p>
      </div>
      
      {showAvatar && (
        <div className="opacity-80">
          <UserAvatar userName={userName} size="small" />
        </div>
      )}
    </div>
  );
};
