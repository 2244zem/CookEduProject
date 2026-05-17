import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import AiAssistant from '../chat/AiAssistant'

export default function UserLayout() {
  const location = useLocation()
  
  // Routes that handle their own header/nav for a custom premium experience
  const isCustomDesign = ['/', '/recipes/'].some(path => 
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] transition-colors duration-500 overflow-x-hidden font-sans relative">
      <AiAssistant />

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-white to-teal-50/30" />
         
         {/* Subtle Drifting Orbs */}
         <motion.div 
           animate={{ x: [-20, 20], y: [-10, 10] }} 
           transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }} 
           className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-teal-200/20 blur-[100px] rounded-full" 
         />
         <motion.div 
           animate={{ x: [20, -20], y: [10, -10] }} 
           transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }} 
           className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-teal-100/30 blur-[120px] rounded-full" 
         />
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
