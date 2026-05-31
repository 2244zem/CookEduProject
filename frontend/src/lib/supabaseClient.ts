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

export async function getProfileForSession(session?: Session | null) {
  if (!supabase || !session?.user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, phone, avatar_url, role, xp, preferences, updated_at')
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    console.warn('CookEdu profile lookup failed:', error.message)
    return null
  }

  return data as CookEduProfile | null
}

export async function upsertProfileForUser(user: SupabaseUser, values: Partial<CookEduProfile> = {}) {
  if (!supabase) return null

  const username = getSupabaseUserName(user, values)
  const payload = {
    id: user.id,
    username,
    phone: values.phone ?? null,
    avatar_url: values.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    role: values.role || 'user',
    xp: values.xp ?? 0,
    preferences: values.preferences ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, username, phone, avatar_url, role, xp, preferences, updated_at')
    .single()

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
