import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi, resolveApiBaseUrl } from '../lib/api'
import { ChefHat, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import bgHero from '../assets/background.png'
import bgPattern from '../assets/food_drawing.jpg'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const update = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.phone) delete (payload as any).phone

      const { data } = await authApi.register(payload)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err: any) {
      console.error('Registration error:', err)
      if (!err.response) {
        setError('Server API tidak merespons. Backend Railway mungkin sedang down — cek https://cookeduproject-production.up.railway.app/up')
        return
      }
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Oops, sepertinya ada yang terlewat. Mari periksa lagi data kamu.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', type: 'text', icon: User, placeholder: 'Your Name' },
    { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'nama@email.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '08xxxxxxxxxx' },
  ]

  const OAUTH_URL = resolveApiBaseUrl();

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-surface transition-colors duration-500">
      <div className="absolute inset-0 z-0 bg-slate-50 dark:bg-slate-900">
         <img src={bgHero} alt="" className="w-full h-full object-cover opacity-10" />
      </div>

      <div className="relative h-[250px] md:h-[300px] w-full shrink-0 z-10 overflow-hidden pointer-events-none bg-primary">
         <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark">
            <img src={bgPattern} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
         </div>

         <div className="relative z-20 h-full flex flex-col items-center justify-center text-center p-6 pointer-events-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/40 shadow-sm">
               <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
               <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none drop-shadow-sm">Mulai Perjalananmu</h1>
               <p className="text-white/90 font-medium tracking-[0.1em] text-[12px] mt-2 drop-shadow-sm">TEMUKAN KEAJAIBAN DI SETIAP RESEP</p>
            </div>
         </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center p-6 md:p-8 relative z-20 mt-[-40px] pb-20">
         <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[24px] shadow-xl border border-gray-100 dark:border-white/10">
            {error && (
              <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[13px] font-medium rounded-xl text-center shadow-sm">
                 {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
                     <div key={key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 ml-1">{label}</label>
                        <div className="relative group">
                           <input 
                             type={type} value={(form as any)[key]} onChange={(e) => update(key, e.target.value)}
                             className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 shadow-sm text-sm"
                             placeholder={placeholder} required={key !== 'phone'}
                           />
                           <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        </div>
                     </div>
                  ))}

                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-gray-500 ml-1">Kata Sandi</label>
                     <div className="relative group">
                        <input 
                          type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 shadow-sm text-sm"
                          placeholder="Minimal 8 karakter" required
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none">
                           {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                     <label className="text-xs font-semibold text-gray-500 ml-1">Ulangi Kata Sandi</label>
                     <div className="relative group">
                        <input 
                          type="password" value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-gray-700 dark:text-white placeholder:text-gray-400 shadow-sm text-sm"
                          placeholder="Masukkan kembali kata sandi" required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                     </div>
                  </div>
               </div>

               <button 
                 type="submit" disabled={loading}
                 className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3.5 font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] mt-8"
               >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun Saya'}
               </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs font-semibold">
                  <span className="px-3 bg-white dark:bg-slate-800 text-gray-400">Atau daftar dengan</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href={`${OAUTH_URL}/auth/google/redirect`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
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
                  href={`${OAUTH_URL}/auth/facebook/redirect`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl shadow-sm transition-colors"
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
                  Sudah memiliki akses?{' '}
                  <Link to="/login" className="text-primary hover:text-primary-dark hover:underline font-semibold ml-1 transition-colors">Masuk di Sini</Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
