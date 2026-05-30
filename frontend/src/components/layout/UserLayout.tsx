import { useEffect, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import AiAssistant from '../chat/AiAssistant'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'

// Immersive premium deep ocean assets
import bgOcean from '../../assets/background/MyStyle25.jpg'
import bgSunlight from '../../assets/background/Random but Beautiful.jpg'
import bgBatik from '../../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg'

export default function UserLayout() {
  const { isMobile, shouldReduceMotion } = useDeviceProfile()
  // Spring-smoothed mouse coordinate trackers
  const mouseX = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 })
  const mouseY = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 })

  const bgSunlightX = useTransform(mouseX, (x) => x * -1.5)
  const bgSunlightY = useTransform(mouseY, (y) => y * -1.5)
  const bgBatikX = useTransform(mouseX, (x) => x * 0.4)
  const bgBatikY = useTransform(mouseY, (y) => y * 0.4)

  useEffect(() => {
    if (isMobile || shouldReduceMotion) {
      mouseX.set(0)
      mouseY.set(0)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const normX = e.clientX / innerWidth - 0.5
      const normY = e.clientY / innerHeight - 0.5
      mouseX.set(normX * 50)
      mouseY.set(normY * 50)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile, mouseX, mouseY, shouldReduceMotion])

  const particles = useMemo(() => {
    if (isMobile || shouldReduceMotion) return []

    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * -25,
      floatRange: Math.random() * 50 + 20,
      glow: Math.random() > 0.4 ? 'from-cyan-400 to-teal-300' : 'from-blue-300 to-teal-400'
    }))
  }, [isMobile, shouldReduceMotion])

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden font-sans relative text-slate-100 bg-[#020b18]">
      <AiAssistant />

      {/* BACKGROUND PARALLAX - lighter on mobile and reduced-motion devices */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={isMobile || shouldReduceMotion ? { backgroundImage: `url(${bgOcean})` } : { x: mouseX, y: mouseY, backgroundImage: `url(${bgOcean})` }}
          className="absolute inset-[-24px] bg-cover bg-center opacity-[0.35] lg:opacity-30 scale-[1.03]"
        />
        <motion.div 
          style={isMobile || shouldReduceMotion ? { backgroundImage: `url(${bgSunlight})` } : { x: bgSunlightX, y: bgSunlightY, backgroundImage: `url(${bgSunlight})` }}
          animate={shouldReduceMotion ? { opacity: 0.12 } : { opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 9, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" }}
          className="absolute inset-[-24px] bg-cover bg-center mix-blend-overlay"
        />
        <motion.div 
          style={isMobile || shouldReduceMotion ? { backgroundImage: `url(${bgBatik})`, backgroundSize: '360px' } : { x: bgBatikX, y: bgBatikY, backgroundImage: `url(${bgBatik})`, backgroundSize: '360px' }}
          className="absolute inset-[-24px] bg-repeat opacity-[0.015] mix-blend-overlay"
        />
        {!isMobile && !shouldReduceMotion && (
          <>
            <div className="absolute top-[-10%] right-[-10%] w-[520px] h-[520px] bg-cyan-950/[0.16] blur-[100px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[480px] h-[480px] bg-teal-950/[0.16] blur-[96px] rounded-full" />
          </>
        )}
        
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute bg-gradient-to-tr ${p.glow} rounded-full blur-[2px] opacity-[0.25]`}
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ y: [0, -p.floatRange, 0], x: [0, Math.sin(p.id) * 20, 0], opacity: [0.10, 0.45, 0.10], scale: [1, 1.1, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* LAYER INTERFACE UTAMA */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* TOP NAV DESKTOP */}
        <div className="hidden lg:block border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto">
            <TopNav />
          </div>
        </div>

        {/* KONTEN HALAMAN (OUTLET) - Diberi padding bawah (pb-28) agar tidak tertutup menu mobile */}
        <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-8">
          <div className="w-full h-full lg:bg-slate-950/15 lg:backdrop-blur-[2px] lg:border lg:border-white/5 lg:rounded-3xl lg:p-6">
            <Outlet />
          </div>
        </main>

        {/* BOTTOM NAV MOBILE */}
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-gradient-to-t from-[#020b18] via-[#020b18]/90 to-transparent pt-12 pb-4 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <BottomNav />
          </div>
        </div>

      </div>
    </div>
  )
}
