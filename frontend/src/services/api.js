/**
 * ============================================
 * API Service Layer — Axios Instance & Endpoints
 * ============================================
 * 
 * Sentralisasi semua HTTP calls ke backend Node.js.
 * Interceptor otomatis menambahkan JWT token
 * ke setiap request yang membutuhkan auth.
 */

import axios from 'axios';

// Base URL backend Node.js
const API_BASE = 'http://localhost:8000/api';

// Buat Axios instance dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Otomatis menambahkan JWT token dari localStorage
 * ke header Authorization setiap request.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor
 * Handle error global — redirect ke login jika token expired (401).
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect ke login jika bukan di halaman login/register
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { message: 'Terjadi kesalahan jaringan' });
  }
);

// -----------------------------------------------
// Auth API
// -----------------------------------------------
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  getProfile: () =>
    api.get('/auth/me'),
};

// -----------------------------------------------
// Recipe API
// -----------------------------------------------
export const recipeAPI = {
  getAll: (params = {}) =>
    api.get('/recipes', { params }),

  getBySlug: (slug) =>
    api.get(`/recipes/${slug}`),

  create: (data) =>
    api.post('/recipes', data),

  update: (id, data) =>
    api.put(`/recipes/${id}`, data),

  delete: (id) =>
    api.delete(`/recipes/${id}`),
};

// -----------------------------------------------
// Category API
// -----------------------------------------------
export const categoryAPI = {
  getAll: () =>
    api.get('/categories'),

  create: (data) =>
    api.post('/categories', data),

  update: (id, data) =>
    api.put(`/categories/${id}`, data),

  delete: (id) =>
    api.delete(`/categories/${id}`),
};

// -----------------------------------------------
// Todo API
// -----------------------------------------------
export const todoAPI = {
  getAll: () =>
    api.get('/todos'),

  create: (data) =>
    api.post('/todos', data),

  toggleItem: (itemId) =>
    api.patch(`/todos/items/${itemId}`),

  delete: (id) =>
    api.delete(`/todos/${id}`),
};

// -----------------------------------------------
// Stats API (Admin Dashboard)
// -----------------------------------------------
export const statsAPI = {
  get: () =>
    api.get('/stats'),
};

// -----------------------------------------------
// Notification API
// -----------------------------------------------
export const notificationAPI = {
  getAll: () =>
    api.get('/notifications'),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
};

export default api;
