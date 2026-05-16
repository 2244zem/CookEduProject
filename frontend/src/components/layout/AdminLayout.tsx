import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../lib/api'
import { 
  LayoutDashboard, ChefHat, BookOpen, FileText, 
  LogOut, Menu, X, Bell, Activity,
  ChevronRight, Search
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DebugOverlay from '../debug/DebugOverlay'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/recipes', icon: ChefHat, label: 'Recipes', end: false },
  { to: '/admin/lessons', icon: BookOpen, label: 'Education', end: false },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs', end: false },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
   
  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0A0A0A] font-sans selection:bg-primary selection:text-white">
      <DebugOverlay />
      
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden lg:flex w-80 bg-white dark:bg-surface-card border-r border-gray-100 dark:border-white/5 flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-10 border-b border-gray-50 dark:border-white/5 flex items-center gap-4">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
              <ChefHat className="w-6 h-6 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter">Cook<span className="text-primary">Edu</span></h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Control</p>
           </div>
        </div>

        <nav className="flex-1 p-8 space-y-3">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-300 group ${
                  isActive
                    ? 'bg-primary text-white shadow-glow scale-[1.02]'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
              <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
            </NavLink>
          ))}
        </nav>

        <div className="p-8 border-t border-gray-50 dark:border-white/5">
           <div className="bg-gray-50 dark:bg-white/5 rounded-[30px] p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                    {user?.name?.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{user?.name}</p>
                    <p className="text-[8px] text-gray-400 uppercase font-bold truncate">Ultimate Admin</p>
                 </div>
              </div>
              <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Logout</button>
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
