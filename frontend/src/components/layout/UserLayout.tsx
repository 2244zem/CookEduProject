import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import AiAssistant from '../chat/AiAssistant'
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
      // Normalize position to range [-0.5, 0.5]
      const normX = e.clientX / innerWidth - 0.5
      const normY = e.clientY / innerHeight - 0.5
      
      mouseX.set(normX * 50) // Max 50px translational shift
      mouseY.set(normY * 50)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Pre-calculate bioluminescent floating plankton coordinates to prevent garbage collection hiccups
  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 4, // 4px to 12px
      left: Math.random() * 100, // % width
      top: Math.random() * 100, // % height
      duration: Math.random() * 18 + 12, // 12s to 30s drift cycles
      delay: Math.random() * -25, // pre-start
      floatRange: Math.random() * 50 + 20, // vertical translation px
      glow: Math.random() > 0.4 ? 'from-cyan-400 to-teal-300' : 'from-blue-300 to-teal-400'
    }))
  }, [])

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden font-sans relative">
      <AiAssistant />
      <BottomNav />

      {/* IMMERSIVE GLOBAL DEEP OCEAN PARALLAX BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#010813]">
        {/* 1. Deep Ocean main backdrop (shifts matching cursor directions) */}
        <motion.div 
          style={{ 
            x: bgOceanX, 
            y: bgOceanY,
            backgroundImage: `url(${bgOcean})`
          }}
          className="absolute inset-[-50px] bg-cover bg-center opacity-85 scale-[1.05]"
        />

        {/* 2. Pulsing sunlight underwater overlay (shifts inversely to simulate immersive 3D depth) */}
        <motion.div 
          style={{ 
            x: bgSunlightX, 
            y: bgSunlightY,
            backgroundImage: `url(${bgSunlight})`
          }}
          animate={{ opacity: [0.18, 0.35, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-50px] bg-cover bg-center mix-blend-overlay"
        />

        {/* 3. Repeating luxurious Batik lines watermark overlay (shifts with subtle speed) */}
        <motion.div 
          style={{ 
            x: bgBatikX, 
            y: bgBatikY,
            backgroundImage: `url(${bgBatik})`,
            backgroundSize: '360px'
          }}
          className="absolute inset-[-50px] bg-repeat opacity-[0.03] mix-blend-overlay"
        />

        {/* 4. Ambient light highlights */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-950/40 blur-[135px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-teal-950/35 blur-[125px] rounded-full" />

        {/* 5. Bioluminescent floating plankton engine */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute bg-gradient-to-tr ${p.glow} rounded-full blur-[2px] opacity-[0.35]`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
            animate={{
              y: [0, -p.floatRange, 0],
              x: [0, Math.sin(p.id) * 20, 0],
              opacity: [0.15, 0.55, 0.15],
              scale: [1, 1.2, 1],
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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Page Content */}
        <main className="flex-1 relative z-10 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
