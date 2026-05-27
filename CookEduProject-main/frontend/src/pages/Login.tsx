import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ChefHat } from 'lucide-react'
import { motion } from 'framer-motion'
import bgHero from '../assets/background.png'
import bgPattern from '../assets/food_drawing.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      setAuth(data.user, data.token)
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Oops, sepertinya email atau kata sandi kurang tepat. Mari coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-surface transition-colors duration-500">
      {/* Drifting Clouds & Ethereal Background - Calmer Pacing */}
      <div className="absolute inset-0 z-0">
         <img src={bgHero} alt="" className="w-full h-full object-cover opacity-20 scale-125 animate-float-slow" />
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface/60 to-primary/5 dark:from-primary/10 dark:via-black/60 dark:to-primary/10" />
         
         {/* Animated Soft Clouds (Radial Gradients) - Slower for reduced anxiety */}
         <motion.div animate={{ x: [-50, 50], y: [-20, 20] }} transition={{ duration: 40, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-white/60 dark:bg-primary/5 blur-[120px] rounded-full" />
         <motion.div animate={{ x: [50, -50], y: [20, -20] }} transition={{ duration: 45, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      {/* Multi-Layered Sea Waves (Organic) */}
      <div className="relative h-[320px] md:h-[400px] w-full shrink-0 z-10 overflow-hidden pointer-events-none">
         {/* Wave Layer 1 (Deepest) */}
         <motion.div 
           animate={{ x: [-30, 0, -30] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 bg-primary/10 backdrop-blur-2xl"
           style={{ clipPath: 'ellipse(100% 60% at 50% 0%)' }}
         />
         
         {/* Wave Layer 2 (Middle) */}
         <motion.div 
           animate={{ x: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 bg-primary/20 backdrop-blur-3xl"
           style={{ clipPath: 'ellipse(120% 50% at 40% 0%)' }}
         />

         {/* Wave Layer 3 (Top/Front) */}
         <motion.div 
           className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/80 shadow-2xl"
           style={{ clipPath: 'ellipse(110% 45% at 50% 0%)' }}
         >
            <img src={bgPattern} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
         </motion.div>

         <div className="relative z-20 h-full flex flex-col items-center justify-center text-center p-6 mt-[-40px] pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-2xl rounded-[32px] flex items-center justify-center mb-6 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
               <ChefHat className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
               <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                  Cook<span className="text-white/60">Edu</span>
               </h1>
               <p className="text-white/80 font-black uppercase tracking-[0.4em] text-[10px] mt-3">Culinary Excellence Awaits</p>
            </motion.div>
         </div>
      </div>

      {/* Organic Floating Form Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.4, type: "spring", damping: 25 }}
        className="flex-1 flex flex-col items-center p-6 md:p-12 relative z-20 mt-[-60px]"
      >
         <div className="w-full max-w-md bg-white/40 dark:bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-white/60 dark:border-white/10 relative">
            {/* Soft Shadow Glow behind form */}
            <div className="absolute -inset-4 bg-primary/5 blur-3xl z-[-1] rounded-[60px]" />

            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Selamat Datang Kembali</h2>
               <p className="text-gray-500 text-sm mt-2 font-medium">Mari lanjutkan perjalanan kulinermu dengan santai</p>
            </div>

            {error && (
              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 p-4 bg-rose-50/80 border border-rose-100 text-rose-600 text-[13px] font-medium rounded-[20px] text-center shadow-sm">
                 {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 ml-5">Email</label>
                  <div className="relative group">
                     <div className="absolute inset-0 bg-primary/5 rounded-[24px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                     <input 
                       type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full relative z-10 bg-white/70 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-[24px] py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 shadow-sm"
                       placeholder="contoh@email.com" required
                     />
                     <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none z-20" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 ml-5">Kata Sandi</label>
                  <div className="relative group">
                     <div className="absolute inset-0 bg-primary/5 rounded-[24px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                     <input 
                       type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                       className="w-full relative z-10 bg-white/70 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-[24px] py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 shadow-sm"
                       placeholder="Masukkan kata sandi" required
                     />
                     <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none z-20">
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                  </div>
               </div>

               <button 
                 type="submit" disabled={loading}
                 className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-[24px] py-4 font-bold text-[14px] shadow-[0_10px_20px_rgba(0,180,216,0.2)] hover:shadow-[0_15px_30px_rgba(0,180,216,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] mt-8"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk ke Dapur'}
               </button>
            </form>

            <div className="mt-10 text-center">
               <p className="text-gray-500 font-medium text-sm">
                  Belum punya akun?{' '}
                  <Link to="/register" className="text-primary hover:text-primary-dark hover:underline font-semibold ml-1 transition-colors">Buat Akun Baru</Link>
               </p>
            </div>
         </div>
      </motion.div>
    </div>
  )
}
