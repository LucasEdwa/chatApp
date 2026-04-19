import { useState, useEffect, useRef, useCallback } from 'react';
import { IMessage, IChatContext, ITypingUser } from '../domain/Interfaces';
import { IUser } from '../../users/domain/Interfaces';
import { chatService } from '../infrastructure/ChatService';
import { notificationService } from '../infrastructure/NotificationService';

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
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasConnected.current && userName) {
      hasConnected.current = true;
      setIsLoading(true);

      const handleMessage = (message: IMessage) => {
        if (!message.isPrivate) {
          // Skip server echo for own messages — already added optimistically
          if (message.clientMessageId && message.userId === userIdRef.current) return;

          setPublicMessages(prev => [...prev, message]);
          
          // Add unread count if not in public chat and message is not from current user
          setActiveChat(currentActiveChat => {
            if (currentActiveChat.isPrivate && message.userId !== userIdRef.current) {
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
          // Skip server echo for own messages — already added optimistically
          if (message.clientMessageId && message.userId === userIdRef.current) return;

          setPrivateChats(prev => {
            const newChats = new Map(prev);
            const existingMessages = newChats.get(message.roomId!) || [];
            newChats.set(message.roomId!, [...existingMessages, message]);
            return newChats;
          });

          // Add unread count if not in the current private chat and message is not from current user
          setActiveChat(currentActiveChat => {
            if (currentActiveChat.id !== message.roomId && message.userId !== userIdRef.current) {
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
        userIdRef.current = id;
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

      // ── Acknowledgment handler (Optimistic UI) ─────────────
      // When the server confirms a message, upgrade its status
      // from "sending" to "sent" (or "failed").
      chatService.onMessageAck((ackData) => {
        const { status, clientMessageId } = ackData;
        if (!clientMessageId) return;

        const newStatus = status === 'ok' ? 'sent' as const : 'failed' as const;

        // Update in public messages
        setPublicMessages(prev =>
          prev.map(m =>
            m.clientMessageId === clientMessageId ? { ...m, status: newStatus } : m
          )
        );

        // Update in private chats
        setPrivateChats(prev => {
          const newChats = new Map(prev);
          let changed = false;
          for (const [roomId, msgs] of newChats) {
            const updated = msgs.map(m =>
              m.clientMessageId === clientMessageId ? { ...m, status: newStatus } : m
            );
            if (updated !== msgs) {
              newChats.set(roomId, updated);
              changed = true;
            }
          }
          return changed ? newChats : prev;
        });
      });

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

    // Generate a client-side ID for ack tracking
    const clientMessageId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const message: IMessage = {
      message: messageText.trim(),
      timestamp: new Date(),
      userName: userName,
      userId: userId,
      roomId: activeChat.isPrivate ? activeChat.id : undefined,
      isPrivate: activeChat.isPrivate,
      clientMessageId,
      status: 'sending', // Optimistic: show immediately as "sending"
    };

    // ── Optimistic insertion ──────────────────────────────────
    // The message appears in the UI right away. The ack callback
    // will upgrade status to "sent" or "failed".
    if (activeChat.isPrivate && activeChat.id) {
      setPrivateChats(prev => {
        const newChats = new Map(prev);
        const existing = newChats.get(activeChat.id) || [];
        newChats.set(activeChat.id, [...existing, message]);
        return newChats;
      });
    } else {
      setPublicMessages(prev => [...prev, message]);
    }

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
