import { Home, User, Moon, Sun, Wand2, Bookmark, ShoppingBag, BookOpen, ChefHat } from 'lucide-react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '../../store'

const TopNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: 'Social' },
    { path: '/recipes', icon: ChefHat, label: 'Resep' },
    { path: '/favorites', icon: Bookmark, label: 'Favorit' },
    { path: '/daftar-belanja', icon: ShoppingBag, label: 'Belanja' },
    { path: '/fridge', icon: Wand2, label: 'Scanner' },
    { path: '/learning', icon: BookOpen, label: 'Belajar' },
  ]

  return (
    <div className="w-full px-6 py-4">
      <nav className="mx-auto flex h-16 w-full max-w-[1480px] items-center justify-between rounded-[28px] border border-cyan-100 bg-white px-5 shadow-sm">
        <Link to="/" className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
            <Home className="h-5 w-5" />
          </span>
          Cook<span className="-ml-2 text-primary">Edu</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-black transition ${
                  isActive
                    ? 'bg-cyan-50 text-primary shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-primary"
            title="Ganti tema"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            className="flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:bg-primary-dark"
          >
            <User className="h-4 w-4" />
            {isAuthenticated ? 'Profil' : 'Masuk'}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default TopNav
