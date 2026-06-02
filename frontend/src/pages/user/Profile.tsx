import { useState, useRef, useEffect } from 'react'
import { 
  User, Mail, Phone, Settings, LogOut, ChevronRight,
  Camera, Save, X, Loader2, ShieldCheck,
  CheckCircle2, AlertCircle, Coins, QrCode
} from 'lucide-react'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { authApi, coinApi } from '../../lib/api'
import { isSupabaseConfigured, supabase, uploadPublicMedia, upsertProfileForUser } from '../../lib/supabaseClient'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'
import { notifyWalletRefresh, useRealtimeWallet } from '../../hooks/useRealtimeWallet'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

const COIN_PACKAGES = [
  { id: 'starter', label: 'Starter', coins: 100, price: 'Rp10.000' },
  { id: 'plus', label: 'Plus', coins: 275, price: 'Rp25.000' },
  { id: 'pro', label: 'Pro', coins: 600, price: 'Rp50.000' },
] as const

export default function Profile() {
  const { user, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { balance: walletBalance, loading: walletLoading, refresh: refreshWallet } = useRealtimeWallet(user?.id)

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<typeof COIN_PACKAGES[number]['id']>('starter')
  const [qrisImageUrl, setQrisImageUrl] = useState('')
  const [qrisOrderId, setQrisOrderId] = useState('')
  const [qrisImageFailed, setQrisImageFailed] = useState(false)
  const [coinLoading, setCoinLoading] = useState(false)
  const [bypassLoading, setBypassLoading] = useState(false)
  const [coinError, setCoinError] = useState('')
  const [coinSuccess, setCoinSuccess] = useState('')
  
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
        if (!sessionUser) {
          sessionStorage.setItem('cookedu_auth_notice', 'Sesi Supabase tidak ditemukan. Silakan login ulang.')
          await logout()
          navigate('/login', { replace: true })
          return
        }

        let avatarUrl = user?.avatar_url || user?.avatar || null
        if (form.avatar) {
          avatarUrl = await uploadPublicMedia('avatars', form.avatar, sessionUser.id)
        }

        const profile = await upsertProfileForUser(sessionUser, {
          username: form.name,
          phone: form.phone,
          avatar_url: avatarUrl,
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

  const handleBuyCoins = async () => {
    if (!user) return

    setCoinLoading(true)
    setCoinError('')
    setCoinSuccess('')
    setQrisImageFailed(false)
    try {
      const response = await coinApi.qrisCheckout({
        package_id: selectedCoinPackage,
        user_id: user.id,
        customer_name: user.username || user.name,
        customer_email: user.email,
      })

      const imageUrl = response.data.qris_image_url
      if (!imageUrl) throw new Error('Laravel belum mengembalikan qris_image_url.')

      console.log('TESTING_URL:', imageUrl)
      setQrisImageUrl(imageUrl)
      setQrisOrderId(response.data.order_id || '')
    } catch (err: any) {
      console.error('QRIS checkout failed:', err)
      setQrisImageUrl('')
      setQrisOrderId('')
      setCoinError(err.response?.data?.message || err.message || 'Gagal membuat QRIS Midtrans.')
    } finally {
      setCoinLoading(false)
    }
  }

  const handleBypassSuccess = async () => {
    if (!qrisOrderId) return

    setBypassLoading(true)
    setCoinError('')
    setCoinSuccess('')
    try {
      const response = await coinApi.bypassSuccess({ order_id: qrisOrderId })
      await refreshWallet()
      notifyWalletRefresh()
      const coinsAdded = Number(response.data.coins_added || 0)
      setCoinSuccess(coinsAdded > 0
        ? `Sandbox sukses. +${coinsAdded} koin masuk ke wallet.`
        : 'Order ini sudah pernah diproses, saldo sudah sinkron.'
      )
    } catch (err: any) {
      console.error('QRIS bypass failed:', err)
      setCoinError(err.response?.data?.message || err.message || 'Gagal menjalankan sandbox bypass.')
    } finally {
      setBypassLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent text-slate-800 pb-40">
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
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Koin</p>
              <p className="text-2xl font-black text-slate-900">{walletLoading ? '...' : walletBalance}</p>
            </div>
          </div>

          <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-5 p-5 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <Coins className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">CookEdu Wallet</p>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Top Up Koin</h2>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saldo Aktif</p>
                    <p className="text-2xl font-black text-slate-950">{walletLoading ? '...' : walletBalance}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {COIN_PACKAGES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedCoinPackage(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedCoinPackage === item.id
                          ? 'border-cyan-300 bg-cyan-50 text-cyan-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50/40'
                      }`}
                    >
                      <p className="text-sm font-black">{item.label}</p>
                      <p className="mt-1 text-3xl font-black text-slate-950">{item.coins}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.price}</p>
                    </button>
                  ))}
                </div>

                {coinError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{coinError}</span>
                  </div>
                )}

                {coinSuccess && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{coinSuccess}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBuyCoins}
                  disabled={coinLoading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-cyan-700 disabled:opacity-60"
                >
                  {coinLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5 text-cyan-300" />}
                  Generate Sandbox QRIS
                </button>
              </div>

              <div className="relative min-h-[340px] border-t border-slate-100 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_48%)]" />
                <div className="relative z-10 flex h-full min-h-[300px] items-center justify-center">
                  {qrisImageUrl ? (
                    <div className="w-full rounded-[28px] bg-white p-5 text-center shadow-2xl">
                      {qrisImageFailed ? (
                        <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-200 bg-cyan-50 text-cyan-800">
                          <QrCode className="h-14 w-14" />
                          <p className="mt-3 text-xs font-black uppercase tracking-widest">Sandbox QR</p>
                        </div>
                      ) : (
                        <img
                          src={qrisImageUrl}
                          onError={() => setQrisImageFailed(true)}
                          className="w-48 h-48 mx-auto object-contain"
                          alt="CookEdu QRIS payment code"
                        />
                      )}
                      <p className="mt-4 break-all text-[10px] font-black uppercase tracking-wide text-slate-400">
                        {qrisOrderId || 'COOKEDU-QRIS'}
                      </p>
                      <button
                        type="button"
                        onClick={handleBypassSuccess}
                        disabled={bypassLoading || !qrisOrderId}
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {bypassLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        🧪 Debug: Simulate Success Payment
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-xs text-center">
                      <QrCode className="mx-auto h-16 w-16 text-cyan-300" />
                      <p className="mt-5 text-lg font-black">QRIS sandbox siap dibuat.</p>
                      <p className="mt-2 text-xs font-bold leading-6 text-white/55">
                        Pilih paket, generate QRIS, lalu tekan tombol debug untuk menyelesaikan pembayaran tanpa simulator manual.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

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
              value="Akun Supabase aktif" 
              disabled
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
