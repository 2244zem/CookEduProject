import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeApi, categoryApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Plus, Pencil, Trash2, RotateCcw, X, ChefHat } from 'lucide-react'

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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Resep</h1>
        <button onClick={() => { setEditId(null); setShowForm(true); }} className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Tambah Resep
        </button>
      </div>

      {/* Recipe Table */}
      {isLoading ? <TableSkeleton rows={5} /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-dim)] text-left">
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Resep</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)] hidden md:table-cell">Level</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)] hidden md:table-cell">Waktu</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Status</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((r: any) => (
                  <tr key={r.id} className="border-t border-gray-50 hover:bg-[var(--color-primary-50)]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                          <ChefHat className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-semibold">{r.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[200px]">{r.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.difficulty === 'beginner' ? 'bg-green-50 text-green-600' : r.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{r.difficulty_label}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-[var(--color-text-secondary)]">{r.total_time} mnt</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.deleted_at ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {r.deleted_at ? 'Dihapus' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {r.deleted_at ? (
                          <button onClick={() => restoreMutation.mutate(r.id)} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title="Restore">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button onClick={() => editRecipe(r)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500" title="Edit"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => { if (confirm('Hapus resep ini?')) deleteMutation.mutate(r.id) }} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl animate-slide-up mb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{editId ? 'Edit Resep' : 'Tambah Resep Baru'}</h2>
              <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Judul Resep *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Deskripsi *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Foto Resep</label>
                  <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] as any })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                  {editId && <p className="text-xs text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah foto.</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tingkat Kesulitan</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm">
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Mahir</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Kategori</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm">
                    <option value="">Pilih Kategori</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Waktu Masak (menit)</label>
                  <input type="number" value={form.cooking_time} onChange={(e) => setForm({ ...form, cooking_time: +e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm" min={1} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Porsi</label>
                  <input type="number" value={form.servings} onChange={(e) => setForm({ ...form, servings: +e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm" min={1} />
                </div>
              </div>

              {/* Dynamic Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold">Bahan-Bahan</label>
                  <button type="button" onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { ...emptyIngredient }] })}
                    className="text-xs text-primary font-semibold flex items-center gap-1"><Plus className="w-3 h-3" /> Tambah</button>
                </div>
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input placeholder="Bahan" value={ing.item} onChange={(e) => updateIngredient(i, 'item', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[var(--color-surface-dim)] border border-gray-100 rounded-lg text-sm" required />
                    <input placeholder="Jumlah" value={ing.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                      className="w-20 px-3 py-2 bg-[var(--color-surface-dim)] border border-gray-100 rounded-lg text-sm" required />
                    <input placeholder="Unit" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                      className="w-16 px-3 py-2 bg-[var(--color-surface-dim)] border border-gray-100 rounded-lg text-sm" />
                    {form.ingredients.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, ingredients: form.ingredients.filter((_, j) => j !== i) })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>

              {/* Dynamic Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold">Langkah Memasak</label>
                  <button type="button" onClick={() => setForm({ ...form, steps: [...form.steps, { ...emptyStep }] })}
                    className="text-xs text-primary font-semibold flex items-center gap-1"><Plus className="w-3 h-3" /> Tambah</button>
                </div>
                {form.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <span className="w-7 h-7 rounded-lg gradient-primary text-white text-xs font-bold flex items-center justify-center mt-1 shrink-0">{i + 1}</span>
                    <textarea placeholder="Instruksi langkah..." value={step.instruction} onChange={(e) => updateStep(i, 'instruction', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[var(--color-surface-dim)] border border-gray-100 rounded-lg text-sm min-h-[60px]" required />
                    <input type="number" placeholder="mnt" value={step.duration || ''} onChange={(e) => updateStep(i, 'duration', +e.target.value)}
                      className="w-16 px-3 py-2 bg-[var(--color-surface-dim)] border border-gray-100 rounded-lg text-sm" />
                    {form.steps.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, steps: form.steps.filter((_, j) => j !== i) })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 mt-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-8 py-4 bg-primary text-white font-black rounded-3xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  {editId ? 'Simpan Perubahan' : 'Terbitkan Resep'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
