import { useState, useEffect, useRef, useCallback } from 'react';
import { IMessage, IUser, IChatContext, ITypingUser } from '../models/Interfaces';
import { chatService } from '../services/ChatService';
import { notificationService } from '../services/NotificationService';

export const useMultiChat = (userName: string) => {
  const [publicMessages, setPublicMessages] = useState<IMessage[]>([]);
  const [privateChats, setPrivateChats] = useState<Map<string, IMessage[]>>(new Map());
  const [users, setUsers] = useState<IUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<IChatContext>({
    id: 'public',
    name: 'Public Chat',
    isPrivate: false
  });
  const [chatContexts, setChatContexts] = useState<IChatContext[]>([
    { id: 'public', name: 'Public Chat', isPrivate: false }
  ]);
  const hasConnected = useRef(false);

  useEffect(() => {
    if (!hasConnected.current && userName) {
      hasConnected.current = true;
      setIsLoading(true);

      const handleMessage = (message: IMessage) => {
        if (!message.isPrivate) {
          setPublicMessages(prev => [...prev, message]);
          
          // Add unread count if not in public chat and message is not from current user
          setActiveChat(currentActiveChat => {
            if (currentActiveChat.isPrivate && message.userId !== userId) {
              setChatContexts(prev => 
                prev.map(ctx => 
                  ctx.id === 'public' 
                    ? { ...ctx, unreadCount: (ctx.unreadCount || 0) + 1 }
                    : ctx
                )
              );
              
              // Show browser notification
              notificationService.showMessageNotification(
                message.userName, 
                message.message, 
                false
              );
            }
            return currentActiveChat;
          });
        }
      };

      const handlePrivateMessage = (message: IMessage) => {
        if (message.roomId) {
          setPrivateChats(prev => {
            const newChats = new Map(prev);
            const existingMessages = newChats.get(message.roomId!) || [];
            newChats.set(message.roomId!, [...existingMessages, message]);
            return newChats;
          });

          // Add unread count if not in the current private chat and message is not from current user
          setActiveChat(currentActiveChat => {
            if (currentActiveChat.id !== message.roomId && message.userId !== userId) {
              setChatContexts(prev => 
                prev.map(ctx => 
                  ctx.id === message.roomId 
                    ? { ...ctx, unreadCount: (ctx.unreadCount || 0) + 1 }
                    : ctx
                )
              );
              
              // Show browser notification
              notificationService.showMessageNotification(
                message.userName, 
                message.message, 
                true
              );
            }
            return currentActiveChat;
          });
        }
      };

      const handleConnection = (id: string) => {
        setUserId(id);
        setIsConnected(true);
        setIsLoading(false);
      };

      const handleUsersList = (usersList: IUser[]) => {
        setUsers(usersList);
      };

      const handlePrivateChatStarted = (data: { roomId: string, participant: IUser, messages: IMessage[] }) => {
        // Add messages to private chat
        setPrivateChats(prev => {
          const newChats = new Map(prev);
          newChats.set(data.roomId, data.messages);
          return newChats;
        });

        // Add chat context
        const newContext: IChatContext = {
          id: data.roomId,
          name: data.participant.name,
          isPrivate: true,
          participantId: data.participant.id
        };

        setChatContexts(prev => {
          const exists = prev.find(ctx => ctx.id === data.roomId);
          if (!exists) {
            return [...prev, newContext];
          }
          return prev;
        });

        // Switch to the new chat
        setActiveChat(newContext);
      };

      const handlePrivateChatInvitation = (data: { roomId: string, participant: IUser, messages: IMessage[] }) => {
        // Join the room
        chatService.joinPrivateChatRoom(data.roomId);
        
        // Add messages to private chat
        setPrivateChats(prev => {
          const newChats = new Map(prev);
          newChats.set(data.roomId, data.messages);
          return newChats;
        });

        // Add chat context
        const newContext: IChatContext = {
          id: data.roomId,
          name: data.participant.name,
          isPrivate: true,
          participantId: data.participant.id,
          unreadCount: 1
        };

        setChatContexts(prev => {
          const exists = prev.find(ctx => ctx.id === data.roomId);
          if (!exists) {
            return [...prev, newContext];
          }
          return prev;
        });
      };

      const handleUserTyping = (user: ITypingUser) => {
        setTypingUsers(prev => {
          // Remove if already exists, then add to avoid duplicates
          const filtered = prev.filter(u => u.id !== user.id || u.roomId !== user.roomId);
          const newUsers = [...filtered, user];
          return newUsers;
        });
      };

      const handleUserStoppedTyping = (data: { userId: string, roomId?: string }) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => 
            !(user.id === data.userId && user.roomId === data.roomId)
          );
          return filtered;
        });
      };

      chatService.onMessage(handleMessage);
      chatService.onPrivateMessage(handlePrivateMessage);
      chatService.onConnection(handleConnection);
      chatService.onUsersList(handleUsersList);
      chatService.onPrivateChatStarted(handlePrivateChatStarted);
      chatService.onPrivateChatInvitation(handlePrivateChatInvitation);
      chatService.onUserTyping(handleUserTyping);
      chatService.onUserStoppedTyping(handleUserStoppedTyping);

      chatService.connect(userName).catch(() => {
        setIsLoading(false);
        setIsConnected(false);
      });

      return () => {
        chatService.disconnect();
      };
    }
  }, [userName]);

  const sendMessage = useCallback((messageText: string) => {
    if (!chatService.isConnected() || !messageText.trim() || !userId) return;

    const message: IMessage = {
      message: messageText.trim(),
      timestamp: new Date(),
      userName: userName,
      userId: userId,
      roomId: activeChat.isPrivate ? activeChat.id : undefined,
      isPrivate: activeChat.isPrivate
    };

    chatService.sendMessage(message);
  }, [activeChat, userId, userName]);

  const startPrivateChat = useCallback((targetUserId: string) => {
    chatService.startPrivateChat(targetUserId);
  }, []);

  const handleTypingStart = useCallback((roomId?: string) => {
    chatService.startTyping(roomId);
  }, []);

  const handleTypingStop = useCallback((roomId?: string) => {
    chatService.stopTyping(roomId);
  }, []);

  const switchToChat = useCallback((context: IChatContext) => {
    setActiveChat(context);
    
    // Clear unread count
    if (context.unreadCount) {
      setChatContexts(prev => 
        prev.map(ctx => 
          ctx.id === context.id 
            ? { ...ctx, unreadCount: 0 }
            : ctx
        )
      );
    }
  }, []);

  const getCurrentMessages = (): IMessage[] => {
    if (activeChat.isPrivate) {
      return privateChats.get(activeChat.id) || [];
    }
    return publicMessages;
  };

  const getCurrentTypingUsers = (): ITypingUser[] => {
    if (activeChat.isPrivate) {
      return typingUsers.filter(user => user.roomId === activeChat.id);
    }
    return typingUsers.filter(user => !user.roomId);
  };

  return {
    messages: getCurrentMessages(),
    users,
    typingUsers: getCurrentTypingUsers(),
    sendMessage,
    startPrivateChat,
    handleTypingStart,
    handleTypingStop,
    isConnected,
    userId,
    isLoading,
    activeChat,
    chatContexts,
    switchToChat
  };
};
