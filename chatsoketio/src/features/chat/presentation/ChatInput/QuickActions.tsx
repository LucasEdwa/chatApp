import React from 'react';

interface QuickActionsProps {
  onEmojiClick?: () => void;
  onAttachmentClick?: () => void;
  onVoiceClick?: () => void;
  disabled?: boolean;
  showEmoji?: boolean;
  showAttachment?: boolean;
  showVoice?: boolean;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onEmojiClick,
  onAttachmentClick,
  onVoiceClick,
  disabled = false,
  showEmoji = true,
  showAttachment = false,
  showVoice = false,
  className = ''
}) => {
  const buttonClass = `
    p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95
    disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100
  `;

  const buttonStyle = {
    backgroundColor: 'var(--color-backgroundSecondary)',
    color: 'var(--color-textSecondary)'
  };

  if (!showEmoji && !showAttachment && !showVoice) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showEmoji && (
        <button
          type="button"
          onClick={onEmojiClick}
          disabled={disabled}
          className={buttonClass}
          style={buttonStyle}
          title="Add emoji"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {showAttachment && (
        <button
          type="button"
          onClick={onAttachmentClick}
          disabled={disabled}
          className={buttonClass}
          style={buttonStyle}
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
      )}

      {showVoice && (
        <button
          type="button"
          onClick={onVoiceClick}
          disabled={disabled}
          className={buttonClass}
          style={buttonStyle}
          title="Voice message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
    </div>
  );
};
