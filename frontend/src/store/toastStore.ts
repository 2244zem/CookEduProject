import { create } from 'zustand';

export interface ToastRecoveryAction {
  label: string;
  action_url?: string;
  action_type?: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  recovery_action?: ToastRecoveryAction;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, recovery_action?: ToastRecoveryAction, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  success: (message, duration) => {
    get().addToast({ type: 'success', message, duration });
  },
  error: (message, recovery_action, duration) => {
    get().addToast({ type: 'error', message, recovery_action, duration });
  },
  info: (message, duration) => {
    get().addToast({ type: 'info', message, duration });
  },
  warning: (message, duration) => {
    get().addToast({ type: 'warning', message, duration });
  },
}));
