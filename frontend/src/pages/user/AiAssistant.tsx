import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bot, ChefHat, Loader2, Send, Utensils, Zap } from 'lucide-react'
import { useAuthStore } from '../../store'
import { getPreferredIdentityName } from '../../lib/supabaseClient'

type Message = {
  id: string
  text: string
  sender: 'ai' | 'user'
}

export default function AiAssistantPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const displayName = getPreferredIdentityName({
    username: user?.username,
    name: user?.name,
    email: user?.email,
  })
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    sender: 'ai',
    text: `Halo ${displayName}! Tanya resep, teknik masak, substitusi bahan, atau langkah plating. Chef siap bantu dari satu layar yang bersih.`,
  }])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getChefResponse = (input: string) => {
    const query = input.toLowerCase()

    if (query.includes('substitusi') || query.includes('ganti') || query.includes('bahan')) {
      return 'Untuk substitusi bahan, cari fungsi utamanya dulu: lemak, cairan, asam, aroma, atau tekstur. Contoh: cooking cream bisa diganti susu cair plus sedikit butter; parmesan bisa diganti cheddar parut halus; kecap asin bisa diganti garam plus sedikit kaldu jamur.'
    }

    if (query.includes('langkah') || query.includes('pandu') || query.includes('cara')) {
      return 'Mulai dari mise en place: timbang bahan, potong seragam, panaskan alat, lalu masak dari bahan yang butuh waktu paling lama. Setelah matang, koreksi rasa di akhir agar garam dan asam tidak berlebihan.'
    }

    if (query.includes('plating')) {
      return 'Untuk plating cepat: pilih satu titik fokus, gunakan kontras warna, beri ruang kosong, lalu tambahkan tekstur renyah terakhir agar tidak lembek. Saus sebaiknya dituang tipis, bukan menenggelamkan bahan utama.'
    }

    return 'Pertanyaan bagus. Kirim nama bahan atau resep yang kamu pegang, nanti Chef bantu pecah menjadi bahan, langkah, risiko gagal, dan opsi pengganti yang masuk akal.'
  }

  const handleSend = (textToSend = inputValue) => {
    if (!textToSend.trim()) return
    const userMessage = { id: crypto.randomUUID(), text: textToSend.trim(), sender: 'user' as const }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: getChefResponse(textToSend), sender: 'ai' }])
      setIsTyping(false)
    }, 650)
  }

  const suggestions = [
    { label: 'Substitusi bahan', icon: Zap, query: 'substitusi bahan untuk cooking cream' },
    { label: 'Panduan langkah', icon: Utensils, query: 'pandu langkah memasak agar rapi' },
    { label: 'Ide plating', icon: ChefHat, query: 'tips plating makanan rumahan' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-4 py-5 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-950">Chef AI Sous-Chef</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Focused cooking assistant</p>
              </div>
            </div>
          </div>
        </header>

        <main className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Quick prompts</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Masak lebih rapi, tanpa distraksi.</h1>
            <div className="mt-6 space-y-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSend(suggestion.query)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <suggestion.icon className="h-5 w-5" />
                  {suggestion.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[82%] rounded-3xl px-5 py-4 text-left text-sm font-semibold leading-7 ${
                      message.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 shadow-sm'
                    }`}>
                      {message.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-3xl bg-white px-5 py-4 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-700" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSend()}
                  placeholder="Tulis pertanyaan dapur..."
                  className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                />
                <button
                  onClick={() => handleSend()}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-700"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
