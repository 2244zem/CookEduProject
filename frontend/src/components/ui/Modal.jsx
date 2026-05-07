/**
 * Modal Component — Dialog overlay
 * 
 * Menggunakan Framer Motion untuk animasi masuk/keluar.
 * Backdrop blur memberikan efek glassmorphism halus.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop — klik di luar modal untuk menutup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative bg-white rounded-xl border border-cream-200
              w-full ${sizeClasses[size]} max-h-[85vh] overflow-hidden
              flex flex-col
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <h3 className="text-lg font-semibold text-charcoal-800">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-cream-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="px-6 py-4 overflow-y-auto scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
