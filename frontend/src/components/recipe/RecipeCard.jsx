/**
 * RecipeCard Component — Card resep dengan hover effect
 * 
 * Menampilkan gambar, judul, deskripsi singkat, badge difficulty,
 * dan info waktu memasak. Hover effect halus tanpa shadow berlebihan.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RecipeCard({ recipe }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/recipes/${recipe.slug}`} className="block group">
        <article className="card card-hover overflow-hidden p-0">
          {/* Image container — aspect ratio 4:3 */}
          <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-12 h-12 text-cream-400" />
              </div>
            )}

            {/* Overlay badge di atas gambar */}
            <div className="absolute top-3 left-3">
              <Badge difficulty={recipe.difficulty} />
            </div>

            {/* Category badge */}
            {recipe.category_name && (
              <div className="absolute top-3 right-3">
                <Badge color="neutral">{recipe.category_name}</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="text-base font-semibold text-charcoal-800 leading-snug line-clamp-2 group-hover:text-terracotta-600 transition-colors duration-200">
              {recipe.title}
            </h3>

            {recipe.description && (
              <p className="text-sm text-charcoal-400 leading-relaxed line-clamp-2">
                {recipe.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 pt-2 border-t border-cream-200">
              <span className="flex items-center gap-1.5 text-xs text-charcoal-400">
                <Clock className="w-3.5 h-3.5" />
                {(recipe.prep_time || 0) + (recipe.cook_time || 0)} menit
              </span>
              <span className="flex items-center gap-1.5 text-xs text-charcoal-400">
                <Users className="w-3.5 h-3.5" />
                {recipe.servings} porsi
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
