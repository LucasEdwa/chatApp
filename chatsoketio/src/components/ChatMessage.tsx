import React from 'react';
import { IMessage } from '../models/Interfaces';

interface ChatMessageProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm italic">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          <div className="break-words">{message.message}</div>
        </div>
        <div className={`flex items-center mt-1 gap-2 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {!isOwnMessage && (
            <span className="font-medium text-gray-600">
              {message.userName}
            </span>
          )}
        </div>
      </div>
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold mr-3 order-1 flex-shrink-0">
          {message.userName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
