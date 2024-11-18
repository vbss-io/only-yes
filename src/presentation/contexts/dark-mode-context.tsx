import { createContext, useEffect, useState } from 'react';

import { darkTheme, theme as defaultTheme } from '@/presentation/config/stitches.config';

export const DarkModeContext = createContext({} as {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
});

interface DarkModeProviderProps {
  children: React.ReactNode;
}

const getModeFromLocalStorage = () => {
  const isDark = localStorage.getItem('darkMode');
  return isDark ? JSON.parse(isDark) : false;
}

const saveModeToLocalStorage = (isDark: boolean) => {
  localStorage.setItem('darkMode', JSON.stringify(isDark));
}

export const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
  const [darkMode, setDarkMode] = useState(getModeFromLocalStorage());
  const html = document.documentElement;
  
  useEffect(() => {
    const applyDarkMode = (isDark: boolean) => {
      html.classList.remove(isDark ? defaultTheme : darkTheme);
      html.classList.add(isDark ? darkTheme : defaultTheme);
      saveModeToLocalStorage(isDark);
    };

    applyDarkMode(darkMode);
  }, [darkMode, html.classList])

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
