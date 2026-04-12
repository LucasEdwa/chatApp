# Chat Feature

Core chat messaging functionality including public and private conversations.

## Structure

- **application/** - Use cases and hooks (`useChat`, `useMultiChat`)
- **domain/** - Interfaces and types (`IMessage`, `ITypingUser`, `IPrivateChatRoom`, `IChatContext`)
- **infrastructure/** - External services (`ChatService`, `NotificationService`)
- **presentation/** - UI components (`ChatHeader`, `ChatWindow`, `ChatInput`, `ChatMessage`, `ChatTabs`, `TypingIndicator`)
