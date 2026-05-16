import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Send, ChefHat, Loader2, Sparkles, 
  Bot, AlertTriangle, Trash 
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { useDebugStore } from '../../store/debugStore'
import { useAuthStore } from '../../store/authStore'
import foodDrawing from '../../assets/food_drawing.jpg'
import telorImg from '../../assets/telor.png'

interface Message {
  id: string
  role: 'user' | 'model' | 'system'
  content: string
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { addLog } = useDebugStore()
  const { user } = useAuthStore()
  
  // Load history from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chefAiHistory')
    if (saved) return JSON.parse(saved)
    return [{ id: '1', role: 'model', content: `Halo${user?.name ? ' ' + user.name : ' Zem'}, ini progress belajar Kamu. Aku sudah perbarui modul dari palet biru! Kot rank Kot#1 dan Leaderboard sekarang sudah AKTIF dan BERFUNGSI SEMPURNA! 🍳` }]
  })
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('chefAiHistory', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-ai-chat', handleOpen)
    return () => window.removeEventListener('open-ai-chat', handleOpen)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleReportBug = () => {
    addLog({
      id: Math.random().toString(36).substr(2, 9),
      method: 'BUG',
      url: location.pathname,
      status: 500,
      duration: 0,
      timestamp: new Date().toLocaleTimeString(),
      error: 'User Reported Bug via AI Assistant'
    })
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Laporan bug telah dikirim ke Dashboard Admin. Terima kasih atas laporannya! 🐛' }])
  }

  const handleSend = async (retryMessage?: string) => {
    const userMessage = retryMessage || input.trim()
    if (!userMessage || isLoading) return
    
    if (!retryMessage) {
       setInput('')
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }])
    }
    
    setIsLoading(true)
    setIsRateLimited(false)

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))

      let attempt = 0;
      let success = false;
      let response;

      while (attempt < 3 && !success) {
        try {
          response = await api.post('/chef-ai', { prompt: userMessage, history });
          success = true;
        } catch (error: any) {
          if (error.response?.status === 429) {
            attempt++;
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      const reply = response?.data?.reply || "Maaf, dapur sedang sibuk."
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: reply }])

    } catch (error: any) {
      if (error.response?.status === 429) {
        setIsRateLimited(true)
        setLastFailedMessage(userMessage)
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Koneksi gagal: ${error.response?.status === 401 ? 'Harap Login terlebih dahulu.' : error.message}` }])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-24 md:bottom-10 right-6 z-[90] flex flex-col gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.button 
              initial={{ opacity: 0, scale: 0, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0, y: 20 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={handleReportBug}
              className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(244,63,94,0.4)] transition-all border border-white/20"
              title="Laporkan Bug ke Admin"
            >
              <AlertTriangle className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <div className="relative">
           {/* Concentric Ring Effect */}
           <div className="absolute inset-0 bg-[#0077B6]/30 rounded-full blur-md animate-ping" />
           <motion.button
             initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
             onClick={() => setIsOpen(!isOpen)}
             className={`w-20 h-20 bg-gradient-to-tr from-[#FFD166] to-[#F77F00] text-white rounded-full shadow-[0_0_40px_rgba(247,127,0,0.6)] flex items-center justify-center border-4 border-white/60 ring-4 ring-[#F77F00]/40 transition-all relative overflow-hidden group`}
           >
             {isLoading && (
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
               />
             )}
             <Sparkles className="absolute top-4 right-4 w-5 h-5 animate-pulse text-white drop-shadow-md" />
             {isOpen ? <X className="w-10 h-10 text-white drop-shadow-md" /> : (
               <div className="relative">
                 <motion.img 
                   src={telorImg} 
                   alt="Egg AI" 
                   animate={{ rotate: [-10, 10, -10], y: [0, -5, 0] }}
                   transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                   className="w-12 h-12 drop-shadow-2xl filter contrast-125"
                 />
               </div>
             )}
           </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, y: 100, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed bottom-40 md:bottom-32 right-4 md:right-8 z-[100] w-[calc(100vw-32px)] md:w-[450px] h-[650px] bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-[40px] rounded-[48px] shadow-[0_0_80px_rgba(0,119,182,0.3),inset_0_0_20px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden border-[3px] border-white/80 dark:border-white/20 ring-1 ring-[#0077B6]/20"
          >
            {/* Thinking Glow Aura */}
            {isLoading && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer z-[110]" 
               />
            )}

            <div className="bg-gradient-to-br from-primary via-primary-dark to-secondary p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center relative shadow-inner overflow-hidden border border-white/40">
                     {isLoading && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-white/30 rounded-2xl" 
                        />
                     )}
                     <img src={telorImg} alt="Egg" className="w-10 h-10 relative z-10 drop-shadow-md" />
                  </div>
                  <div>
                     <h3 className="font-black text-white text-xl tracking-tight leading-none mb-1.5">ChefAI Assistant</h3>
                     <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'} shadow-[0_0_10px_rgba(74,222,128,0.5)]`} />
                        <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">{isLoading ? 'Chef is cooking ideas...' : 'Ready to help'}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2 relative z-10">
                  <button onClick={() => {
                    setMessages([{ id: '1', role: 'model', content: `Halo${user?.name ? ' ' + user.name : ' Zem'}, ini progress belajar Kamu. Aku sudah perbarui modul dari palet biru! Kot rank Kot#1 dan Leaderboard sekarang sudah AKTIF dan BERFUNGSI SEMPURNA! 🍳` }])
                    localStorage.removeItem('chefAiHistory')
                  }} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all backdrop-blur-md" title="Hapus Obrolan">
                    <Trash className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition-all backdrop-blur-md">
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
               {/* Wallpaper Layer */}
               <div className="absolute inset-0 pointer-events-none z-0">
                  <img src={foodDrawing} alt="" className="w-full h-full object-cover opacity-10 grayscale-[50%]" />
                  <div className="absolute inset-0 bg-white/50 dark:bg-[#0A0A0A]/80 backdrop-blur-[2px]" />
               </div>

               <div className="relative z-10 p-6 space-y-6">
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD166] to-[#F77F00] rounded-full flex items-center justify-center shrink-0 mr-3 mt-auto shadow-[0_0_15px_rgba(247,127,0,0.4)] border-2 border-white">
                           <img src={telorImg} alt="Egg" className="w-6 h-6 drop-shadow-sm" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] p-4 md:p-5 rounded-[32px] shadow-sm relative group ${
                        msg.role === 'user' 
                          ? 'bg-[#03045E] text-[#f4ebd0] rounded-br-lg shadow-xl border border-white/10' 
                          : msg.role === 'system'
                          ? 'bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 font-mono rounded-2xl px-6'
                          : 'bg-[#f4ebd0] text-[#03045E] rounded-bl-lg shadow-xl border-2 border-[#e6d5c3]'
                      }`}>
                         {msg.role === 'model' && (
                           <div className="absolute -left-2 top-4 w-4 h-4 bg-white dark:bg-white/5 border-l border-t border-gray-100 dark:border-white/10 rotate-[-45deg] z-[-1]" />
                         )}
                         {msg.role === 'system' && <AlertTriangle className="w-3 h-3 inline mr-2 -mt-0.5" />}
                         <span className="text-[14px] leading-relaxed font-bold tracking-tight whitespace-pre-wrap block">{msg.content}</span>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                       <div className="w-10 h-10 bg-gradient-to-tr from-[#FFD166] to-[#F77F00] rounded-full flex items-center justify-center shrink-0 mr-3 mt-auto shadow-[0_0_15px_rgba(247,127,0,0.4)] border-2 border-white">
                          <motion.img animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} src={telorImg} alt="Egg" className="w-6 h-6 drop-shadow-sm" />
                       </div>
                       <div className="bg-[#f4ebd0] text-[#03045E] shadow-xl border-2 border-[#e6d5c3] rounded-[32px] rounded-bl-lg p-5 flex gap-1.5 items-center">
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 bg-[#03045E] rounded-full shadow-glow-sm" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-[#03045E] rounded-full shadow-glow-sm" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-[#03045E] rounded-full shadow-glow-sm" />
                       </div>
                    </div>
                  )}
                  {isRateLimited && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                         <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shrink-0 mr-3 mt-auto shadow-glow-sm">
                            <AlertTriangle className="w-5 h-5 text-white" />
                         </div>
                         <div className="bg-red-50 text-red-700 shadow-xl border-2 border-red-200 rounded-[32px] rounded-bl-lg p-5 flex flex-col gap-3 max-w-[85%]">
                            <p className="font-bold text-sm">Batas Harian AI Tercapai 🚦</p>
                            <p className="text-xs">Google Gemini membatasi 15 request per menit untuk versi gratis. Mohon tunggu sekitar 1 menit sebelum menekan tombol coba lagi.</p>
                            <button onClick={() => handleSend(lastFailedMessage)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors w-fit shadow-md active:scale-95">
                               Coba Lagi (Tunggu 1 Menit)
                            </button>
                         </div>
                      </motion.div>
                   )}
                   <div ref={messagesEndRef} />
               </div>
            </div>

            <div className="p-6 bg-transparent relative z-20">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-[#F77F00] rounded-[32px] blur-md opacity-30 group-focus-within:opacity-60 transition-opacity animate-shimmer" />
                  <div className="relative bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border-2 border-white/90 dark:border-white/20 rounded-[30px] p-2 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                     <input 
                       type="text" 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder="Ask Egg Chef anything..."
                       disabled={isLoading}
                       className="flex-1 bg-transparent border-none text-[15px] font-bold px-4 focus:outline-none text-text-primary placeholder:text-gray-400 disabled:opacity-50"
                     />
                     <motion.button 
                       whileHover={{ scale: 1.1, rotate: 10 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => handleSend()}
                       disabled={!input.trim() || isLoading}
                       className="w-12 h-12 bg-gradient-to-br from-[#0077B6] to-[#03045E] text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,119,182,0.5)] border-2 border-white/50"
                     >
                       {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                     </motion.button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
