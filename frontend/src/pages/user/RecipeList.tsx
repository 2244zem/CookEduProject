import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Clock, Flame, ShoppingCart, Plus, 
  BookOpen, Snowflake, 
  User, Moon, Bookmark, Thermometer,
  CloudSun, Edit3, Trash2, X, PlusCircle,
  ChefHat, Globe, Heart, ChevronRight, Compass,
  Award, Shield, Activity, Sparkles, MapPin
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeApi, categoryApi } from '../../lib/api'
import { recipes as initialRecipes, type Recipe } from '../../data/recipes'
import { useShoppingStore } from '../../store/shoppingStore'
import { useAuthStore } from '../../store/authStore'

// Asset Imports
import bgPattern from '../../assets/food_drawing.jpg'
import inspiration1 from '../../assets/download (1).jpg';
import inspiration2 from '../../assets/download (2).jpg';
import inspiration3 from '../../assets/download (3).jpg';

export default function RecipeList() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [activeCategory, setActiveCategory] = useState("SEMUA")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const { addGroup, groups } = useShoppingStore()

  // Weather & Geolocation State
  const [weather, setWeather] = useState({ 
    temp: 74, 
    condition: 'Partly Cloudy', 
    city: 'Bandung, ID', 
    visibility: 110, 
    feelsLike: 74, 
    precipitation: 68, 
    humidity: 68 
  })
  const [resolvedAddress, setResolvedAddress] = useState("Bandung, ID")
  const [searchAddressInput, setSearchAddressInput] = useState("Bandung, ID")
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
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

  // Weather Geocoder Fetch Logic
  const handleFetchWeather = async (city: string) => {
    if (!city.trim()) return;
    try {
      setIsLoadingWeather(true);
      const cleanCity = encodeURIComponent(city.trim());
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cleanCity}&limit=1&appid=bd5e378503939ddaee76f12ad7a97608`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=bd5e378503939ddaee76f12ad7a97608`;
        const weatherRes = await fetch(weatherUrl);
        const wData = await weatherRes.json();
        
        if (wData && wData.main) {
          const temp = Math.round(wData.main.temp);
          const cond = wData.weather[0]?.main || "Partly Cloudy";
          const clouds = wData.clouds?.all || 68;
          const vis = Math.round((wData.visibility || 11000) / 100);
          const hum = wData.main.humidity || 68;

          setWeather({
            temp,
            condition: cond,
            city: `${name}, ${country}`,
            visibility: vis,
            feelsLike: temp,
            precipitation: clouds,
            humidity: hum
          });
          setResolvedAddress(`${name}, ${country}`);
          setSearchAddressInput(`${name}, ${country}`);

          // Trigger dynamic culinary weather alerts
          if (cond.toLowerCase().includes('rain') || cond.toLowerCase().includes('storm')) {
            setWeatherAlert({
              title: "🌧️ Cuaca Hujan Terdeteksi!",
              msg: `Suhu ${temp}°F di ${name} terasa dingin. Chef merekomendasikan memasak hidangan berkuah hangat seperti Soto Ayam hari ini!`
            });
          } else if (temp > 80) {
            setWeatherAlert({
              title: "☀️ Suhu Panas Terdeteksi!",
              msg: `Udara ${temp}°F cukup terik di ${name}. Waktunya menyegarkan diri dengan hidangan penutup dingin seperti Es Cendol!`
            });
          }
        }
      }
    } catch (err) {
      console.warn("API Skip, falling back to Bandung coordinate telemetry:", err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    handleFetchWeather("Bandung, ID");
  }, []);

  // Recommendation Tag calculation
  const recTag = useMemo(() => {
    const cond = weather.condition.toLowerCase();
    const isRainy = cond.includes('rain') || cond.includes('storm') || cond.includes('drizzle');
    
    if (isRainy) return { label: "🌧️ Rainy Day Warmth", color: "bg-indigo-650/90", priority: 'soup' }
    if (weather.temp < 65) return { label: "❄️ Cold Day Comfort", color: "bg-sky-550/90", priority: 'warm' }
    if (weather.temp >= 65 && weather.temp <= 80) return { label: "🏡 Home Cooking Comfort", color: "bg-teal-550/90", priority: 'standard' }
    return { label: "☀️ Sunny Refreshments", color: "bg-amber-550/90", priority: 'refreshing' }
  }, [weather]);

  const filteredRecipes = useMemo(() => {
    let result = recipes.filter(recipe => {
      if (!recipe) return false;
      const recipeCategory = (recipe.category?.name || recipe.category || "LAINNYA").toUpperCase();
      const matchesCategory = activeCategory === "SEMUA" || recipeCategory === activeCategory;
      const title = recipe.title || "Resep Tanpa Nama";
      const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Smart Weather Sorting
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
          if (isHot && (rCat.includes('DRINK') || rCat.includes('COLD') || rCat.includes('BEVERAGE') || rCat.includes('DESSERT'))) return 10;
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
      : ["Daging Sapi", "Santan", "Bumbu Rempah"] // Fallback ingredients
    addGroup(`Belanja ${recipe.title}`, ings)
    navigate('/daftar-belanja')
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
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden bg-transparent pb-40 ${isDarkMode ? 'dark text-white' : 'text-slate-800'}`}>
      
      {/* SMART WEATHER NOTIFICATION */}
      <AnimatePresence>
        {weatherAlert && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-6 right-6 z-[100] max-w-md mx-auto"
          >
            <div className="bg-white/85 dark:bg-slate-850/85 backdrop-blur-3xl border border-sky-100 dark:border-sky-500/10 p-6 rounded-[32px] shadow-2xl flex gap-4 items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <CloudSun className="w-16 h-16 text-sky-600" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{weatherAlert.title}</h4>
                <p className="text-[11px] font-bold text-slate-500 dark:text-sky-200/80 mt-1 leading-relaxed">{weatherAlert.msg}</p>
                <button 
                  onClick={() => setWeatherAlert(null)}
                  className="mt-3 text-[10px] font-black text-sky-600 dark:text-cyan-400 uppercase tracking-widest hover:text-sky-700"
                >
                  Siap, Chef! ✨
                </button>
              </div>
              <button 
                onClick={() => setWeatherAlert(null)}
                className="absolute top-4 right-4 text-slate-350 hover:text-slate-500"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-lg mx-auto pb-40">
        
        {/* ================= FLOATING GLASSMORPHIC HEADER & PROFILE ================= */}
        <header className="mx-6 mt-8 p-4 bg-white/40 dark:bg-slate-900/45 backdrop-blur-xl border border-white/50 dark:border-sky-500/10 rounded-[32px] shadow-sm flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-xl overflow-hidden bg-white/80 backdrop-blur-md p-0.5 relative shrink-0">
              <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Zem'}&backgroundColor=b6e3f4`} alt="User" className="w-full h-full rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 opacity-60">
                 <ChefHat className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                 <span className="text-[9px] font-black text-sky-650 dark:text-cyan-300 uppercase tracking-widest block">Halo,</span>
              </div>
              <h2 className="text-sm font-black tracking-tight leading-none text-slate-850 dark:text-white mt-0.5">{user?.name?.toLowerCase() || 'zem'}</h2>
            </div>
          </motion.div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/daftar-belanja')}
              className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-sky-400/5 shadow flex items-center justify-center text-sky-600 dark:text-cyan-400 relative active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Smart Weather Dashboard Quick Access Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/smart-weather')}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-teal-500 text-white shadow-md flex items-center justify-center relative active:scale-95 transition-all"
              title="Beralih ke Smart Weather Dashboard"
            >
              <CloudSun className="w-4.5 h-4.5" />
            </motion.button>

            {/* CookShare Social Feed Access Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/cookshare')}
              className="w-9 h-9 rounded-xl bg-sky-500 text-white shadow flex items-center justify-center relative active:scale-95 transition-all border border-sky-400/20"
              title="Buka CookShare Social Feed"
            >
              <Compass className="w-4.5 h-4.5 text-white animate-spin-slow" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-teal-400 rounded-full animate-ping" />
            </motion.button>
          </div>
        </header>

        {/* ================= WEATHER TELEMETRY CARD (Mockup matching 4 domes) ================= */}
        <section className="px-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-sky-500/95 to-teal-655/95 text-white p-5 rounded-[36px] shadow-xl border border-white/20 relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-[9px] text-sky-100 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full w-fit backdrop-blur-md border border-white/10">
                  <MapPin className="w-2.5 h-2.5 text-sky-200" />
                  <input 
                    type="text" 
                    value={searchAddressInput}
                    onChange={(e) => setSearchAddressInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchWeather(searchAddressInput)}
                    className="bg-transparent border-none text-[9px] text-white focus:outline-none uppercase w-28 placeholder:text-sky-250 font-bold"
                    placeholder="Bandung, ID"
                  />
                </div>
                <div className="text-3xl font-black tracking-tighter mt-1">{weather.temp}°F</div>
                <p className="text-[10px] font-black text-teal-50 uppercase tracking-widest leading-none mt-0.5">{weather.condition}</p>
              </div>

              <button 
                onClick={() => handleFetchWeather(searchAddressInput)}
                className="p-3 bg-white/25 hover:bg-white/30 rounded-2xl backdrop-blur-xl border border-white/20 active:scale-95 transition-transform"
              >
                <CloudSun className="w-8 h-8 text-white drop-shadow" />
              </button>
            </div>

            {/* 4 Glass Dome Telemetry Indicators from Reference Image Mockup */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-white/15 relative z-10">
              
              {/* Pod 1: Feels like */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-md flex flex-col justify-between h-16">
                <div className="w-4.5 h-4.5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[7px]">🌡️</div>
                <div>
                  <span className="block text-[9px] font-black">{weather.feelsLike}°F</span>
                  <span className="text-[6px] text-sky-200 block uppercase font-medium">Feels like</span>
                </div>
              </div>

              {/* Pod 2: Precipitation */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-md flex flex-col justify-between h-16">
                <div className="w-4.5 h-4.5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[7px]">💧</div>
                <div>
                  <span className="block text-[9px] font-black">{weather.precipitation}%</span>
                  <span className="text-[6px] text-sky-200 block uppercase font-medium">Precip</span>
                </div>
              </div>

              {/* Pod 3: Visibility */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-md flex flex-col justify-between h-16">
                <div className="w-4.5 h-4.5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[7px]">👁️</div>
                <div>
                  <span className="block text-[9px] font-black">{weather.visibility}m</span>
                  <span className="text-[6px] text-sky-200 block uppercase font-medium">Visibility</span>
                </div>
              </div>

              {/* Pod 4: Humidity */}
              <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-md flex flex-col justify-between h-16">
                <div className="w-4.5 h-4.5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[7px]">💦</div>
                <div>
                  <span className="block text-[9px] font-black">{weather.humidity}%</span>
                  <span className="text-[6px] text-sky-200 block uppercase font-medium">Humidity</span>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* ================= OCEAN-SHIMMER SEARCH BAR ================= */}
        <section className="px-6 mt-5">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative group"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-sky-300/40 via-teal-300/40 to-sky-400/40 rounded-[32px] blur-md opacity-75 group-focus-within:opacity-100 transition-opacity animate-pulse duration-[4000ms]"></div>
             <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-sky-400/5 p-2 rounded-[32px] shadow-inner flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-500 ml-4 shrink-0" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari keajaiban rasa hari ini..."
                  className="flex-1 bg-transparent px-2 py-2.5 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-655 hover:to-teal-600 text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all border border-white/20">
                  Cari Resep
                </button>
             </div>
          </motion.div>
        </section>

        {/* ================= PREMIUM FEATURED CAROUSEL (Rekomendasi Chef) ================= */}
        <section className="mt-8">
           <div className="px-6 flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-sky-350 tracking-wider uppercase">Rekomendasi <span className="text-sky-600 dark:text-cyan-400">Chef</span></h3>
              <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
           </div>
           
           <div className="flex gap-5 overflow-x-auto px-6 pb-6 no-scrollbar snap-x snap-mandatory scroll-smooth">
              {recipes.slice(0, 3).map((r, i) => (
                <motion.div 
                  key={`featured-${i}`}
                  whileTap={{ scale: 0.98 }}
                  className="min-w-[280px] h-[360px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[40px] shadow-lg relative overflow-hidden snap-center group border border-white dark:border-sky-400/10 flex flex-col justify-end"
                >
                   {/* Background Image */}
                   <img 
                    src={r.imageUrl || r.image_url} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8000ms] ease-out" 
                   />
                   
                   {/* Gradient Glass overlay */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10 pointer-events-none" />
                   
                   <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
                      <div className="px-2.5 py-1 bg-white/25 backdrop-blur-md border border-white/30 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                         {r.category}
                      </div>
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer">
                         <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                      </div>
                   </div>

                   <div className="p-6 relative z-20 text-left">
                      <div className="flex gap-1.5 mb-2">
                         <div className="px-2 py-0.5 bg-sky-500/85 backdrop-blur-sm rounded text-[7px] font-black text-white uppercase flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {r.cooking_time || 30}m
                          </div>
                          <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[7px] font-black text-white uppercase flex items-center gap-1 border border-white/10">
                            <Flame className="w-2.5 h-2.5" /> {r.difficulty || 'Easy'}
                          </div>
                      </div>
                      <h3 className="text-base font-black text-white leading-tight tracking-tight mb-1 line-clamp-1">{r.title}</h3>
                      <p className="text-[9px] text-white/70 font-semibold line-clamp-2 leading-relaxed">
                        Nikmati keajaiban rasa kuliner pilihan chef terbaik dengan kesegaran bumbu alami.
                      </p>
                      
                      <div className="mt-4 flex gap-2">
                        <Link 
                          to={`/recipes/${r.id}`}
                          className="flex-1 py-3 bg-white hover:bg-sky-500 hover:text-white text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow flex items-center justify-center gap-1.5"
                        >
                          Lihat Resep <ChevronRight className="w-3 h-3" />
                        </Link>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddRecipeToShopping(r);
                          }}
                          className="w-10 h-10 bg-white/25 hover:bg-sky-500 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-white transition-all shadow"
                          title="Auto Shopping List"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* ================= CHIPS & CATEGORY CONTROLS ================= */}
        <section className="px-6 mt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-400 dark:text-sky-350 tracking-wider uppercase">Kategori <span className="text-sky-600 dark:text-cyan-400">Pilihan</span></h3>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow hover:bg-sky-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`px-3.5 py-2 rounded-full text-[9px] font-black text-white flex items-center gap-1.5 shadow ${recTag.color} whitespace-nowrap`}
            >
              {recTag.label}
            </motion.div>
            {["SEMUA", ...categories.map((c: any) => c.name.toUpperCase())].map((cat) => {
              const isActive = activeCategory === cat
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full text-[9px] font-black tracking-wider uppercase whitespace-nowrap relative transition-all"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 dark:text-sky-200'}`}>
                    {cat}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full shadow border border-sky-400/20"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-slate-800/80 border border-sky-100 dark:border-sky-400/5 backdrop-blur-md rounded-full -z-10" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* ================= THE RECIPE GRID CATALOG (Beautiful Sky-Blue Glassmorphism) ================= */}
        <section className="px-6 mt-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoadingRecipes ? (
               <div className="py-12 text-center">
                 <ChefHat className="w-10 h-10 text-sky-300/40 mx-auto animate-bounce mb-3" />
                 <p className="text-xs font-bold text-slate-400">Memuat resep lezat...</p>
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
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="group relative cursor-pointer"
                >
                  <Link
                    to={`/recipes/${recipeId}`}
                    className="bg-white/70 dark:bg-slate-800/75 backdrop-blur-xl border border-white/60 dark:border-sky-400/10 rounded-[32px] p-4 flex gap-5 shadow-lg relative overflow-hidden text-left group-hover:shadow-xl transition-all duration-300 block"
                  >
                    <div className="w-24 h-24 rounded-[20px] overflow-hidden shrink-0 bg-slate-900 shadow border-2 border-white dark:border-sky-400/20">
                      <img
                        src={img || `https://api.dicebear.com/7.x/shapes/svg?seed=${recipe.title || idx}`}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 py-1 text-left">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                           <span className="text-[8px] font-black text-sky-600 dark:text-cyan-400 tracking-widest uppercase">{(recipe.category?.name || recipe.category || 'RESEP').toUpperCase()}</span>
                           <div className="h-px w-6 bg-sky-200 dark:bg-sky-400/25" />
                        </div>
                        <h3 className="text-xs font-black text-slate-850 dark:text-white leading-tight group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {recipe.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-3">
                           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-450 dark:text-sky-200/60">
                              <Clock className="w-3 h-3 text-sky-500" />
                              {recipe.cooking_time || recipe.prepTime || 20}m
                           </div>
                           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-450 dark:text-sky-200/60">
                              <Flame className="w-3 h-3 text-rose-500" />
                              {recipe.difficulty || 'Easy'}
                           </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddRecipeToShopping(recipe);
                            }}
                            className="p-2 rounded-lg bg-sky-50 dark:bg-slate-700/60 text-sky-600 dark:text-sky-300 hover:bg-sky-600 hover:text-white border border-sky-100/40 dark:border-transparent transition-colors"
                            title="Tambah ke Daftar Belanja"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>

                          {user?.role === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm('Hapus resep ini secara permanen?')) deleteMutation.mutate(recipe.id);
                              }}
                              className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-450 hover:bg-rose-500 hover:text-white border border-rose-105/40 dark:border-transparent transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-slate-700/60 text-sky-600 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all border border-sky-100/40 dark:border-transparent">
                             <ChevronRight className="w-4 h-4" />
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
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-400/10 rounded-[40px] p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">New Masterpiece</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create your signature dish</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group">
                  <X className="w-4.5 h-4.5 text-slate-500 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipe Title</label>
                  <div className="relative">
                    <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                    <input 
                      type="text" 
                      value={newRecipeForm.title}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, title: e.target.value})}
                      placeholder="e.g. Zem's Spicy Ramen" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent p-3.5 pl-11 rounded-2xl focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-850 transition-all text-xs font-bold text-slate-800 dark:text-white" 
                    />
                  </div>
                </div>

                {/* Difficulty & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</label>
                    <select 
                      value={newRecipeForm.difficulty}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, difficulty: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent p-3.5 rounded-2xl focus:outline-none focus:border-sky-500 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newRecipeForm.category_id}
                      onChange={(e) => setNewRecipeForm({...newRecipeForm, category_id: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent p-3.5 rounded-2xl focus:outline-none focus:border-sky-500 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value="">Select...</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Time Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cook (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input 
                        type="number" 
                        value={newRecipeForm.cooking_time}
                        onChange={(e) => setNewRecipeForm({...newRecipeForm, cooking_time: +e.target.value})}
                        placeholder="20" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent p-3.5 pl-11 rounded-2xl focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-850 transition-all text-xs font-bold text-slate-800 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Prep (Min)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input 
                        type="number" 
                        value={newRecipeForm.prep_time}
                        onChange={(e) => setNewRecipeForm({...newRecipeForm, prep_time: +e.target.value})}
                        placeholder="10" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent p-3.5 pl-11 rounded-2xl focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-850 transition-all text-xs font-bold text-slate-800 dark:text-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Ingredients */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingredients</label>
                    <button 
                      type="button"
                      onClick={() => setNewRecipeForm({...newRecipeForm, ingredients: [...newRecipeForm.ingredients, { item: '', amount: '', unit: '' }]})}
                      className="text-[8px] font-black text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100"
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
                          className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-transparent p-3 rounded-xl text-xs font-bold text-slate-850 dark:text-white" 
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
                          className="w-16 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-transparent p-3 rounded-xl text-xs font-bold text-slate-850 dark:text-white" 
                        />
                        {newRecipeForm.ingredients.length > 1 && (
                           <button 
                            type="button"
                            onClick={() => setNewRecipeForm({...newRecipeForm, ingredients: newRecipeForm.ingredients.filter((_, j) => j !== i)})}
                            className="p-1.5 text-rose-500"
                           ><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-5">
                <button
                  className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                  disabled={createMutation.isPending}
                  onClick={handleSaveRecipe}
                >
                  {createMutation.isPending ? <ChefHat className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5 text-cyan-400" />}
                  {createMutation.isPending ? 'SAVING...' : 'SAVE SIGNATURE RECIPE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARED NAVIGATION */}
      <nav className="fixed bottom-8 inset-x-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-3xl border border-white/60 dark:border-sky-500/10 rounded-[40px] py-3.5 px-8 shadow-lg flex items-center justify-between w-full max-w-sm"
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
                className={`relative p-3 transition-all ${isActive ? "text-sky-600 dark:text-cyan-400" : "text-slate-450 hover:text-slate-700 dark:text-sky-200/50 dark:hover:text-white"}`}
              >
                <item.icon className={`w-6 h-6 transition-all ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-nav"
                    className="absolute inset-0 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-500/10 rounded-2xl -z-10"
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
