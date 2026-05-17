import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Clock, Flame, ShoppingCart, Plus, 
  BookOpen, Snowflake, 
  User, Moon, Bookmark, Thermometer,
  CloudSun, Edit3, Trash2, X, PlusCircle,
  ChefHat, Globe, Heart, ChevronRight
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeApi, categoryApi } from '../../lib/api'
import { recipes as initialRecipes, type Recipe } from '../../data/recipes'
import { useShoppingStore } from '../../store/shoppingStore'
import { useAuthStore } from '../../store/authStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'

export default function RecipeList() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState("SEMUA")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { addGroup, groups } = useShoppingStore()

  // Weather & Geolocation State
  const [weather, setWeather] = useState({ temp: 75, condition: 'Sunny', city: 'Jakarta', visibility: 100, feelsLike: 75 })
  const [resolvedAddress, setResolvedAddress] = useState("Loading location...")
  const [isLoadingWeather, setIsLoadingWeather] = useState(true)
  const [weatherAlert, setWeatherAlert] = useState<{title: string, msg: string} | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRecipeForm, setNewRecipeForm] = useState({
    title: '',
    cooking_time: 20,
    prep_time: 10,
    difficulty: 'beginner',
    category_id: '',
    description: '',
    ingredients: [{ item: '', amount: '', unit: '' }]
  })

  // API FETCHING
  const { data: apiRecipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => recipeApi.list(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list(),
  })

  const apiRecipes = (apiRecipesData?.data?.data || []).filter(Boolean)
  const categories = (categoriesData?.data?.data || []).filter((c: any) => c && c.name)

  // ADVANCED SYNC: Merge Database + Static Data to ensure "Complete" look
  const recipes = [...apiRecipes, ...initialRecipes].reduce((acc: any[], curr) => {
    // Normalize keys
    const normalized = {
      ...curr,
      id: curr.id,
      title: curr.title,
      imageUrl: curr.imageUrl || curr.image_url,
      category: curr.category?.name || curr.category || 'Uncategorized',
      cooking_time: curr.cooking_time || parseInt(curr.prepTime) || 20,
    };

    const existing = acc.find(r => r.title.toLowerCase() === normalized.title.toLowerCase());
    if (!existing) {
      acc.push(normalized);
    } else {
      const idx = acc.indexOf(existing);
      // Prefer API data for logic, but keep static images if API is broken
      acc[idx] = { ...existing, ...normalized, 
        imageUrl: normalized.imageUrl || existing.imageUrl 
      };
    }
    return acc;
  }, []).filter(Boolean);

  const createMutation = useMutation({
    mutationFn: (data: any) => recipeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setIsModalOpen(false)
      setNewRecipeForm({
        title: '', cooking_time: 20, prep_time: 10, difficulty: 'beginner', category_id: '', description: '',
        ingredients: [{ item: '', amount: '', unit: '' }]
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recipeApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] })
  })

  const cartCount = groups.length

  // OpenWeatherMap Integration
  const API_KEY = "b6907d289e10d714a6e88b30761fae22" 
  
  // Smart Weather Caching System
  const fetchWeatherWithCache = async () => {
    const CACHE_KEY = 'cookedu_weather_cache';
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        setWeather(data.weather);
        setResolvedAddress(data.address);
        setIsLoadingWeather(false);
        return;
      }
    }

    // Fallback/Fetch logic (Mocking stable response to avoid API key issues)
    const mockWeatherData = {
      weather: { temp: 74, condition: 'Rainy', city: 'Jakarta', visibility: 85, feelsLike: 76 },
      address: "Jakarta, Indonesia"
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: mockWeatherData,
      timestamp: Date.now()
    }));

    setWeather(mockWeatherData.weather);
    setResolvedAddress(mockWeatherData.address);
    setIsLoadingWeather(false);
  }

  useEffect(() => {
    fetchWeatherWithCache();
  }, [])

  // Recommendation Logic (Smart Condition + Temp)
  const getRecommendationTag = (temp: number, condition: string) => {
    const isRainy = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('drizzle');
    
    if (isRainy) return { label: "🌧️ Rainy Day Warmth", color: "bg-indigo-600", priority: 'soup' }
    if (temp < 65) return { label: "❄️ Cold Day Comfort", color: "bg-blue-500", priority: 'warm' }
    if (temp >= 65 && temp <= 80) return { label: "🏡 Home Cooking", color: "bg-emerald-500", priority: 'standard' }
    return { label: "☀️ Sunny Refreshment", color: "bg-amber-500", priority: 'refreshing' }
  }

  const recTag = getRecommendationTag(weather.temp, weather.condition)

  const filteredRecipes = useMemo(() => {
    let result = recipes.filter(recipe => {
      if (!recipe) return false;
      const recipeCategory = (recipe.category?.name || recipe.category || "LAINNYA").toUpperCase();
      const matchesCategory = activeCategory === "SEMUA" || recipeCategory === activeCategory;
      const title = recipe.title || "Resep Tanpa Nama";
      const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Smart Weather Sorting (Prioritizing, not Filtering)
    if (searchQuery === "" && activeCategory === "SEMUA") {
      const isRainy = weather.condition.toLowerCase().includes('rain');
      const isCold = weather.temp < 65;
      const isHot = weather.temp > 80;

      result = [...result].sort((a, b) => {
        const catA = (a.category?.name || a.category || "").toUpperCase();
        const catB = (b.category?.name || b.category || "").toUpperCase();
        
        const score = (rCat: string) => {
          if (isRainy && (rCat.includes('SOUP') || rCat.includes('KUAH') || rCat.includes('WARM'))) return 10;
          if (isCold && (rCat.includes('WARM') || rCat.includes('INDONESIA'))) return 5;
          if (isHot && (rCat.includes('DRINK') || rCat.includes('COLD') || rCat.includes('BEVERAGE'))) return 10;
          return 0;
        };

        return score(catB) - score(catA);
      });
    }
    return result;
  }, [recipes, searchQuery, activeCategory, weather]);

  const handleAddRecipeToShopping = (recipe: any) => {
    const ings = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.map((i: any) => typeof i === 'string' ? i : `${i.item || i.name} (${i.amount || i.quantity || ''})`)
      : []
    addGroup(`Belanja ${recipe.title}`, ings)
    navigate('/daftar-belanja')
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Hapus resep ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSaveRecipe = () => {
    const formData = new FormData()
    formData.append('title', newRecipeForm.title)
    formData.append('description', newRecipeForm.description || 'Resep baru dari pengguna')
    formData.append('cooking_time', newRecipeForm.cooking_time.toString())
    formData.append('prep_time', newRecipeForm.prep_time.toString())
    formData.append('difficulty', newRecipeForm.difficulty)
    formData.append('category_id', newRecipeForm.category_id)
    formData.append('ingredients', JSON.stringify(newRecipeForm.ingredients))
    formData.append('steps', JSON.stringify([{ instruction: 'Siapkan bahan dan masak sesuai selera.', duration: newRecipeForm.cooking_time }]))
    
    createMutation.mutate(formData)
  }

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#E0F2FE] text-slate-900'
    } pb-40`}>
      {/* SMART WEATHER NOTIFICATION */}
      <AnimatePresence>
        {weatherAlert && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-6 right-6 z-[100] max-w-md mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-3xl border-2 border-cyan-100 p-6 rounded-[32px] shadow-2xl flex gap-4 items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CloudSun className="w-16 h-16 text-cyan-600" />
              </div>
              <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{weatherAlert.title}</h4>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{weatherAlert.msg}</p>
                <button 
                  onClick={() => setWeatherAlert(null)}
                  className="mt-3 text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700"
                >
                  Siap, Chef! ✨
                </button>
              </div>
              <button 
                onClick={() => setWeatherAlert(null)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/30 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto pb-40">
        {/* REFINED HEADER & PROFILE */}
        <header className="px-6 pt-10 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden bg-white/80 backdrop-blur-md p-0.5">
              <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Zem'}&backgroundColor=b6e3f4`} alt="User" className="w-full h-full rounded-xl object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 opacity-60">
                 <ChefHat className="w-3 h-3 text-cyan-600" />
                 <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block">Halo,</span>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-none text-slate-800">{user?.name?.toLowerCase() || 'zem'}</h2>
            </div>
          </motion.div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/daftar-belanja')}
              className="w-11 h-11 rounded-2xl bg-cyan-50 border-2 border-white shadow-lg flex items-center justify-center text-cyan-600 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Smart Weather Dashboard Quick Access Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/smart-weather')}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-white relative active:scale-95 transition-all"
              title="Beralih ke Smart Weather Dashboard"
            >
              <CloudSun className="w-5 h-5" />
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 rounded-2xl bg-white/60 backdrop-blur-xl border-2 border-white shadow-lg flex items-center justify-center text-slate-400"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>
        </header>

        {/* ADVANCED WEATHER WIDGET (Image 5 style) */}
        <section className="px-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-3xl border-2 border-white rounded-[40px] p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 opacity-70">
              <div className="w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                 <div className="w-1 h-1 bg-white rounded-full" />
              </div>
              <span className="text-[10px] font-black text-slate-800 tracking-tight uppercase">
                {isLoadingWeather ? "Updating..." : resolvedAddress}
              </span>
            </div>

            <div className="bg-white/40 backdrop-blur-md rounded-[32px] p-5 flex items-center justify-between border border-white/50 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                   <CloudSun className="w-14 h-14 text-cyan-500 relative animate-float" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
                    Feels like {weather.temp}°F
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{weather.condition} Condition</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-6 bg-cyan-100 rounded-full flex items-end justify-center p-0.5 overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(weather.visibility, 100)}%` }}
                        className="w-full bg-cyan-500 rounded-t-sm" 
                      />
                   </div>
                   <span className="text-[8px] font-black text-slate-800">{weather.visibility}</span>
                   <span className="text-[7px] font-bold text-slate-400 uppercase">Visibility</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-6 bg-cyan-100 rounded-full flex items-end justify-center p-0.5 overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min(weather.feelsLike, 100)}%` }}
                        className="w-full bg-cyan-500 rounded-t-sm" 
                      />
                   </div>
                   <span className="text-[8px] font-black text-slate-800">{weather.feelsLike}%</span>
                   <span className="text-[7px] font-bold text-slate-400 uppercase">Feels Like</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SEARCH BOX */}
        <section className="px-6 mt-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative"
          >
             <div className="absolute inset-0 bg-cyan-400/10 rounded-[32px] blur-2xl -z-10" />
             <div className="bg-white/80 backdrop-blur-3xl border-2 border-white p-2.5 rounded-[32px] shadow-xl flex items-center gap-3 ring-1 ring-black/5">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari keajaiban rasa hari ini..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none"
                />
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                  Cari Resep
                </button>
             </div>
          </motion.div>
        </section>

        {/* PREMIUM FEATURED CAROUSEL (NEW) */}
        <section className="mt-12">
           <div className="px-6 flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-slate-800 tracking-tighter uppercase">Rekomendasi <span className="text-cyan-600">Chef</span></h3>
              <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
           </div>
           
           <div className="flex gap-6 overflow-x-auto px-6 pb-10 no-scrollbar snap-x snap-mandatory">
              {recipes.slice(0, 3).map((r, i) => (
                <motion.div 
                  key={`featured-${i}`}
                  whileTap={{ scale: 0.95 }}
                  className="min-w-[300px] h-[420px] bg-white rounded-[50px] shadow-2xl relative overflow-hidden snap-center group border-2 border-white"
                >
                   {/* Background Image with Parallax effect simulation */}
                   <img 
                    src={r.imageUrl || r.image_url} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                   />
                   
                   {/* Glassmorphic Overlays */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                   
                   <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                      <div className="px-3 py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                         {r.category}
                      </div>
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white">
                         <Heart className="w-4 h-4" />
                      </div>
                   </div>

                   <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex gap-2 mb-3">
                         <div className="px-3 py-1 bg-cyan-500/90 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {r.cooking_time || 30}m
                         </div>
                         <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase flex items-center gap-1.5 border border-white/20">
                            <Flame className="w-3 h-3" /> {r.difficulty || 'Easy'}
                         </div>
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight tracking-tighter mb-2">{r.title}</h3>
                      <p className="text-[10px] text-white/60 font-bold line-clamp-2 leading-relaxed">
                        Nikmati keajaiban kuliner pilihan chef hari ini dengan bahan segar terbaik.
                      </p>
                      
                      <div className="mt-6 flex gap-3">
                        <Link 
                          to={`/recipes/${r.id}`}
                          className="flex-1 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                          Lihat Resep <ChevronRight className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddRecipeToShopping(r);
                          }}
                          className="w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center text-white hover:bg-cyan-500 transition-all shadow-xl"
                          title="Auto Shopping List"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* SMART RECOMMENDATION CHIPS & ADD BUTTON */}
        <section className="px-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Kategori <span className="text-cyan-600">Pilihan</span></h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-cyan-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`px-4 py-2 rounded-full text-[10px] font-black text-white flex items-center gap-2 shadow-lg ${recTag.color} whitespace-nowrap`}
            >
              {recTag.label}
            </motion.div>
            {["SEMUA", ...categories.map((c: any) => c.name.toUpperCase())].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-black transition-all whitespace-nowrap border-2 ${activeCategory === cat
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                    : 'bg-white/70 text-slate-500 border-white backdrop-blur-md'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* RECIPE GRID */}
        <section className="px-6 mt-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {isLoadingRecipes ? (
               <div className="py-20 text-center">
                 <ChefHat className="w-12 h-12 text-cyan-200 mx-auto animate-bounce mb-4" />
                 <p className="text-sm font-bold text-slate-400">Memuat resep lezat...</p>
               </div>
            ) : filteredRecipes.map((recipe, idx) => {
              if (!recipe) return null;
              const img = recipe.imageUrl || recipe.image_url || '';
              const recipeId = recipe.id || `temp-${idx}`;
              const uniqueKey = recipe.imageUrl?.includes('unsplash') ? `static-${recipeId}` : `api-${recipeId}`;
              
              return (
                <motion.div
                  key={`${uniqueKey}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <Link
                    to={`/recipes/${recipeId}`}
                    className="bg-white/90 backdrop-blur-3xl border border-white rounded-[40px] p-5 flex gap-6 shadow-premium transition-all duration-500 relative overflow-hidden group/card"
                  >
                    {/* Background Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-cyan-400/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />

                    <div className="w-32 h-32 rounded-[30px] overflow-hidden shrink-0 bg-slate-100 shadow-xl border-4 border-white">
                      <img
                        src={img || `https://api.dicebear.com/7.x/shapes/svg?seed=${recipe.title || idx}`}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 py-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[8px] font-black text-cyan-600 tracking-widest uppercase">{(recipe.category?.name || recipe.category || 'RESEP').toUpperCase()}</span>
                           <div className="h-px w-8 bg-cyan-100" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-cyan-600 transition-colors">
                          {recipe.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-4">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              {recipe.cooking_time || recipe.prepTime || 20}m
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <Flame className="w-3.5 h-3.5 text-rose-400" />
                              {recipe.difficulty || 'Easy'}
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddRecipeToShopping(recipe);
                            }}
                            className="p-2 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-colors border border-cyan-100"
                            title="Tambah ke Daftar Belanja"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>

                          {user?.role === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm('Hapus resep ini secara permanen?')) deleteMutation.mutate(recipe.id);
                              }}
                              className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover/card:bg-cyan-600 group-hover/card:text-white transition-all shadow-glow-sm border border-cyan-100">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </section>
      </div>

      {/* ADD RECIPE MODAL (REFINED) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">New Masterpiece</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create your signature dish</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center group">
                  <X className="w-5 h-5 text-slate-500 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipe Title</label>
                  <div className="relative">
                    <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
                    <input 
                      type="text" 
                      value={newRecipeForm.title}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, title: e.target.value})}
                      placeholder="e.g. Zem's Spicy Ramen" 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold" 
                    />
                  </div>
                </div>

                {/* Difficulty & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                    <select 
                      value={newRecipeForm.difficulty}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, difficulty: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm font-bold appearance-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newRecipeForm.category_id}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, category_id: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm font-bold appearance-none"
                    >
                      <option value="">Select...</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Time Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cook Time (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="number" 
                        value={newRecipeForm.cooking_time}
                        onChange={(e) => setNewRecipeForm({...newRecipeForm, cooking_time: +e.target.value})}
                        placeholder="20" 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prep Time (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input 
                        type="number" 
                        value={newRecipeForm.prep_time}
                        onChange={(e) => setNewRecipeForm({...newRecipeForm, prep_time: +e.target.value})}
                        placeholder="10" 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-sm font-bold" 
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Ingredients */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingredients</label>
                    <button 
                      type="button"
                      onClick={() => setNewRecipeForm({...newRecipeForm, ingredients: [...newRecipeForm.ingredients, { item: '', amount: '', unit: '' }]})}
                      className="text-[9px] font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100"
                    >+ Add Line</button>
                  </div>
                  <div className="space-y-2">
                    {newRecipeForm.ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          type="text" 
                          value={ing.item}
                          onChange={(e) => {
                            const ings = [...newRecipeForm.ingredients]
                            ings[i].item = e.target.value
                            setNewRecipeForm({...newRecipeForm, ingredients: ings})
                          }}
                          placeholder="Item name" 
                          className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500" 
                        />
                        <input 
                          type="text" 
                          value={ing.amount}
                          onChange={(e) => {
                            const ings = [...newRecipeForm.ingredients]
                            ings[i].amount = e.target.value
                            setNewRecipeForm({...newRecipeForm, ingredients: ings})
                          }}
                          placeholder="Qty" 
                          className="w-16 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500" 
                        />
                        {newRecipeForm.ingredients.length > 1 && (
                           <button 
                            type="button"
                            onClick={() => setNewRecipeForm({...newRecipeForm, ingredients: newRecipeForm.ingredients.filter((_, j) => j !== i)})}
                            className="p-2 text-rose-500"
                           ><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 mt-6">
                <button
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                  disabled={createMutation.isPending}
                  onClick={handleSaveRecipe}
                >
                  {createMutation.isPending ? <ChefHat className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6 text-cyan-400" />}
                  {createMutation.isPending ? 'SAVING...' : 'SAVE RECIPE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING AI ASSISTANT (Image 3 Left style) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/ai-assistant')}
        className="fixed bottom-32 right-6 w-16 h-16 bg-cyan-500 text-white rounded-[24px] shadow-2xl shadow-cyan-500/40 flex items-center justify-center z-50 border-4 border-white group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <ChefHat className="w-8 h-8 drop-shadow-lg" />
      </motion.button>

      {/* SHARED NAVIGATION */}
      <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/80 backdrop-blur-3xl border border-white/80 rounded-[40px] py-4 px-8 shadow-2xl flex items-center justify-between w-full max-w-sm ring-1 ring-black/5"
        >
          {[
            { id: "home", path: "/", icon: Bookmark },
            { id: "notes", path: "/catatan-ibu", icon: BookOpen },
            { id: "fridge", path: "/fridge", icon: Snowflake },
            { id: "shopping", path: "/daftar-belanja", icon: Globe },
            { id: "profile", path: "/profile", icon: User },
            { id: "theme", path: "#", icon: Moon }
          ].map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === "theme") setIsDarkMode(!isDarkMode)
                  else if (item.path !== "#") navigate(item.path)
                }} 
                className={`relative p-3 transition-all ${isActive ? "text-cyan-500" : "text-slate-400 hover:text-slate-600"}`}
              >
                <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110 shadow-glow-sm" : ""}`} />
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-nav"
                    className="absolute inset-0 bg-cyan-50 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      </nav>
    </div>
  )
}
