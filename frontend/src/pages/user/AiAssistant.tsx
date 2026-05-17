import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, ChevronLeft, Bot, User, 
  Sparkles, Coffee, Utensils, Zap,
  Bookmark, BookOpen, Snowflake, Globe, Moon
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

interface Message {
  id: string
  text: string
  sender: 'ai' | 'user'
  timestamp: Date
}

export default function AiAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Halo! Saya Chef Bot, asisten koki pintar CookEdu. Ingin memasak apa hari ini?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Mock AI Response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Itu pilihan yang bagus! Untuk resep tersebut, saya sarankan menggunakan api sedang agar matangnya merata. Apakah Anda ingin melihat daftar bahannya?",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const suggestions = [
    { label: "Resep Cepat", icon: Zap },
    { label: "Tips Sarapan", icon: Coffee },
    { label: "Bahan Pengganti", icon: Utensils }
  ]

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-hidden ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#E0F2FE] text-slate-900'
    }`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto h-screen flex flex-col">
        {/* HEADER */}
        <header className="px-6 pt-10 pb-6 flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-white/50">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/80 border border-white shadow-lg flex items-center justify-center text-slate-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-white shadow-xl">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight leading-none">Chef Bot</h2>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mt-1">Online & Ready</span>
              </div>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-inner"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </header>

        {/* MESSAGES AREA */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-[28px] shadow-xl relative overflow-hidden ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-white/90 backdrop-blur-3xl text-slate-800 border border-white rounded-tl-none'
                }`}>
                  {msg.sender === 'ai' && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Bot className="w-12 h-12" />
                    </div>
                  )}
                  <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                  <span className={`text-[8px] font-black uppercase mt-2 block opacity-50 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[28px] rounded-tl-none border border-white shadow-lg flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        {/* SUGGESTIONS */}
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputValue(s.label)}
              className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-white rounded-full text-[10px] font-black text-slate-600 shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <s.icon className="w-3.5 h-3.5 text-cyan-500" />
              {s.label}
            </motion.button>
          ))}
        </div>

        {/* INPUT AREA */}
        <footer className="p-6 pb-40">
          <div className="bg-white/80 backdrop-blur-3xl border-2 border-white rounded-[32px] p-2 flex items-center gap-2 shadow-2xl ring-1 ring-black/5">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanya Chef Bot apa saja..."
              className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-12 h-12 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
        </footer>

        {/* SHARED NAVIGATION */}
        <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-[40px] py-4 px-8 shadow-2xl flex items-center justify-between w-full max-w-sm ring-1 ring-black/5"
          >
            {[
              { id: "home", path: "/", icon: Bookmark },
              { id: "notes", path: "/catatan-ibu", icon: BookOpen },
              { id: "fridge", path: "/fridge", icon: Snowflake },
              { id: "shopping", path: "/daftar-belanja", icon: Globe },
              { id: "profile", path: "/profile", icon: User },
              { id: "theme", path: "#", icon: Moon }
            ].map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.id === "theme") setIsDarkMode(!isDarkMode)
                    else if (item.path !== "#") navigate(item.path)
                  }} 
                  className={`relative p-3 transition-all ${isActive ? "text-cyan-500" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110 shadow-glow-sm" : ""}`} />
                  {isActive && (
                    <motion.div 
                      layoutId="active-tab-nav"
                      className="absolute inset-0 bg-cyan-50 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        </nav>
      </div>
    </div>
  )
}
