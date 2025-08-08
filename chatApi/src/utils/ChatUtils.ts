import { IUser, IPrivateChatRoom } from '../models/Interfaces';
import { users, privateChatRooms } from '../state/ChatState';

// Helper function to get current users list
export const getCurrentUsersList = (): IUser[] => {
  return Array.from(users.values());
};

// Helper function to generate private chat room ID
export const generatePrivateChatRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-');
};

// Helper function to get or create private chat room
export const getOrCreatePrivateChatRoom = (userId1: string, userId2: string): IPrivateChatRoom => {
  const roomId = generatePrivateChatRoomId(userId1, userId2);
  
  if (!privateChatRooms.has(roomId)) {
    const newRoom: IPrivateChatRoom = {
      id: roomId,
      participants: [userId1, userId2],
      messages: [],
      createdAt: new Date()
    };
    privateChatRooms.set(roomId, newRoom);
  }
  
  return privateChatRooms.get(roomId)!;
};
