import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../lib/api'
import { 
  ChefHat, Home, BookOpen, User, LogOut, LogIn, UserPlus,
  Search, Bell, Settings
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/recipes', icon: ChefHat, label: 'Recipes', end: false },
  { to: '/lessons', icon: BookOpen, label: 'Lessons', end: false },
  { to: '/profile', icon: User, label: 'Profile', end: false },
]

export default function DesktopLayout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] grid-cols-[280px_1fr] bg-slate-50">
      {/* Header - spans full width */}
      <header className="col-span-2 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="h-20 px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Cook<span className="text-cyan-600">Edu</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Desktop Platform
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipes, lessons, or ingredients..."
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="w-11 h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                  <Bell className="w-5 h-5 text-slate-600" />
                </button>
                <button className="w-11 h-11 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors">
                  <Settings className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-3 pl-3 ml-3 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - fixed height, scrollable */}
      <aside className="bg-white border-r border-slate-200 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        <nav className="p-6 space-y-2">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider px-4 mb-4">
            Navigation
          </div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="text-sm font-bold">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <div className="h-px bg-slate-200 my-6" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-bold">Logout</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">CookEdu Pro</p>
                <p className="text-xs text-slate-600">Upgrade for more</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all">
              Learn More
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="bg-slate-50 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer - spans full width */}
      <footer className="col-span-2 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black text-slate-900">CookEdu</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your culinary education platform for mastering cooking skills and discovering amazing recipes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} CookEdu. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-600 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-600 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-600 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-cyan-600 transition-colors">
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
