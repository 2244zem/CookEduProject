/**
 * RecipeForm Component — Form CRUD resep admin
 * Dynamic fields untuk ingredients dan steps.
 */
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function RecipeForm({ recipe = null, categories = [], onSubmit, loading = false }) {
  const [form, setForm] = useState({
    title: '', category_id: '', description: '', image_url: '',
    prep_time: '', cook_time: '', servings: '', difficulty: 'mudah', is_featured: 0,
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [{ instruction: '' }],
  });

  useEffect(() => {
    if (recipe) {
      setForm({
        ...recipe,
        ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: '', quantity: '', unit: '' }],
        steps: recipe.steps?.length ? recipe.steps : [{ instruction: '' }],
      });
    }
  }, [recipe]);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addIngredient = () => setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: '', quantity: '', unit: '' }] }));
  const removeIngredient = (i) => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));
  const updateIngredient = (i, field, value) => {
    setForm((f) => {
      const ing = [...f.ingredients];
      ing[i] = { ...ing[i], [field]: value };
      return { ...f, ingredients: ing };
    });
  };

  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, { instruction: '' }] }));
  const removeStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i, value) => {
    setForm((f) => {
      const s = [...f.steps];
      s[i] = { ...s[i], instruction: value };
      return { ...f, steps: s };
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Judul Resep" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-charcoal-600">Kategori</label>
          <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)} required
            className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400">
            <option value="">Pilih kategori</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-charcoal-600">Tingkat Kesulitan</label>
          <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}
            className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400">
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-charcoal-600">Deskripsi</label>
        <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3}
          className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
      </div>
      <Input label="URL Gambar" value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} placeholder="https://..." />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Persiapan (menit)" type="number" value={form.prep_time} onChange={(e) => updateField('prep_time', e.target.value)} />
        <Input label="Masak (menit)" type="number" value={form.cook_time} onChange={(e) => updateField('cook_time', e.target.value)} />
        <Input label="Porsi" type="number" value={form.servings} onChange={(e) => updateField('servings', e.target.value)} />
      </div>

      {/* Dynamic Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-700">Bahan-bahan</label>
          <button type="button" onClick={addIngredient} className="text-xs text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah</button>
        </div>
        {form.ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input placeholder="Nama bahan" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)}
              className="flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
            <input placeholder="Jumlah" value={ing.quantity} onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
              className="w-20 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
            <input placeholder="Satuan" value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
              className="w-20 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
            {form.ingredients.length > 1 && (
              <button type="button" onClick={() => removeIngredient(i)} className="p-2 text-charcoal-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>

      {/* Dynamic Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal-700">Langkah-langkah</label>
          <button type="button" onClick={addStep} className="text-xs text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Tambah</button>
        </div>
        {form.steps.map((step, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1">{i + 1}</span>
            <textarea value={step.instruction} onChange={(e) => updateStep(i, e.target.value)} rows={2} placeholder="Jelaskan langkah ini..."
              className="flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
            {form.steps.length > 1 && (
              <button type="button" onClick={() => removeStep(i)} className="p-2 text-charcoal-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
        <Button type="submit" loading={loading}>{recipe ? 'Simpan Perubahan' : 'Buat Resep'}</Button>
      </div>
    </form>
  );
}
