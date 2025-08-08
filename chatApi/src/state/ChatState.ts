import { IUser, IPrivateChatRoom, ITypingUser } from '../models/Interfaces';

// Keep track of connected users with their details
export const users = new Map<string, IUser>();

// Keep track of private chat rooms
export const privateChatRooms = new Map<string, IPrivateChatRoom>();

// Keep track of typing users
export const typingUsers = new Map<string, { timeout: NodeJS.Timeout; user: ITypingUser }>();
