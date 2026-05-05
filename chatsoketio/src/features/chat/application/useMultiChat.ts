import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IMessage, IChatContext, ITypingUser } from '../domain/Interfaces';
import { IUser } from '../../users/domain/Interfaces';
import { chatService } from '../infrastructure/ChatService';
import { notificationService } from '../infrastructure/NotificationService';

const PUBLIC_CHAT: IChatContext = { id: 'public', name: 'Public Chat', isPrivate: false };

export const useMultiChat = (userName: string) => {
  const [publicMessages, setPublicMessages] = useState<IMessage[]>([]);
  const [privateChats, setPrivateChats] = useState<Map<string, IMessage[]>>(new Map());
  const [users, setUsers] = useState<IUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<ITypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<IChatContext>(PUBLIC_CHAT);
  const [chatContexts, setChatContexts] = useState<IChatContext[]>([PUBLIC_CHAT]);

  const hasConnected = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const activeChatRef = useRef<IChatContext>(PUBLIC_CHAT);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const incrementUnreadCount = useCallback((roomId: string) => {
    setChatContexts(prev =>
      prev.map(ctx => ctx.id === roomId ? { ...ctx, unreadCount: (ctx.unreadCount || 0) + 1 } : ctx)
    );
  }, []);

  const upsertPrivateChatContext = useCallback((context: IChatContext) => {
    setChatContexts(prev => prev.some(ctx => ctx.id === context.id) ? prev : [...prev, context]);
  }, []);

  const handleMessage = useCallback((message: IMessage) => {
    if (message.isPrivate) return;
    if (message.clientMessageId && message.userId === userIdRef.current) return;

    setPublicMessages(prev => [...prev, message]);

    if (activeChatRef.current.isPrivate && message.userId !== userIdRef.current) {
      incrementUnreadCount('public');
      notificationService.showMessageNotification(message.userName, message.message, false);
    }
  }, [incrementUnreadCount]);

  const handlePrivateMessage = useCallback((message: IMessage) => {
    if (!message.roomId) return;
    if (message.clientMessageId && message.userId === userIdRef.current) return;

    setPrivateChats(prev => {
      const newChats = new Map(prev);
      const existing = newChats.get(message.roomId!) || [];
      newChats.set(message.roomId!, [...existing, message]);
      return newChats;
    });

    if (activeChatRef.current.id !== message.roomId && message.userId !== userIdRef.current) {
      incrementUnreadCount(message.roomId);
      notificationService.showMessageNotification(message.userName, message.message, true);
    }
  }, [incrementUnreadCount]);

  const handleConnection = useCallback((id: string) => {
    userIdRef.current = id;
    setUserId(id);
    setIsConnected(true);
    setIsLoading(false);
  }, []);

  const handleUsersList = useCallback((usersList: IUser[]) => {
    setUsers(usersList);
  }, []);

  const handlePrivateChatStarted = useCallback((data: { roomId: string; participant: IUser; messages: IMessage[] }) => {
    setPrivateChats(prev => {
      const newChats = new Map(prev);
      newChats.set(data.roomId, data.messages);
      return newChats;
    });

    const newContext: IChatContext = {
      id: data.roomId,
      name: data.participant.name,
      isPrivate: true,
      participantId: data.participant.id,
    };

    upsertPrivateChatContext(newContext);
    setActiveChat(newContext);
  }, [upsertPrivateChatContext]);

  const handlePrivateChatInvitation = useCallback((data: { roomId: string; participant: IUser; messages: IMessage[] }) => {
    chatService.joinPrivateChatRoom(data.roomId);

    setPrivateChats(prev => {
      const newChats = new Map(prev);
      newChats.set(data.roomId, data.messages);
      return newChats;
    });

    upsertPrivateChatContext({
      id: data.roomId,
      name: data.participant.name,
      isPrivate: true,
      participantId: data.participant.id,
      unreadCount: 1,
    });
  }, [upsertPrivateChatContext]);

  const handleUserTyping = useCallback((user: ITypingUser) => {
    setTypingUsers(prev => {
      const filtered = prev.filter(u => u.id !== user.id || u.roomId !== user.roomId);
      return [...filtered, user];
    });
  }, []);

  const handleUserStoppedTyping = useCallback((data: { userId: string; roomId?: string }) => {
    setTypingUsers(prev => prev.filter(u => !(u.id === data.userId && u.roomId === data.roomId)));
  }, []);

  const handleMessageAck = useCallback((ackData: { status: string; clientMessageId?: string }) => {
    const { status, clientMessageId } = ackData;
    if (!clientMessageId) return;

    const newStatus = status === 'ok' ? 'sent' as const : 'failed' as const;

    setPublicMessages(prev =>
      prev.map(m => m.clientMessageId === clientMessageId ? { ...m, status: newStatus } : m)
    );

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
  }, []);

  useEffect(() => {
    if (hasConnected.current || !userName) return;
    hasConnected.current = true;
    setIsLoading(true);

    chatService.onMessage(handleMessage);
    chatService.onPrivateMessage(handlePrivateMessage);
    chatService.onConnection(handleConnection);
    chatService.onUsersList(handleUsersList);
    chatService.onPrivateChatStarted(handlePrivateChatStarted);
    chatService.onPrivateChatInvitation(handlePrivateChatInvitation);
    chatService.onUserTyping(handleUserTyping);
    chatService.onUserStoppedTyping(handleUserStoppedTyping);
    chatService.onMessageAck(handleMessageAck);

    chatService.connect(userName).catch(() => {
      setIsLoading(false);
      setIsConnected(false);
    });

    return () => {
      chatService.disconnect();
    };
  }, [userName, handleMessage, handlePrivateMessage, handleConnection, handleUsersList,
      handlePrivateChatStarted, handlePrivateChatInvitation, handleUserTyping,
      handleUserStoppedTyping, handleMessageAck]);

  const sendMessage = useCallback((messageText: string) => {
    const trimmed = messageText.trim();
    if (!chatService.isConnected() || !trimmed || !userIdRef.current) return;

    const currentChat = activeChatRef.current;
    const clientMessageId = `${userIdRef.current}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const message: IMessage = {
      message: trimmed,
      timestamp: new Date(),
      userName,
      userId: userIdRef.current,
      roomId: currentChat.isPrivate ? currentChat.id : undefined,
      isPrivate: currentChat.isPrivate,
      clientMessageId,
      status: 'sending',
    };

    if (currentChat.isPrivate) {
      setPrivateChats(prev => {
        const newChats = new Map(prev);
        const existing = newChats.get(currentChat.id) || [];
        newChats.set(currentChat.id, [...existing, message]);
        return newChats;
      });
    } else {
      setPublicMessages(prev => [...prev, message]);
    }

    chatService.sendMessage(message);
  }, [userName]);

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
    if (context.unreadCount) {
      setChatContexts(prev =>
        prev.map(ctx => ctx.id === context.id ? { ...ctx, unreadCount: 0 } : ctx)
      );
    }
  }, []);

  const messages = useMemo((): IMessage[] => {
    if (activeChat.isPrivate) return privateChats.get(activeChat.id) || [];
    return publicMessages;
  }, [activeChat, privateChats, publicMessages]);

  const currentTypingUsers = useMemo((): ITypingUser[] => {
    if (activeChat.isPrivate) return typingUsers.filter(u => u.roomId === activeChat.id);
    return typingUsers.filter(u => !u.roomId);
  }, [activeChat, typingUsers]);

  return {
    messages,
    users,
    typingUsers: currentTypingUsers,
    sendMessage,
    startPrivateChat,
    handleTypingStart,
    handleTypingStop,
    isConnected,
    userId,
    isLoading,
    activeChat,
    chatContexts,
    switchToChat,
  };
};
