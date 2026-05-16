import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, ChefHat, Flame, Clock, ArrowRight, Loader2, Info, ArrowLeft, Refrigerator } from 'lucide-react'
import { recipeApi } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function FridgeScanner() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const navigate = useNavigate()

  const commonIngredients = [
    { name: 'Telur', icon: '🥚' },
    { name: 'Ayam', icon: '🍗' },
    { name: 'Nasi', icon: '🍚' },
    { name: 'Cabai', icon: '🌶️' },
    { name: 'Bawang Putih', icon: '🧄' },
    { name: 'Susu', icon: '🥛' },
    { name: 'Roti', icon: '🍞' },
    { name: 'Ikan', icon: '🐟' },
    { name: 'Tomat', icon: '🍅' },
    { name: 'Sosis', icon: '🌭' }
  ]

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
    
    // Artificial delay for "Matching" feel
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await recipeApi.list()
      const allRecipes = res.data.data
      
      const matched = allRecipes.map((r: any) => {
        let ingredientsList = [];
        try {
           ingredientsList = typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : (Array.isArray(r.ingredients) ? r.ingredients : []);
        } catch (e) {
           ingredientsList = [];
        }
        
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
    <div className="pb-40 pt-12 px-6 max-w-6xl mx-auto min-h-screen relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-16 relative z-10">
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-6"
        >
          <div className="w-20 h-20 bg-primary rounded-[30px] flex items-center justify-center shadow-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Refrigerator className="w-10 h-10 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none text-text-primary">
              Isi <span className="text-primary font-medium">Kulkasmu?</span>
            </h1>
            <p className="text-text-secondary text-sm font-medium tracking-wide mt-2">Mari lihat apa yang bisa kita masak hari ini</p>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-surface-card p-10 rounded-[50px] shadow-premium border border-gray-100 dark:border-white/5 relative overflow-hidden">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-primary" /> Bahan yang Tersedia
            </h3>
            
            <div className="relative mb-8">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient(inputValue)}
                placeholder="Ketik bahan..."
                className="w-full h-16 bg-gray-50 dark:bg-white/5 rounded-[22px] px-8 pr-16 text-sm font-bold focus:outline-none border border-transparent focus:border-primary/30 transition-all shadow-inner placeholder:text-gray-400"
              />
              <button 
                onClick={() => addIngredient(inputValue)}
                className="absolute right-3 top-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-glow hover:scale-105 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-10 min-h-[40px]">
              <AnimatePresence>
                {ingredients.map(ing => (
                  <motion.span 
                    key={ing}
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest border border-primary/20 group"
                  >
                    {ing}
                    <button onClick={() => removeIngredient(ing)} className="hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-white/5">
              <p className="text-xs font-semibold text-gray-500 mb-5">Sering Tersedia:</p>
              <div className="grid grid-cols-2 gap-3">
                {commonIngredients.map(ing => (
                  <button 
                    key={ing.name}
                    onClick={() => addIngredient(ing.name)}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-primary/10 hover:text-primary rounded-2xl text-xs font-semibold transition-all border border-transparent hover:border-primary/20"
                  >
                    <span className="text-lg">{ing.icon}</span> {ing.name}
                  </button>
                ))}
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={findRecipes}
              disabled={ingredients.length === 0 || loading}
              className="w-full mt-10 h-16 bg-primary text-white rounded-[24px] font-bold text-[14px] shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Mencari...</>
              ) : (
                <><Search className="w-5 h-5" /> Cari Resep</>
              )}
            </motion.button>
          </div>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-20 bg-primary/5 rounded-[60px] border border-primary/20 relative overflow-hidden min-h-[400px]"
              >
                <motion.div 
                  animate={{ y: [-100, 400] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_#00B4D8] z-20"
                />
                <div className="relative z-10">
                   <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow animate-pulse">
                      <Search className="w-16 h-16 text-white" />
                   </div>
                   <h3 className="text-2xl font-bold text-primary mb-3">Sedang Mencari...</h3>
                   <p className="text-text-secondary font-medium text-sm">Mencocokkan bahanmu dengan resep terbaik</p>
                </div>
              </motion.div>
            ) : hasScanned && recipes.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-20 bg-gray-50 dark:bg-white/5 rounded-[70px] border border-gray-100 dark:border-white/5 min-h-[400px]"
              >
                <div className="relative mb-8">
                   <Refrigerator className="w-24 h-24 text-gray-300 dark:text-white/20 relative z-10" />
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                     <X className="w-5 h-5 text-red-500" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">Oops, Tidak Ada Resep Cocok!</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm text-sm mb-8">
                  Kami tidak menemukan resep yang menggunakan bahan tersebut. Coba tambahkan bahan lain atau periksa kembali ejaanmu.
                </p>
                <button onClick={() => setHasScanned(false)} className="px-6 py-3 bg-white dark:bg-surface-card border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  Coba Bahan Lain
                </button>
              </motion.div>
            ) : recipes.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10"
              >
                {recipes.map((recipe, i) => (
                  <motion.div 
                    key={recipe.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="bg-white dark:bg-surface-card rounded-[50px] overflow-hidden shadow-premium group cursor-pointer border border-transparent hover:border-primary/30 transition-all flex flex-col h-full"
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-6 right-6 px-5 py-2 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">{recipe.difficulty}</div>
                      <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-glow">Cocok {Math.min(100, 40 + (recipe.matchCount * 20))}%</div>
                    </div>
                    <div className="p-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase bg-primary/5 px-4 py-2 rounded-xl"><Flame className="w-4 h-4" /> {recipe.nutritional_info?.calories || 0} Cal</div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary uppercase bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl"><Clock className="w-4 h-4" /> {recipe.cooking_time}m</div>
                      </div>
                      <h4 className="text-2xl font-black text-text-primary mb-3 tracking-tight line-clamp-1">{recipe.title}</h4>
                      <p className="text-sm text-text-secondary line-clamp-2 font-bold mb-8 leading-relaxed opacity-70">{recipe.description}</p>
                      <div className="mt-auto pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex -space-x-3">
                           {[1,2,3].map(x => <div key={x} className="w-9 h-9 rounded-full border-4 border-white dark:border-surface-card bg-gray-200" />)}
                           <div className="w-9 h-9 rounded-full border-4 border-white dark:border-surface-card bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-sm">+1k</div>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                           <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-20 bg-gray-50 dark:bg-white/5 rounded-[70px] border border-gray-100 dark:border-white/5 min-h-[400px]"
              >
                <div className="relative mb-12">
                   <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse" />
                   <Refrigerator className="w-24 h-24 text-gray-200 dark:text-white/10 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 mb-3">Kulkas Pintar</h3>
                <p className="text-gray-400 font-medium max-w-xs text-sm">Tambahkan bahan yang kamu miliki untuk melihat resep yang bisa dimasak.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
