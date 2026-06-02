import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Plus, X, Flame, Clock, ArrowRight, Loader2, 
  ArrowLeft, Refrigerator, CheckCircle2, BookOpen, Snowflake, User, Bookmark, BarChart3,
  Globe, Moon
} from 'lucide-react'
import { recipeApi } from '../../lib/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { useThemeStore } from '../../store'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'
import { stapleIngredientsData } from '../../data/stapleIngredients'

export default function FridgeScanner() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useThemeStore()

  // Grouped suggestions for the UI
  const categories = Array.from(new Set(stapleIngredientsData.map(i => i.category)))

  const addIngredient = (ing: string) => {
    const trimmed = ing.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setInputValue('')
    }
  }

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing))
  }

  const findRecipes = async () => {
    if (ingredients.length === 0) return
    setIsScanning(true)
    setLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await recipeApi.list()
      const allRecipes = res.data.data
      
      const matched = allRecipes.map((r: any) => {
        const ingredientsList = Array.isArray(r.ingredients) ? r.ingredients : [];
        
        const recipeIngs = ingredientsList.map((i: any) => {
           if (typeof i === 'string') return i.toLowerCase();
           return (i.item || i.name || '').toLowerCase();
        });
        
        const titleAndDesc = (r.title + ' ' + r.description).toLowerCase();
        
        const matchCount = ingredients.filter(ing => {
           const lowerIng = ing.toLowerCase();
           return titleAndDesc.includes(lowerIng) || recipeIngs.some((ri: string) => ri.includes(lowerIng));
        }).length
        
        return { ...r, matchCount }
      })
      .filter((r: any) => r.matchCount > 0)
      .sort((a: any, b: any) => b.matchCount - a.matchCount)
      
      setRecipes(matched)
      setHasScanned(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setIsScanning(false)
    }
  }

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent ${
      isDarkMode ? 'dark text-white' : 'text-slate-800'
    } pb-40`}>
      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 lg:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-lg lg:max-w-7xl">
        <header className="px-6 pt-12 lg:px-0 lg:pt-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-12 h-12 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl flex items-center justify-center text-cyan-600 shadow-premium mb-8"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>

          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-cyan-600 rounded-3xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <Refrigerator className="w-8 h-8 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none">
                Isi <span className="text-cyan-600">Kulkasmu?</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold tracking-wide mt-2">Mari lihat apa yang bisa dimasak hari ini</p>
            </div>
          </div>
        </header>

        <main className="px-6 space-y-8 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0 lg:px-0">
          {/* INPUT CARD */}
          <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[40px] shadow-premium border border-white/80">
            <div className="relative mb-6">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient(inputValue)}
                placeholder="Ketik bahan di kulkas..."
                className="w-full h-16 bg-slate-50 rounded-3xl px-6 pr-16 text-sm font-bold focus:outline-none border-2 border-transparent focus:border-cyan-500/20 transition-all placeholder:text-slate-300"
              />
              <button 
                onClick={() => addIngredient(inputValue)}
                className="absolute right-3 top-3 w-10 h-10 bg-cyan-600 text-white rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <AnimatePresence>
                {ingredients.map(ing => (
                  <motion.span 
                    key={ing}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-cyan-100 shadow-sm"
                  >
                    {ing}
                    <button onClick={() => removeIngredient(ing)}><X className="w-3.5 h-3.5" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {stapleIngredientsData.filter(i => i.category === cat).slice(0, 6).map(ing => (
                      <button 
                        key={ing.id}
                        onClick={() => addIngredient(ing.name)}
                        className="px-4 py-2 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all shadow-sm flex items-center gap-2"
                      >
                        <span className="text-xs">{ing.icon}</span>
                        {ing.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={findRecipes}
              disabled={ingredients.length === 0 || loading}
              className="w-full mt-10 h-16 bg-slate-900 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mencari...</>
              ) : (
                <><Search className="w-5 h-5" /> Cari Inspirasi Resep</>
              )}
            </motion.button>
          </div>

          {/* RESULTS AREA */}
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center text-center p-10 bg-cyan-600/5 rounded-[40px] border border-cyan-500/10 relative overflow-hidden"
              >
                <motion.div 
                  animate={{ y: [-100, 300] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_#22D3EE] z-20"
                />
                <Search className="w-12 h-12 text-cyan-600 mb-4 animate-pulse" />
                <h3 className="text-xl font-black text-cyan-600">Sedang Memindai...</h3>
              </motion.div>
            ) : hasScanned && recipes.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-10 text-center bg-white/70 rounded-[40px] border border-slate-100"
              >
                <Refrigerator className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900">Tidak Ada Resep Cocok</h3>
                <p className="text-sm text-slate-400 mt-2">Coba tambahkan bahan dasar lain.</p>
              </motion.div>
            ) : recipes.length > 0 ? (
              <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                {recipes.map((recipe, i) => (
                  <motion.div 
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="bg-white/70 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-premium group cursor-pointer border border-white hover:shadow-glow transition-all"
                  >
                    <div className="p-6 flex gap-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                        <img src={recipe.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[8px] font-black uppercase tracking-widest">Cocok {Math.min(100, 40 + (recipe.matchCount * 20))}%</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-cyan-700">{recipe.title}</h4>
                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.cooking_time}m</span>
                          <span className="flex items-center gap-1 text-rose-400"><Flame className="w-3.5 h-3.5" /> {recipe.nutritional_info?.calories || 0} Cal</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
