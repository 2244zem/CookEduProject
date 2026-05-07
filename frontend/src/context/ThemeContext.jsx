/**
 * ============================================
 * Theme Context — Dark/Light Mode Management
 * ============================================
 * 
 * Mengelola tema dark/light mode secara global.
 * Preference disimpan di localStorage dan 
 * di-apply via class 'dark' pada elemen <html>.
 */

import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Cek localStorage dulu, fallback ke system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply class 'dark' pada <html> saat theme berubah
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const value = { isDark, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
