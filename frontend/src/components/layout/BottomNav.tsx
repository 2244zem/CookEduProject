import { motion } from 'framer-motion'
import { BookOpen, ChefHat, Heart, ShoppingBag, User, Moon, Sun } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useThemeStore()

  const navItems = [
    { id: "home", path: "/", icon: BookOpen },
    { id: "recipes", path: "/recipes", icon: ChefHat },
    { id: "favorites", path: "/favorites", icon: Heart },
    { id: "shopping", path: "/daftar-belanja", icon: ShoppingBag },
    { id: "profile", path: "/profile", icon: User }
  ]

  return (
    <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/60 dark:border-sky-500/10 rounded-[40px] py-2 px-6 shadow-xl flex items-center justify-between w-full max-w-sm pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)} 
              className={`relative p-3 transition-all ${
                isActive 
                  ? "text-sky-600 dark:text-cyan-400 scale-110" 
                  : "text-slate-400 hover:text-slate-700 dark:text-sky-200/50 dark:hover:text-white"
              }`}
            >
              <item.icon className="w-6 h-6 transition-transform duration-300" />
              {isActive && (
                <motion.div 
                  layoutId="active-tab-nav"
                  className="absolute inset-0 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-500/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}

        <button
          onClick={toggleDarkMode}
          className="relative p-3 transition-all text-slate-400 hover:text-slate-700 dark:text-sky-200/50 dark:hover:text-white active:scale-95"
        >
          <motion.div whileTap={{ rotate: 180, scale: 0.8 }} className="flex items-center justify-center">
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-500" />
            ) : (
              <Moon className="w-6 h-6 text-slate-500 dark:text-sky-200/50" />
            )}
          </motion.div>
        </button>
      </motion.div>
    </nav>
  )
}

export { BottomNav }
export default BottomNav
