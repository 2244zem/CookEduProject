/**
 * Custom hook untuk mengakses AuthContext.
 * Memudahkan penggunaan auth di komponen manapun
 * tanpa harus import useContext + AuthContext.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
