/**
 * TodoList Page — Daftar belanja / shopping list
 * User bisa membuat daftar belanja dan mencentang item.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, ShoppingCart, X } from 'lucide-react';
import { todoAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([{ item_name: '', quantity: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await todoAPI.getAll();
      setTodos(res.data || []);
    } catch {
      setTodos(demoTodos);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await todoAPI.create({ title, items: items.filter((i) => i.item_name.trim()) });
      setTitle(''); setItems([{ item_name: '', quantity: '' }]); setShowForm(false);
      fetchTodos();
    } catch { alert('Gagal membuat daftar belanja'); }
  };

  const toggleItem = async (itemId) => {
    try {
      await todoAPI.toggleItem(itemId);
      fetchTodos();
    } catch {
      // Toggle locally for demo
      setTodos((prev) => prev.map((list) => ({
        ...list,
        items: list.items.map((item) =>
          item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        ),
      })));
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm('Hapus daftar belanja ini?')) return;
    try {
      await todoAPI.delete(id);
      fetchTodos();
    } catch { setTodos((prev) => prev.filter((t) => t.id !== id)); }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-terracotta-500" /> Daftar Belanja
            </h1>
            <p className="text-sm text-charcoal-400 mt-1">Catat bahan yang perlu dibeli</p>
          </div>
          <Button icon={Plus} onClick={() => setShowForm(true)}>Buat Baru</Button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden">
              <form onSubmit={handleCreate} className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-charcoal-800">Daftar Belanja Baru</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded text-charcoal-400 hover:text-charcoal-600"><X className="w-4 h-4" /></button>
                </div>
                <Input label="Judul" placeholder="Belanja untuk Nasi Goreng" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal-600">Item</label>
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Nama bahan" value={item.item_name} onChange={(e) => { const n = [...items]; n[i].item_name = e.target.value; setItems(n); }}
                        className="flex-1 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
                      <input placeholder="Jumlah" value={item.quantity} onChange={(e) => { const n = [...items]; n[i].quantity = e.target.value; setItems(n); }}
                        className="w-28 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
                      {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="p-2 text-charcoal-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => setItems([...items, { item_name: '', quantity: '' }])}
                    className="text-xs text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Tambah item</button>
                </div>
                <Button type="submit">Simpan</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo lists */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : todos.length === 0 ? (
          <div className="text-center py-20 card">
            <ShoppingCart className="w-12 h-12 text-cream-400 mx-auto mb-3" />
            <p className="text-charcoal-400">Belum ada daftar belanja</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos.map((list) => (
              <motion.div key={list.id} layout className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-charcoal-800">{list.title}</h3>
                  <button onClick={() => deleteTodo(list.id)} className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <ul className="space-y-1">
                  {(list.items || []).map((item) => (
                    <li key={item.id} onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${item.is_checked ? 'bg-sage-50' : 'hover:bg-cream-50'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.is_checked ? 'bg-sage-400 border-sage-400' : 'border-cream-400'}`}>
                        {item.is_checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm flex-1 ${item.is_checked ? 'text-charcoal-400 line-through' : 'text-charcoal-700'}`}>{item.item_name}</span>
                      {item.quantity && <span className={`text-xs ${item.is_checked ? 'text-charcoal-300' : 'text-charcoal-500'}`}>{item.quantity}</span>}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const demoTodos = [
  { id: 1, title: 'Belanja Nasi Goreng', items: [
    { id: 1, item_name: 'Bawang merah', quantity: '5 siung', is_checked: false },
    { id: 2, item_name: 'Telur', quantity: '2 butir', is_checked: true },
    { id: 3, item_name: 'Kecap manis', quantity: '1 botol', is_checked: false },
  ]},
];
