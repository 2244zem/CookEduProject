import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] flex items-center justify-center p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-surface-card border border-red-500/20 rounded-[45px] p-10 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
            
            <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-8 animate-pulse">
               <Bug className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Oops! Sistem Terhenti.</h1>
            <p className="text-text-secondary font-bold mb-8 leading-relaxed">Terjadi kesalahan teknis yang tidak terduga. Jangan khawatir, tim "Bug Hunter" kami telah mendapatkan notifikasi.</p>

            <div className="bg-red-50 dark:bg-red-500/5 rounded-3xl p-6 mb-10 text-left overflow-hidden border border-red-100 dark:border-red-500/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Error Details</p>
               <code className="text-xs font-mono text-red-600 dark:text-red-400 break-all leading-relaxed">
                 {this.state.error?.toString()}
               </code>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => window.location.reload()}
                 className="flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-glow"
               >
                 <RotateCcw className="w-4 h-4" /> Reload App
               </button>
               <button 
                 onClick={() => window.location.href = '/'}
                 className="flex items-center justify-center gap-3 py-4 bg-gray-100 dark:bg-white/5 text-text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest"
               >
                 <Home className="w-4 h-4" /> Back Home
               </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
