/**
 * ManageCategories Page — CRUD kategori admin
 */
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminTopBar from '../../components/layout/AdminTopBar';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { categoryAPI } from '../../services/api';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch {
      setCategories([
        { id: 1, name: 'Masakan Indonesia', description: 'Aneka masakan Nusantara', recipe_count: 24 },
        { id: 2, name: 'Dessert & Kue', description: 'Hidangan penutup dan kue', recipe_count: 18 },
        { id: 3, name: 'Minuman', description: 'Resep minuman', recipe_count: 12 },
      ]);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, description: row.description || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) { await categoryAPI.update(editing.id, form); }
      else { await categoryAPI.create(form); }
      setModalOpen(false); fetchCategories();
    } catch (err) { alert(err?.message || 'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Hapus kategori "${row.name}"? Semua resep di kategori ini juga akan terhapus.`)) return;
    try { await categoryAPI.delete(row.id); fetchCategories(); }
    catch { setCategories((p) => p.filter((c) => c.id !== row.id)); }
  };

  const columns = [
    { key: 'name', label: 'Nama Kategori' },
    { key: 'description', label: 'Deskripsi', render: (val) => <span className="text-charcoal-400">{val || '-'}</span> },
    { key: 'recipe_count', label: 'Jumlah Resep', render: (val) => <span className="font-medium">{val || 0}</span> },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar />
      <div className="ml-[260px]">
        <AdminTopBar title="Kelola Kategori" />
        <main className="p-8">
          <div className="flex justify-end mb-6">
            <Button icon={Plus} onClick={openCreate}>Tambah Kategori</Button>
          </div>
          <DataTable columns={columns} data={categories} onEdit={openEdit} onDelete={handleDelete} />
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nama Kategori" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-charcoal-600">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full rounded-lg border border-cream-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" loading={loading}>{editing ? 'Simpan' : 'Buat'}</Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
