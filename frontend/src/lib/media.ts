const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lhjdwmkceagdtnexiuek.supabase.co'

function getApiPublicBaseUrl() {
  const raw = import.meta.env.VITE_API_URL || ''
  if (!raw) return ''

  let url = raw.trim()
  const legacyHostPattern = ['railway', 'app'].join('.')
  if (url.includes(legacyHostPattern) && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  return url.replace(/\/api\/?$/i, '').replace(/\/$/, '')
}

export function resolveMediaUrl(value?: string | null) {
  if (!value) return ''
  const raw = value.trim()
  if (!raw) return ''

  if (/^https?:\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw
  }

  if (raw.startsWith('//')) {
    return `https:${raw}`
  }

  const cleanPath = raw.replace(/^\/+/, '')

  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseProjectUrl.replace(/\/$/, '')}/${cleanPath}`
  }

  const storageBucketMatch = cleanPath.match(/^(avatars|recipe-media|comment-attachments)\//i)
  if (storageBucketMatch) {
    return `${supabaseProjectUrl.replace(/\/$/, '')}/storage/v1/object/public/${cleanPath}`
  }

  const backendBase = getApiPublicBaseUrl()
  if (!backendBase) return `/${cleanPath}`

  const backendPath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`
  return `${backendBase}/${backendPath}`
}

export function avatarFallbackUrl(seed?: string | null) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'CookEdu')}&backgroundColor=b6e3f4`
}

export function withImageFallback(seed?: string | null) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed || 'CookEdu')}&backgroundColor=e0f2fe`
}
