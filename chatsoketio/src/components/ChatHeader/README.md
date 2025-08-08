# ChatHeader Component Architecture

This folder contains the refactored ChatHeader component broken down into smaller, more maintainable components following clean architecture principles.

## Component Structure

### Main Component
- **`ChatHeader.tsx`** (in parent folder) - Main container component that orchestrates all sub-components

### Sub-Components

#### Atomic Components
- **`UserAvatar.tsx`** - Reusable avatar component with optional status indicator and multiple sizes
- **`ConnectionStatus.tsx`** - Connection status with animated indicator and online count
- **`RoomTitle.tsx`** - Customizable room title with emoji support
- **`OnlineUsersButton.tsx`** - Interactive button to view online users with count
- **`UserInfo.tsx`** - User information display with greeting and optional avatar
- **`HeaderGradient.tsx`** - Decorative gradient line at bottom of header

#### Layout Components
- **`LeftSection.tsx`** - Left section combining avatar, title, and connection status
- **`RightSection.tsx`** - Right section with controls (users button, theme toggle, user info)

## Benefits of This Architecture

### 🔧 **Maintainability**
- Each component has a single responsibility
- Easy to locate and modify specific features
- Clear separation of UI concerns

### 🧪 **Testability**
- Individual components can be tested in isolation
- Props-based configuration makes testing predictable
- No complex internal state to mock

### 🔄 **Reusability**
- `UserAvatar` can be used throughout the app with different sizes
- `ConnectionStatus` can show connection state anywhere
- `RoomTitle` can be customized for different room types

### 📖 **Readability**
- Main component is now only 43 lines vs 159 lines
- Each file focuses on one specific piece of functionality
- Clear component hierarchy and data flow

### 🚀 **Scalability**
- Easy to add new controls without bloating existing components
- Components can be enhanced independently
- Consistent patterns for future development

## Usage

### Main Component (unchanged API)
```tsx
import { ChatHeader } from './components/ChatHeader';

<ChatHeader
  userName="John Doe"
  isConnected={true}
  onlineCount={5}
  onToggleUsers={() => setShowUsers(!showUsers)}
/>
```

### Individual Components
```tsx
import { 
  UserAvatar, 
  ConnectionStatus, 
  RoomTitle,
  OnlineUsersButton 
} from './components/ChatHeader';

// Reusable avatar with different sizes and status
<UserAvatar userName="John" size="large" showStatus={true} isConnected={true} />
<UserAvatar userName="Jane" size="small" />

// Connection status in other contexts
<ConnectionStatus isConnected={true} onlineCount={3} />

// Customizable room title
<RoomTitle title="Support Chat" emoji="🎧" />

// Online users button
<OnlineUsersButton onlineCount={5} onClick={handleToggle} />
```

## Component Props

### UserAvatar
- `userName: string` - User name for initials
- `size?: 'small' | 'medium' | 'large'` - Avatar size
- `showStatus?: boolean` - Show online status indicator
- `isConnected?: boolean` - Connection status for indicator
- `className?: string` - Additional CSS classes

### ConnectionStatus
- `isConnected: boolean` - Connection state
- `onlineCount?: number` - Number of online users
- `showCount?: boolean` - Whether to display the count

### RoomTitle
- `title?: string` - Room title (default: "Chat Room")
- `emoji?: string` - Title emoji (default: "💬")
- `className?: string` - Additional CSS classes

### OnlineUsersButton
- `onlineCount: number` - Number of online users
- `onClick: () => void` - Click handler
- `className?: string` - Additional CSS classes

### UserInfo
- `userName: string` - User name to display
- `greeting?: string` - Greeting text (default: "Welcome back")
- `showAvatar?: boolean` - Show small avatar (default: true)
- `className?: string` - Additional CSS classes

## File Size Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Main file | 159 lines | 43 lines |
| Components | 1 monolithic | 8 focused components |
| Reusability | Low | High |
| Testability | Hard | Easy |
| Maintainability | Complex | Simple |
