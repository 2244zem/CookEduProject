/**
 * ============================================
 * Auth Context — State Management untuk Auth
 * ============================================
 * 
 * React Context yang menyimpan state autentikasi
 * secara global. Semua komponen bisa mengakses
 * user data dan fungsi login/logout tanpa prop drilling.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cek apakah ada token tersimpan saat app dimuat.
   * Jika ada, validasi token dengan memanggil /auth/me.
   * Ini memastikan user tetap login setelah refresh halaman.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch {
          // Token invalid/expired — hapus dan reset state
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login — kirim credentials ke API, simpan token,
   * dan update state user.
   */
  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  /**
   * Register — buat akun baru dan langsung login.
   */
  const register = useCallback(async (name, email, password) => {
    const response = await authAPI.register(name, email, password);
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  /**
   * Logout — tampilkan konfirmasi alert dulu,
   * hapus token dan redirect ke home.
   */
  const logout = useCallback(() => {
    const confirmed = window.confirm('Apakah kamu yakin ingin keluar dari MasakYuk?');
    if (confirmed) {
      localStorage.removeItem('auth_token');
      setUser(null);
      // Redirect ke halaman utama
      window.location.href = '/';
    }
  }, []);

  // Nilai yang di-expose ke seluruh komponen
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
