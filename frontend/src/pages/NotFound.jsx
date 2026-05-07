/**
 * 404 Not Found Page
 * Halaman yang ditampilkan ketika URL tidak ditemukan
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, ChefHat } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cream-100 via-cream-50 to-terracotta-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-terracotta-100 rounded-3xl mb-8"
        >
          <ChefHat className="w-12 h-12 text-terracotta-500" />
        </motion.div>

        <h1 className="text-7xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-charcoal-800 mb-3">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-charcoal-500 mb-8 leading-relaxed">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan. 
          Mungkin resep yang kamu cari ada di halaman lain?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button icon={Home} size="lg">Kembali ke Beranda</Button>
          </Link>
          <Link to="/recipes">
            <Button variant="secondary" icon={Search} size="lg">Cari Resep</Button>
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-charcoal-400 hover:text-terracotta-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke halaman sebelumnya
        </button>
      </motion.div>
    </div>
  );
}
