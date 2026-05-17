import { motion } from 'framer-motion'
import { useAuthStore } from '../../store'
import { 
  Award, Target, Zap, TrendingUp, BarChart, 
  Calendar, Trophy, Crown, Medal, User,
  Bookmark, BookOpen, Snowflake, Globe, Moon
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function Stats() {
  const { user } = useAuthStore()

  const data = [
    { name: 'Sen', xp: 100 },
    { name: 'Sel', xp: 300 },
    { name: 'Rab', xp: 200 },
    { name: 'Kam', xp: 500 },
    { name: 'Jum', xp: 400 },
    { name: 'Sab', xp: 800 },
    { name: 'Min', xp: user?.xp || 1000 },
  ]

  const stats = [
    { label: 'Total XP', value: user?.xp || 0, icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Level', value: Math.floor((user?.xp || 0) / 500) + 1, icon: Award, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Streak', value: '7 Hari', icon: Target, color: 'text-primary-light', bg: 'bg-primary-light/10' },
    { label: 'Modul', value: '12', icon: BarChart, color: 'text-accent', bg: 'bg-accent/10' },
  ]

  const leaderboard = [
    { name: 'Chef Renatta', xp: 12400, rank: 1, avatar: null },
    { name: 'Chef Juna', xp: 11200, rank: 2, avatar: null },
    { name: 'Chef Arnold', xp: 9800, rank: 3, avatar: null },
    { name: user?.name || 'You', xp: user?.xp || 0, rank: 14, isMe: true },
    { name: 'Budi Santoso', xp: 8500, rank: 4, avatar: null },
    { name: 'Siti Aminah', xp: 7200, rank: 5, avatar: null },
  ]

  const navigate = useNavigate()
  const location = useLocation()
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent ${
      isDarkMode ? 'dark text-white' : 'text-slate-800'
    } pb-40`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto pt-12 px-6">
        <div className="mb-16">
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
          >
            <Award className="w-4 h-4" /> Kembali ke Home
          </motion.button>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none"
          >
            Progres <span className="text-primary">Eksklusif</span>
          </motion.h1>
          <p className="text-slate-500 text-lg font-bold max-w-2xl leading-relaxed">
            Pantau pencapaian kuliner Anda dan jadilah Master Chef berikutnya di leaderboard komunitas.
          </p>
        </div>

        {/* ... Rest of stats content (simplified for brevity in this tool call, 
            but I'll keep the grid and chart logic intact) ... */}
        {/* Stat Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/70 backdrop-blur-2xl p-8 rounded-[45px] shadow-premium border border-white flex flex-col items-center text-center group"
            >
              <div className={`w-16 h-16 ${stat.bg} rounded-[24px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</span>
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/70 backdrop-blur-2xl rounded-[55px] p-10 shadow-premium border border-white"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Statistik XP</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Aktivitas 7 Hari Terakhir</p>
                  </div>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB33" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '20px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Area type="monotone" dataKey="xp" stroke="#0891B2" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyan-600 text-white rounded-[50px] p-10 shadow-glow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Calendar className="w-12 h-12 mb-6 opacity-40" />
              <h3 className="text-3xl font-black mb-4 leading-tight">Ritme Kuliner</h3>
              <p className="text-white/70 font-bold leading-relaxed mb-8">Anda sudah memasak selama 7 hari berturut-turut. Pertahankan streak Anda untuk membuka lencana "Iron Chef".</p>
              <button className="px-8 py-4 bg-white text-cyan-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Lihat Koleksi Badge</button>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/70 backdrop-blur-2xl rounded-[55px] p-10 shadow-premium border border-white h-full"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Leaderboard</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Master of Kitchen</p>
                </div>
              </div>

              <div className="space-y-4">
                {leaderboard.sort((a,b) => b.xp - a.xp).map((item, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-between p-4 rounded-[25px] transition-all ${
                      item.isMe ? 'bg-cyan-50 border border-cyan-100 scale-[1.05]' : 'bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center relative">
                        {i === 0 ? <Crown className="w-6 h-6 text-amber-500" /> : i === 1 ? <Medal className="w-6 h-6 text-slate-400" /> : i === 2 ? <Medal className="w-6 h-6 text-orange-400" /> : <span className="text-xs font-black text-slate-400">{i + 1}</span>}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center overflow-hidden">
                        <User className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${item.isMe ? 'text-cyan-600' : 'text-slate-900'}`}>{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.xp} XP</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SHARED NAVIGATION */}
      <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-[40px] py-4 px-8 shadow-2xl flex items-center justify-between w-full max-w-sm ring-1 ring-black/5"
        >
          {[
            { id: "home", path: "/", icon: Bookmark },
            { id: "notes", path: "/catatan-ibu", icon: BookOpen },
            { id: "fridge", path: "/fridge", icon: Snowflake },
            { id: "shopping", path: "/daftar-belanja", icon: Globe },
            { id: "profile", path: "/profile", icon: User },
            { id: "theme", path: "#", icon: Moon }
          ].map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === "theme") setIsDarkMode(!isDarkMode)
                  else navigate(item.path)
                }} 
                className={`relative p-3 transition-all ${isActive ? "text-cyan-500" : "text-slate-400 hover:text-slate-600"}`}
              >
                <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110 shadow-glow-sm" : ""}`} />
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-nav"
                    className="absolute inset-0 bg-cyan-50 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      </nav>
    </div>
  )
}
