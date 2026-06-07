import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import { getSupabaseAuthMessage, getSupabaseUserName, isSupabaseConfigured, supabase, upsertProfileForUser } from '../lib/supabaseClient'
import { Mail, Eye, EyeOff, Loader2, ChefHat } from '@icons/CookEduIcons'
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

  useEffect(() => {
    const notice = sessionStorage.getItem('cookedu_auth_notice')
    if (notice) {
      setError(notice)
      sessionStorage.removeItem('cookedu_auth_notice')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (!data.session?.user) throw new Error('Supabase belum mengembalikan sesi. Coba login ulang.')

        const profile = await upsertProfileForUser(data.session.user)
        const displayName = getSupabaseUserName(data.session.user, profile)
        const user = {
          id: data.session.user.id,
          name: displayName,
          username: displayName,
          email: data.session.user.email || email,
          role: profile?.role || 'user',
          phone: profile?.phone || undefined,
          avatar_url: profile?.avatar_url || undefined,
          xp: profile?.xp || 0,
          preferences: profile?.preferences || undefined,
        }

        setAuth(user as any, data.session.access_token)
        navigate(user.role === 'admin' ? '/admin' : '/')
        return
      }

      const { data } = await authApi.login({ email, password })
      setAuth(data.user, data.token)
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err: any) {
      setError(
        isSupabaseConfigured
          ? getSupabaseAuthMessage(err, 'Oops, sepertinya email atau kata sandi kurang tepat. Mari coba lagi.')
          : err.message || err.response?.data?.message || 'Oops, sepertinya email atau kata sandi kurang tepat. Mari coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-surface p-4 transition-colors duration-500 lg:p-8">
      <div className="absolute inset-0 z-0">
        <img src={bgHero} alt="" className="h-full w-full scale-110 object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-sky-50/80 to-primary/10" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="hidden h-full min-h-[620px] overflow-hidden rounded-[44px] bg-gradient-to-br from-primary via-primary to-primary-dark p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            <img src={bgPattern} alt="" className="h-full w-full object-cover opacity-10 mix-blend-overlay" />
          </div>
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/18 ring-1 ring-white/25">
              <ChefHat className="h-9 w-9" />
            </div>
            <h1 className="mt-10 max-w-xl text-6xl font-black leading-[0.95] tracking-tight">
              Cook<span className="text-white/60">Edu</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-bold leading-7 text-white/75">
              Masuk ke ruang belajar memasak yang lebih stabil, cepat, dan nyaman untuk desktop.
            </p>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {['Resep', 'AI Chef', 'Catatan'].map((item) => (
              <div key={item} className="rounded-3xl bg-white/12 px-4 py-5 ring-1 ring-white/15">
                <p className="text-xs font-black uppercase tracking-widest text-white/60">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24 }}
          className="mx-auto w-full max-w-md rounded-[36px] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-9"
        >
          <div className="mb-8 text-left">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-slate-900">Cook Edu</p>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Masuk</p>
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Selamat Datang</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Lanjutkan belajar memasak dari akun kamu.</p>
          </div>

          {error && (
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/90 p-4 text-center text-[13px] font-semibold text-rose-600">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-500">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="contoh@email.com"
                  required
                />
                <Mail className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-500">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary">
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-sm font-black text-white shadow-[0_16px_32px_rgba(42,77,136,0.22)] transition hover:translate-y-[-1px] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk ke Dapur'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-black text-primary hover:text-primary-dark">Buat Akun Baru</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
