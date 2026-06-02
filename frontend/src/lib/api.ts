import axios from 'axios';
import { useDebugStore } from '../store/debugStore';
import { isSupabaseConfigured, supabase } from './supabaseClient';

// Auto-correcting Base URL: automatically prepends https:// if omitted by user
let rawBaseURL = import.meta.env.VITE_API_URL || '/api';
if (rawBaseURL && !rawBaseURL.startsWith('http://') && !rawBaseURL.startsWith('https://') && rawBaseURL.includes('railway.app')) {
  rawBaseURL = 'https://' + rawBaseURL;
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
  logout: () => api.post('/logout'),
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

  if (context) {
    try {
      const payload = await context.clone().json();
      if (payload?.message) return String(payload.message);
    } catch {
      // Keep the original Supabase Functions message below.
    }
  }

  return functionError?.message || 'Supabase Function gagal dipanggil.';
}

async function invokeCoinFunction<T>(action: 'qris-checkout' | 'bypass-success' | 'wallet-balance', payload: Record<string, unknown> = {}) {
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

// ===== Coin / QRIS API (Supabase Edge Function, not Railway) =====
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
};

// ===== Recipe API =====
export const recipeApi = {
  list: (params?: any) => api.get('/recipes', { params }),
  show: (id: number) => api.get(`/recipes/${id}`),
  // Admin
  adminList: (params?: any) => api.get('/admin/recipes', { params }),
  create: (data: any) => api.post('/admin/recipes', data),
  update: (id: number, data: any) => {
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/recipes/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/admin/recipes/${id}`, data);
  },
  delete: (id: number) => api.delete(`/admin/recipes/${id}`),
  restore: (id: number) => api.post(`/admin/recipes/${id}/restore`),
  moderate: (id: number, status: string) => api.patch(`/admin/recipes/${id}/moderate`, { status }),
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
  stats: () => api.get('/admin/dashboard'),
};

// ===== Audit Log API =====
export const auditApi = {
  list: (params?: any) => api.get('/admin/audit-logs', { params }),
};
