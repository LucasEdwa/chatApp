import { FormEvent, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { IMessage } from './models/Interfaces';

function App() {
  const socketRef = useRef<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [name] = useState(() => prompt('What is your name?') || 'Anonymous');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const newSocket = io('http://localhost:3000');
      socketRef.current = newSocket;

      // Emit user-connected event when socket is ready
      newSocket.emit('user-connected', name);

      // Set the userId when the socket connects
      newSocket.on('connect', () => {
        if (newSocket.id) {
          setUserId(newSocket.id);
        }
      });

      // Listen for regular chat messages
      newSocket.on('chat-message', (data: IMessage) => {
        console.log('Received chat message:', data);
        setMessages(prevMessages => [...prevMessages, {
          ...data,
          timestamp: new Date(data.timestamp)
        }]);
      });

      // Listen for user joined event
      newSocket.on('user-joined', (data: IMessage) => {
        console.log('User joined:', data);
        setMessages(prevMessages => [...prevMessages, {
          ...data,
          timestamp: new Date(data.timestamp)
        }]);
      });

      // Listen for user left event
      newSocket.on('user-left', (data: IMessage) => {
        console.log('User left:', data);
        setMessages(prevMessages => [...prevMessages, {
          ...data,
          timestamp: new Date(data.timestamp)
        }]);
      });

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [name]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!socketRef.current || !message.trim()) return;

    const msg: IMessage = {
      message: message.trim(),
      timestamp: new Date(),
      userName: name,
      userId: socketRef.current.id
    };
    socketRef.current.emit('send-chat-message', msg);
    setMessage('');
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600">Chat Channel</h1>
        <p className="text-gray-600">Welcome, {name}!</p>
      </header>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
        <div className="chat-box h-[500px] overflow-y-auto border rounded-lg p-4 mb-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-3 p-2 rounded ${
                msg.isSystemMessage 
                  ? 'bg-gray-100 text-center w-full' 
                  : msg.userId === userId
                    ? 'bg-blue-100 ml-auto max-w-[80%]' 
                    : 'bg-gray-100 max-w-[80%]'
              }`}
            >
              {!msg.isSystemMessage ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-semibold">
                      {msg.userId === userId ? 'You' : msg.userName}
                    </span>
                  </div>
                  <p className="mt-1">{msg.message}</p>
                </>
              ) : (
                <p className="text-gray-500 italic">{msg.message}</p>
              )}
            </div>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="off"
          />
          <button 
            type='submit'
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!socketRef.current || !message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;