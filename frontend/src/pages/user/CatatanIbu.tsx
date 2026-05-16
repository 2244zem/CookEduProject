import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Heart, Search, ChevronRight, ArrowLeft, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { recipeData } from '../../data/catatanIbuRecipes';

export default function CatatanIbu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('Chef');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name);
    }
  }, [user]);

  const filteredRecipes = recipeData.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#03045E] font-sans pb-32">
      
      {/* 1. HEADER SECTION (FROSTED GLASS EFFECT) */}
      <div className="bg-gradient-to-b from-[#0077B6]/10 to-transparent p-6 pt-12 max-w-2xl mx-auto w-full relative">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 p-2 bg-white/50 backdrop-blur-md rounded-full text-[#0077B6] hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex flex-col items-center text-center mt-4">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-bold uppercase tracking-widest text-[#0077B6] bg-[#0077B6]/10 px-4 py-1.5 rounded-full border border-[#0077B6]/20"
          >
            📂 Buku Resep Keluarga
          </motion.span>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight mt-4 text-[#03045E]"
          >
            Catatan Ibu
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-500 mt-2 max-w-sm"
          >
            Takaran bumbu tulus, tips rahasia, dan memori rasa untuk {username}.
          </motion.p>
        </div>

        {/* SEARCH BAR BLUE STYLED */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 relative w-full bg-white/90 backdrop-blur-md rounded-3xl border border-blue-100 p-1.5 flex items-center shadow-premium group focus-within:ring-4 ring-primary/5 transition-all"
        >
          <div className="pl-4 text-[#0077B6]">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Cari bawang merah, putih, atau tips..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent pl-3 pr-4 py-3 text-sm focus:outline-none text-[#03045E] placeholder-slate-400 font-medium"
          />
        </motion.div>
      </div>

      {/* 2. RECIPE LIST AREA */}
      <div className="p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredRecipes.map((item, index) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index % 10 * 0.05 }}
              className="bg-white/80 backdrop-blur-md rounded-[40px] border border-white/60 shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
            >
              {/* IMAGE HEADER WITH GRADIENT OVERLAY */}
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/featured/800x600?food,${item.title.split(' ').join(',')}`} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <span className="absolute top-6 left-6 bg-[#03045E] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md bg-opacity-80 border border-white/20">
                  {item.category}
                </span>
                <button className="absolute top-6 right-6 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 shadow-lg transition-all active:scale-90">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* CARD CONTENT */}
              <div className="p-8 flex-1 flex flex-col gap-6">
                {/* DETAILS METRIC */}
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider text-[#0077B6]">
                  <span className="flex items-center gap-2 bg-blue-50/80 px-4 py-2 rounded-full border border-blue-100/50">
                    <Clock className="w-4 h-4" /> {item.duration}
                  </span>
                  <span className="flex items-center gap-2 bg-blue-50/80 px-4 py-2 rounded-full border border-blue-100/50">
                    <BookOpen className="w-4 h-4" /> {item.ingredients.length} Bumbu
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-[#03045E] leading-tight">{item.title}</h2>

                {/* INGREDIENTS PILL TAGS */}
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.slice(0, 4).map((ing, i) => (
                    <span 
                      key={i} 
                      className="text-[11px] bg-[#0077B6]/5 text-[#0077B6] font-bold px-4 py-1.5 rounded-2xl border border-blue-100/50 shadow-sm"
                    >
                      {ing}
                    </span>
                  ))}
                  {item.ingredients.length > 4 && (
                    <span className="text-[11px] text-slate-400 font-bold px-2 py-1.5">+{item.ingredients.length - 4} lainnya</span>
                  )}
                </div>

                {/* MOTHER'S SECRET NOTE (COZY DIARY DESIGN) */}
                <div className="bg-[#0077B6]/5 border border-[#0077B6]/10 rounded-3xl p-6 relative overflow-hidden mt-2 group-hover:bg-[#0077B6]/10 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Bookmark className="w-12 h-12 text-[#0077B6]" />
                  </div>
                  <p className="text-[10px] font-black text-[#0077B6] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <span className="text-lg">✍️</span> Pesan Rahasia Ibu
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                    "{item.motherNote.replace('{username}', username)}"
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate(`/recipes/${item.id}`)}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-[#03045E] text-white rounded-[24px] font-bold text-xs uppercase tracking-widest hover:bg-[#0077B6] transition-all shadow-lg active:scale-95"
                >
                  Lihat Detail <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-[#03045E]">Tidak ada catatan untuk "{searchTerm}"</h3>
            <p className="text-sm text-slate-400">Coba cari bahan lain atau bumbu spesifik.</p>
          </div>
        )}
      </div>
    </div>
  );
}
