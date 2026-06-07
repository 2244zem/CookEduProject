import { create } from 'zustand'

export type ToastTone = 'success' | 'warning' | 'error' | 'info'

export type CookEduToast = {
  id: string
  title: string
  message?: string
  tone: ToastTone
}

type ToastState = {
  toasts: CookEduToast[]
  pushToast: (toast: Omit<CookEduToast, 'id'>) => string
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }].slice(-4),
    }))
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
    }, toast.tone === 'error' ? 7000 : 4500)
    return id
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }))
  },
}))
