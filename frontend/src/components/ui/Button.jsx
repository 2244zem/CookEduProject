/**
 * Button Component — Variant-based button
 * 
 * Mendukung beberapa variant: primary, secondary, ghost, danger.
 * Menggunakan Framer Motion untuk efek tap (scale down sedikit).
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700',
  secondary: 'bg-cream-200 text-charcoal-700 hover:bg-cream-300 border border-cream-400',
  ghost: 'bg-transparent text-charcoal-600 hover:bg-cream-200',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
