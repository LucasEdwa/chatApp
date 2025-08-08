import React from 'react';
import { UserAvatar } from './UserAvatar';
import { RoomTitle } from './RoomTitle';
import { ConnectionStatus } from './ConnectionStatus';

interface LeftSectionProps {
  userName: string;
  isConnected: boolean;
  onlineCount?: number;
}

export const LeftSection: React.FC<LeftSectionProps> = ({
  userName,
  isConnected,
  onlineCount
}) => {
  return (
    <div className="flex items-center gap-4">
      <UserAvatar 
        userName={userName}
        size="medium"
        showStatus={true}
        isConnected={isConnected}
      />
      
      <div className="flex flex-col">
        <RoomTitle />
        <ConnectionStatus 
          isConnected={isConnected}
          onlineCount={onlineCount}
        />
      </div>
    </div>
  );
};
