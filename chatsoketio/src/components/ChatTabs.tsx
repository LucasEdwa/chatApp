import React from 'react';
import { IChatContext } from '../models/Interfaces';

interface ChatTabsProps {
  chatContexts: IChatContext[];
  activeChat: IChatContext;
  onSwitchChat: (context: IChatContext) => void;
}

export const ChatTabs: React.FC<ChatTabsProps> = ({
  chatContexts,
  activeChat,
  onSwitchChat
}) => {
  return (
    <div 
      className="flex overflow-x-auto border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      {chatContexts.map((context) => (
        <button
          key={context.id}
          onClick={() => onSwitchChat(context)}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap flex items-center gap-2"
          style={{
            borderBottomColor: activeChat.id === context.id 
              ? 'var(--color-accent)' 
              : 'transparent',
            color: activeChat.id === context.id 
              ? 'var(--color-accent)' 
              : 'var(--color-textSecondary)',
            backgroundColor: activeChat.id === context.id 
              ? 'var(--color-background)' 
              : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (activeChat.id !== context.id) {
              e.currentTarget.style.color = 'var(--color-textPrimary)';
              e.currentTarget.style.backgroundColor = 'var(--color-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeChat.id !== context.id) {
              e.currentTarget.style.color = 'var(--color-textSecondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {context.isPrivate ? (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          ) : (
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            ></div>
          )}
          
          <span className="truncate max-w-32">
            {context.name}
          </span>
          
          {context.unreadCount && context.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center">
              {context.unreadCount > 99 ? '99+' : context.unreadCount}
            </span>
          )}
          
          {context.isPrivate && (
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-textMuted)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};
