import { create } from 'zustand'

export interface ApiLog {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: string
  error?: string
}

interface DebugState {
  logs: ApiLog[]
  addLog: (log: ApiLog) => void
  clearLogs: () => void
}

export const useDebugStore = create<DebugState>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ 
    logs: [log, ...state.logs].slice(0, 50) // Keep last 50 logs
  })),
  clearLogs: () => set({ logs: [] }),
}))
