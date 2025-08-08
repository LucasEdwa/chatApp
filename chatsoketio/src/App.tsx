import { useState } from 'react';
import { useChat } from './hooks';
import { ChatHeader, ChatWindow, ChatInput, UserNameModal, UsersList } from './components';

function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(true);
  const [showUsersList, setShowUsersList] = useState(false);
  
  const { messages, users, sendMessage, isConnected, userId, isLoading } = useChat(userName || '');

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setShowNameModal(false);
  };

  const toggleUsersList = () => {
    setShowUsersList(!showUsersList);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      <UserNameModal 
        isOpen={showNameModal} 
        onSubmit={handleNameSubmit} 
      />
      
      {userName && (
        <>
          {/* Main chat area */}
          <div className="flex-1 flex flex-col">
            <ChatHeader 
              userName={userName} 
              isConnected={isConnected}
              onlineCount={users.length}
              onToggleUsers={toggleUsersList}
            />
            
            <ChatWindow 
              messages={messages} 
              currentUserId={userId} 
              isLoading={isLoading}
            />
            
            <ChatInput 
              onSendMessage={sendMessage} 
              disabled={!isConnected || isLoading}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
            />
          </div>

          {/* Users sidebar */}
          <UsersList
            users={users}
            currentUserId={userId}
            isVisible={showUsersList}
            onToggle={toggleUsersList}
          />
        </>
      )}
    </div>
  );
}

export default App;