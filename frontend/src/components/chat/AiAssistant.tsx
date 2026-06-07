import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Loader2, Send, Sparkles, X } from '@icons/CookEduIcons'
import { useAuthStore } from '../../store/authStore'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'
import { useToastStore } from '../../store/toastStore'
import { chefAiApi, type ChefAiHistoryItem } from '../../lib/api'
import { getPreferredIdentityName } from '../../lib/supabaseClient'
import { buildLocalChefReply } from '../../lib/chefLocalBrain'

type Message = {
  id: string
  role: 'user' | 'model' | 'system'
  content: string
}

export default function AiAssistant() {
  const { user } = useAuthStore()
  const { isDesktop, shouldReduceMotion } = useDeviceProfile()
  const pushToast = useToastStore((state) => state.pushToast)
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const displayName = getPreferredIdentityName({
    username: user?.username,
    name: user?.name,
    email: user?.email,
  })

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chefAiHistory')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        localStorage.removeItem('chefAiHistory')
      }
    }

    return [{
      id: 'welcome',
      role: 'model',
      content: `Halo ${displayName}! CookEdu siap membantu resep, teknik masak, substitusi bahan, dan ide plating. Ada yang bisa Chef bantu?`,
    }]
  })

  useEffect(() => {
    localStorage.setItem('chefAiHistory', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-ai-chat', handleOpen)
    return () => window.removeEventListener('open-ai-chat', handleOpen)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })
  }, [messages, isOpen, shouldReduceMotion])

  const quickPrompts = [
    'Bantu ide menu dari telur dan nasi',
    'Ganti santan pakai bahan lain',
    'Bikin plating rumahan lebih cantik',
  ]

  const handleSend = async (nextPrompt?: string) => {
    const prompt = (nextPrompt || input).trim()
    if (!prompt || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: prompt }])
    setIsLoading(true)

    try {
      const history: ChefAiHistoryItem[] = messages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role,
          content: message.content,
        }))

      const response = await chefAiApi.chat({
        prompt,
        history,
        user_name: displayName,
      })

      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: response.data.reply || 'Maaf, Chef AI belum punya jawaban untuk pertanyaan itu.',
      }])
    } catch {
      const message = buildLocalChefReply(prompt, displayName)
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        content: message,
      }])
      pushToast({
        tone: 'warning',
        title: 'CookEdu Brain aktif',
        message: 'Jawaban dibuat dari mesin kuliner CookEdu tanpa menunggu API eksternal.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed z-[90] ${isDesktop ? 'bottom-6 right-8' : 'bottom-24 right-6'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            className="mb-4 flex h-[520px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-950">Chef AI</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">CookEdu Brain</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </header>

            <main className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-left text-sm font-semibold leading-6 ${
                    message.role === 'user'
                      ? 'bg-cyan-600 text-white'
                      : message.role === 'system'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-white text-slate-700 shadow-sm'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl bg-white px-4 py-3 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-700" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </main>

            <footer className="border-t border-slate-100 p-3">
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="h-9 shrink-0 rounded-full border border-cyan-100 bg-cyan-50 px-3 text-[11px] font-black text-cyan-800 transition hover:border-cyan-200 hover:bg-cyan-100 disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                  placeholder="Tanya resep atau teknik..."
                  className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        initial={shouldReduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-2xl"
        title="Buka Chef AI"
      >
        <Sparkles className="h-7 w-7" />
      </motion.button>
    </div>
  )
}
