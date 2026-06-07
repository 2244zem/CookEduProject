import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, RefreshCw, TriangleAlert, XCircle } from 'lucide-react'
import { coinApi } from '../../lib/api'
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient'
import { useAuthStore } from '../../store/authStore'

type CheckTone = 'ok' | 'warn' | 'error'

type BackendCheck = {
  id: string
  label: string
  tone: CheckTone
  detail: string
}

function normalizeError(error: unknown) {
  const err = error as { message?: string; code?: string } | null
  const message = err?.message || err?.code || 'Tidak tersedia'

  if (/failed to send a request to the edge function/i.test(message)) {
    return 'Edge Function belum bisa dijangkau. Deploy ulang function atau cek secret/JWT.'
  }

  return message
}

function statusFromError(id: string, label: string, error: unknown): BackendCheck {
  return {
    id,
    label,
    tone: 'error',
    detail: normalizeError(error),
  }
}

async function runBackendChecks(): Promise<BackendCheck[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [{
      id: 'config',
      label: 'Supabase Config',
      tone: 'error',
      detail: 'VITE_SUPABASE_URL atau publishable key belum tersedia.',
    }]
  }

  const checks: BackendCheck[] = []
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const session = sessionData.session

  checks.push(session?.user && !sessionError
    ? { id: 'auth', label: 'Supabase Auth', tone: 'ok', detail: session.user.email || session.user.id }
    : { id: 'auth', label: 'Supabase Auth', tone: 'warn', detail: sessionError?.message || 'Belum ada sesi aktif.' }
  )

  if (!session?.user) {
    return [
      ...checks,
      { id: 'storage', label: 'Storage avatars', tone: 'warn', detail: 'Login diperlukan untuk cek bucket.' },
      { id: 'coins', label: 'Coins Function', tone: 'warn', detail: 'Login diperlukan untuk cek Edge Function.' },
      { id: 'wallets', label: 'Wallet Tables', tone: 'warn', detail: 'Login diperlukan untuk cek wallet.' },
    ]
  }

  const [recipeResult, storageResult, walletResult, coinsResult] = await Promise.allSettled([
    supabase.from('recipes').select('id').limit(1),
    supabase.storage.from('avatars').list(session.user.id, { limit: 1 }),
    supabase.from('user_wallets').select('user_id, coin_balance').eq('user_id', session.user.id).maybeSingle(),
    coinApi.walletBalance(),
  ])

  if (recipeResult.status === 'fulfilled' && !recipeResult.value.error) {
    checks.push({ id: 'recipes', label: 'Recipes API', tone: 'ok', detail: 'public.recipes terbaca.' })
  } else {
    checks.push(statusFromError('recipes', 'Recipes API', recipeResult.status === 'fulfilled' ? recipeResult.value.error : recipeResult.reason))
  }

  if (storageResult.status === 'fulfilled' && !storageResult.value.error) {
    checks.push({ id: 'storage', label: 'Storage avatars', tone: 'ok', detail: 'Bucket avatars dapat diakses.' })
  } else {
    checks.push(statusFromError('storage', 'Storage avatars', storageResult.status === 'fulfilled' ? storageResult.value.error : storageResult.reason))
  }

  if (walletResult.status === 'fulfilled' && !walletResult.value.error) {
    checks.push({
      id: 'wallets',
      label: 'Wallet Tables',
      tone: walletResult.value.data ? 'ok' : 'warn',
      detail: walletResult.value.data ? `Saldo tabel: ${walletResult.value.data.coin_balance}` : 'Wallet user belum dibuat, fungsi coins perlu menyiapkan row.',
    })
  } else {
    checks.push(statusFromError('wallets', 'Wallet Tables', walletResult.status === 'fulfilled' ? walletResult.value.error : walletResult.reason))
  }

  if (coinsResult.status === 'fulfilled') {
    checks.push({ id: 'coins', label: 'Coins Function', tone: 'ok', detail: `Saldo function: ${coinsResult.value.data.coin_balance}` })
  } else {
    checks.push(statusFromError('coins', 'Coins Function', coinsResult.reason))
  }

  return checks
}

const toneClass: Record<CheckTone, string> = {
  ok: 'border-emerald-100 bg-emerald-50 text-emerald-800',
  warn: 'border-yellow-100 bg-yellow-50 text-yellow-900',
  error: 'border-rose-100 bg-rose-50 text-rose-800',
}

const toneIcon: Record<CheckTone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: TriangleAlert,
  error: XCircle,
}

export default function BackendStatusChecker({ compact = false }: { compact?: boolean }) {
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin')
  const checksQuery = useQuery({
    queryKey: ['backend-status-checks'],
    queryFn: runBackendChecks,
    enabled: isAdmin,
    staleTime: 30_000,
    retry: false,
  })

  if (!isAdmin) return null

  const checks = checksQuery.data || []
  const errorCount = checks.filter((item) => item.tone === 'error').length
  const warnCount = checks.filter((item) => item.tone === 'warn').length

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Backend Health</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Status Supabase</h2>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {checksQuery.isLoading
              ? 'Mengecek Auth, Storage, Function, dan wallet...'
              : errorCount
                ? `${errorCount} error perlu dibereskan.`
                : warnCount
                  ? `${warnCount} warning perlu dicek.`
                  : 'Semua koneksi utama terlihat siap.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => checksQuery.refetch()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"
          title="Refresh status backend"
        >
          {checksQuery.isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </button>
      </div>

      <div className={`mt-4 grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {checksQuery.isLoading ? (
          Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : checks.map((check) => {
          const Icon = toneIcon[check.tone]
          return (
            <div key={check.id} className={`rounded-2xl border p-3 ${toneClass[check.tone]}`}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <p className="truncate text-xs font-black uppercase tracking-wide">{check.label}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4 opacity-80">{check.detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
