/**
 * Navbar Component — Navigasi utama website
 * 
 * Responsive dengan mobile menu. Menampilkan link navigasi
 * berbeda tergantung status login dan role user.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChefHat, LogOut, User, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Jangan tampilkan navbar di halaman admin
  if (location.pathname.startsWith('/admin')) return null;

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Resep', path: '/recipes' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-terracotta-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-charcoal-800 tracking-tight">
              Masak<span className="text-terracotta-500">Yuk</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${isActive(link.path)
                    ? 'bg-terracotta-50 text-terracotta-600'
                    : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-cream-100'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Link ke Todo List */}
                <Link
                  to="/todos"
                  className="p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-cream-100 transition-colors relative"
                  title="Daftar Belanja"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Link>

                {/* Link ke Admin Dashboard (hanya admin) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-lg text-charcoal-500 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}

                {/* User dropdown */}
                <div className="flex items-center gap-2 pl-3 border-l border-cream-300">
                  <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-terracotta-600" />
                  </div>
                  <span className="text-sm font-medium text-charcoal-700">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-charcoal-500 hover:bg-cream-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-cream-200 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : 'text-charcoal-600'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/todos"
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-600"
                    onClick={() => setMobileOpen(false)}
                  >
                    Daftar Belanja
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2 border-t border-cream-200 mt-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">Masuk</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">Daftar</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
