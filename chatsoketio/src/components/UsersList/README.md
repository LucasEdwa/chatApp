# UsersList Component Architecture

This folder contains the refactored UsersList component broken down into smaller, more maintainable components following clean architecture principles.

## Component Structure

### Main Component
- **`UsersList.tsx`** (in parent folder) - Main container component that orchestrates all sub-components

### Sub-Components

#### UI Components
- **`UserCard.tsx`** - Individual user card with avatar, name, status, and interaction
- **`UserAvatar.tsx`** - Reusable avatar component with online status indicator
- **`SearchBar.tsx`** - Search input with icon and styling
- **`OnlineIndicator.tsx`** - Small online status dot component
- **`EmptyState.tsx`** - Empty state when no users found

#### Layout Components
- **`UsersListHeader.tsx`** - Header with title, user count, and close button
- **`UsersListFooter.tsx`** - Footer with user statistics and clear search button

#### Hooks/Logic
- **`useUserFiltering.ts`** - Custom hook for filtering and sorting users

## Benefits of This Architecture

### 🔧 **Maintainability**
- Each component has a single responsibility
- Easy to locate and modify specific features
- Clear separation of concerns

### 🧪 **Testability**
- Individual components can be tested in isolation
- Business logic separated into custom hooks
- Easier to mock dependencies

### 🔄 **Reusability**
- Components like `UserAvatar` and `OnlineIndicator` can be used elsewhere
- `SearchBar` can be reused for other search functionality
- Modular design allows for easy composition

### 📖 **Readability**
- Main component is much cleaner and easier to understand
- Each file focuses on one specific piece of functionality
- Clear naming conventions

### 🚀 **Scalability**
- Easy to add new features without bloating existing components
- New developers can quickly understand the structure
- Components can be enhanced independently

## Usage

```tsx
import { UsersList } from './components/UsersList';

// The main component works exactly the same as before
<UsersList
  users={users}
  currentUserId={currentUserId}
  isVisible={isVisible}
  onToggle={onToggle}
  onStartPrivateChat={onStartPrivateChat}
/>
```

## Individual Component Usage

```tsx
// Use individual components for custom layouts
import { UserAvatar, OnlineIndicator, SearchBar } from './components/UsersList';

<UserAvatar name="John Doe" size="large" isOnline={true} />
<OnlineIndicator isOnline={true} size="medium" />
<SearchBar searchTerm={term} onSearchChange={setTerm} />
```
