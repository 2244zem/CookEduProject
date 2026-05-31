const APP_CACHE_VERSION = 'cookedu-supabase-profile-v3'
const CACHE_VERSION_KEY = 'cookedu_app_cache_version'
const RELOAD_FLAG_KEY = 'cookedu_cache_rescue_reload'

export async function rescueStaleServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  const currentVersion = localStorage.getItem(CACHE_VERSION_KEY)
  if (currentVersion === APP_CACHE_VERSION) {
    sessionStorage.removeItem(RELOAD_FLAG_KEY)
    return
  }

  localStorage.setItem(CACHE_VERSION_KEY, APP_CACHE_VERSION)

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.update()))

  if (!navigator.serviceWorker.controller) return
  if (sessionStorage.getItem(RELOAD_FLAG_KEY) === APP_CACHE_VERSION) return

  sessionStorage.setItem(RELOAD_FLAG_KEY, APP_CACHE_VERSION)
  await Promise.all(registrations.map((registration) => registration.unregister()))

  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }

  window.location.reload()
}
