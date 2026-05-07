/**
 * AdminSidebar Component — Fixed sidebar navigasi admin
 * 
 * Desain SaaS-style: sidebar gelap di kiri yang tetap
 * terlihat saat scroll. Active state menunjukkan halaman
 * yang sedang dibuka.
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  ArrowLeft,
  ChefHat,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Kelola Resep', path: '/admin/recipes', icon: BookOpen },
  { label: 'Kelola Kategori', path: '/admin/categories', icon: FolderOpen },
];

export default function AdminSidebar() {
  const location = useLocation();

  // Cek apakah path aktif (exact match atau prefix match untuk sub-routes)
  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-charcoal-800 text-cream-300 flex flex-col z-50">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-charcoal-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-terracotta-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold text-white tracking-tight">
              Masak<span className="text-terracotta-400">Yuk</span>
            </span>
            <p className="text-[10px] text-cream-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-terracotta-500 text-white'
                  : 'text-cream-400 hover:text-white hover:bg-charcoal-700'
                }
              `}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site link */}
      <div className="px-3 py-4 border-t border-charcoal-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                     text-cream-400 hover:text-white hover:bg-charcoal-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          Kembali ke Website
        </Link>
      </div>
    </aside>
  );
}
