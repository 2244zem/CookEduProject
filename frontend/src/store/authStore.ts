import { create } from 'zustand';
import { getProfileForSession, getSupabaseUserName, isSupabaseConfigured, supabase } from '../lib/supabaseClient';

interface User {
  id: number | string;
  name: string;
  username?: string;
  email: string;
  role: 'admin' | 'user' | 'premium';
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
  hydrateSupabaseSession: () => Promise<void>;
}

function normalizeUser(user: Partial<User>): User {
  const displayName = user.name || user.username || user.email?.split('@')[0] || 'Koki CookEdu';

  return {
    id: user.id || '',
    name: displayName,
    username: user.username || displayName,
    email: user.email || '',
    role: (user.role as User['role']) || 'user',
    phone: user.phone,
    avatar: user.avatar,
    avatar_url: user.avatar_url || user.avatar,
    xp: user.xp || 0,
    preferences: user.preferences,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('cookedu_user') || 'null'),
  token: localStorage.getItem('cookedu_token'),
  isAuthenticated: !!localStorage.getItem('cookedu_token'),
  isAdmin: JSON.parse(localStorage.getItem('cookedu_user') || '{}')?.role === 'admin',

  setAuth: (user, token) => {
    const normalized = normalizeUser(user);
    localStorage.setItem('cookedu_token', token);
    localStorage.setItem('cookedu_user', JSON.stringify(normalized));
    set({
      user: normalized,
      token,
      isAuthenticated: true,
      isAdmin: normalized.role === 'admin',
    });
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
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
      const updated = normalizeUser({ ...current, ...userData });
      localStorage.setItem('cookedu_user', JSON.stringify(updated));
      set({ user: updated, isAdmin: updated.role === 'admin' });
    }
  },

  hydrateSupabaseSession: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user) return;

    const profile = await getProfileForSession(session);
    const normalized = normalizeUser({
      id: session.user.id,
      name: getSupabaseUserName(session.user, profile),
      username: profile?.username || session.user.user_metadata?.username,
      email: session.user.email || '',
      role: profile?.role || 'user',
      avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
    });

    localStorage.setItem('cookedu_token', session.access_token);
    localStorage.setItem('cookedu_user', JSON.stringify(normalized));
    set({
      user: normalized,
      token: session.access_token,
      isAuthenticated: true,
      isAdmin: normalized.role === 'admin',
    });
  },
}));
