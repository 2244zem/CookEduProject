import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from '@icons/CookEduIcons'
import { useToastStore, type ToastTone } from '../../store/toastStore'

const toneStyle: Record<ToastTone, {
  icon: typeof CheckCircle2
  className: string
}> = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  },
  error: {
    icon: AlertCircle,
    className: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  info: {
    icon: Info,
    className: 'border-cyan-200 bg-cyan-50 text-cyan-900',
  },
}

export default function ToastViewport() {
  const { toasts, dismissToast } = useToastStore()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[2000] mx-auto flex w-full max-w-md flex-col gap-3 px-4 sm:left-auto sm:right-4 sm:mx-0">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = toneStyle[toast.tone]
          const Icon = tone.icon

          return (
            <motion.article
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-[22px] border p-4 shadow-xl shadow-slate-950/10 backdrop-blur-xl ${tone.className}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-black leading-5">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-xs font-semibold leading-5 opacity-80">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-xl p-1 opacity-60 transition hover:bg-white/50 hover:opacity-100"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.article>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
