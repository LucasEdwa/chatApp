import { Server } from 'socket.io';
import { typingUsers } from '../state/ChatState';

// Helper function to handle typing stop
export const handleTypingStop = (userId: string, roomId: string | undefined, io: Server) => {
  const typingData = typingUsers.get(userId);
  if (!typingData) return;

  clearTimeout(typingData.timeout);
  typingUsers.delete(userId);

  // Emit typing stopped to appropriate users
  if (roomId) {
    // Private chat
    io.to(roomId).emit('user-stopped-typing', { userId, roomId });
  } else {
    // Public chat
    io.emit('user-stopped-typing', { userId });
  }
};
