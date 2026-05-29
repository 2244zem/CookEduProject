import { motion } from 'framer-motion'
import { Home, User, Search, Moon, Sun, Wand2, Bookmark, ShoppingBag } from 'lucide-react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../../store'
import foodDrawing from '../../assets/food_drawing.jpg'

const TopNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/catatan-ibu', icon: Bookmark, label: 'Catatan' },
    { path: '/daftar-belanja', icon: ShoppingBag, label: 'Belanja' },
    { path: '/fridge', icon: Wand2, label: 'Scanner' },
  ]

  return (
    <div className="sticky top-0 z-50 w-full px-4 py-4 md:px-6">
      <motion.nav 
        initial={{ y: -100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="max-w-7xl mx-auto w-full h-[72px] flex justify-between items-center rounded-[40px] shadow-premium px-6 md:px-8 border-2 border-white/80 dark:border-white/10 relative overflow-hidden"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
           <img src={foodDrawing} alt="" className="w-full h-full object-cover opacity-20" />
           <div className="absolute inset-0 bg-primary/95 dark:bg-black/90 backdrop-blur-md" />
        </div>

        <div className="relative z-10 flex items-center justify-between w-full">
          <Link to="/" className="text-white font-black text-2xl tracking-tighter flex items-center gap-2 drop-shadow-sm">
            Cook<span className="text-teal-200">Edu</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 h-11 rounded-full flex items-center gap-2 transition-all duration-300 outline-none ${
                    isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-black/10 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon 
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`} 
                  />
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-white/80'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-top-glow"
                      className="absolute inset-0 rounded-full bg-white/10 blur-[2px]"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 text-white"
            >
              <motion.div whileTap={{ rotate: 180, scale: 0.8 }}>
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </button>
            <button
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className="px-5 h-10 rounded-full bg-white text-primary font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              {isAuthenticated ? <User className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {isAuthenticated ? 'Profil' : 'Masuk'}
            </button>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}

export default TopNav
