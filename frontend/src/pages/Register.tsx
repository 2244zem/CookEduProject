import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import { getSupabaseAuthMessage, getSupabaseUserName, isSupabaseConfigured, supabase, upsertProfileForUser } from '../lib/supabaseClient'
import { ChefHat, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from '@icons/CookEduIcons'
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
      if (form.password !== form.password_confirmation) {
        throw new Error('Konfirmasi kata sandi belum sama.')
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              username: form.name,
              name: form.name,
              phone: form.phone || null,
            },
          },
        })

        if (signUpError) throw signUpError
        if (!data.user) throw new Error('Supabase belum membuat user. Coba beberapa saat lagi.')

        if (!data.session) {
          sessionStorage.setItem('cookedu_auth_notice', 'Akun dibuat. Cek inbox/spam untuk konfirmasi email, lalu login kembali.')
          navigate('/login', { replace: true })
          return
        }

        const profile = await upsertProfileForUser(data.user, {
          username: form.name,
          phone: form.phone || null,
        })
        const displayName = getSupabaseUserName(data.user, profile)
        const user = {
          id: data.user.id,
          name: displayName,
          username: displayName,
          email: data.user.email || form.email,
          role: profile?.role || 'user',
          phone: profile?.phone || form.phone || undefined,
          avatar_url: profile?.avatar_url || undefined,
          xp: profile?.xp || 0,
          preferences: profile?.preferences || undefined,
        }

        setAuth(user as any, data.session.access_token)
        navigate('/')
        return
      }

      const payload = { ...form }
      if (!payload.phone) delete (payload as any).phone

      const { data } = await authApi.register(payload)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err: any) {
      console.error('Registration error:', err)
      const msgs = err.response?.data?.errors
      setError(
        msgs
          ? Object.values(msgs).flat().join(' ')
          : isSupabaseConfigured
            ? getSupabaseAuthMessage(err, 'Oops, sepertinya ada yang terlewat. Mari periksa lagi data kamu.')
            : err.message || err.response?.data?.message || 'Oops, sepertinya ada yang terlewat. Mari periksa lagi data kamu.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Username', type: 'text', icon: User, placeholder: 'zem_cooks' },
    { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'nama@email.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '08xxxxxxxxxx' },
  ]

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-surface p-4 transition-colors duration-500 lg:p-8">
      <div className="absolute inset-0 z-0">
        <img src={bgHero} alt="" className="h-full w-full scale-110 object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-sky-50/80 to-primary/10" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-6 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(520px,1fr)]">
        <section className="hidden h-full min-h-[640px] overflow-hidden rounded-[44px] bg-gradient-to-br from-primary via-primary to-primary-dark p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 pointer-events-none hidden lg:block">
            <img src={bgPattern} alt="" className="h-full w-full object-cover opacity-10 mix-blend-overlay" />
          </div>
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/18 ring-1 ring-white/25">
              <ChefHat className="h-9 w-9" />
            </div>
            <h1 className="mt-10 max-w-xl text-5xl font-black leading-[0.98] tracking-tight">
              Mulai perjalanan memasak yang lebih rapi.
            </h1>
            <p className="mt-5 max-w-md text-base font-bold leading-7 text-white/75">
              Daftar sekali, lalu sinkronkan resep, catatan, dan progres belajar dengan backend CookEdu.
            </p>
          </div>
          <div className="relative rounded-[32px] bg-white/12 p-5 ring-1 ring-white/15">
            <p className="text-xs font-black uppercase tracking-widest text-white/60">Cook Edu</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white/80">Layout desktop dibuat lega agar form tidak terasa sempit.</p>
          </div>
        </section>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24 }}
          className="mx-auto w-full max-w-2xl rounded-[36px] border border-white/80 bg-white/85 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:p-9"
        >
          <div className="mb-8 text-left">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-slate-900">Cook Edu</p>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Daftar</p>
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Buat Akun</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Isi data utama untuk membuka pengalaman belajar penuh.</p>
          </div>

          {error && (
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/90 p-4 text-center text-[13px] font-semibold text-rose-600">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
                <div key={key} className={key === 'phone' ? 'md:col-span-2 lg:col-span-1' : ''}>
                  <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-500">{label}</label>
                  <div className="relative mt-2">
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                      placeholder={placeholder}
                      required={key !== 'phone'}
                    />
                    <Icon className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              ))}

              <div>
                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-500">Kata Sandi</label>
                <div className="relative mt-2">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary">
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="ml-1 text-xs font-black uppercase tracking-wide text-slate-500">Ulangi Kata Sandi</label>
                <div className="relative mt-2">
                  <input
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 pr-12 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                    placeholder="Masukkan kembali kata sandi"
                    required
                  />
                  <Lock className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-sm font-black text-white shadow-[0_16px_32px_rgba(42,77,136,0.22)] transition hover:translate-y-[-1px] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Buat Akun Saya'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-semibold text-slate-500">
            Sudah memiliki akses?{' '}
            <Link to="/login" className="font-black text-primary hover:text-primary-dark">Masuk di Sini</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
