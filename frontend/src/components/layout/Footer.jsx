/**
 * Footer Component — Footer minimalis
 */

import { ChefHat, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal-800 text-cream-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-terracotta-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                Masak<span className="text-terracotta-400">Yuk</span>
              </span>
            </div>
            <p className="text-sm text-cream-400 leading-relaxed">
              Platform tutorial memasak terlengkap dengan resep-resep pilihan dari dapur Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', path: '/' },
                { label: 'Semua Resep', path: '/recipes' },
                { label: 'Daftar Belanja', path: '/todos' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-cream-400 hover:text-terracotta-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kategori Populer
            </h4>
            <ul className="space-y-2.5">
              {['Masakan Indonesia', 'Dessert & Kue', 'Minuman', 'Sarapan'].map((cat) => (
                <li key={cat}>
                  <span className="text-sm text-cream-400">
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-charcoal-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-500">
            © {new Date().getFullYear()} MasakYuk. All rights reserved.
          </p>
          <p className="text-xs text-cream-500 flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-terracotta-400 fill-terracotta-400" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
