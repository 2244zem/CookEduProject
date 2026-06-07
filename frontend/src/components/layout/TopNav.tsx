import { Home, User, Wand2, Bookmark, ShoppingBag, BookOpen, ChefHat, Coins, ShieldCheck, Sparkles } from '@icons/CookEduIcons'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { useRealtimeWallet } from '../../hooks/useRealtimeWallet'

const TopNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user } = useAuthStore()
  const { balance: walletBalance, loading: walletLoading } = useRealtimeWallet(user?.id)

  const navItems = [
    { path: '/', icon: Home, label: 'Social' },
    { path: '/recipes', icon: ChefHat, label: 'Resep' },
    { path: '/favorites', icon: Bookmark, label: 'Favorit' },
    { path: '/daftar-belanja', icon: ShoppingBag, label: 'Belanja' },
    { path: '/fridge', icon: Wand2, label: 'Scanner' },
    { path: '/ai-lab', icon: Sparkles, label: 'AI Lab' },
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
          {isAuthenticated && (
            <div className="hidden h-11 items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 text-cyan-800 sm:flex">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-wide">{walletLoading ? '...' : walletBalance} Koin</span>
            </div>
          )}
          {isAuthenticated && isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden h-11 items-center gap-2 rounded-2xl bg-yellow-400 px-4 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-yellow-300 md:flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </button>
          )}
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
