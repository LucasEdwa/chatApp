import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ITheme, ThemeMode } from '../types/theme';
import { lightTheme, darkTheme } from '../themes';

interface ThemeContextType {
  theme: ITheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'light';
  });

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
    
    // Update body class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${mode}`);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: handleSetMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
