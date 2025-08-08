import { IUser } from '../../models/Interfaces';

export const useUserFiltering = (users: IUser[], searchTerm: string, currentUserId: string | null) => {
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    // Current user first
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });

  return {
    filteredUsers,
    sortedUsers
  };
};
