import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Settings, LogOut, ChevronRight, Award, Clock, BookOpen, Camera, Save, X, Loader2, ShieldCheck, Key, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import api, { authApi } from '../../lib/api'

export default function Profile() {
  const { user, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()
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
      setPreview(user.avatar_url || null)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSendOTP = async () => {
    if (!user?.email) return
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.sendOTP(user.email)
      setOtpSent(true)
      // For demo purposes, we can show the OTP if it's in the response
      if (res.data.demo_otp) {
        console.log('DEMO OTP:', res.data.demo_otp)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim kode OTP. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword({
        email: user.email,
        ...passForm
      })
      setShowPassModal(false)
      setOtpSent(false)
      setPassForm({ otp: '', password: '', password_confirmation: '' })
      alert('Kata sandi berhasil diubah!')
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Gagal mengubah kata sandi.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm({ ...form, avatar: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('_method', 'PUT')
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      const response = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const updatedUser = response.data.user
      if (updatedUser) {
        setAuth(updatedUser, localStorage.getItem('cookedu_token') || '')
        setPreview(updatedUser.avatar_url || updatedUser.avatar || null)
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Update profile failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Modul Selesai', value: '12', icon: BookOpen, color: 'text-primary' },
    { label: 'Total Jam', value: '24h', icon: Clock, color: 'text-blue-500' },
    { label: 'Sertifikat', value: '3', icon: Award, color: 'text-purple-500' },
  ]

  return (
    <div className="pb-40 pt-12 px-6 max-w-2xl mx-auto relative min-h-screen">
      <div className="absolute top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-blob" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10 relative z-10"
      >
        {/* Header Profile */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#FF8C00] to-indigo-600 shadow-xl mx-auto overflow-hidden animate-pulse-glow">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 relative">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Zem'}`} alt="Avatar" className="w-full h-full object-cover bg-[#f4ebd0]" />
                )}
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            
            <button 
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`absolute -bottom-2 -right-2 p-4 ${isEditing ? 'bg-danger' : 'bg-primary'} text-white rounded-2xl shadow-glow border border-white/20 hover:scale-110 transition-all z-20 cursor-pointer`}
            >
              {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
            </button>
          </div>

          <div className="w-full max-w-sm">
            {isEditing ? (
              <div className="space-y-4 animate-slide-up">
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full bg-white dark:bg-white/5 border-2 border-primary/20 rounded-2xl pl-12 pr-6 py-3 font-black text-xl text-text-primary focus:border-primary transition-all outline-none"
                    placeholder="Username"
                  />
                </div>
                <div className="flex justify-center gap-3">
                  <button 
                    type="button"
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow hover:scale-105 transition-all disabled:opacity-50 w-full justify-center"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{user?.name || 'Zem'}</h1>
                <div className="inline-flex items-center gap-2 mt-2 bg-orange-50 dark:bg-orange-900/30 px-4 py-1.5 rounded-full border border-orange-100 dark:border-orange-500/20 shadow-sm">
                   <span className="text-sm">🍳</span>
                   <span className="text-xs font-black text-[#FF8C00] uppercase tracking-wider">Apprentice Chef</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BENTO GRID RESUME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kotak 1: Progression Line Chart */}
          <div className="bg-white dark:bg-surface-card rounded-[35px] p-6 border border-slate-100 dark:border-white/5 shadow-xl md:col-span-2 relative overflow-hidden flex flex-col group">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
             <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 relative z-10 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Learning Progress
             </h3>
             <div className="flex items-end gap-2 mb-4 relative z-10">
                <span className="text-xs font-bold text-slate-400">Rata-rata</span>
                <span className="text-3xl font-black text-indigo-600">78%</span>
             </div>
             <div className="h-28 w-full relative">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                   <path d="M0,35 Q20,10 40,25 T70,15 T100,5" fill="none" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                   <path d="M0,40 Q25,20 50,30 T85,20 T100,10" fill="none" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="3 3" />
                   <circle cx="40" cy="25" r="4" fill="#fff" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
                   <circle cx="70" cy="15" r="4" fill="#fff" stroke="#4F46E5" strokeWidth="2" className="animate-pulse" />
                </svg>
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mt-2">
                   <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                </div>
             </div>
          </div>

          {/* Kotak 2: Stats Badge */}
          <div className="bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E6] dark:from-rose-950/40 dark:to-rose-900/20 rounded-[35px] p-6 border border-rose-100 dark:border-rose-900/50 shadow-xl flex flex-col justify-center gap-4">
             <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200">Total Teknik</span>
                <span className="text-xl font-black text-rose-600">44</span>
             </div>
             <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200">Resep Dikuasai</span>
                <span className="text-xl font-black text-rose-600">12</span>
             </div>
             <div className="flex items-center justify-between bg-white/60 dark:bg-black/20 p-3 rounded-2xl">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200">Skill Baru</span>
                <span className="text-xl font-black text-rose-600">34</span>
             </div>
          </div>

          {/* Kotak 3: Leaderboard Podium Mini */}
          <div className="bg-gradient-to-t from-orange-50 to-white dark:from-[#2d1b10] dark:to-surface-card rounded-[35px] p-6 border border-orange-100 dark:border-white/5 shadow-xl flex flex-col items-center justify-end relative overflow-hidden">
             <h3 className="absolute top-6 left-6 text-sm font-black text-orange-900 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4" /> Top 3
             </h3>
             <div className="flex items-end justify-center gap-3 h-32 w-full mt-8">
                {/* Rank 2 */}
                <div className="flex flex-col items-center w-[30%]">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Idris`} alt="Rank 2" className="w-8 h-8 rounded-full border-2 border-[#C0C0C0] bg-[#f4ebd0] mb-2" />
                   <div className="w-full bg-gradient-to-t from-[#C0C0C0] to-[#E8E8E8] h-12 rounded-t-xl flex justify-center pt-1 shadow-inner border border-gray-300">
                      <span className="text-[10px] font-black text-gray-700">#2</span>
                   </div>
                </div>
                {/* Rank 1 */}
                <div className="flex flex-col items-center w-[35%] relative">
                   <div className="absolute -top-4 text-sm z-10">👑</div>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Zem`} alt="Rank 1" className="w-12 h-12 rounded-full border-2 border-[#FFD700] bg-[#f4ebd0] mb-2 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                   <div className="w-full bg-gradient-to-t from-[#FFD700] to-[#FFF8DC] h-20 rounded-t-xl flex justify-center pt-2 shadow-inner border border-yellow-500">
                      <span className="text-xs font-black text-yellow-800">#1</span>
                   </div>
                </div>
                {/* Rank 3 */}
                <div className="flex flex-col items-center w-[30%]">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia`} alt="Rank 3" className="w-8 h-8 rounded-full border-2 border-[#CD7F32] bg-[#f4ebd0] mb-2" />
                   <div className="w-full bg-gradient-to-t from-[#CD7F32] to-[#F4A460] h-8 rounded-t-xl flex justify-center pt-1 shadow-inner border border-orange-700">
                      <span className="text-[10px] font-black text-orange-900">#3</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-[40px] border border-gray-100 dark:border-white/10 overflow-hidden shadow-2xl">
          <MenuLink 
            icon={Mail} 
            label="Email Terverifikasi" 
            value={user?.email} 
            disabled 
          />
          
          <MenuLink 
            icon={Phone} 
            label="Nomor Telepon" 
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => phoneInputRef.current?.focus(), 100);
            }}
            value={isEditing ? (
              <input 
                ref={phoneInputRef}
                type="text"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-primary w-full outline-none"
                placeholder="08xxxxxxxxxx"
              />
            ) : (user?.phone || 'Atur sekarang')} 
          />

          <MenuLink 
            icon={ShieldCheck} 
            label="Keamanan & Privasi" 
            value="Kata sandi & Data akun"
            onClick={() => { setShowPassModal(true); setError(null); }}
          />
          
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-6 p-6 text-red-400 hover:bg-red-500/10 transition-all group border-t border-gray-100 dark:border-white/5"
          >
            <div className="w-12 h-12 rounded-[18px] bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px]">Keluar dari Sesi</span>
          </button>
        </div>
      </motion.div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showPassModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPassModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface-card w-full max-w-md rounded-[45px] p-10 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
            >
              <button 
                onClick={() => setShowPassModal(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Ubah Kata Sandi</h2>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Verifikasi Keamanan</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              {!otpSent ? (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed font-bold">
                    Kami akan mengirimkan kode OTP ke email <span className="text-primary font-black">{user?.email}</span> untuk memverifikasi identitas Anda.
                  </p>
                  <button 
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl gradient-primary text-white font-black uppercase text-xs tracking-[0.2em] shadow-glow flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Kirim Kode OTP
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5 animate-slide-up" autoComplete="off">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Kode OTP terkirim!</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-text-secondary mb-2 block uppercase tracking-widest">Kode OTP</label>
                    <input 
                      type="text" 
                      autoComplete="one-time-code"
                      value={passForm.otp}
                      onChange={(e) => setPassForm({...passForm, otp: e.target.value})}
                      className="w-full bg-surface-dim dark:bg-white/5 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 font-black tracking-[0.5em] text-center text-xl outline-none transition-all"
                      placeholder="XXXXXX"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-text-secondary mb-2 block uppercase tracking-widest">Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      value={passForm.password}
                      onChange={(e) => setPassForm({...passForm, password: e.target.value})}
                      className="w-full bg-surface-dim dark:bg-white/5 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-text-secondary mb-2 block uppercase tracking-widest">Konfirmasi Sandi</label>
                    <input 
                      type="password" 
                      autoComplete="new-password"
                      value={passForm.password_confirmation}
                      onChange={(e) => setPassForm({...passForm, password_confirmation: e.target.value})}
                      className="w-full bg-surface-dim dark:bg-white/5 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                      placeholder="Ketik ulang sandi baru"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl gradient-ocean text-white font-black uppercase text-xs tracking-[0.2em] shadow-glow flex items-center justify-center gap-3 disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Sandi Baru
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setOtpSent(false); setError(null); }}
                    className="w-full text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    Kirim Ulang Kode OTP
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuLink({ icon: Icon, label, value, disabled, onClick }: any) {
  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`w-full flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 last:border-0 transition-all text-left group ${!disabled ? 'hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-6 w-full">
        <div className="w-12 h-12 rounded-[18px] bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/5 group-hover:border-primary/50 transition-colors">
          <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1">
          <div className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[10px] mb-1">{label}</div>
          {value && <div className={`text-sm font-bold ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>{value}</div>}
        </div>
      </div>
      {!disabled && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />}
    </div>
  )
}
