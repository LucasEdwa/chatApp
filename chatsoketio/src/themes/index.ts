import { ITheme } from '../types/theme';

export const lightTheme: ITheme = {
  id: 'light',
  name: 'Light',
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    primary: '#ffffff',
    
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    
    accent: '#3b82f6',
    
    messageSent: '#3b82f6',
    messageReceived: '#f1f5f9',
    messageText: '#ffffff',
    
    border: '#e2e8f0',
    
    online: '#10b981',
    error: '#ef4444',
  }
};

export const darkTheme: ITheme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    primary: '#334155',
    
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    accent: '#60a5fa',
    
    messageSent: '#60a5fa',
    messageReceived: '#374151',
    messageText: '#f1f5f9',
    
    border: '#475569',
    
    online: '#34d399',
    error: '#f87171',
  }
};
