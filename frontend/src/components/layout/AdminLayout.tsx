import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { 
  LayoutDashboard, ChefHat, BookOpen, FileText, 
  LogOut, Menu, X, Bell, Activity,
  ChevronRight, Search, Coins
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DebugOverlay from '../debug/DebugOverlay'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/recipes', icon: ChefHat, label: 'Recipes', end: false },
  { to: '/admin/lessons', icon: BookOpen, label: 'Education', end: false },
  { to: '/admin/wallet', icon: Coins, label: 'Wallet', end: false },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs', end: false },
]

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuthStore()
  const pushToast = useToastStore((state) => state.pushToast)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
   
  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!user) return
    if (!isAdmin) {
      pushToast({
        tone: 'error',
        title: 'Akses admin ditolak',
        message: 'Menu admin hanya tersedia untuk akun dengan role admin.',
      })
      navigate('/', { replace: true })
    }
  }, [isAdmin, navigate, pushToast, user])

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-primary selection:text-white">
      <DebugOverlay />
      
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen overflow-hidden z-50">
        <div className="p-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-[20px] flex items-center justify-center shadow-2xl shadow-slate-900/20">
              <ChefHat className="w-6 h-6 text-cyan-400" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900">Cook<span className="text-cyan-600">Edu</span></h1>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">Control Tower</p>
           </div>
        </div>

        <nav className="flex-1 px-8 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] px-6 mb-4 mt-6">Main Command</div>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 group relative ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className={`w-5 h-5 transition-colors ${location.pathname === to ? 'text-cyan-400' : 'group-hover:text-cyan-600'}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
              {location.pathname === to && (
                <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-glow-sm" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-8">
           <div className="bg-slate-50 rounded-[35px] p-6 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 opacity-[0.03] -mr-12 -mt-12 rounded-full" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black shadow-sm group-hover:rotate-12 transition-transform">
                    {user?.name?.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-900 truncate leading-tight">{user?.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Superuser</p>
                 </div>
              </div>
              <button onClick={handleLogout} className="w-full py-4 bg-white border border-slate-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group/btn">
                 <LogOut className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" /> 
                 Logout Session
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white/80 dark:bg-black/40 backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                 <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter">Admin</span>
           </div>
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-gray-400" /></button>
              <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><Menu className="w-5 h-5" /></button>
           </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-24 items-center justify-between px-12 z-30">
           <div className="relative w-96 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input type="text" placeholder="Search data or commands..." className="w-full h-12 bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-2xl pl-14 pr-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
                 <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Server Status: <span className="text-green-500">Optimal</span></span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-surface-card border border-gray-100 dark:border-white/5 flex items-center justify-center relative"><Bell className="w-5 h-5 text-gray-400" /><div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-card" /></div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-10 pb-32">
           <Outlet />
        </main>

        {/* Floating Bottom Nav (Mobile Only) */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 pointer-events-none">
           <motion.nav 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="bg-black/90 backdrop-blur-2xl border border-white/10 h-20 rounded-[35px] flex items-center justify-around px-4 pointer-events-auto shadow-2xl"
           >
             {navItems.map(({ to, icon: Icon, label, end }) => {
               const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to))
               return (
                 <NavLink 
                    key={to} 
                    to={to} 
                    end={end}
                    className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                  >
                    <div className={`transition-all duration-300 ${isActive ? 'text-primary -translate-y-1 scale-110' : 'text-gray-500'}`}>
                       <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'text-primary' : 'text-gray-500'}`}>{label.split(' ')[0]}</span>
                    {isActive && (
                      <motion.div layoutId="admin-active" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                    )}
                 </NavLink>
               )
             })}
             <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 text-red-500 flex-1"><LogOut className="w-6 h-6" /><span className="text-[8px] font-black uppercase tracking-widest">Exit</span></button>
           </motion.nav>
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute inset-y-0 left-0 w-[80vw] bg-white dark:bg-surface-card flex flex-col p-8">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow"><ChefHat className="w-5 h-5" /></div>
                     <span className="font-black text-xl tracking-tighter">CookEdu</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-gray-500"><X className="w-6 h-6" /></button>
               </div>
               
               <div className="flex-1 space-y-4">
                  {navItems.map(({ to, icon: Icon, label, end }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-4 p-5 rounded-[22px] transition-all ${isActive ? 'bg-primary/10 text-primary border border-primary/20 font-black' : 'text-gray-500 font-bold'}`}>
                       <Icon className="w-5 h-5" /> {label}
                    </NavLink>
                  ))}
               </div>

               <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center gap-4 p-4">
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-lg">{user?.name?.charAt(0)}</div>
                     <div><p className="font-black text-sm">{user?.name}</p><p className="text-[10px] text-gray-400 uppercase font-black">System Admin</p></div>
                  </div>
                  <button onClick={handleLogout} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow flex items-center justify-center gap-3"><LogOut className="w-5 h-5" /> Keluar</button>
               </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
