import { motion } from 'framer-motion'
import { BookOpen, ChefHat, Heart, ShoppingBag, User } from 'lucide-react'
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
    <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-white/90 backdrop-blur-3xl border border-white/70 rounded-[32px] py-2 px-5 shadow-xl flex items-center justify-between w-full max-w-sm pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button 
              key={item.id}
              onClick={() => navigate(item.path)} 
              className={`relative p-3 transition-all ${
                isActive 
                  ? "text-sky-600 scale-110" 
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <item.icon className="w-6 h-6 transition-transform duration-300" />
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
