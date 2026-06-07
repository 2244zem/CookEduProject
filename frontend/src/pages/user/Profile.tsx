import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  User, Mail, Phone, Settings, LogOut, ChevronRight,
  Camera, Save, X, Loader2, ShieldCheck,
  CheckCircle2, AlertCircle, Coins, QrCode,
  CalendarCheck, Sparkles, History, WalletCards, Bot, Trophy, LockKeyhole
} from 'lucide-react'
import { useAuthStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { authApi, coinApi } from '../../lib/api'
import { isSupabaseConfigured, supabase, uploadPublicMedia, upsertProfileForUser } from '../../lib/supabaseClient'
import { avatarFallbackUrl, resolveMediaUrl } from '../../lib/media'
import { notifyWalletRefresh, useRealtimeWallet } from '../../hooks/useRealtimeWallet'
import HumanSignalButtons from '../../components/ui/HumanSignalButtons'
import BackendStatusChecker from '../../components/debug/BackendStatusChecker'
import { useToastStore } from '../../store/toastStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

const COIN_PACKAGES = [
  { id: 'starter', label: 'Starter', coins: 100, price: 'Rp10.000' },
  { id: 'plus', label: 'Plus', coins: 275, price: 'Rp25.000' },
  { id: 'pro', label: 'Pro', coins: 600, price: 'Rp50.000' },
] as const

const SPEND_OPTIONS = [
  { id: 'premium_recipe', label: 'Unlock Resep Premium', cost: 25, icon: LockKeyhole },
  { id: 'ai_boost', label: 'Chef AI Boost', cost: 15, icon: Bot },
  { id: 'badge', label: 'Badge Kolektor', cost: 40, icon: Trophy },
] as const

const WALLET_TABS = [
  { id: 'balance', label: 'Balance' },
  { id: 'buy', label: 'Buy Coins' },
  { id: 'daily', label: 'Reward' },
  { id: 'spend', label: 'Spend' },
  { id: 'history', label: 'History' },
] as const

type WalletTransaction = {
  id: string
  amount: number
  transaction_type: string
  description: string
  reference_type?: string | null
  reference_id?: string | null
  created_at: string
}

function getWalletErrorMessage(error: any, fallback: string) {
  const rawMessage = String(error?.response?.data?.message || error?.message || fallback)
  const lowerMessage = rawMessage.toLowerCase()
  const status = Number(error?.response?.status || 0)

  if (status === 401 || lowerMessage.includes('session') || lowerMessage.includes('sesi')) {
    return 'Sesi kamu sudah habis. Silakan login ulang.'
  }
  if (status === 403 || lowerMessage.includes('forbidden') || lowerMessage.includes('akses')) {
    return 'Akses ditolak. Fitur ini membutuhkan izin akun yang sesuai.'
  }
  if (status === 404 || lowerMessage.includes('not found') || lowerMessage.includes('tidak ditemukan')) {
    return 'Data transaksi belum ditemukan. Coba refresh wallet atau buat QRIS baru.'
  }
  if (status === 429 || lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'
  }
  if (status >= 500 || lowerMessage.includes('edge function') || lowerMessage.includes('function')) {
    return 'Sistem pembayaran belum siap. Periksa Supabase Edge Function coins dan secret Midtrans.'
  }

  return rawMessage || fallback
}

export default function Profile() {
  const { user, setAuth, logout } = useAuthStore()
  const pushToast = useToastStore((state) => state.pushToast)
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
  const [walletHistory, setWalletHistory] = useState<WalletTransaction[]>([])
  const [walletHistoryLoading, setWalletHistoryLoading] = useState(false)
  const [walletActionLoading, setWalletActionLoading] = useState('')
  const [walletNotice, setWalletNotice] = useState('')
  const [walletTab, setWalletTab] = useState<typeof WALLET_TABS[number]['id']>('buy')
  const isDevelopment = import.meta.env.DEV
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: null as File | null
  })
  const [preview, setPreview] = useState<string | null>(null)

  const loadWalletHistory = useCallback(async () => {
    if (!user?.id) return

    setWalletHistoryLoading(true)
    try {
      const response = await coinApi.walletHistory({ limit: 12 })
      setWalletHistory(response.data.transactions || [])
    } catch (err) {
      console.warn('Wallet history sync failed:', err)
    } finally {
      setWalletHistoryLoading(false)
    }
  }, [user?.id])

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

  useEffect(() => {
    void loadWalletHistory()
  }, [loadWalletHistory])

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
        pushToast({ tone: 'success', title: 'Profil tersimpan', message: 'Data profil dan avatar sudah sinkron ke Supabase.' })
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
      pushToast({ tone: 'success', title: 'Profil tersimpan', message: 'Perubahan profil berhasil disimpan.' })
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
      if (!imageUrl) throw new Error('Supabase belum mengembalikan qris_image_url.')

      if (isDevelopment) {
        console.log('TESTING_URL:', imageUrl)
      }
      setQrisImageUrl(imageUrl)
      setQrisOrderId(response.data.order_id || '')
      await loadWalletHistory()
      pushToast({ tone: 'success', title: 'QRIS siap', message: 'QR sandbox berhasil dibuat untuk paket koin yang dipilih.' })
    } catch (err: any) {
      console.error('QRIS checkout failed:', err)
      setQrisImageUrl('')
      setQrisOrderId('')
      const message = getWalletErrorMessage(err, 'Gagal membuat QRIS Midtrans.')
      setCoinError(message)
      pushToast({ tone: 'error', title: 'QRIS gagal dibuat', message })
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
      notifyWalletRefresh(Number(response.data.coin_balance || 0))
      await loadWalletHistory()
      const coinsAdded = Number(response.data.coins_added || 0)
      setCoinSuccess(coinsAdded > 0
        ? `Sandbox sukses. +${coinsAdded} koin masuk ke wallet.`
        : 'Order ini sudah pernah diproses, saldo sudah sinkron.'
      )
      pushToast({ tone: 'success', title: 'Pembayaran disimulasikan', message: `${coinsAdded} koin diproses ke wallet.` })
    } catch (err: any) {
      console.error('QRIS bypass failed:', err)
      const message = getWalletErrorMessage(err, 'Gagal menjalankan sandbox bypass.')
      setCoinError(message)
      pushToast({ tone: 'error', title: 'Debug payment gagal', message })
    } finally {
      setBypassLoading(false)
    }
  }

  const handleClaimDailyReward = async () => {
    setWalletActionLoading('daily')
    setWalletNotice('')
    setCoinError('')
    try {
      const response = await coinApi.claimDailyReward()
      notifyWalletRefresh(Number(response.data.coin_balance || 0))
      await refreshWallet()
      await loadWalletHistory()
      setWalletNotice(response.data.message || 'Bonus harian berhasil diproses.')
      pushToast({ tone: 'success', title: 'Bonus harian diproses', message: response.data.message || 'Koin reward sudah masuk ke wallet.' })
    } catch (err: any) {
      const message = getWalletErrorMessage(err, 'Gagal klaim bonus harian.')
      setCoinError(message)
      pushToast({ tone: 'warning', title: 'Bonus belum bisa diklaim', message })
    } finally {
      setWalletActionLoading('')
    }
  }

  const handleSpendCoins = async (spendType: typeof SPEND_OPTIONS[number]['id']) => {
    setWalletActionLoading(spendType)
    setWalletNotice('')
    setCoinError('')
    try {
      const response = await coinApi.spendCoins({ spend_type: spendType })
      notifyWalletRefresh(Number(response.data.coin_balance || 0))
      await refreshWallet()
      await loadWalletHistory()
      setWalletNotice(response.data.message || 'Koin berhasil dipakai.')
      pushToast({ tone: 'success', title: 'Koin dipakai', message: response.data.message || 'Saldo wallet sudah diperbarui.' })
    } catch (err: any) {
      const message = getWalletErrorMessage(err, 'Gagal memakai koin.')
      setCoinError(message)
      pushToast({ tone: 'error', title: 'Koin gagal dipakai', message })
    } finally {
      setWalletActionLoading('')
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
              className={`absolute -bottom-2 -right-2 w-12 h-12 ${isEditing ? 'bg-ocean-city' : 'bg-cyan-600'} text-white rounded-2xl shadow-lg border-4 border-slate-50 flex items-center justify-center hover:scale-110 transition-all`}
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
          <HumanSignalButtons />
          <BackendStatusChecker compact />

          <section className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex gap-2 overflow-x-auto">
              {WALLET_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWalletTab(tab.id)}
                  className={`h-11 min-w-28 flex-1 rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest transition ${
                    walletTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

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

          {walletTab === 'balance' && (
            <section className="rounded-[32px] border border-cyan-100 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Saldo Wallet</p>
                  <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{walletLoading ? '...' : walletBalance} Koin</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                    Saldo ini diambil dari Supabase Edge Function dan tersinkron saat transaksi berubah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshWallet()}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-600 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700"
                >
                  <WalletCards className="h-4 w-4" />
                  Refresh Saldo
                </button>
              </div>
            </section>
          )}

          <section className={`relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm ${walletTab === 'buy' ? '' : 'hidden'}`}>
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
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 text-sm font-black uppercase tracking-widest text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60"
                >
                  {coinLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5 text-white" />}
                  Generate Sandbox QRIS
                </button>
              </div>

              <div className="relative min-h-[340px] border-t border-slate-100 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,148,184,0.28),_transparent_48%)]" />
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
                      {isDevelopment && (
                        <button
                          type="button"
                          onClick={handleBypassSuccess}
                          disabled={bypassLoading || !qrisOrderId}
                          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-yellow-300 disabled:opacity-60"
                        >
                          {bypassLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                          Debug: Simulate Success Payment
                        </button>
                      )}
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

          <section className={`grid gap-6 ${walletTab === 'history' ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'} ${walletTab === 'daily' || walletTab === 'spend' || walletTab === 'history' ? '' : 'hidden'}`}>
            <div className={`space-y-6 ${walletTab === 'history' ? 'hidden' : ''}`}>
              <div className={`rounded-[32px] border border-cyan-100 bg-white p-6 shadow-sm ${walletTab === 'daily' ? '' : 'hidden'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Daily Login</p>
                      <h2 className="text-xl font-black text-slate-950">Bonus Harian</h2>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">+10</div>
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                  Klaim bonus login sekali per hari. Reward ini langsung masuk ke Supabase wallet.
                </p>
                <button
                  type="button"
                  onClick={handleClaimDailyReward}
                  disabled={walletActionLoading === 'daily'}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 text-xs font-black uppercase tracking-widest text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {walletActionLoading === 'daily' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Klaim Bonus
                </button>
              </div>

              <div className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ${walletTab === 'spend' ? '' : 'hidden'}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                    <WalletCards className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Coin Usage</p>
                    <h2 className="text-xl font-black text-slate-950">Pakai Koin</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {SPEND_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSpendCoins(item.id)}
                      disabled={Boolean(walletActionLoading)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-cyan-200 hover:bg-cyan-50 disabled:opacity-60"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
                        {walletActionLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <item.icon className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900">{item.label}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.cost} koin</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>

              {walletNotice && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{walletNotice}</span>
                </div>
              )}
            </div>

            <div className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ${walletTab === 'history' ? '' : 'hidden'}`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Wallet History</p>
                    <h2 className="text-xl font-black text-slate-950">Riwayat Transaksi</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadWalletHistory()}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:border-cyan-200 hover:text-cyan-700"
                >
                  Refresh
                </button>
              </div>

              {walletHistoryLoading ? (
                <div className="flex items-center justify-center py-16 text-cyan-700">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : walletHistory.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <History className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-4 text-sm font-black text-slate-700">Belum ada transaksi wallet.</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Top up, gift admin, daily reward, dan spend akan muncul di sini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {walletHistory.map((transaction) => {
                    const isPositive = Number(transaction.amount) > 0
                    return (
                      <div key={transaction.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          <Coins className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-900">{transaction.description || formatTransactionType(transaction.transaction_type)}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {formatTransactionType(transaction.transaction_type)} • {new Date(transaction.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className={`text-right text-base font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

function formatTransactionType(type: string) {
  const labels: Record<string, string> = {
    purchase: 'Pembelian',
    admin_gift: 'Gift Admin',
    daily_reward: 'Bonus Harian',
    spend: 'Pemakaian',
    refund: 'Refund',
    adjustment: 'Penyesuaian',
  }

  return labels[type] || type
}
