import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, Settings, LogOut, ChevronRight, Award, 
  Clock, BookOpen, Camera, Save, X, Loader2, ShieldCheck, 
  Key, CheckCircle2, AlertCircle, Snowflake, Bookmark, BarChart3,
  Globe, Moon
} from 'lucide-react'
import { useAuthStore, useThemeStore } from '../../store'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../../lib/api'
import { isSupabaseConfigured, supabase, uploadPublicMedia, upsertProfileForUser } from '../../lib/supabaseClient'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function Profile() {
  const { user, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useThemeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [showPassModal, setShowPassModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passForm, setPassForm] = useState({ otp: '', password: '', password_confirmation: '' })
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: null as File | null
  })
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        avatar: null
      })
      setPreview(resolveMediaUrl(user.avatar_url || user.avatar) || avatarFallbackUrl(user.name))
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUpdate = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUser = sessionData.session?.user
        if (!sessionUser) throw new Error('Sesi Supabase tidak ditemukan. Silakan login ulang.')

        let avatarUrl = user?.avatar_url || user?.avatar || null
        if (form.avatar) {
          avatarUrl = await uploadPublicMedia('avatars', form.avatar, sessionUser.id)
        }

        const profile = await upsertProfileForUser(sessionUser, {
          username: form.name,
          phone: form.phone,
          avatar_url: avatarUrl,
          role: user?.role || 'user',
        })

        const updatedUser = {
          ...user,
          id: sessionUser.id,
          name: profile?.username || form.name,
          username: profile?.username || form.name,
          email: sessionUser.email || user?.email || '',
          phone: profile?.phone || form.phone,
          avatar_url: profile?.avatar_url || avatarUrl || undefined,
          role: profile?.role || user?.role || 'user',
        }

        setAuth(updatedUser as any, sessionData.session?.access_token || localStorage.getItem('cookedu_token') || '')
        setPreview(resolveMediaUrl(updatedUser.avatar_url) || avatarFallbackUrl(updatedUser.name))
        setIsEditing(false)
        return
      }

      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      const response = form.avatar
        ? await authApi.updateProfile(formData)
        : await authApi.updateProfile({ name: form.name, phone: form.phone })
      
      const updatedUser = response.data.user
      if (updatedUser) {
        setAuth(updatedUser, localStorage.getItem('cookedu_token') || '')
        setPreview(updatedUser.avatar_url || updatedUser.avatar || null)
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Update profile failed:', err)
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent ${
      isDarkMode ? 'dark text-white' : 'text-slate-800'
    } pb-40`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 lg:hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-lg lg:grid lg:max-w-6xl lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
        {/* HEADER SECTION */}
        <header className="px-6 pt-12 pb-8 flex flex-col items-center lg:sticky lg:top-28 lg:self-start lg:rounded-[36px] lg:border lg:border-cyan-100 lg:bg-white lg:p-8 lg:shadow-sm">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-[40px] bg-white border-4 border-white shadow-2xl overflow-hidden relative group">
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                  <User className="w-12 h-12" />
                </div>
              )}
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setForm({ ...form, avatar: file })
                  setPreview(URL.createObjectURL(file))
                }
              }} 
            />
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`absolute -bottom-2 -right-2 w-12 h-12 ${isEditing ? 'bg-rose-500' : 'bg-cyan-600'} text-white rounded-2xl shadow-lg border-4 border-[#F0F9FF] flex items-center justify-center hover:scale-110 transition-all`}
            >
              {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-center w-full px-6">
            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl px-4 py-3">
                {error}
              </div>
            )}
            {isEditing ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/70 backdrop-blur-xl border-2 border-white rounded-2xl px-6 py-3 font-black text-xl text-center focus:border-cyan-500/20 transition-all outline-none shadow-premium"
                  placeholder="Nama Lengkap"
                />
                <button 
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full bg-cyan-600 text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight">{user?.name || 'User CookEdu'}</h1>
                <div className="mt-2 inline-flex items-center gap-2 bg-cyan-100 px-4 py-1.5 rounded-full text-[9px] font-black text-cyan-600 uppercase tracking-widest">
                  Apprentice Chef
                </div>
              </>
            )}
          </div>
        </header>

        <main className="px-6 space-y-6 lg:px-0 lg:py-12">
          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white shadow-premium">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Learning Progress</p>
              <p className="text-2xl font-black text-cyan-600">78%</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-cyan-500 h-full w-[78%]" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white shadow-premium flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resep Dikuasai</p>
              <p className="text-2xl font-black text-slate-900">12</p>
            </div>
          </div>

          {/* MENU LIST */}
          <div className="grid overflow-hidden rounded-[40px] border border-white bg-white/70 shadow-premium backdrop-blur-2xl lg:grid-cols-2 lg:border-cyan-100 lg:bg-white">
            <MenuLink icon={Mail} label="Email" value={user?.email} disabled />
            <MenuLink 
              icon={Phone} 
              label="Nomor Telepon" 
              value={user?.phone || 'Atur sekarang'} 
              onClick={() => setIsEditing(true)}
            />
            <MenuLink 
              icon={ShieldCheck} 
              label="Keamanan" 
              value="Ubah Kata Sandi" 
              onClick={() => setShowPassModal(true)}
            />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-6 p-6 text-rose-500 hover:bg-rose-50 transition-all border-t border-slate-50"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <span className="font-black uppercase tracking-widest text-[10px]">Keluar Akun</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

function MenuLink({ icon: Icon, label, value, disabled, onClick }: any) {
  return (
    <button 
      onClick={!disabled ? onClick : undefined}
      className={`w-full flex items-center justify-between p-6 border-b border-slate-50 last:border-0 transition-all text-left group ${!disabled ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-cyan-200 transition-colors">
          <Icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-600 transition-colors" />
        </div>
        <div>
          <div className="font-black text-slate-900 uppercase tracking-widest text-[9px] mb-1">{label}</div>
          <div className={`text-sm font-bold ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>{value}</div>
        </div>
      </div>
      {!disabled && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-600 transition-all" />}
    </button>
  )
}
