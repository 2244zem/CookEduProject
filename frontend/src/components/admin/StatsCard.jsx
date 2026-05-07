/**
 * StatsCard Component — Card statistik admin dashboard
 * 
 * Menampilkan angka statistik dengan icon dan trend indicator.
 * Desain clean tanpa shadow berlebihan.
 */

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, color = 'terracotta', index = 0 }) {
  const colorMap = {
    terracotta: {
      bg: 'bg-terracotta-50',
      icon: 'text-terracotta-500',
      border: 'border-terracotta-100',
    },
    sage: {
      bg: 'bg-sage-50',
      icon: 'text-sage-500',
      border: 'border-sage-100',
    },
    charcoal: {
      bg: 'bg-charcoal-50',
      icon: 'text-charcoal-500',
      border: 'border-charcoal-100',
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      border: 'border-amber-100',
    },
  };

  const colors = colorMap[color] || colorMap.terracotta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`card p-6 ${colors.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-charcoal-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-charcoal-800 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sage-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
