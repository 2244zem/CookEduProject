/**
 * ManageRecipes Page — CRUD resep admin dengan DataTable + Modal
 */
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminTopBar from '../../components/layout/AdminTopBar';
import DataTable from '../../components/admin/DataTable';
import RecipeForm from '../../components/admin/RecipeForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { recipeAPI, categoryAPI } from '../../services/api';

export default function ManageRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recRes, catRes] = await Promise.all([recipeAPI.getAll({ per_page: 100 }), categoryAPI.getAll()]);
      setRecipes(recRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      setRecipes(demoRecipes);
      setCategories([]);
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editing) { await recipeAPI.update(editing.id, data); }
      else { await recipeAPI.create(data); }
      setModalOpen(false); setEditing(null); fetchData();
    } catch (err) { alert(err?.message || 'Gagal menyimpan'); }
    finally { setLoading(false); }
  };

  const handleEdit = (row) => { setEditing(row); setModalOpen(true); };
  const handleDelete = async (row) => {
    if (!confirm(`Hapus resep "${row.title}"?`)) return;
    try { await recipeAPI.delete(row.id); fetchData(); }
    catch { setRecipes((p) => p.filter((r) => r.id !== row.id)); }
  };

  const columns = [
    { key: 'title', label: 'Judul' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'difficulty', label: 'Kesulitan', render: (val) => <Badge difficulty={val} /> },
    { key: 'created_at', label: 'Tanggal', render: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar />
      <div className="ml-[260px]">
        <AdminTopBar title="Kelola Resep" />
        <main className="p-8">
          <div className="flex justify-end mb-6">
            <Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true); }}>Tambah Resep</Button>
          </div>
          <DataTable columns={columns} data={recipes} onEdit={handleEdit} onDelete={handleDelete} />
          <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Resep' : 'Tambah Resep'} size="lg">
            <RecipeForm recipe={editing} categories={categories} onSubmit={handleSubmit} loading={loading} />
          </Modal>
        </main>
      </div>
    </div>
  );
}

const demoRecipes = [
  { id: 1, title: 'Nasi Goreng Spesial', category_name: 'Masakan Indonesia', difficulty: 'mudah', created_at: '2024-01-15' },
  { id: 2, title: 'Brownies Kukus', category_name: 'Dessert & Kue', difficulty: 'sedang', created_at: '2024-01-10' },
  { id: 3, title: 'Es Teh Tarik', category_name: 'Minuman', difficulty: 'mudah', created_at: '2024-01-08' },
];
