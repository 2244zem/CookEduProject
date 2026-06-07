import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Gift,
  Loader2,
  Search,
  ShieldCheck,
  User,
  WalletCards,
} from 'lucide-react'
import { coinApi } from '../../lib/api'

type WalletUser = {
  id: string
  username?: string | null
  email?: string | null
  avatar_url?: string | null
  role?: string | null
  coin_balance: number
}

export default function WalletAdmin() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null)
  const [amount, setAmount] = useState(100)
  const [reason, setReason] = useState('Bonus admin CookEdu')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const normalizedQuery = query.trim()

  const usersQuery = useQuery({
    queryKey: ['wallet-admin-users', normalizedQuery],
    enabled: normalizedQuery.length >= 2,
    queryFn: async () => {
      const response = await coinApi.adminSearchUsers({ query: normalizedQuery })
      return response.data.users || []
    },
  })

  const auditQuery = useQuery({
    queryKey: ['wallet-admin-audit'],
    queryFn: async () => {
      const response = await coinApi.adminWalletAudit({ limit: 20 })
      return response.data.logs || []
    },
  })

  const giveMutation = useMutation({
    mutationFn: () => {
      if (!selectedUser) throw new Error('Pilih user dulu.')
      return coinApi.adminGiveCoins({
        target_user_id: selectedUser.id,
        amount,
        reason,
      })
    },
    onSuccess: (response) => {
      setError('')
      setMessage(`Berhasil memberi +${response.data.coins_added} koin. Saldo baru: ${response.data.coin_balance}.`)
      setSelectedUser((current) => current ? { ...current, coin_balance: response.data.coin_balance } : current)
      queryClient.invalidateQueries({ queryKey: ['wallet-admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-admin-audit'] })
    },
    onError: (err: any) => {
      setMessage('')
      setError(err.message || 'Gagal memberi koin.')
    },
  })

  const users = usersQuery.data || []
  const selectedInitial = useMemo(() => {
    const name = selectedUser?.username || selectedUser?.email || 'U'
    return name.charAt(0).toUpperCase()
  }, [selectedUser])

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans text-slate-800">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">
            <ShieldCheck className="h-4 w-4" />
            Admin Wallet Control
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">Give Coins</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Cari user berdasarkan email atau username, kirim koin secara atomik ke Supabase, dan simpan jejak audit admin.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
          <div className="rounded-[28px] border border-cyan-100 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Preset</p>
            <p className="mt-1 text-2xl font-black text-cyan-700">+{amount}</p>
          </div>
          <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Audit</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{auditQuery.data?.length || 0}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari email atau username..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-5 text-sm font-bold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="mt-5 space-y-3">
            {normalizedQuery.length < 2 ? (
              <EmptyState icon={Search} title="Mulai cari user" text="Ketik minimal 2 karakter dari email atau username." />
            ) : usersQuery.isLoading ? (
              <div className="flex items-center justify-center py-16 text-cyan-700">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <EmptyState icon={User} title="User tidak ditemukan" text="Pastikan user sudah register dan punya profile Supabase." />
            ) : users.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedUser(item)}
                className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition ${
                  selectedUser?.id === item.id
                    ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-cyan-200 hover:bg-cyan-50/40'
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-sm font-black text-white">
                  {item.avatar_url ? <img src={item.avatar_url} alt="" className="h-full w-full object-cover" /> : (item.username || item.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-950">{item.username || item.email || 'Username belum ada'}</p>
                  <p className="truncate text-xs font-bold text-slate-400">{item.email || item.id}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-2 text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saldo</p>
                  <p className="text-sm font-black text-slate-950">{item.coin_balance}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                {selectedUser ? <span className="text-xl font-black">{selectedInitial}</span> : <Gift className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Target User</p>
                <h2 className="truncate text-xl font-black text-slate-950">{selectedUser?.username || selectedUser?.email || 'Belum dipilih'}</h2>
              </div>
            </div>

            {message && (
              <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jumlah Koin</span>
              <input
                type="number"
                min={1}
                max={100000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-lg font-black outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[25, 100, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  +{preset}
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alasan</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="button"
              disabled={!selectedUser || giveMutation.isPending}
              onClick={() => giveMutation.mutate()}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black uppercase tracking-widest text-white transition hover:bg-cyan-700 disabled:opacity-50"
            >
              {giveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Coins className="h-5 w-5 text-cyan-300" />}
              Give Coins
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Audit Log</p>
            <h2 className="text-xl font-black text-slate-950">Riwayat Give Coins</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 pr-6">Waktu</th>
                <th className="py-4 pr-6">Admin</th>
                <th className="py-4 pr-6">Target</th>
                <th className="py-4 pr-6">Koin</th>
                <th className="py-4 pr-6">Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(auditQuery.data || []).map((log) => (
                <tr key={log.id} className="text-sm">
                  <td className="py-4 pr-6 font-bold text-slate-500">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td className="py-4 pr-6 font-black text-slate-900">{log.admin_username || 'Admin'}</td>
                  <td className="py-4 pr-6">
                    <p className="font-black text-slate-900">{log.target_username || 'User'}</p>
                    <p className="text-xs font-bold text-slate-400">{log.target_email}</p>
                  </td>
                  <td className="py-4 pr-6 font-black text-emerald-600">+{log.amount}</td>
                  <td className="py-4 pr-6 font-semibold text-slate-500">{log.reason}</td>
                </tr>
              ))}
              {!auditQuery.isLoading && (auditQuery.data || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-bold text-slate-400">Belum ada audit wallet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
      <Icon className="h-9 w-9 text-slate-300" />
      <p className="mt-4 text-base font-black text-slate-700">{title}</p>
      <p className="mt-1 max-w-xs text-sm font-semibold text-slate-400">{text}</p>
    </div>
  )
}
