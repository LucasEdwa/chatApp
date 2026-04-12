// Presentation
export { ChatHeader } from './presentation/ChatHeader';
export { ChatWindow } from './presentation/ChatWindow';
export { ChatInput } from './presentation/ChatInput';
export { ChatMessage } from './presentation/ChatMessage';
export { ChatTabs } from './presentation/ChatTabs';
export { TypingIndicator } from './presentation/TypingIndicator';

// Application
export { useChat } from './application/useChat';
export { useMultiChat } from './application/useMultiChat';

// Infrastructure
export { ChatService, chatService } from './infrastructure/ChatService';
export { NotificationService, notificationService } from './infrastructure/NotificationService';

// Domain
export type { IMessage, ITypingUser, IPrivateChatRoom, IChatContext } from './domain/Interfaces';
