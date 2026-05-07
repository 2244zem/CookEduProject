/**
 * Custom hook untuk mengakses ThemeContext.
 */
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme harus digunakan di dalam ThemeProvider');
  }
  return context;
}
