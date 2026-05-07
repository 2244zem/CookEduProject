/**
 * Admin Dashboard Page — Statistik real-time + recent activity
 * Layout: Sidebar kiri (static) + TopBar atas
 * Data diambil dari API /api/stats secara real-time
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, FolderOpen, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminTopBar from '../../components/layout/AdminTopBar';
import StatsCard from '../../components/admin/StatsCard';
import { statsAPI } from '../../services/api';

const PIE_COLORS = ['#C4634F', '#8B9E82', '#D4A574', '#6B8E8E', '#B5838D'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_recipes: 0, total_users: 0, total_categories: 0,
    recent_recipes: [], monthly_data: [], category_data: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await statsAPI.get();
      setStats(res.data || stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Gagal memuat statistik. Pastikan backend berjalan.');
      // Fallback demo data
      setStats({
        total_recipes: 24, total_users: 156, total_categories: 5,
        recent_recipes: [],
        monthly_data: [
          { name: 'Jan', resep: 4 }, { name: 'Feb', resep: 6 }, { name: 'Mar', resep: 8 },
          { name: 'Apr', resep: 5 }, { name: 'Mei', resep: 12 }, { name: 'Jun', resep: 9 },
        ],
        category_data: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh setiap 60 detik
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const chartData = stats.monthly_data?.length > 0
    ? stats.monthly_data
    : [{ name: 'Jan', resep: 4 }, { name: 'Feb', resep: 6 }, { name: 'Mar', resep: 8 },
       { name: 'Apr', resep: 5 }, { name: 'Mei', resep: 12 }, { name: 'Jun', resep: 9 }];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar />
      <div className="ml-[260px]">
        <AdminTopBar title="Dashboard" />
        <main className="p-8">
          {/* Error banner */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <p className="text-sm text-amber-700">{error}</p>
              <button onClick={fetchStats} className="text-amber-600 hover:text-amber-700">
                <RefreshCw className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatsCard title="Total Resep" value={stats.total_recipes} icon={BookOpen} color="terracotta" index={0} />
            <StatsCard title="Total Pengguna" value={stats.total_users} icon={Users} color="sage" index={1} />
            <StatsCard title="Kategori" value={stats.total_categories} icon={FolderOpen} color="amber" index={2} />
            <StatsCard title="Kunjungan" value="2.4K" icon={TrendingUp} color="charcoal" index={3} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-charcoal-800">Resep Ditambahkan per Bulan</h3>
                <button onClick={fetchStats} className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-cream-100 transition-colors" title="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE0D1" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#999' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #EDE0D1', fontSize: '13px' }} />
                    <Bar dataKey="resep" fill="#C4634F" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart — category distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="card p-6">
              <h3 className="text-base font-semibold text-charcoal-800 mb-6">Distribusi Kategori</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.category_data?.length > 0 ? stats.category_data : [{ name: 'No data', count: 1 }]}
                      dataKey="count"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {(stats.category_data || []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1.5">
                {(stats.category_data || []).slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-charcoal-600 truncate">{cat.name}</span>
                    </div>
                    <span className="text-charcoal-400 font-medium">{cat.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent recipes table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="card p-6">
            <h3 className="text-base font-semibold text-charcoal-800 mb-4">Resep Terbaru</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left py-3 text-xs font-semibold text-charcoal-500 uppercase">Judul</th>
                  <th className="text-left py-3 text-xs font-semibold text-charcoal-500 uppercase">Kategori</th>
                  <th className="text-left py-3 text-xs font-semibold text-charcoal-500 uppercase">Kesulitan</th>
                  <th className="text-left py-3 text-xs font-semibold text-charcoal-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {(stats.recent_recipes?.length > 0 ? stats.recent_recipes : [
                  { title: 'Nasi Goreng Spesial', category_name: 'Masakan Indonesia', difficulty: 'mudah', created_at: null },
                  { title: 'Brownies Kukus', category_name: 'Dessert', difficulty: 'sedang', created_at: null },
                  { title: 'Es Teh Tarik', category_name: 'Minuman', difficulty: 'mudah', created_at: null },
                ]).map((r, i) => (
                  <tr key={i} className="hover:bg-cream-50/50">
                    <td className="py-3 font-medium text-charcoal-700">{r.title}</td>
                    <td className="py-3 text-charcoal-500">{r.category_name}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        (r.difficulty || '').toLowerCase() === 'mudah' ? 'badge-success' :
                        (r.difficulty || '').toLowerCase() === 'sulit' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {r.difficulty ? r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 text-charcoal-400">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
