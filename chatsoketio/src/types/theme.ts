export interface ITheme {
  id: string;
  name: string;
  colors: {
    // Main backgrounds
    background: string;
    surface: string;
    primary: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Accent color
    accent: string;
    
    // Message colors
    messageSent: string;
    messageReceived: string;
    messageText: string;
    
    // Borders
    border: string;
    
    // Status
    online: string;
    error: string;
  };
}

export type ThemeMode = 'light' | 'dark';
