/**
 * IngredientChecklist Component — Checklist interaktif bahan
 * 
 * Fitur utama:
 * - Klik bahan untuk menandai "sudah disiapkan"
 * - Bahan yang dicentang mendapat efek strikethrough
 * - Counter menunjukkan progress (3/10 bahan siap)
 * - Animasi halus saat toggle dengan Framer Motion
 * 
 * State disimpan di local component (bukan database),
 * karena ini fitur UX untuk membantu user di dapur.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingCart, ChefHat } from 'lucide-react';

export default function IngredientChecklist({ ingredients = [] }) {
  // Track mana saja bahan yang sudah dicentang
  // Menggunakan Set untuk O(1) lookup
  const [checked, setChecked] = useState(new Set());

  const toggleItem = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Hitung progress
  const progress = useMemo(() => ({
    done: checked.size,
    total: ingredients.length,
    percentage: ingredients.length > 0
      ? Math.round((checked.size / ingredients.length) * 100)
      : 0,
  }), [checked.size, ingredients.length]);

  return (
    <div className="space-y-4">
      {/* Header dengan progress bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-terracotta-500" />
          Bahan-bahan
        </h3>
        <span className="text-sm text-charcoal-400">
          {progress.done}/{progress.total} siap
        </span>
      </div>

      {/* Progress bar visual */}
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-terracotta-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Daftar bahan */}
      <ul className="space-y-1">
        {ingredients.map((item) => {
          const isChecked = checked.has(item.id);

          return (
            <motion.li
              key={item.id}
              layout
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                transition-colors duration-200 select-none
                ${isChecked
                  ? 'bg-sage-50'
                  : 'hover:bg-cream-50'
                }
              `}
              onClick={() => toggleItem(item.id)}
            >
              {/* Custom checkbox — lingkaran dengan checkmark */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200 flex-shrink-0
                  ${isChecked
                    ? 'bg-sage-400 border-sage-400'
                    : 'border-cream-400'
                  }
                `}
              >
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              {/* Nama bahan + jumlah */}
              <div className="flex-1 min-w-0">
                <span
                  className={`
                    text-sm transition-all duration-200
                    ${isChecked
                      ? 'text-charcoal-400 line-through'
                      : 'text-charcoal-700'
                    }
                  `}
                >
                  {item.name}
                </span>
              </div>

              {/* Jumlah + satuan */}
              {(item.quantity || item.unit) && (
                <span
                  className={`
                    text-sm font-medium flex-shrink-0
                    ${isChecked ? 'text-charcoal-300' : 'text-charcoal-500'}
                  `}
                >
                  {item.quantity} {item.unit}
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>

      {/* Pesan semua bahan siap */}
      {progress.done === progress.total && progress.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-sage-50 border border-sage-200"
        >
          <ChefHat className="w-5 h-5 text-sage-500" />
          <span className="text-sm font-medium text-sage-700">
            Semua bahan sudah ada yuk masak !!
          </span>
        </motion.div>
      )}
    </div>
  );
}
