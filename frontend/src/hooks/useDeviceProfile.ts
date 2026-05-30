import { useEffect, useState } from 'react'

type DeviceProfile = {
  isAndroid: boolean
  isMobile: boolean
  isDesktop: boolean
  shouldReduceMotion: boolean
  prefersReducedMotion: boolean
}

function getDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return {
      isAndroid: false,
      isMobile: false,
      isDesktop: true,
      shouldReduceMotion: false,
      prefersReducedMotion: false,
    }
  }

  const width = window.innerWidth
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isAndroid = userAgent.includes('android')
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lowCoreDevice = typeof window.navigator.hardwareConcurrency === 'number'
    ? window.navigator.hardwareConcurrency <= 4
    : false
  const isMobile = width < 900 || isAndroid || isCoarsePointer

  return {
    isAndroid,
    isMobile,
    isDesktop: !isMobile,
    prefersReducedMotion,
    shouldReduceMotion: prefersReducedMotion || isMobile || lowCoreDevice,
  }
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState<DeviceProfile>(() => getDeviceProfile())

  useEffect(() => {
    const update = () => setProfile(getDeviceProfile())
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerQuery = window.matchMedia('(pointer: coarse)')

    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    motionQuery.addEventListener('change', update)
    pointerQuery.addEventListener('change', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      motionQuery.removeEventListener('change', update)
      pointerQuery.removeEventListener('change', update)
    }
  }, [])

  return profile
}
