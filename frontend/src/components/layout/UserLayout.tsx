import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import AiAssistant from '../chat/AiAssistant'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

// Immersive premium deep ocean assets
import bgOcean from '../../assets/background/MyStyle25.jpg'
import bgSunlight from '../../assets/background/Random but Beautiful.jpg'
import bgBatik from '../../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg'

export default function UserLayout() {
  const location = useLocation()

  // Spring-smoothed mouse coordinate trackers
  const mouseX = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 })
  const mouseY = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 })

  // Parallax transforms representing varying visual depth gains and inverse directions
  const bgOceanX = mouseX
  const bgOceanY = mouseY

  const bgSunlightX = useTransform(mouseX, (x) => x * -1.5)
  const bgSunlightY = useTransform(mouseY, (y) => y * -1.5)

  const bgBatikX = useTransform(mouseX, (x) => x * 0.4)
  const bgBatikY = useTransform(mouseY, (y) => y * 0.4)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const normX = e.clientX / innerWidth - 0.5
      const normY = e.clientY / innerHeight - 0.5
      
      mouseX.set(normX * 50)
      mouseY.set(normY * 50)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * -25,
      floatRange: Math.random() * 50 + 20,
      glow: Math.random() > 0.4 ? 'from-cyan-400 to-teal-300' : 'from-blue-300 to-teal-400'
    }))
  }, [])

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden font-sans relative text-slate-100 selection:bg-teal-500/30 bg-[#020b18]">
      <AiAssistant />

      {/* IMMERSIVE GLOBAL DEEP OCEAN PARALLAX BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020b18]">
        {/* 1. Deep Ocean main backdrop */}
        <motion.div 
          style={{ 
            x: bgOceanX, 
            y: bgOceanY,
            backgroundImage: `url(${bgOcean})`
          }}
          className="absolute inset-[-50px] bg-cover bg-center opacity-40 lg:opacity-30 scale-[1.05]" 
        />

        {/* 2. Pulsing sunlight underwater overlay */}
        <motion.div 
          style={{ 
            x: bgSunlightX, 
            y: bgSunlightY,
            backgroundImage: `url(${bgSunlight})`
          }}
          animate={{ opacity: [0.10, 0.25, 0.10] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-50px] bg-cover bg-center mix-blend-overlay"
        />

        {/* 3. Repeating luxurious Batik lines watermark overlay */}
        <motion.div 
          style={{ 
            x: bgBatikX, 
            y: bgBatikY,
            backgroundImage: `url(${bgBatik})`,
            backgroundSize: '360px'
          }}
          className="absolute inset-[-50px] bg-repeat opacity-[0.02] mix-blend-overlay"
        />

        {/* 4. Ambient light highlights */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-950/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-teal-950/20 blur-[120px] rounded-full" />

        {/* 5. Bioluminescent floating plankton engine */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute bg-gradient-to-tr ${p.glow} rounded-full blur-[2px] opacity-[0.25]`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              y: [0, -p.floatRange, 0],
              x: [0, Math.sin(p.id) * 20, 0],
              opacity: [0.10, 0.45, 0.10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* STRUCTURED INTERFACE LAYER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* DESKTOP HEADER NAVIGATION */}
        <div className="hidden lg:block border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto">
            <TopNav />
          </div>
        </div>

        {/* RESPONSIVE MAIN CONTENT HUB */}
        {/* Perubahan: Ditambahkan pb-28 di mobile agar ujung bawah konten tidak tertutup BottomNav */}
        <main className="flex-1 relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-8 z-10">
          <div className="w-full h-full lg:bg-slate-950/15 lg:backdrop-blur-[2px] lg:border lg:border-white/5 lg:rounded-3xl lg:p-6 transition-all duration-300">
            <Outlet />
          </div>
        </main>

        {/* ANDROID/MOBILE NAVIGATION (Floating Fixed Bottom) */}
        {/* Perubahan: Nilai z-index dinaikkan secara ekstrem ke z-[999] agar mutlak berada di lapisan teratas */}
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-gradient-to-t from-[#020b18] via-[#020b18]/95 to-transparent pt-8 pb-4 px-4 pointer-events-none">
          <div className="max-w-md mx-auto shadow-2xl shadow-black/80 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 overflow-hidden pointer-events-auto">
            <BottomNav />
          </div>
        </div>

      </div>
    </div>
  )
}