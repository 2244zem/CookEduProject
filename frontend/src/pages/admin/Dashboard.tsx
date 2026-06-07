import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../lib/api'
import { StatSkeleton } from '../../components/ui/Skeleton'
import { 
  Users, ChefHat, BookOpen, TrendingUp, Award, 
  Activity, HeartPulse, FileWarning, Zap, 
  ArrowUpRight, Terminal 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useDebugStore } from '../../store/debugStore'

const StatCard = ({ title, value, icon: Icon, color, trend, className = '' }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-white dark:bg-surface-card p-6 md:p-8 rounded-[35px] md:rounded-[40px] shadow-premium border border-gray-100 dark:border-white/5 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 blur-2xl group-hover:opacity-10 transition-opacity`} />
    <div className="flex items-center justify-between mb-4 md:mb-6">
       <div className={`p-3 md:p-4 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 ')} flex items-center justify-center`}>
          <Icon className={`${color.replace('bg-', 'text-')} w-5 h-5 md:w-6 md:h-6`} />
       </div>
       {trend && (
         <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] md:text-[10px] font-black tracking-widest">
            <ArrowUpRight className="w-3 h-3" /> {trend}
         </div>
       )}
    </div>
    <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
    <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{value ?? 0}</h3>
  </motion.div>
);

const HealthIndicator = ({ label, value, status }: { label: string, value: string, status: 'healthy' | 'warning' | 'critical' }) => {
  const colors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500'
  }
  return (
    <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 dark:bg-white/5 rounded-2xl md:rounded-3xl border border-transparent hover:border-primary/20 transition-all">
       <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${colors[status]} shadow-lg animate-pulse`} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-text-secondary truncate max-w-[120px] md:max-w-none">{label}</span>
       </div>
       <span className="text-[10px] md:text-xs font-black">{value}</span>
    </div>
  )
}

export default function Dashboard() {
  const { logs } = useDebugStore()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardApi.stats(),
  })

  const stats = data?.data?.stats
  const userGrowth = data?.data?.user_growth || []
  const recentActivity = data?.data?.recent_activity || []

  // Performance calculation
  const avgLatency = logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + log.duration, 0) / logs.length) : 0

  if (isLoading) {
    return (
      <div className="space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8 md:space-y-12 pb-24 md:pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">Dashboard</h1>
           <p className="text-text-secondary font-bold text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2">
             <Activity className="w-4 h-4 text-primary" /> 
             <span className="truncate">Real-time Platform Overview</span>
           </p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white dark:bg-surface-card px-4 md:px-6 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-3 md:gap-4 flex-1 md:flex-none">
              <Zap className={`w-4 h-4 md:w-5 md:h-5 ${avgLatency > 1000 ? 'text-red-500' : 'text-primary'} animate-pulse`} />
              <div>
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Latency</p>
                 <p className="text-[10px] md:text-xs font-black">{avgLatency}ms</p>
              </div>
           </div>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
        <StatCard title="Total Users" value={stats?.total_users} icon={Users} color="bg-blue-500" trend="+12%" className="col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-500/5 to-blue-600/10" />
        <StatCard title="Total Recipes" value={stats?.total_recipes} icon={ChefHat} color="bg-orange-500" trend="+5%" className="col-span-1" />
        <StatCard title="Modules" value={stats?.total_lessons} icon={BookOpen} color="bg-green-500" className="col-span-1" />
        <StatCard title="Quizzes" value={stats?.quiz_completions} icon={Award} color="bg-red-500" className="col-span-1" />
        <StatCard title="New Users" value={stats?.new_users_this_month} icon={TrendingUp} color="bg-purple-500" trend="+24%" className="col-span-1 lg:col-span-2" />
        <StatCard title="Active" value="124" icon={Zap} color="bg-primary" className="col-span-2 lg:col-span-1" />
      </div>

      {/* Bento Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         {/* Growth Chart - Span 2 */}
         <div className="lg:col-span-2 bg-white dark:bg-surface-card p-6 md:p-10 rounded-[35px] md:rounded-[50px] shadow-premium border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-8 md:mb-10">
               <h3 className="text-xl md:text-2xl font-black tracking-tight">Analytics</h3>
               <select className="bg-gray-100 dark:bg-white/5 border-none rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-4 py-2 focus:ring-0">
                  <option>6 Months</option>
                  <option>Year</option>
               </select>
            </div>
            <div className="h-[250px] min-h-[240px] min-w-[1px] w-full md:h-[350px]">
               {userGrowth.length ? (
                 <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={userGrowth}>
                       <defs>
                          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2A4D88" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#2A4D88" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#7C94B8', fontSize: 10, fontWeight: 700}} dy={10} />
                       <YAxis hide />
                       <Tooltip
                          contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '15px', color: '#fff', fontSize: '10px' }}
                          itemStyle={{ color: '#2A4D88' }}
                       />
                       <Area type="monotone" dataKey="count" stroke="#2A4D88" strokeWidth={4} fill="url(#growthGrad)" />
                    </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="flex h-full items-center justify-center rounded-[28px] bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400">
                   No analytics data
                 </div>
               )}
            </div>
         </div>

         {/* Health Check */}
         <div className="bg-white dark:bg-surface-card p-6 md:p-10 rounded-[35px] md:rounded-[50px] shadow-premium border border-gray-100 dark:border-white/5 flex flex-col">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3"><HeartPulse className="text-red-500 w-5 h-5 md:w-6 md:h-6" /> Health</h3>
            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1">
               <HealthIndicator label="Images" value="98.5%" status="healthy" />
               <HealthIndicator label="Latency" value="1.2s" status="warning" />
               <HealthIndicator label="DB Sync" value="OK" status="healthy" />
               <HealthIndicator label="Cache" value="45%" status="critical" />
            </div>
            <div className="p-4 md:p-6 bg-red-500/10 rounded-2xl md:rounded-3xl border border-red-500/20">
               <div className="flex items-center gap-2 mb-2">
                  <FileWarning className="text-red-500 w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-red-500">Alert</span>
               </div>
               <p className="text-[9px] md:text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed">Detected broken assets. Action required.</p>
            </div>
         </div>
      </div>

      {/* Bento Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         {/* Optimizer - Span 1 */}
         <div className="lg:col-span-1 bg-black text-white p-6 md:p-10 rounded-[35px] md:rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4 md:mb-6" />
            <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 tracking-tight">AI Health Monitor</h3>
            <p className="text-[11px] md:text-[13px] text-gray-400 font-bold leading-relaxed mb-6 md:mb-8">Ada 2 video tutorial yang link-nya mati, bos. Trafik tinggi terdeteksi di modul "Pasta". Mau saya carikan cadangannya & cache endpoint-nya?</p>
            <button className="w-full py-3 md:py-4 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Lakukan Tindakan AI</button>
         </div>

         {/* Activity - Span 2 */}
         <div className="lg:col-span-2 bg-white dark:bg-surface-card p-6 md:p-10 rounded-[35px] md:rounded-[50px] shadow-premium border border-gray-100 dark:border-white/5">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8">Terminal Logs (Real-time)</h3>
            <div className="space-y-3 md:space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 font-mono">
               {recentActivity.map((log: any, i: number) => (
                 <div key={i} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50/50 dark:bg-black/20 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="w-8 h-8 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mt-1">
                       <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                          <span className="text-primary mr-2">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                          <span className="text-purple-500">[{log.user?.name || 'SYSTEM'}]</span> {log.action}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}
