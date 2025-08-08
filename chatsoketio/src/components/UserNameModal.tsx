import React, { useState, useEffect } from 'react';

interface UserNameModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
}

export const UserNameModal: React.FC<UserNameModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }
    
    onSubmit(trimmedName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat!</h2>
          <p className="text-gray-600">Enter your name to join the conversation</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Join Chat
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Your name will be visible to other users in the chat
        </p>
      </div>
    </div>
  );
};
