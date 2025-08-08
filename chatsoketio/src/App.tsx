import { useState } from 'react';
import { useMultiChat } from './hooks';
import { ChatHeader, ChatWindow, ChatInput, UserNameModal, UsersList, ChatTabs } from './components';

function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(true);
  const [showUsersList, setShowUsersList] = useState(false);
  
  const { 
    messages, 
    users, 
    sendMessage, 
    startPrivateChat,
    isConnected, 
    userId, 
    isLoading,
    activeChat,
    chatContexts,
    switchToChat
  } = useMultiChat(userName || '');

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setShowNameModal(false);
  };

  const toggleUsersList = () => {
    setShowUsersList(!showUsersList);
  };

  const handleStartPrivateChat = (targetUserId: string) => {
    startPrivateChat(targetUserId);
    setShowUsersList(false); // Close users list after starting chat
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
            
            {/* Chat tabs for switching between conversations */}
            {chatContexts.length > 1 && (
              <ChatTabs
                chatContexts={chatContexts}
                activeChat={activeChat}
                onSwitchChat={switchToChat}
              />
            )}
            
            <ChatWindow 
              messages={messages} 
              currentUserId={userId} 
              isLoading={isLoading}
            />
            
            <ChatInput 
              onSendMessage={sendMessage} 
              disabled={!isConnected || isLoading}
              placeholder={isConnected 
                ? `Type your message to ${activeChat.name}...` 
                : "Connecting..."
              }
            />
          </div>

          {/* Users sidebar */}
          <UsersList
            users={users}
            currentUserId={userId}
            isVisible={showUsersList}
            onToggle={toggleUsersList}
            onStartPrivateChat={handleStartPrivateChat}
          />
        </>
      )}
    </div>
  );
}

export default App;