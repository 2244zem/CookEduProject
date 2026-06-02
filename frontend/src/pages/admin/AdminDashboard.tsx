import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Check, Trash2, 
  Edit3, BarChart3, AlertCircle, FileText,
  ArrowRight, User, Clock, Flame, XCircle,
  TrendingUp, ShieldCheck, ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi, dashboardApi, auditApi } from '../../lib/api';
import { recipes as initialRecipes } from '../../data/recipes';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell 
} from 'recharts';

interface RecipeNormalized {
  id: number;
  title: string;
  category: string;
  createdBy: string;
  authorRole: string;
  isOfficial: boolean;
  tempRange: { min: number; max: number };
  status: string;
  imageUrl?: string;
}

interface CategoryStat {
  name: string;
  value: number;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved

  // REAL DATA FETCHING
  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['admin-recipes'],
    queryFn: () => recipeApi.adminList(),
  });

  // Data Transformation Layer
  const allRecipes = useMemo<RecipeNormalized[]>(() => {
    const rawApi = recipesData?.data?.data || [];
    return [...rawApi, ...initialRecipes].reduce((acc: RecipeNormalized[], curr: any) => {
      const isOfficial = curr.is_system || curr.isOfficial || (curr.creator?.role === 'admin');
      const normalized: RecipeNormalized = {
        id: curr.id,
        title: curr.title,
        category: curr.category?.name || curr.category || "Main Course",
        createdBy: curr.creator?.name || curr.createdBy || "System",
        authorRole: curr.creator?.role || curr.authorRole || (isOfficial ? "Admin" : "User"),
        isOfficial: isOfficial,
        tempRange: curr.tempRange || { min: 45, max: 95 },
        status: curr.moderation_status || (curr.is_published ? "approved" : "pending"),
        imageUrl: curr.image_url || curr.imageUrl
      };

      const existing = acc.find(r => r.title.toLowerCase() === normalized.title.toLowerCase());
      if (!existing) acc.push(normalized);
      else {
        const idx = acc.indexOf(existing);
        acc[idx] = { ...existing, ...normalized };
      }
      return acc;
    }, []);
  }, [recipesData]);

  // ANALYTICS MOCK DATA
  const categoryStats = useMemo<CategoryStat[]>(() => {
    const counts: Record<string, number> = {};
    allRecipes.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [allRecipes]);

  const trendData = [
    { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 }, { day: 'Fri', count: 30 }, { day: 'Sat', count: 45 }, { day: 'Sun', count: 38 }
  ];

  // ACTIONS
  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => recipeApi.moderate(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const handleModeration = (id: number, status: string) => {
    moderateMutation.mutate({ id, status });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recipeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-recipes'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeNormalized | null>(null);
  const [form, setForm] = useState({ title: '', category_id: '1', description: '', cooking_time: 30, difficulty: 'beginner' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => editingRecipe 
      ? recipeApi.update(editingRecipe.id, data) 
      : recipeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
      setIsModalOpen(false);
    }
  });

  const handleEdit = (recipe: RecipeNormalized) => {
    setEditingRecipe(recipe);
    setForm({ title: recipe.title, category_id: '1', description: '', cooking_time: 30, difficulty: 'beginner' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category_id', form.category_id);
    formData.append('cooking_time', form.cooking_time.toString());
    formData.append('difficulty', form.difficulty);
    if (selectedFile) formData.append('image', selectedFile);
    formData.append('ingredients', JSON.stringify([{ item: 'Bahan', amount: '1', unit: 'pcs' }]));
    formData.append('steps', JSON.stringify([{ instruction: 'Langkah', duration: 5 }]));
    saveMutation.mutate(formData);
  };

  const filteredRecipes = allRecipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && r.status === 'pending';
    if (activeTab === 'approved') return matchesSearch && r.status === 'approved';
    return matchesSearch;
  });

  const { data: auditLogsData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditApi.list(),
  });
  const auditLogs = auditLogsData?.data?.data || [];

  const pendingCount = allRecipes.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-concepto p-4 md:p-10 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Command <span className="text-primary">Center</span></h1>
            <p className="text-sm font-medium text-slate-400">Moderation Hub & Culinary Intelligence</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" placeholder="Search entries..." 
                  className="bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all w-64 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                Sync Engine
             </button>
          </div>
        </header>

        {/* BENTO ANALYTICS GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Stat Cards */}
           <div className="lg:col-span-1 grid grid-cols-1 gap-6">
              {[
                { label: "Pending Queue", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Official Base", value: allRecipes.filter(r => r.isOfficial).length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex items-center justify-between group">
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                   </div>
                   <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                </div>
              ))}
           </div>

           {/* Trend Chart */}
           <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm relative overflow-hidden h-64 lg:h-auto">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> User Interaction Trends
                 </h4>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2A4D88" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2A4D88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke="#2A4D88" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Category Distribution */}
           <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-emerald-500/20 blur-[60px] rounded-full" />
              <h4 className="text-sm font-black uppercase tracking-tighter text-white mb-6 flex items-center gap-2">
                 <BarChart3 className="w-4 h-4" /> Hot Categories
              </h4>
              <div className="space-y-4 relative z-10">
                 {categoryStats.map((stat, i) => (
                   <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-white/60 uppercase tracking-widest">
                         <span>{stat.name}</span>
                         <span>{stat.value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${(stat.value / allRecipes.length) * 100}%` }}
                          className="h-full bg-emerald-500 rounded-full" 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* MODERATION QUEUE & MANAGEMENT */}
        <main className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                 {['all', 'pending', 'approved'].map(tab => (
                   <button 
                    key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                   <Clock className="w-4 h-4 animate-spin-slow" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{pendingCount} Waiting for review</span>
                </div>
              )}
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50/50">
                       <th className="py-6 px-10">Recipe Identity</th>
                       <th className="py-6 px-10">Category</th>
                       <th className="py-6 px-10">Author Profile</th>
                       <th className="py-6 px-10">Moderation</th>
                       <th className="py-6 px-10 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                       <tr><td colSpan={5} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest animate-pulse">Scanning Catalog...</td></tr>
                    ) : filteredRecipes.map((r, i) => (
                      <motion.tr 
                        key={`${r.isOfficial ? 'sys' : 'usr'}-${r.id}-${i}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="group hover:bg-slate-50/30 transition-all"
                      >
                         <td className="py-6 px-10">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                                  {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover" /> : <ChefHat className="w-full h-full p-3 text-slate-200" />}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 leading-tight">{r.title}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{r.isOfficial ? 'Official Core' : 'User Contributed'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="py-6 px-10 font-bold text-xs text-slate-500 uppercase tracking-tighter">{r.category}</td>
                         <td className="py-6 px-10">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{r.createdBy.charAt(0)}</div>
                               <span className="text-xs font-bold text-slate-600">{r.createdBy}</span>
                            </div>
                         </td>
                         <td className="py-6 px-10">
                            {r.status === 'pending' ? (
                               <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleModeration(r.id, 'approved')}
                                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleModeration(r.id, 'rejected')}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                  >
                                    Reject
                                  </button>
                               </div>
                            ) : (
                               <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                 r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                               }`}>
                                 {r.status}
                               </span>
                            )}
                         </td>
                         <td className="py-6 px-10 text-right">
                            <div className="flex justify-end gap-2">
                               <button 
                                 onClick={() => handleEdit(r)}
                                 className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                               >
                                 <Edit3 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => { if(window.confirm('Purge from DB?')) deleteMutation.mutate(r.id); }}
                                 className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                               ><Trash2 className="w-4 h-4" /></button>
                            </div>
                         </td>
                      </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </main>

        {/* RECIPE EDITOR MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingRecipe ? 'Edit Masterpiece' : 'Create New Entry'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900"><XCircle className="w-6 h-6" /></button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recipe Title</label>
                    <input 
                      type="text" value={form.title} 
                      onChange={(e) => setForm({...form, title: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cooking Time (min)</label>
                      <input 
                        type="number" value={form.cooking_time} 
                        onChange={(e) => setForm({...form, cooking_time: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Difficulty</label>
                      <select 
                        value={form.difficulty} 
                        onChange={(e) => setForm({...form, difficulty: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update Photo</label>
                    <input 
                      type="file" accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                    />
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saveMutation.isPending ? 'Syncing with Server...' : 'Commit Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AUDIT LOGS SECTION */}
        <section className="mt-12 bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-600" /> Audit Activity Log
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Track admin actions and system changes</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-cyan-600 transition-all shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs.map((log: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{log.user?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        log.action === 'created' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        log.action === 'deleted' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-cyan-50 text-cyan-600 border-cyan-100'
                      } border`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-500">{log.model_type?.split('\\').pop()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 text-slate-300 hover:text-cyan-600 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
