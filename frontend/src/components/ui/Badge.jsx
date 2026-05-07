/**
 * Badge Component — Label kecil untuk status/kategori
 * 
 * Warna badge disesuaikan dengan difficulty resep
 * atau jenis konten lainnya.
 */

const colorMap = {
  primary: 'bg-terracotta-50 text-terracotta-600 border-terracotta-200',
  success: 'bg-sage-50 text-sage-600 border-sage-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
  neutral: 'bg-cream-200 text-charcoal-600 border-cream-300',
};

// Mapping difficulty resep ke warna badge
const difficultyColors = {
  mudah: 'success',
  sedang: 'warning',
  sulit: 'danger',
};

export default function Badge({ children, color = 'primary', difficulty, className = '' }) {
  // Jika ada prop difficulty, otomatis pilih warna yang sesuai
  const resolvedColor = difficulty ? difficultyColors[difficulty] || 'neutral' : color;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium border
        ${colorMap[resolvedColor]}
        ${className}
      `}
    >
      {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : children}
    </span>
  );
}
