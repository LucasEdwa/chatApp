import React from 'react';

interface OnlineUsersButtonProps {
  onlineCount: number;
  onClick: () => void;
  className?: string;
}

export const OnlineUsersButton: React.FC<OnlineUsersButtonProps> = ({
  onlineCount,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{
        backgroundColor: 'var(--color-accent)',
        color: 'var(--color-messageText)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      title="View online users"
    >
      <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{onlineCount}</span>
      <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
    </button>
  );
};
