import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Search, Sparkles, ChefHat } from 'lucide-react'
import { motion } from 'framer-motion'
import { BottomNav } from './BottomNav'
import bgHero from '../../assets/background.png'
import bgPattern from '../../assets/food_drawing.jpg'
import AiAssistant from '../chat/AiAssistant'

export default function UserLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '')
  
  const isHome = location.pathname === '/'

  useEffect(() => {
    const q = queryParams.get('q') || ''
    if (q !== searchQuery) setSearchQuery(q)
  }, [location.search])

  const handleSearch = (val: string) => {
    setSearchQuery(val)
    const params = new URLSearchParams(location.search)
    if (val) params.set('q', val)
    else params.delete('q')
    
    if (!isHome) navigate(`/?${params.toString()}`)
    else navigate(`/?${params.toString()}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface transition-colors duration-500 overflow-x-hidden font-sans relative">
      <AiAssistant />

      {/* Cinematic Background Layer - Match Login/Register */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img src={bgHero} alt="" className="w-full h-full object-cover opacity-10 scale-125 animate-float-slow" />
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface/80 to-primary/10 dark:from-primary/20 dark:via-black/80 dark:to-primary/5" />
         
         {/* Drifting Clouds - Slower for reduced anxiety */}
         <motion.div animate={{ x: [-50, 50], y: [-20, 20] }} transition={{ duration: 45, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-white blur-[120px] rounded-full opacity-60" />
         <motion.div animate={{ x: [50, -50], y: [20, -20] }} transition={{ duration: 55, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Masterpiece Floating Header */}
        <header className="sticky top-0 z-50 w-full p-4 md:p-6 transition-all duration-300">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-4xl mx-auto bg-white/40 dark:bg-white/5 backdrop-blur-2xl rounded-[32px] md:rounded-[48px] p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 dark:border-white/10 overflow-hidden relative"
          >
            {/* Subtle Pattern Overlay */}
            <img src={bgPattern} alt="" className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none mix-blend-overlay" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-[24px] overflow-hidden border border-white/80 shadow-premium relative group">
                   <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                   {user?.avatar_url ? (
                     <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-primary font-black text-xl">
                        {user?.name?.charAt(0).toUpperCase() || <ChefHat className="w-6 h-6" />}
                     </div>
                   )}
                </div>
                <div>
                   <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      <p className="text-[11px] font-semibold text-gray-500">Halo,</p>
                   </div>
                   <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-none mt-1">{user?.name || 'Chef Guest'}</h2>
                </div>
              </div>
              
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                 <Search className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Floating Glass Search Pill */}
            <div className="relative group mt-2">
               <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <div className="relative bg-white/70 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-full p-1.5 flex items-center shadow-sm group-focus-within:border-primary/30 transition-all">
                  <input 
                    type="text" 
                    placeholder="Ingin memasak apa hari ini?" 
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none text-[14px] font-medium px-5 focus:outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
                  />
                  <button className="h-10 px-6 bg-gradient-to-r from-primary to-primary-dark text-white text-[12px] font-bold rounded-full shadow-sm hover:shadow-md transition-all">Cari Resep</button>
               </div>
            </div>
          </motion.div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative z-10 px-4 md:px-6 pb-32 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
