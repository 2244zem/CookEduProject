import { ShoppingBag, Edit3, Trash2, ShieldCheck, Thermometer, User, Star } from 'lucide-react';
import type { Recipe } from '../data/recipeStore';

interface RecipeCardProps {
  recipe: Recipe;
  currentUser: { id: string; username: string };
  isInCart: boolean;
  onToggleCart: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export default function RecipeCard({
  recipe,
  currentUser,
  isInCart,
  onToggleCart,
  onEdit,
  onDelete
}: RecipeCardProps) {
  const isOwner = recipe.createdBy === currentUser.id;

  // Visual category colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Soup": return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Salad": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Main Course": return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Dessert": return "bg-pink-50 text-pink-600 border border-pink-100";
      default: return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  return (
    <div className="group bg-white border border-slate-150/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Subtle top decoration */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="space-y-4">
        {/* Visual Image container */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Temperature Range overlay badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
            <Thermometer className="w-3 h-3 text-emerald-400" />
            <span>{recipe.suitableTemp.min}°F - {recipe.suitableTemp.max}°F</span>
          </div>

          {/* Official badge overlay */}
          {recipe.isOfficial && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Official
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCategoryColor(recipe.category)}`}>
              {recipe.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold text-slate-500">4.8</span>
            </div>
          </div>

          <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {recipe.title}
          </h3>

          {/* Contributor Profile */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-200">
              <User className="w-2.5 h-2.5 text-slate-500" />
            </div>
            <span>
              Oleh: <strong className="text-slate-600 font-bold">{isOwner ? "Anda" : recipe.createdBy}</strong>
              <span className="text-slate-300 mx-1">•</span>
              <span className="italic">{recipe.authorRole}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scoped Actions Panel */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={() => onToggleCart(recipe)}
          className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${
            isInCart
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm"
              : "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isInCart ? "Dalam Belanja" : "+ Masuk Belanja"}</span>
        </button>

        {/* Private Scoped CRUD triggers: rendered ONLY if owner is user_zem123 */}
        {isOwner ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(recipe)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Edit resep"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Hapus resep"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-[10px] text-slate-300 font-medium select-none italic">
            Terkunci (Read Only)
          </div>
        )}
      </div>
    </div>
  );
}
