import React, { useEffect, useRef } from 'react';
import { IMessage } from '../models/Interfaces';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  messages: IMessage[];
  currentUserId: string | null;
  isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  currentUserId, 
  isLoading = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatWindowRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-1"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg mb-2">Welcome to the chat!</p>
            <p className="text-sm">Start a conversation by sending a message below.</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.userId}-${message.timestamp}-${index}`}
              message={message}
              isOwnMessage={message.userId === currentUserId}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
