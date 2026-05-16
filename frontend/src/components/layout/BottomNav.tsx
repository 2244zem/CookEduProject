import { motion, AnimatePresence } from 'framer-motion'
import { Home, BookOpen, User, Search, Moon, Sun, BarChart3, Wand2, Bookmark, ShoppingBag } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../../store'
import foodDrawing from '../../assets/food_drawing.jpg'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/catatan-ibu', icon: Bookmark, label: 'Catatan' },
    { path: '/daftar-belanja', icon: ShoppingBag, label: 'Belanja' },
    { path: '/fridge', icon: Wand2, label: 'Scanner' },
    { path: isAuthenticated ? '/profile' : '/login', icon: isAuthenticated ? User : Search, label: isAuthenticated ? 'Profil' : 'Masuk' },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-50 pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="mx-auto w-full h-[72px] flex justify-around items-center rounded-[40px] shadow-premium px-3 pointer-events-auto border-2 border-white/80 dark:border-white/10 relative overflow-hidden"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
           <img src={foodDrawing} alt="" className="w-full h-full object-cover opacity-30" />
           <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xl" />
        </div>

        <div className="relative z-10 flex justify-around items-center w-full">
          {navItems.map((item) => {
            if (item.auth && !isAuthenticated) return null
            
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
                  isActive ? 'bg-primary shadow-glow-sm scale-110' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`} 
                />
                {isActive && (
                  <motion.div 
                    layoutId="active-glow"
                    className="absolute inset-0 rounded-full bg-white/20 blur-md"
                  />
                )}
              </button>
            )
          })}

          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-2" />

          <button
            onClick={toggleDarkMode}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <motion.div whileTap={{ rotate: 180, scale: 0.8 }}>
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </motion.div>
          </button>
        </div>
      </motion.nav>
    </div>
  )
}

export { BottomNav }
export default BottomNav
