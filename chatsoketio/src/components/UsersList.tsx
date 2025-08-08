import React, { useState } from 'react';
import { IUser } from '../models/Interfaces';
import { SearchBar } from './UsersList/SearchBar';
import { UsersListHeader } from './UsersList/UsersListHeader';
import { UsersListFooter } from './UsersList/UsersListFooter';
import { UserCard } from './UsersList/UserCard';
import { EmptyState } from './UsersList/EmptyState';
import { useUserFiltering } from './UsersList/useUserFiltering';
import { useMobileOptimization } from './UsersList/useMobileOptimization';

interface UsersListProps {
  users: IUser[];
  currentUserId: string | null;
  isVisible: boolean;
  onToggle: () => void;
  onStartPrivateChat?: (targetUserId: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  currentUserId, 
  isVisible,
  onToggle,
  onStartPrivateChat
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const { filteredUsers, sortedUsers } = useUserFiltering(users, searchTerm, currentUserId);
  const { isMobile } = useMobileOptimization(isVisible, onToggle);

  const handleUserClick = (user: IUser) => {
    if (user.id !== currentUserId && onStartPrivateChat) {
      onStartPrivateChat(user.id);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isVisible && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}
      
      <aside 
        className={`
          ${isMobile ? 'fixed' : 'relative'} top-0 right-0 h-full z-50
          border-l backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden
          ${isVisible 
            ? `${isMobile ? 'w-full max-w-sm' : 'w-80'} opacity-100 translate-x-0` 
            : `${isMobile ? 'w-full max-w-sm' : 'w-0'} opacity-0 ${isMobile ? 'translate-x-full' : ''} border-l-0`
          }
        `}
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
          boxShadow: isVisible ? '-2px 0 8px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <div className={`h-full flex flex-col ${isMobile ? 'w-full' : 'w-80'}`}>
        {/* Header with search */}
        <UsersListHeader userCount={users.length} onToggle={onToggle}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search users..."
          />
        </UsersListHeader>

        {/* Users list */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {sortedUsers.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <div className="p-3 md:p-4 space-y-1.5 md:space-y-2 pb-safe">
              {sortedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentUserId}
                  isHovered={hoveredUserId === user.id}
                  onMouseEnter={() => setHoveredUserId(user.id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  onClick={() => handleUserClick(user)}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <UsersListFooter
          filteredCount={filteredUsers.length}
          totalCount={users.length}
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
        />
      </div>
    </aside>
    </>
  );
};
