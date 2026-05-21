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
      if (!err.response) {
        setError('Server API tidak merespons. Backend Railway mungkin sedang down — cek https://cookeduproject-production.up.railway.app/up')
        return
      }
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

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs font-semibold">
                  <span className="px-3 bg-white/40 dark:bg-slate-900/40 text-gray-500 backdrop-blur-xl rounded-full">Atau masuk dengan</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href={`${import.meta.env.VITE_API_URL}/api/v1/auth/google/redirect`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 dark:text-white">Google</span>
                </a>

                <a
                  href={`${import.meta.env.VITE_API_URL}/api/v1/auth/facebook/redirect`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-[20px] shadow-sm transition-colors"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-semibold">Facebook</span>
                </a>
              </div>
            </div>

            <div className="mt-8 text-center">
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
