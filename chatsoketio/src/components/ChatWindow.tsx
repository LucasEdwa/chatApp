import React, { useEffect, useRef } from 'react';
import { IMessage, ITypingUser } from '../models/Interfaces';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
  messages: IMessage[];
  typingUsers?: ITypingUser[];
  currentUserId: string | null;
  isLoading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  typingUsers = [],
  currentUserId, 
  isLoading = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  if (isLoading) {
    return (
      <div 
        className="flex-1 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--color-accent)' }}
          ></div>
          <p style={{ color: 'var(--color-textMuted)' }}>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chatWindowRef}
      className="flex-1 overflow-y-auto p-4 space-y-1"
      style={{ 
        backgroundColor: 'var(--color-background)',
        height: 'calc(100vh - 200px)' 
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div 
            className="text-center"
            style={{ color: 'var(--color-textMuted)' }}
          >
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
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator 
              typingUsers={typingUsers} 
              currentUserId={currentUserId} 
            />
          )}
          
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
