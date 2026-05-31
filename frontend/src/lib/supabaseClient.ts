import { createClient, type Session, type User as SupabaseUser } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lhjdwmkceagdtnexiuek.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_op-f5Jm7s_mNst1Axg0m8Q_HvyjuPLy'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type CookEduProfile = {
  id: string
  username: string
  phone?: string | null
  avatar_url?: string | null
  role?: 'user' | 'premium' | 'admin'
  xp?: number | null
  preferences?: Record<string, unknown> | null
  updated_at?: string | null
}

export function getSupabaseAuthMessage(error: unknown, fallback: string) {
  const err = error as { message?: string; status?: number; code?: string } | null
  const message = err?.message || ''
  const normalized = message.toLowerCase()

  if (err?.status === 429 || normalized.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Supabase sedang membatasi email konfirmasi. Tunggu sekitar 1 jam, atau matikan Confirm email sementara di Supabase Auth untuk testing.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau kata sandi belum cocok. Jika baru daftar, cek email konfirmasi dulu atau buat akun baru di Supabase.'
  }

  if (normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed')) {
    return 'Email belum dikonfirmasi. Cek inbox/spam, klik link konfirmasi, lalu login lagi.'
  }

  if (normalized.includes('user already registered') || normalized.includes('already registered')) {
    return 'Email ini sudah terdaftar. Silakan login, atau reset kata sandi jika lupa.'
  }

  return message || fallback
}

export function getSupabaseUserName(user?: SupabaseUser | null, profile?: Partial<CookEduProfile> | null) {
  const metadata = user?.user_metadata || {}
  return (
    profile?.username ||
    metadata.username ||
    metadata.name ||
    metadata.full_name ||
    user?.email?.split('@')[0] ||
    'Koki CookEdu'
  )
}

function getSafeProfileUsername(user: SupabaseUser, profile?: Partial<CookEduProfile> | null) {
  const candidate = getSupabaseUserName(user, profile).trim()
  return candidate.length >= 2 ? candidate : `koki-${user.id.slice(0, 8)}`
}

export async function getProfileForSession(session?: Session | null) {
  if (!supabase || !session?.user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    console.warn('CookEdu profile lookup failed:', error.message)
    return null
  }

  return data as CookEduProfile | null
}

function isMissingColumnError(error: unknown) {
  const err = error as { code?: string; message?: string } | null
  return err?.code === 'PGRST204' || /column .* does not exist|Could not find .* column/i.test(err?.message || '')
}

export async function upsertProfileForUser(user: SupabaseUser, values: Partial<CookEduProfile> = {}) {
  if (!supabase) return null

  const username = getSafeProfileUsername(user, values)
  const payload = {
    id: user.id,
    username,
    phone: values.phone ?? null,
    avatar_url: values.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    xp: values.xp ?? 0,
    preferences: values.preferences ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error && isMissingColumnError(error)) {
    const { data: legacyData, error: legacyError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        avatar_url: values.avatar_url ?? user.user_metadata?.avatar_url ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select('*')
      .single()

    if (legacyError) throw legacyError
    return legacyData as CookEduProfile
  }

  if (error) throw error
  return data as CookEduProfile
}

export async function uploadPublicMedia(bucket: 'avatars' | 'recipe-media' | 'comment-attachments', file: File, userId: string) {
  if (!supabase) throw new Error('Supabase is not configured')

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${crypto.randomUUID()}.${extension}`
  const filePath = `${userId}/${safeName}`

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}
