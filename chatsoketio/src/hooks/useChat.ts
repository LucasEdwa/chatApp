import { useState, useEffect, useRef } from 'react';
import { IMessage, IUser } from '../models/Interfaces';
import { chatService } from '../services/ChatService';

export const useChat = (userName: string) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasConnected = useRef(false);

  useEffect(() => {
    if (!hasConnected.current && userName) {
      hasConnected.current = true;
      setIsLoading(true);

      const handleMessage = (message: IMessage) => {
        setMessages(prev => [...prev, message]);
      };

      const handleConnection = (id: string) => {
        setUserId(id);
        setIsConnected(true);
        setIsLoading(false);
      };

      const handleUsersList = (usersList: IUser[]) => {
        setUsers(usersList);
      };

      chatService.onMessage(handleMessage);
      chatService.onConnection(handleConnection);
      chatService.onUsersList(handleUsersList);

      chatService.connect(userName).catch(() => {
        setIsLoading(false);
        setIsConnected(false);
      });

      return () => {
        chatService.disconnect();
      };
    }
  }, [userName]);

  const sendMessage = (messageText: string) => {
    if (!chatService.isConnected() || !messageText.trim() || !userId) return;

    const message: IMessage = {
      message: messageText.trim(),
      timestamp: new Date(),
      userName: userName,
      userId: userId
    };

    chatService.sendMessage(message);
  };

  return {
    messages,
    users,
    sendMessage,
    isConnected,
    userId,
    isLoading
  };
};
