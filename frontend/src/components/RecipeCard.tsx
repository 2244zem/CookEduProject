import React, { useState, useEffect } from 'react';
import { ShoppingBag, Edit3, Trash2, ShieldCheck, Thermometer, User, Star, Flame, Sparkles } from 'lucide-react';
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
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);

  // 1. Sync live geocoded temperature for dynamic climate-fit psychology
  useEffect(() => {
    const checkWeather = () => {
      try {
        const stored = localStorage.getItem('cookedu_last_weather');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.temp === 'number') {
            setCurrentTemp(parsed.temp);
          }
        }
      } catch (e) {}
    };
    checkWeather();
    // Live polling simulation to match search cards instantly
    const interval = setInterval(checkWeather, 2000);
    return () => clearInterval(interval);
  }, []);

  const tempFits = currentTemp !== null && currentTemp >= recipe.suitableTemp.min && currentTemp <= recipe.suitableTemp.max;

  // 2. High-end visual category accents with custom matching micro-dots
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Soup": 
        return {
          pill: "bg-sky-50 text-sky-600 border border-sky-100/70",
          dot: "bg-sky-500"
        };
      case "Salad": 
        return {
          pill: "bg-emerald-50 text-emerald-600 border border-emerald-100/70",
          dot: "bg-emerald-500"
        };
      case "Main Course": 
        return {
          pill: "bg-amber-50/80 text-amber-700 border border-amber-100/70",
          dot: "bg-amber-500"
        };
      case "Dessert": 
        return {
          pill: "bg-rose-50 text-rose-600 border border-rose-100/70",
          dot: "bg-rose-500"
        };
      default: 
        return {
          pill: "bg-slate-50 text-slate-500 border border-slate-100/70",
          dot: "bg-slate-400"
        };
    }
  };

  const theme = getCategoryTheme(recipe.category);

  return (
    <div className="group bg-white border border-sky-100/60 rounded-[30px] p-4 flex flex-col justify-between hover:shadow-xl hover:shadow-sky-500/[0.03] hover:border-sky-200/60 transition-all duration-500 relative overflow-hidden">
      
      {/* Premium top aesthetic glow bar */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-sky-400 via-teal-400 to-sky-400 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* ================= CINEMATIC IMAGE VIEWER ================= */}
        <div className="relative w-full h-44 rounded-[22px] overflow-hidden bg-sky-50/20 border border-sky-100/40">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Adaptive Climate Recommendation Telemetry Badge (Appetite Psychology) */}
          {tempFits ? (
            <div className="absolute top-3 left-3 bg-teal-500/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1.2 rounded-full flex items-center gap-1.5 shadow-md shadow-teal-500/20 border border-white/20 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-white" />
              <span>SUHU COCOK ({currentTemp}°F)</span>
            </div>
          ) : recipe.isOfficial ? (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-[8px] font-black px-2.5 py-1.2 rounded-full flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-2.5 h-2.5" /> 
              <span>OFFICIAL</span>
            </div>
          ) : null}

          {/* Temperature Threshold Range pill */}
          <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-sm">
            <Thermometer className="w-3 h-3 text-sky-400" />
            <span>{recipe.suitableTemp.min}°F - {recipe.suitableTemp.max}°F</span>
          </div>
        </div>

        {/* ================= CONTENT METADATA HIERARCHY ================= */}
        <div className="space-y-2 text-left px-1">
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${theme.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
              {recipe.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span className="text-[10px] font-black text-slate-500">4.9</span>
            </div>
          </div>

          <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors tracking-tight mt-1">
            {recipe.title}
          </h3>

          {/* Author/Contributor line */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
            <div className="w-4.5 h-4.5 bg-sky-50 border border-sky-100/50 rounded-full flex items-center justify-center shrink-0">
              <User className="w-2.5 h-2.5 text-sky-500" />
            </div>
            <span className="truncate">
              Oleh: <strong className="text-slate-600 font-bold">{isOwner ? "Anda" : recipe.createdBy}</strong>
              <span className="text-slate-200 mx-1.5">•</span>
              <span className="italic font-medium">{recipe.authorRole}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= SCOPED ACTIONS CAPSULED BAR ================= */}
      <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-sky-50">
        <button
          onClick={() => onToggleCart(recipe)}
          className={`text-[10px] font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 border shrink-0 ${
            isInCart
              ? "bg-teal-50 border-teal-200 text-teal-600 shadow-sm shadow-teal-500/[0.04]"
              : "bg-slate-900 border-slate-900 text-white hover:bg-sky-500 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10"
          }`}
          title={isInCart ? "Hapus dari Daftar Belanja" : "Tambahkan Bahan ke Belanja"}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isInCart ? "Tersimpan" : "+ Belanja"}</span>
        </button>

        {/* CRUD Controls scoped perfectly to owners */}
        {isOwner ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(recipe)}
              className="w-8 h-8 flex items-center justify-center text-slate-450 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
              title="Edit resep"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-500" />
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Hapus resep"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        ) : (
          <div className="text-[8px] font-black text-slate-400/80 bg-slate-50 border border-slate-100/80 px-2.5 py-1 rounded-lg select-none uppercase tracking-wider">
            Resep Global
          </div>
        )}
      </div>
    </div>
  );
}
