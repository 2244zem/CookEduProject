import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeApi, categoryApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { 
  Plus, Pencil, Trash2, RotateCcw, X, 
  ChefHat, Search, Filter, Clock, 
  ChevronRight, LayoutGrid, List, Sparkles,
  Camera, UtensilsCrossed, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ingredient { item: string; amount: string; unit: string; calories: number; protein: number; carbs: number; fat: number }
interface Step { instruction: string; duration: number; tip: string }

const emptyIngredient: Ingredient = { item: '', amount: '', unit: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
const emptyStep: Step = { instruction: '', duration: 0, tip: '' }

export default function RecipesCRUD() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'beginner', cooking_time: 15, prep_time: 5, servings: 2, category_id: '',
    ingredients: [{ ...emptyIngredient }] as Ingredient[],
    steps: [{ ...emptyStep }] as Step[],
    image: null as File | null,
  })
  const [error, setError] = useState('')

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['admin-recipes'],
    queryFn: () => recipeApi.adminList(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  })

  const recipes = recipesData?.data?.data || []
  const categories = categoriesData?.data?.data || []

  const saveMutation = useMutation({
    mutationFn: (data: any) => editId ? recipeApi.update(editId, data) : recipeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recipes'] })
      resetForm()
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Gagal menyimpan resep.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recipeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-recipes'] }),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => recipeApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-recipes'] }),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setError('')
    setForm({ title: '', description: '', difficulty: 'beginner', cooking_time: 15, prep_time: 5, servings: 2, category_id: '', ingredients: [{ ...emptyIngredient }], steps: [{ ...emptyStep }], image: null })
  }

  const editRecipe = (r: any) => {
    setEditId(r.id)
    setForm({ title: r.title, description: r.description, difficulty: r.difficulty, cooking_time: r.cooking_time, prep_time: r.prep_time || 0, servings: r.servings || 1, category_id: r.category?.id || '', ingredients: r.ingredients || [{ ...emptyIngredient }], steps: r.steps || [{ ...emptyStep }], image: null })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData()
    Object.keys(form).forEach(key => {
      if (key === 'ingredients' || key === 'steps') {
        formData.append(key, JSON.stringify((form as any)[key]))
      } else if (key === 'image' && !(form as any)[key]) {
        // Skip
      } else {
        formData.append(key, (form as any)[key])
      }
    })
    if (form.category_id) formData.append('category_id', form.category_id)

    saveMutation.mutate(formData)
  }

  const updateIngredient = (i: number, key: string, value: any) => {
    const updated = [...form.ingredients]
    ;(updated[i] as any)[key] = value
    setForm({ ...form, ingredients: updated })
  }

  const updateStep = (i: number, key: string, value: any) => {
    const updated = [...form.steps]
    ;(updated[i] as any)[key] = value
    setForm({ ...form, steps: updated })
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* PREMIUM HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
               <ChefHat className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Content Engine</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Recipe <span className="text-cyan-600">Factory</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg max-w-xl">Bangun katalog kuliner terbaik. Kelola resep official sistem dengan kontrol penuh.</p>
        </div>

        <button 
          onClick={() => { setEditId(null); setShowForm(true); }}
          className="bg-slate-900 text-white px-8 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/30 flex items-center gap-4 hover:scale-[1.03] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 text-cyan-400" /> 
          <span>Create New Recipe</span>
        </button>
      </header>

      {/* FILTER & SEARCH STRIP */}
      <div className="bg-white p-4 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input type="text" placeholder="Search database resep..." className="w-full bg-slate-50 border-none rounded-[22px] py-4 pl-16 pr-8 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-4 bg-slate-50 text-slate-500 rounded-[22px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-transparent hover:border-slate-200 transition-all"><Filter className="w-4 h-4" /> Filter</button>
            <div className="h-10 w-[2px] bg-slate-100 hidden md:block" />
            <div className="flex bg-slate-50 p-1.5 rounded-[22px]">
               <button className="p-2.5 bg-white text-cyan-600 rounded-xl shadow-sm"><LayoutGrid className="w-5 h-5" /></button>
               <button className="p-2.5 text-slate-300"><List className="w-5 h-5" /></button>
            </div>
         </div>
      </div>

      {/* RECIPE TABLE GRID */}
      {isLoading ? <TableSkeleton rows={6} /> : (
        <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-8 px-12">Basic Information</th>
                  <th className="py-8 px-10">Difficulty</th>
                  <th className="py-8 px-10">Time Metric</th>
                  <th className="py-8 px-10">System Status</th>
                  <th className="py-8 px-12 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recipes.map((r: any) => (
                  <tr key={r.id} className="hover:bg-cyan-50/10 transition-colors group">
                    <td className="py-8 px-12">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[22px] bg-slate-100 overflow-hidden shadow-inner border border-slate-50">
                          {r.image_url ? (
                            <img src={r.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><UtensilsCrossed className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-cyan-700 transition-colors">{r.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{r.category?.name || 'No Category'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-10">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        r.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        r.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {r.difficulty_label}
                      </span>
                    </td>
                    <td className="py-8 px-10 text-[13px] font-bold text-slate-500">
                       <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-300" />
                          {r.total_time} mins
                       </div>
                    </td>
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${r.deleted_at ? 'bg-rose-500' : 'bg-emerald-500'} shadow-glow-sm`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${r.deleted_at ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {r.deleted_at ? 'Suspended' : 'Live'}
                         </span>
                      </div>
                    </td>
                    <td className="py-8 px-12">
                      <div className="flex items-center justify-end gap-3">
                        {r.deleted_at ? (
                          <button onClick={() => restoreMutation.mutate(r.id)} className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Restore"><RotateCcw className="w-5 h-5" /></button>
                        ) : (
                          <>
                            <button onClick={() => editRecipe(r)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="Edit"><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => { if (confirm('Hapus resep ini?')) deleteMutation.mutate(r.id) }} className="p-3 rounded-2xl bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete"><Trash2 className="w-5 h-5" /></button>
                          </>
                        )}
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
              {/* Form Backdrop Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100 opacity-20 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />

              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{editId ? 'Edit Masterpiece' : 'New Creation'}</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Crafting culinary excellence</p>
                </div>
                <button onClick={resetForm} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                {error && <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-bold rounded-2xl flex items-center gap-3 animate-shake"><AlertCircle className="w-5 h-5" /> {error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column: Core Data */}
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipe Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-300" placeholder="e.g. Premium Wagyu Steak" required />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chef's Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-300 min-h-[120px]" placeholder="Tell the story behind this dish..." required />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                           <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                             className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer">
                             <option value="beginner">Beginner</option>
                             <option value="intermediate">Intermediate</option>
                             <option value="advanced">Advanced</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                           <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                             className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer">
                             <option value="">Uncategorized</option>
                             {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Visuals & Metrics */}
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Image</label>
                        <div className="relative h-[236px] bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-cyan-500/30 transition-all overflow-hidden cursor-pointer">
                           {form.image ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <p className="text-xs font-black text-cyan-600">Image selected: {form.image.name}</p>
                              </div>
                           ) : (
                              <>
                                 <Camera className="w-10 h-10 mb-3 text-slate-300" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">Click to upload visual</p>
                              </>
                           )}
                           <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] as any })}
                             className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cooking Time (m)</label>
                           <input type="number" value={form.cooking_time} onChange={(e) => setForm({ ...form, cooking_time: +e.target.value })}
                             className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" min={1} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Servings</label>
                           <input type="number" value={form.servings} onChange={(e) => setForm({ ...form, servings: +e.target.value })}
                             className="w-full bg-slate-50 border-none rounded-[22px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" min={1} />
                        </div>
                     </div>
                  </div>
                </div>

                {/* TABS FOR INGREDIENTS / STEPS */}
                <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                    <div className="flex items-center gap-8 mb-10 border-b border-slate-200 pb-4">
                       <button type="button" className="text-[11px] font-black text-slate-900 uppercase tracking-widest relative">
                          Recipe Breakdown
                          <div className="absolute -bottom-[18px] left-0 right-0 h-1 bg-cyan-600 rounded-full" />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                       {/* Ingredients */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ingredients</h4>
                             <button type="button" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { ...emptyIngredient }] })}
                               className="text-[10px] font-black text-cyan-600 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Row</button>
                          </div>
                          {form.ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-3">
                              <input placeholder="Item" value={ing.item} onChange={(e) => updateIngredient(i, 'item', e.target.value)}
                                className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" required />
                              <input placeholder="Qty" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                                className="w-20 bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all" required />
                              {form.ingredients.length > 1 && (
                                <button type="button" onClick={() => setForm({ ...form, ingredients: form.ingredients.filter((_, j) => j !== i) })}
                                  className="text-rose-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          ))}
                       </div>

                       {/* Steps */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Instructions</h4>
                             <button type="button" onClick={() => setForm({ ...form, steps: [...form.steps, { ...emptyStep }] })}
                               className="text-[10px] font-black text-cyan-600 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Step</button>
                          </div>
                          {form.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-1">{i + 1}</div>
                              <textarea placeholder="Write instruction..." value={step.instruction} onChange={(e) => updateStep(i, 'instruction', e.target.value)}
                                className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-cyan-500/10 transition-all min-h-[60px]" required />
                              {form.steps.length > 1 && (
                                <button type="button" onClick={() => setForm({ ...form, steps: form.steps.filter((_, j) => j !== i) })}
                                  className="text-rose-300 hover:text-rose-500 transition-colors mt-2"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          ))}
                       </div>
                    </div>
                </div>

                {/* SUBMIT AREA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
                  <button type="button" onClick={resetForm} className="flex-1 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard Changes</button>
                  <button type="submit" disabled={saveMutation.isPending}
                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 active:scale-95 hover:bg-cyan-700 transition-all disabled:opacity-50">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    {saveMutation.isPending ? 'Processing...' : (editId ? 'Apply Updates' : 'Launch Masterpiece')}
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
