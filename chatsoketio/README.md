# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Chat Application - Clean Architecture

A modern, user-friendly real-time chat application built with React, TypeScript, and Socket.IO, following clean architecture principles.

## Features

- 🎨 **Modern UI**: Clean, responsive design with message bubbles and avatars
- 🔄 **Real-time messaging**: Instant message delivery using Socket.IO
- 👤 **User identification**: Customizable usernames with avatar generation
- 📱 **Responsive design**: Works seamlessly on desktop and mobile
- ⚡ **Performance optimized**: Efficient rendering and memory management
- 🏗️ **Clean Architecture**: Separation of concerns with services, hooks, and components

## Architecture Overview

This application follows clean architecture principles with clear separation of concerns:

### 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ChatHeader.tsx   # Chat room header with user info
│   ├── ChatWindow.tsx   # Message display area
│   ├── ChatInput.tsx    # Message input form
│   ├── ChatMessage.tsx  # Individual message component
│   ├── UserNameModal.tsx # User name input modal
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   ├── useChat.ts       # Chat functionality hook
│   └── index.ts         # Hook exports
├── services/            # Business logic layer
│   ├── ChatService.ts   # Socket.IO service
│   └── index.ts         # Service exports
├── models/              # Type definitions
│   └── Interfaces.ts    # Message and user interfaces
└── App.tsx             # Main application component
```

### 🔧 Architecture Layers

1. **Presentation Layer** (`components/`): React components responsible for UI rendering
2. **Application Layer** (`hooks/`): Custom hooks that manage state and business logic
3. **Domain Layer** (`models/`): TypeScript interfaces and types
4. **Infrastructure Layer** (`services/`): External integrations (Socket.IO)

## Components

### ChatHeader
- Displays chat room title and connection status
- Shows user avatar and name
- Real-time connection indicator

### ChatWindow
- Renders message history with smooth scrolling
- Handles loading states
- Empty state with welcoming message
- Optimized message rendering with keys

### ChatMessage
- Individual message bubble component
- Differentiates between own and other users' messages
- Shows timestamps and user avatars
- Handles system messages

### ChatInput
- Message composition with character limit
- Send button with loading states
- Keyboard shortcuts (Enter to send)
- Input validation

### UserNameModal
- Beautiful modal for name entry
- Input validation (length, characters)
- Prevents empty submissions

## Custom Hooks

### useChat
Manages all chat-related state and operations:
- Connection management
- Message handling
- User identification
- Loading states

## Services

### ChatService
Handles all Socket.IO operations:
- Connection establishment
- Message sending/receiving
- Event handling
- Cleanup on disconnect

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

1. Open the application in your browser
2. Enter your name in the welcome modal
3. Start chatting with other connected users
4. Enjoy real-time communication!

## Technical Highlights

- **TypeScript**: Full type safety throughout the application
- **React 18**: Modern React features with functional components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Socket.IO**: Reliable real-time bidirectional communication
- **Clean Architecture**: Maintainable and testable code structure
- **Performance**: Optimized rendering and memory management

## Future Enhancements

- 📁 File sharing
- 🎭 Emoji reactions
- 👥 User list sidebar
- 🔔 Message notifications
- 🎨 Theme customization
- 📊 Typing indicators

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
