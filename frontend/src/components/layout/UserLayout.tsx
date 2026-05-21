import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBreakpoint } from '../../hooks/useResponsive'
import AiAssistant from '../chat/AiAssistant'
import BottomNav from './BottomNav'
import { Home, Bookmark, ShoppingBag, Wand2, Search, User, Sun, Moon } from 'lucide-react'
import { useThemeStore, useAuthStore } from '../../store'

const navItems = [
  { path: '/', icon: Home, label: 'Beranda' },
  { path: '/catatan-ibu', icon: Bookmark, label: 'Catatan Ibu' },
  { path: '/daftar-belanja', icon: ShoppingBag, label: 'Belanja' },
  { path: '/fridge', icon: Wand2, label: 'Kulkas' },
]

function DesktopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      {/* Sidebar Navigation */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col z-50">
        <div className="p-6">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            Cook<span className="text-teal-600 dark:text-teal-400">Edu</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            <span>Tema Gelap</span>
          </button>
          
          <button
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 dark:bg-teal-600 text-white font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            {isAuthenticated ? <User className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            <span>{isAuthenticated ? 'Profil Saya' : 'Masuk'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 min-h-[calc(100vh-5rem)]">
          <Outlet />
        </div>
      </main>
      
      <AiAssistant />
    </div>
  )
}

function MobileLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      <main className="pb-28">
        <Outlet />
      </main>

      <BottomNav />
      <AiAssistant />
    </div>
  )
}

export default function UserLayout() {
  const breakpoint = useBreakpoint()
  const isDesktop = breakpoint === 'desktop' || breakpoint === 'wide'

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}