import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi, categoryApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { 
  Plus, Pencil, Trash2, X, Loader2, BookOpen, 
  Video, Target, Layers, Search, Filter, 
  ChevronRight, Sparkles, PlayCircle, Clock,
  Eye, GraduationCap, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LessonsManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '', video_url: '', content: '', summary: '', duration: 15, order_index: 0,
    level: 'beginner', category_id: '', prerequisite_id: '', is_published: true
  })
  const [error, setError] = useState('')

  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ['admin-lessons'],
    queryFn: () => lessonApi.list(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  })

  const lessons = lessonsData?.data?.data || []
  const categories = categoriesData?.data?.data || []

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? lessonApi.update(editId, data) : lessonApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] })
      resetForm()
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Gagal menyimpan modul.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lessonApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lessons'] }),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setError('')
    setForm({
      title: '', video_url: '', content: '', summary: '', duration: 15, order_index: 0,
      level: 'beginner', category_id: '', prerequisite_id: '', is_published: true
    })
  }

  const editLesson = (l: any) => {
    setEditId(l.id)
    setForm({
      title: l.title, video_url: l.video_url || '', content: l.content, summary: l.summary || '',
      duration: l.duration, order_index: l.order_index, level: l.level,
      category_id: l.category?.id || '', prerequisite_id: l.prerequisite_id || '',
      is_published: l.is_published
    })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    saveMutation.mutate({
        ...form,
        category_id: form.category_id || null,
        prerequisite_id: form.prerequisite_id || null
    })
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
               <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Education Hub</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Learning <span className="text-indigo-600">Academy</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg max-w-xl">Curate high-quality culinary education. Manage modules, video content, and curriculum flow.</p>
        </div>

        <button 
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-indigo-600 text-white px-8 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 flex items-center gap-4 hover:scale-[1.03] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-indigo-300" /> 
          <span>Publish New Module</span>
        </button>
      </header>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input type="text" placeholder="Search curriculum database..." className="w-full bg-slate-50 border-none rounded-[22px] py-4 pl-16 pr-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
         </div>
         <button className="w-full md:w-auto px-8 py-4 bg-slate-50 text-slate-500 rounded-[22px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-transparent hover:border-slate-200 transition-all"><Filter className="w-4 h-4" /> Filter Curriculum</button>
      </div>

      {/* LESSONS LIST */}
      {isLoading ? <TableSkeleton rows={6} /> : (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-8 px-12">Module Info</th>
                  <th className="py-8 px-10">Difficulty</th>
                  <th className="py-8 px-10">Order Index</th>
                  <th className="py-8 px-10">Publishing</th>
                  <th className="py-8 px-12 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lessons.map((l: any) => (
                  <tr key={l.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="py-8 px-12">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-700 transition-colors">{l.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{l.category?.name || 'Education'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-10">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        l.level === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        l.level === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {l.level_label}
                      </span>
                    </td>
                    <td className="py-8 px-10 text-[13px] font-black text-slate-900">
                       <span className="bg-slate-100 px-3 py-1 rounded-lg"># {l.order_index}</span>
                    </td>
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${l.is_published ? 'bg-emerald-500' : 'bg-slate-300'} shadow-glow-sm`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${l.is_published ? 'text-emerald-500' : 'text-slate-400'}`}>
                           {l.is_published ? 'Live Content' : 'Draft Mode'}
                         </span>
                      </div>
                    </td>
                    <td className="py-8 px-12">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => editLesson(l)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Edit"><Pencil className="w-5 h-5" /></button>
                        <button onClick={() => { if (confirm('Hapus modul ini?')) deleteMutation.mutate(l.id) }} className="p-3 rounded-2xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREMIUM FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[50px] w-full max-w-4xl shadow-2xl p-10 lg:p-14 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 opacity-20 blur-[100px] -ml-32 -mt-32 rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{editId ? 'Refine Lesson' : 'Compose Lesson'}</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Shaping the next culinary masters</p>
                </div>
                <button onClick={resetForm} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                {error && <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-bold rounded-2xl flex items-center gap-3"><AlertCircle className="w-5 h-5" /> {error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="e.g. Knife Skills 101" required />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Summary</label>
                        <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Briefly describe what they'll learn..." />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Resource</label>
                          <div className="relative">
                             <PlayCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                             <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                               className="w-full bg-slate-50 border-none rounded-[22px] py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="YouTube URL" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Duration (m)</label>
                          <div className="relative">
                             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                             <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })}
                               className="w-full bg-slate-50 border-none rounded-[22px] py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                          </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer" required>
                            <option value="">Select Category</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curriculum Order</label>
                        <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: +e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                      </div>

                      <div className="p-6 bg-slate-50 rounded-[30px] flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-slate-900">Publish Content</p>
                            <p className="text-[10px] text-slate-400 font-bold">Make this visible to all students</p>
                         </div>
                         <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} 
                           className="w-6 h-6 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Curriculum Content</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-[35px] py-8 px-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[250px] leading-relaxed" placeholder="Write your master lesson here... (Markdown supported)" required />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
                  <button type="button" onClick={resetForm} className="flex-1 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel Composition</button>
                  <button type="submit" disabled={saveMutation.isPending}
                    className="flex-[2] py-5 bg-indigo-600 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-95 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                    {saveMutation.isPending ? 'Publishing...' : (editId ? 'Apply Improvements' : 'Release Module')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
