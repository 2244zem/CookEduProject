import { motion } from 'framer-motion'
import { useAuthStore } from '../../store'
import { Award, Target, Zap, TrendingUp, BarChart, Calendar, Trophy, Crown, Medal, User } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

  return (
    <div className="pb-40 pt-12 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-16">
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
        >
          <Award className="w-4 h-4" /> Kembali ke Home
        </motion.button>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none text-text-primary"
        >
          Progres <span className="text-primary">Eksklusif</span>
        </motion.h1>
        <p className="text-text-secondary text-lg font-bold max-w-2xl leading-relaxed">
          Pantau pencapaian kuliner Anda dan jadilah Master Chef berikutnya di leaderboard komunitas.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-surface-card p-8 rounded-[45px] shadow-premium border border-gray-100 dark:border-white/5 flex flex-col items-center text-center group"
          >
            <div className={`w-16 h-16 ${stat.bg} rounded-[24px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.label}</span>
            <span className="text-2xl font-black text-text-primary">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-surface-card rounded-[55px] p-10 shadow-premium border border-gray-100 dark:border-white/5"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Statistik XP</h3>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Aktivitas 7 Hari Terakhir</p>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00B4D8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB33" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      border: 'none', 
                      borderRadius: '20px', 
                      color: '#fff',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                  />
                  <Area type="monotone" dataKey="xp" stroke="#00B4D8" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary text-white rounded-[50px] p-10 shadow-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <Calendar className="w-12 h-12 mb-6 opacity-40" />
            <h3 className="text-3xl font-black mb-4 leading-tight">Ritme Kuliner</h3>
            <p className="text-white/70 font-bold leading-relaxed mb-8">Anda sudah memasak selama 7 hari berturut-turut. Pertahankan streak Anda untuk membuka lencana "Iron Chef".</p>
            <button className="px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">Lihat Koleksi Badge</button>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-surface-card rounded-[55px] p-10 shadow-premium border border-gray-100 dark:border-white/5 h-full"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Leaderboard</h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Master of Kitchen</p>
              </div>
            </div>

            <div className="space-y-4">
              {leaderboard.sort((a,b) => b.xp - a.xp).map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-4 rounded-[25px] transition-all ${
                    item.isMe ? 'bg-primary/10 border border-primary/20 scale-[1.05]' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center relative">
                      {i === 0 ? <Crown className="w-6 h-6 text-accent" /> : i === 1 ? <Medal className="w-6 h-6 text-gray-400" /> : i === 2 ? <Medal className="w-6 h-6 text-orange-400" /> : <span className="text-xs font-black text-gray-400">{i + 1}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-black ${item.isMe ? 'text-primary' : 'text-text-primary'}`}>{item.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.xp} XP</p>
                    </div>
                  </div>
                  {item.isMe && (
                    <div className="px-3 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-full">You</div>
                  )}
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-gray-50 dark:bg-white/5 text-text-secondary font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Lihat Semua Peringkat</button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
