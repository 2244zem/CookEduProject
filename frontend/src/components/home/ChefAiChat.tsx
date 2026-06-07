import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Send } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

interface Message {
  id: string
  type: 'user' | 'ai'
  text: string
  timestamp: Date
  error?: boolean
}

export default function ChefAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: 'Halo! Chef AI sedang dipindahkan ke Supabase Edge Function agar tidak memakai backend lama.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pushToast = useToastStore((state) => state.pushToast)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return

    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    }])
    setInput('')
    setIsLoading(true)

    window.setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        type: 'ai',
        text: 'Chef AI belum aktif di Supabase. Endpoint lama sudah dimatikan supaya web tidak memanggil backend legacy. Aktifkan Edge Function AI baru untuk menghidupkan fitur ini lagi.',
        timestamp: new Date(),
        error: true,
      }])
      setRetryMessage(messageText)
      setIsLoading(false)
      pushToast({
        tone: 'warning',
        title: 'Chef AI belum aktif',
        message: 'Tidak ada request ke backend lama. Siapkan Supabase Edge Function AI untuk mengaktifkan chat.',
      })
    }, 250)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-xl"
    >
      <div className="bg-gradient-to-r from-[#2A4D88] to-[#7C94B8] p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Chef AI Assistant</h2>
            <p className="text-xs text-white/75">Menunggu Supabase Edge Function</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs rounded-2xl p-3 text-sm font-medium leading-relaxed shadow-sm ${
                  msg.type === 'user'
                    ? 'rounded-br-none bg-[#2A4D88] text-white'
                    : msg.error
                      ? 'rounded-bl-none border border-yellow-200 bg-yellow-50 text-yellow-900'
                      : 'rounded-bl-none bg-white text-slate-800'
                }`}
              >
                <p>{msg.text}</p>
                <p className="mt-1 text-xs opacity-60">
                  {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 rounded-2xl rounded-bl-none bg-white p-3 shadow-sm">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#2A4D88]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#2A4D88]" style={{ animationDelay: '0.2s' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#2A4D88]" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {retryMessage && (
        <div className="border-t border-yellow-200 bg-yellow-50 p-3">
          <button
            onClick={() => handleSendMessage(retryMessage)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-2 text-sm font-semibold text-white transition hover:bg-yellow-600"
          >
            <RotateCcw className="h-4 w-4" />
            Tampilkan Info Lagi
          </button>
        </div>
      )}

      <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
          placeholder="Chef AI belum aktif..."
          disabled={isLoading}
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7C94B8]"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="rounded-full bg-[#2A4D88] p-3 text-white shadow-md transition hover:bg-[#1f3f73] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}
