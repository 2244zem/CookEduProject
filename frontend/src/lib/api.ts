import axios from 'axios';
import { useDebugStore } from '../store/debugStore';
import { isSupabaseConfigured, supabase } from './supabaseClient';

let rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const legacyHostPattern = ['railway', 'app'].join('.');
if (String(rawBaseURL).toLowerCase().includes(legacyHostPattern)) {
  rawBaseURL = '/api-disabled';
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Performance Monitoring Interceptors
api.interceptors.request.use((config) => {
  // Inject auth token
  const token = localStorage.getItem('cookedu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Track start time
  (config as any).startTime = Date.now();
  return config;
});

api.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).startTime;
    const duration = Date.now() - startTime;
    
    // Log to Debug Store
    useDebugStore.getState().addLog({
      id: Math.random().toString(36).substr(2, 9),
      method: response.config.method?.toUpperCase() || 'GET',
      url: response.config.url || '',
      status: response.status,
      duration,
      timestamp: new Date().toLocaleTimeString(),
    });

    return response;
  },
  (error) => {
    const startTime = (error.config as any).startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    
    // Log error to Debug Store
    useDebugStore.getState().addLog({
      id: Math.random().toString(36).substr(2, 9),
      method: error.config?.method?.toUpperCase() || 'ERROR',
      url: error.config?.url || 'Unknown',
      status: error.response?.status || 0,
      duration,
      timestamp: new Date().toLocaleTimeString(),
      error: error.message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('cookedu_token');
      localStorage.removeItem('cookedu_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ===== Auth API =====
export const authApi = {
  register: (data: any) => api.post('/register', data),
  login: (data: { email: string; password: string }) => api.post('/login', data),
  profile: () => api.get('/profile'),
  updateProfile: (data: any) => {
    if (data instanceof FormData) {
      if (!data.has('_method')) data.append('_method', 'PUT');
      return api.post('/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put('/profile', data);
  },
  uploadAvatar: (avatar: File | Blob) => {
    const data = new FormData();
    data.append('avatar', avatar);
    return api.post('/profile/avatar', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  sendOTP: (email: string) => api.post('/password/otp', { email }),
  resetPassword: (data: any) => api.post('/password/reset', data),
  addXp: (amount: number) => api.post('/user/add-xp', { amount }),
  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    return { data: { status: 'success' } };
  },
};

type CoinCheckoutPayload = {
  package_id?: 'starter' | 'plus' | 'pro';
  user_id?: string | number;
  customer_name?: string;
  customer_email?: string;
}

async function getFunctionErrorMessage(error: unknown) {
  const functionError = error as { message?: string; context?: Response } | null;
  const context = functionError?.context;
  const status = context?.status || 0;

  if (context) {
    try {
      const payload = await context.clone().json();
      if (payload?.message) return String(payload.message);
      if (payload?.error) return String(payload.error);
      if (payload?.details) return String(payload.details);
    } catch {
      // Keep the original Supabase Functions message below.
    }
  }

  if (status === 401) return 'Sesi kamu sudah habis. Silakan login ulang.';
  if (status === 403) return 'Akses ditolak untuk fitur wallet ini.';
  if (status === 404) return 'Endpoint Supabase Function atau data yang diminta tidak ditemukan.';
  if (status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  if (status >= 500) return 'Supabase Edge Function gagal. Periksa deployment function dan secret yang dibutuhkan.';

  const message = functionError?.message || '';
  if (/failed to send a request to the edge function/i.test(message)) {
    return 'Supabase Edge Function belum bisa dijangkau. Pastikan function sudah dideploy, JWT aktif sesuai kebutuhan, dan koneksi perangkat stabil.';
  }

  return message || 'Supabase Function gagal dipanggil.';
}

type CoinAction =
  | 'qris-checkout'
  | 'bypass-success'
  | 'wallet-balance'
  | 'wallet-history'
  | 'claim-daily-reward'
  | 'spend-coins'
  | 'admin-search-users'
  | 'admin-give-coins'
  | 'admin-wallet-audit'

async function invokeCoinFunction<T>(action: CoinAction, payload: Record<string, unknown> = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi untuk pembayaran koin.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error('Sesi Supabase tidak ditemukan. Silakan login ulang.');
  }

  const { data, error } = await supabase.functions.invoke('coins', {
    body: { action, ...payload },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  return { data: data as T };
}

// ===== Coin / QRIS API (Supabase Edge Function) =====
export const coinApi = {
  qrisCheckout: (data: CoinCheckoutPayload) => invokeCoinFunction<{
    status: 'success';
    order_id: string;
    qris_image_url: string;
    coin_amount?: number;
    gross_amount?: number;
  }>('qris-checkout', data),
  bypassSuccess: (data: { order_id: string }) => invokeCoinFunction<{
    status: 'success';
    order_id: string;
    purchase_status: string;
    coins_added: number;
    coin_balance: number;
  }>('bypass-success', data),
  walletBalance: () => invokeCoinFunction<{
    status: 'success';
    coin_balance: number;
  }>('wallet-balance'),
  walletHistory: (data: { limit?: number } = {}) => invokeCoinFunction<{
    status: 'success';
    transactions: Array<{
      id: string;
      amount: number;
      transaction_type: string;
      description: string;
      reference_type?: string | null;
      reference_id?: string | null;
      metadata?: Record<string, unknown>;
      created_at: string;
    }>;
  }>('wallet-history', data),
  claimDailyReward: () => invokeCoinFunction<{
    status: 'success';
    claimed: boolean;
    coins_added: number;
    coin_balance: number;
    message: string;
  }>('claim-daily-reward'),
  spendCoins: (data: { spend_type: 'premium_recipe' | 'ai_boost' | 'badge'; reference_id?: string }) => invokeCoinFunction<{
    status: 'success';
    spend_type: string;
    coins_spent: number;
    coin_balance: number;
    message: string;
  }>('spend-coins', data),
  adminSearchUsers: (data: { query: string }) => invokeCoinFunction<{
    status: 'success';
    users: Array<{
      id: string;
      username?: string | null;
      email?: string | null;
      avatar_url?: string | null;
      role?: string | null;
      coin_balance: number;
    }>;
  }>('admin-search-users', data),
  adminGiveCoins: (data: { target_user_id: string; amount: number; reason: string }) => invokeCoinFunction<{
    status: 'success';
    target_user_id: string;
    coins_added: number;
    coin_balance: number;
    reference_id: string;
  }>('admin-give-coins', data),
  adminWalletAudit: (data: { limit?: number } = {}) => invokeCoinFunction<{
    status: 'success';
    logs: Array<{
      id: string;
      admin_user_id: string;
      admin_username?: string | null;
      target_user_id?: string | null;
      target_username?: string | null;
      target_email?: string | null;
      action: string;
      amount: number;
      reason: string;
      metadata?: Record<string, unknown>;
      created_at: string;
    }>;
  }>('admin-wallet-audit', data),
};

export type ChefAiHistoryItem = {
  role: 'user' | 'model' | 'system' | 'ai'
  content?: string
  text?: string
  parts?: Array<{ text: string }>
}

export async function invokeChefAi(payload: {
  prompt: string
  history?: ChefAiHistoryItem[]
  user_name?: string
}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi untuk Chef AI.')
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new Error('Sesi Supabase tidak ditemukan. Silakan login ulang.')
  }

  const { data, error } = await supabase.functions.invoke('chef-ai', {
    body: payload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  const result = data as { status?: string; reply?: string; response?: string; message?: string; model?: string }
  if (result.status === 'error') {
    throw new Error(result.message || 'Chef AI gagal memproses request.')
  }

  return {
    data: {
      ...result,
      reply: result.reply || result.response || '',
    },
  }
}

export const chefAiApi = {
  chat: invokeChefAi,
}

// ===== Recipe API =====
export const recipeApi = {
  list: (params?: any) => api.get('/recipes', { params }),
  show: (id: number) => api.get(`/recipes/${id}`),
  adminList: async () => {
    const { listSupabaseAdminRecipes } = await import('./supabaseData');
    return listSupabaseAdminRecipes();
  },
  create: async (_data?: any) => {
    throw new Error('Admin recipe create harus memakai Supabase recipes secara langsung.');
  },
  update: async (_id?: number | string, _data?: any) => {
    throw new Error('Admin recipe update harus memakai Supabase recipes secara langsung.');
  },
  delete: async (id: number | string) => {
    const { setSupabaseRecipePublished } = await import('./supabaseData');
    await setSupabaseRecipePublished(String(id), false);
    return { data: { status: 'success' } };
  },
  restore: async (id: number | string) => {
    const { setSupabaseRecipePublished } = await import('./supabaseData');
    await setSupabaseRecipePublished(String(id), true);
    return { data: { status: 'success' } };
  },
  moderate: async (id: number | string, status: string) => {
    const { setSupabaseRecipePublished } = await import('./supabaseData');
    await setSupabaseRecipePublished(String(id), status === 'approved');
    return { data: { status: 'success' } };
  },
};

// ===== Lesson API =====
export const lessonApi = {
  list: (params?: any) => api.get('/lessons', { params }),
  show: (id: number) => api.get(`/lessons/${id}`),
  submitQuiz: (lessonId: number, data: any) => api.post(`/lessons/${lessonId}/quiz`, data),
  progress: () => api.get('/learning/progress'),
  // Admin
  create: (data: any) => api.post('/admin/lessons', data),
  update: (id: number, data: any) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/lessons/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/admin/lessons/${id}`, data);
  },
  delete: (id: number) => api.delete(`/admin/lessons/${id}`),
};

// ===== Category API =====
export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/admin/categories', data),
  update: (id: number, data: any) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/categories/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/admin/categories/${id}`, data);
  },
  delete: (id: number) => api.delete(`/admin/categories/${id}`),
};

// ===== Dashboard API =====
export const dashboardApi = {
  stats: async () => {
    const { listSupabaseAdminRecipes } = await import('./supabaseData');
    const recipes = await listSupabaseAdminRecipes();
    const totalRecipes = recipes.data.data.length;
    return {
      data: {
        stats: {
          total_users: 0,
          total_recipes: totalRecipes,
          total_lessons: 0,
          quiz_completions: 0,
          new_users_this_month: 0,
        },
        user_growth: [
          { month: 'Jan', count: 0 },
          { month: 'Feb', count: 0 },
          { month: 'Mar', count: totalRecipes },
        ],
        recent_activity: [],
      },
    };
  },
};

// ===== Audit Log API =====
export const auditApi = {
  list: async (params?: { limit?: number }) => {
    const response = await coinApi.adminWalletAudit({ limit: params?.limit || 50 });
    return {
      data: {
        data: response.data.logs || [],
        last_page: 1,
        current_page: 1,
      },
    };
  },
};
