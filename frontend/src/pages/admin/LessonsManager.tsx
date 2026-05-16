import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi, categoryApi } from '../../lib/api'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { Plus, Pencil, Trash2, X, Loader2, BookOpen, Video, Target, Layers } from 'lucide-react'

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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Modul Edukasi</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Tambah Modul
        </button>
      </div>

      {isLoading ? <TableSkeleton rows={5} /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-dim)] text-left">
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Modul</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Level</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Urutan</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Status</th>
                  <th className="px-5 py-3 font-semibold text-[var(--color-text-secondary)]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l: any) => (
                  <tr key={l.id} className="border-t border-gray-50 hover:bg-[var(--color-primary-50)]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-semibold">{l.title}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{l.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${l.level === 'beginner' ? 'bg-green-50 text-green-600' : l.level === 'intermediate' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{l.level_label}</span>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">{l.order_index}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${l.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                        {l.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => editLesson(l)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm('Hapus modul ini?')) deleteMutation.mutate(l.id) }} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl animate-slide-up mb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">{editId ? 'Edit Modul' : 'Tambah Modul Baru'}</h2>
              <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Judul Modul *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Ringkasan (Summary)</label>
                  <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Konten (HTML/Markdown) *</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 min-h-[150px]" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Video URL</label>
                  <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Durasi (menit)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tingkat Kesulitan</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm">
                    <option value="beginner">Pemula</option>
                    <option value="intermediate">Menengah</option>
                    <option value="advanced">Mahir</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Kategori *</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm" required>
                    <option value="">Pilih Kategori</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Prasyarat (Prerequisite)</label>
                  <select value={form.prerequisite_id} onChange={(e) => setForm({ ...form, prerequisite_id: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm">
                    <option value="">Tidak ada</option>
                    {lessons.filter(l => l.id !== editId).map((l: any) => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Urutan (Order Index)</label>
                    <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: +e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--color-surface-dim)] border border-gray-100 rounded-xl text-sm" />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} id="is_published" />
                  <label htmlFor="is_published" className="text-sm font-medium">Publish sekarang?</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="flex-1 py-3 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editId ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
