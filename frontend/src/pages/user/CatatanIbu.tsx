import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Clock, Heart, Search, 
  ChevronRight, ArrowLeft, Bookmark, 
  ShoppingCart, Snowflake, Globe, 
  User, Moon 
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../../store'
import { recipeData } from '../../data/catatanIbuRecipes'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'
import imgDefault from '../../assets/download (1).jpg'

export default function CatatanIbu() {
  const [searchTerm, setSearchTerm] = useState('')
  const [username, setUsername] = useState('User')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { isDarkMode } = useThemeStore()

  useEffect(() => {
    if (user?.name) {
      setUsername(user.name)
    }
  }, [user])

  const filteredRecipes = recipeData.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent ${
      isDarkMode ? 'dark text-white' : 'text-slate-800'
    } pb-40`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 lg:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-lg lg:max-w-6xl">
        {/* HEADER SECTION */}
        <header className="px-6 pt-12 pb-8 lg:px-0 lg:pt-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center text-cyan-600 shadow-premium mb-8"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>

          <div className="text-center lg:text-left">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20 text-cyan-600 text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <BookOpen className="w-3 h-3" /> Buku Resep Keluarga
            </motion.div>
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-black tracking-tight text-slate-900 lg:text-6xl"
            >
              Catatan Ibu
            </motion.h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Takaran bumbu tulus dan memori rasa untuk {username}.
            </p>
          </div>

          {/* SEARCH BAR */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-10 relative"
          >
            <div className="absolute inset-0 bg-cyan-400/20 rounded-[28px] blur-2xl -z-10" />
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-6 h-6 text-cyan-500" />
              <input 
                type="text" 
                placeholder="Cari bumbu atau tips rahasia..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-2xl border-2 border-white p-5 pl-14 rounded-[28px] text-base focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all text-slate-800 placeholder-slate-400 font-bold shadow-2xl"
              />
            </div>
          </motion.div>
        </header>

        {/* RECIPE LIST */}
        <main className="px-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:px-0 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/70 backdrop-blur-2xl rounded-[40px] border border-white/80 shadow-premium overflow-hidden group hover:shadow-glow transition-all duration-500"
              >
                {/* IMAGE */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={imgDefault} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-6 left-6 bg-cyan-600/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
                    {item.category}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-100">
                      <Clock className="w-3.5 h-3.5" /> {item.duration}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Bookmark className="w-3.5 h-3.5" /> {item.ingredients.length} Bahan
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6 group-hover:text-cyan-700 transition-colors">
                    {item.title}
                  </h2>

                  {/* MOTHER'S NOTE */}
                  <div className="bg-cyan-50/50 border border-cyan-100/50 rounded-3xl p-5 relative overflow-hidden mb-8">
                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-2">Pesan Rahasia Ibu</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                      "{item.motherNote.replace('{username}', username)}"
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/recipes/${item.id}`)}
                    className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    Buka Catatan <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRecipes.length === 0 && (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900">Tidak ada catatan ditemukan</h3>
              <p className="text-sm text-slate-400">Coba cari bahan lain atau bumbu spesifik.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
