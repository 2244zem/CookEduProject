import { motion } from 'framer-motion'
import { BookOpen, ChefHat, Heart, ShoppingBag, User } from '@icons/CookEduIcons'
import { useLocation, useNavigate } from 'react-router-dom'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { id: "home", path: "/", icon: BookOpen },
    { id: "recipes", path: "/recipes", icon: ChefHat },
    { id: "favorites", path: "/favorites", icon: Heart },
    { id: "shopping", path: "/daftar-belanja", icon: ShoppingBag },
    { id: "profile", path: "/profile", icon: User }
  ]

  return (
    <nav className="flex w-full justify-center pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-white/95 backdrop-blur-3xl border border-slate-200/80 rounded-[28px] py-2 px-4 shadow-xl shadow-slate-950/10 flex items-center justify-between w-full max-w-sm pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)} 
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                isActive 
                  ? "text-sky-600 scale-110" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <item.icon className="w-5 h-5 transition-transform duration-300" />
              {isActive && (
                <motion.div 
                  layoutId="active-tab-nav"
                  className="absolute inset-0 bg-sky-50 border border-sky-100 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          )
        })}
      </motion.div>
    </nav>
  )
}

export { BottomNav }
export default BottomNav
