import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { 
  FileText, User, Activity, Calendar, Search, 
  Filter, Shield, Clock, Hash, ChevronLeft, 
  ChevronRight, ArrowRight, Database
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuditLog() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['audit-logs', page, action],
    queryFn: () => auditApi.list({ page, action: action || undefined }),
  })

  const logs = auditData?.data?.data || []
  const pagination = auditData?.data

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'updated': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'deleted': return 'bg-rose-50 text-rose-600 border-rose-100'
      case 'restored': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-10 max-w-7xl mx-auto font-sans">
      
      {/* PREMIUM HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
               <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Security Intelligence</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Audit <span className="text-cyan-600">Logs</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg max-w-xl">Monitor platform activities with deep traceability. Every modification, creation, and deletion is recorded here.</p>
        </div>

        <div className="flex bg-white p-2 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/20">
           <select 
             value={action} 
             onChange={(e) => { setAction(e.target.value); setPage(1) }}
             className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-6 py-2 outline-none cursor-pointer"
           >
              <option value="">All Filtered Events</option>
              <option value="created">Creations Only</option>
              <option value="updated">Modifications Only</option>
              <option value="deleted">Deletions Only</option>
              <option value="restored">Restorations Only</option>
           </select>
        </div>
      </header>

      {/* SEARCH STRIP */}
      <div className="bg-white p-4 rounded-[30px] border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input type="text" placeholder="Search system events by keyword..." className="w-full bg-slate-50 border-none rounded-[20px] py-4 pl-16 pr-8 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" />
         </div>
         <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-cyan-50 rounded-[20px] border border-cyan-100">
            <Database className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">PostgreSQL Ledger Active</span>
         </div>
      </div>

      {/* AUDIT LOG TABLE */}
      {isLoading ? <TableSkeleton rows={10} /> : (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-8 px-10">Timestamp</th>
                  <th className="py-8 px-10">Operator</th>
                  <th className="py-8 px-10 text-center">Action Type</th>
                  <th className="py-8 px-10">Target Entity</th>
                  <th className="py-8 px-10 text-right">Data Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                    <tr><td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center opacity-20">
                           <FileText className="w-16 h-16 mb-4" />
                           <p className="text-xl font-black uppercase tracking-widest">No Records Found</p>
                        </div>
                    </td></tr>
                ) : logs.map((log: any, i: number) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="py-6 px-10">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-800">{new Date(log.created_at).toLocaleDateString('id-ID')}</span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                    </td>
                    <td className="py-6 px-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-black/10">
                                {log.user?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                               <p className="text-[13px] font-black text-slate-800 leading-tight">{log.user?.name || 'System'}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{log.user?.role || 'Admin'}</p>
                            </div>
                        </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex justify-center">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                           {log.action}
                         </span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{log.model_type.split('\\').pop()}</span>
                           <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1"><Hash className="w-3 h-3" /> UID: {log.model_id}</span>
                        </div>
                    </td>
                    <td className="py-6 px-10 text-right">
                        <button 
                          className="px-5 py-2.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto" 
                          onClick={() => console.log(log.new_values || log.old_values)}
                        >
                           <Activity className="w-4 h-4" /> Trace
                        </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Viewing page {page} of {pagination.last_page}</p>
                <div className="flex items-center gap-2">
                   <button 
                     disabled={page === 1}
                     onClick={() => setPage(p => p - 1)}
                     className="p-3 bg-white border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"
                   ><ChevronLeft className="w-5 h-5" /></button>
                   
                   <div className="flex gap-1">
                      {[...Array(pagination.last_page)].map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setPage(i + 1)}
                          className={`w-11 h-11 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                   </div>

                   <button 
                     disabled={page === pagination.last_page}
                     onClick={() => setPage(p => p + 1)}
                     className="p-3 bg-white border border-slate-100 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"
                   ><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
