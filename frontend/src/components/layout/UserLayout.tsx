import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import AiAssistant from '../chat/AiAssistant'

// Immersive premium deep ocean assets
import bgOcean from '../../assets/background/#MyStyle25.jpg'
import bgSunlight from '../../assets/background/Random but Beautiful.jpg'
import bgBatik from '../../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg'

export default function UserLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen transition-colors duration-500 overflow-x-hidden font-sans relative">
      <AiAssistant />

      {/* IMMERSIVE GLOBAL DEEP OCEAN PARALLAX BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1. Deep Ocean main backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 scale-[1.03]"
          style={{ backgroundImage: `url(${bgOcean})` }}
        />
        {/* 2. Pulsing underwater sun rays */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25 animate-pulse"
          style={{ backgroundImage: `url(${bgSunlight})`, animationDuration: '14s' }}
        />
        {/* 3. Repeating luxurious Batik lines watermark overlay */}
        <div 
          className="absolute inset-0 bg-repeat opacity-[0.035] mix-blend-overlay"
          style={{ backgroundImage: `url(${bgBatik})`, backgroundSize: '360px' }}
        />
        {/* 4. Ambient light highlights */}
        <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-cyan-950/40 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-950/35 blur-[120px] rounded-full" />
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
