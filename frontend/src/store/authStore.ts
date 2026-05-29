import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  xp?: number;
  preferences?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('cookedu_user') || 'null'),
  token: localStorage.getItem('cookedu_token'),
  isAuthenticated: !!localStorage.getItem('cookedu_token'),
  isAdmin: JSON.parse(localStorage.getItem('cookedu_user') || '{}')?.role === 'admin',

  setAuth: (user, token) => {
    localStorage.setItem('cookedu_token', token);
    localStorage.setItem('cookedu_user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
    });
  },

  logout: () => {
    localStorage.removeItem('cookedu_token');
    localStorage.removeItem('cookedu_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  updateUser: (userData) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem('cookedu_user', JSON.stringify(updated));
      set({ user: updated, isAdmin: updated.role === 'admin' });
    }
  },
}));
