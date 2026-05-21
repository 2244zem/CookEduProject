import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingBag, SlidersHorizontal, MapPin, CloudSun, Utensils, Heart, Plus, X, 
  Award, ChevronRight, Share2, Refrigerator, HeartHandshake, Settings, Moon, Sun, LogOut,
  Clock, Flame, Check, Trash2, Edit2, Play, Star, Shield, Snowflake, User, Activity, AlertCircle,
  Bookmark // Imported here to guarantee absolute compile-time and runtime safety across HMR cycles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Premium background & photographic assets
import bgImage from '../assets/background/MyStyle25.jpg';
import bgDrop from '../assets/background/Random but Beautiful.jpg';
import foodPattern from '../assets/background/Bold Batik Patterns to Transform Your Home Decor Today!.jpg';
import inspiration1 from '../assets/download (1).jpg';
import inspiration2 from '../assets/download (2).jpg';
import inspiration3 from '../assets/download (3).jpg';

// Core Recipe Interface
interface LocalRecipe {
  id: string;
  title: string;
  category: "Soup" | "Salad" | "Main Course" | "Dessert";
  image: string;
  calories: string;
  prepTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  suitableTemp: { min: number; max: number };
  description: string;
  isLegacy?: boolean;
  likes?: number;
  commentsCount?: number;
  rating?: number;
}

// Preset Recipes Database
const PRESET_RECIPES: LocalRecipe[] = [
  {
    id: "rec_soto_1",
    title: "Soto Ayam Lamongan",
    category: "Soup",
    image: inspiration2,
    calories: "320 Kcal",
    prepTime: "25 Mins",
    difficulty: "Easy",
    ingredients: ["Ayam", "Bumbu Soto", "Garam", "Bawang"],
    suitableTemp: { min: -6, max: 25 },
    description: "Soto ayam hangat khas Lamongan dengan kuah kaldu rempah gurih berlimpah koyo.",
    likes: 184,
    commentsCount: 22,
    rating: 4.9
  },
  {
    id: "rec_cendol_1",
    title: "Es Cendol Durian Premium",
    category: "Dessert",
    image: inspiration1,
    calories: "280 Kcal",
    prepTime: "15 Mins",
    difficulty: "Easy",
    ingredients: ["Durian", "Santan", "Gula Merah", "Tepung Beras"],
    suitableTemp: { min: 26, max: 43 },
    description: "Es serut cendol kenyal berpadu aroma durian mewah menyegarkan hari panas.",
    likes: 310,
    commentsCount: 42,
    rating: 5.0
  },
  {
    id: "rec_rendang_1",
    title: "Rendang Sapi Minang",
    category: "Main Course",
    image: inspiration3,
    calories: "550 Kcal",
    prepTime: "120 Mins",
    difficulty: "Hard",
    ingredients: ["Daging Sapi", "Santan", "Bawang", "Cabai"],
    suitableTemp: { min: 7, max: 33 },
    description: "Rendang daging karamelisasi kering bercita rasa tinggi pusaka Nusantara.",
    likes: 540,
    commentsCount: 88,
    rating: 4.9
  },
  {
    id: "rec_nasgor_1",
    title: "Nasi Goreng Kampung Ibu",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    calories: "480 Kcal",
    prepTime: "20 Mins",
    difficulty: "Easy",
    ingredients: ["Telur", "Kecap", "Bawang", "Cabai"],
    suitableTemp: { min: 2, max: 40 },
    description: "Resep Nasi Goreng warisan ibu dengan aroma wajan membara dan kehangatan rumah.",
    isLegacy: true,
    likes: 92,
    commentsCount: 9,
    rating: 4.8
  },
  {
    id: "rec_soup_korea",
    title: "Spicy Kimchi Jjigae",
    category: "Soup",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    calories: "420 Kcal",
    prepTime: "25 Mins",
    difficulty: "Medium",
    ingredients: ["Tahu", "Bawang", "Ayam", "Cabai"],
    suitableTemp: { min: -12, max: 20 },
    description: "Sup kimchi panas mendidih masam pedas yang menghangatkan tubuh di kala cuaca dingin.",
    likes: 85,
    commentsCount: 14,
    rating: 4.7
  },
  {
    id: "rec_soto_madura",
    title: "Soto Madura Asli",
    category: "Soup",
    image: "https://images.unsplash.com/photo-1547928576-a4a3323dce9d?auto=format&fit=crop&w=600&q=80",
    calories: "390 Kcal",
    prepTime: "45 Mins",
    difficulty: "Medium",
    ingredients: ["Daging Sapi", "Bumbu Soto", "Bawang", "Garam"],
    suitableTemp: { min: -4, max: 26 },
    description: "Kuah soto daging pekat bersantan gurih berlimpah jeroan khas pulau Madura.",
    isLegacy: true,
    likes: 215,
    commentsCount: 29,
    rating: 4.9
  }
];

interface UserDashboardProps {
  onSwitchView?: (view: 'user' | 'admin') => void;
}

export default function UserDashboard({ onSwitchView }: UserDashboardProps = {}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Active Tab: 'home' | 'legacy' | 'fridge' | 'cookshare' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'legacy' | 'fridge' | 'cookshare' | 'profile'>('home');

  // Recipes State Pool
  const [recipes, setRecipes] = useState<LocalRecipe[]>(() => {
    const saved = localStorage.getItem('cookedu_local_recipes_v3');
    return saved ? JSON.parse(saved) : PRESET_RECIPES;
  });

  useEffect(() => {
    localStorage.setItem('cookedu_local_recipes_v3', JSON.stringify(recipes));
  }, [recipes]);

  // Liked Recipes Array
  const [likedRecipes, setLikedRecipes] = useState<string[]>(() => {
    const saved = localStorage.getItem('cookedu_liked_recipes');
    return saved ? JSON.parse(saved) : ["rec_soto_1"];
  });

  useEffect(() => {
    localStorage.setItem('cookedu_liked_recipes', JSON.stringify(likedRecipes));
  }, [likedRecipes]);

  // Shopping Cart (Weekly Checklist grouped elegantly by Active menus)
  const [shoppingCart, setShoppingCart] = useState<{ recipeTitle: string; items: { name: string; checked: boolean }[] }[]>(() => {
    const saved = localStorage.getItem('cookedu_shopping_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cookedu_shopping_cart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Kulkas Pintar Checked Ingredients State
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>(() => {
    const saved = localStorage.getItem('cookedu_fridge_ingredients');
    return saved ? JSON.parse(saved) : ["Ayam", "Bumbu Soto", "Telur", "Bawang"];
  });

  useEffect(() => {
    localStorage.setItem('cookedu_fridge_ingredients', JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  // Weather States
  const [temperature, setTemperature] = useState(23);
  const [weatherCondition, setWeatherCondition] = useState("Partly Cloudy");
  const [userAddress, setUserAddress] = useState("Bandung, ID");
  const [searchAddressInput, setSearchAddressInput] = useState("Bandung, ID");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Live telemetry details matching mockup
  const [precipitation, setPrecipitation] = useState(68);
  const [visibility, setVisibility] = useState(110);
  const [humidity, setHumidity] = useState(68);

  // Search query & Category Switcher
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // CookShare Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Soup" | "Salad" | "Main Course" | "Dessert">("Main Course");
  const [newImage, setNewImage] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCal, setNewCal] = useState("320 Kcal");
  const [newTime, setNewTime] = useState("20 Mins");
  const [newIngredientsInput, setNewIngredientsInput] = useState("Ayam, Garam, Bawang");

  // Dynamic Theme (Light Mode Default, switches to Neon-Ocean mode)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // OpenWeatherMap Geocoding & Weather Fetch Logic
  const handleFetchWeather = async (city: string) => {
    if (!city.trim()) return;
    try {
      setIsLoadingWeather(true);
      const cleanCity = encodeURIComponent(city.trim());
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || 'bd5e378503939ddaee76f12ad7a97608';
      // Geocode city to coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cleanCity}&limit=1&appid=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        const { lat, lon, name, country } = geoData[0];
        // Fetch Fahrenheit weather info
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await fetch(weatherUrl);
        const wData = await weatherRes.json();
        
        if (wData && wData.main) {
          const temp = Math.round(wData.main.temp);
          const cond = wData.weather[0]?.main || "Partly Cloudy";
          setTemperature(temp);
          setWeatherCondition(cond);
          setUserAddress(`${name}, ${country}`);
          setSearchAddressInput(`${name}, ${country}`);
          
          // Generate aesthetic indicator stats
          setPrecipitation(wData.clouds?.all || Math.floor(Math.random() * 40) + 20);
          setVisibility(Math.round((wData.visibility || 10000) / 100));
          setHumidity(wData.main.humidity || 68);

          // Cache globally
          localStorage.setItem('cookedu_last_weather', JSON.stringify({ temp, condition: cond, city: name }));
        }
      } else {
        throw new Error("City not found");
      }
    } catch (err) {
      console.warn("Weather API skip, using premium mockup coordinates fallback:", err);
      // Fallback
      setTemperature(23);
      setWeatherCondition("Partly Cloudy");
      setUserAddress(city);
      setPrecipitation(68);
      setVisibility(110);
      setHumidity(68);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    handleFetchWeather("Bandung, ID");
  }, []);

  // Kulkas Pintar matching score
  const getFridgeScore = (recipe: LocalRecipe) => {
    const matches = recipe.ingredients.filter(ing => fridgeIngredients.includes(ing));
    return matches.length;
  };

  // Weather suitability & Search Query filtering
  const processedRecipes = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || r.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTemp = temperature >= r.suitableTemp.min && temperature <= r.suitableTemp.max;
      return matchesSearch && matchesCategory && matchesTemp;
    });
  }, [recipes, searchQuery, selectedCategory, temperature]);

  // Sort: Prioritize items with highest Kulkas Pintar matching score
  const sortedRecipes = useMemo(() => {
    return [...processedRecipes].sort((a, b) => {
      const scoreA = getFridgeScore(a);
      const scoreB = getFridgeScore(b);
      return scoreB - scoreA;
    });
  }, [processedRecipes, fridgeIngredients]);

  // Filter legacy recipes for Mom's Traditional page
  const legacyRecipes = useMemo(() => {
    return recipes.filter(r => r.isLegacy);
  }, [recipes]);

  // Shopping checklist handlers
  const handleAddRecipeIngredientsToShopping = (recipe: LocalRecipe) => {
    const existingIndex = shoppingCart.findIndex(cart => cart.recipeTitle === recipe.title);
    const newItems = recipe.ingredients.map(ing => ({ name: ing, checked: false }));

    if (existingIndex > -1) {
      const updated = [...shoppingCart];
      const currentItems = updated[existingIndex].items;
      newItems.forEach(ni => {
        if (!currentItems.some(ci => ci.name.toLowerCase() === ni.name.toLowerCase())) {
          currentItems.push(ni);
        }
      });
      setShoppingCart(updated);
    } else {
      setShoppingCart([...shoppingCart, { recipeTitle: recipe.title, items: newItems }]);
    }
    setIsCartOpen(true);
  };

  const handleToggleShoppingItem = (groupTitle: string, itemName: string) => {
    setShoppingCart(shoppingCart.map(group => {
      if (group.recipeTitle === groupTitle) {
        return {
          ...group,
          items: group.items.map(item => item.name === itemName ? { ...item, checked: !item.checked } : item)
        };
      }
      return group;
    }));
  };

  const handleRemoveGroupFromShopping = (groupTitle: string) => {
    setShoppingCart(shoppingCart.filter(group => group.recipeTitle !== groupTitle));
  };

  const handleClearAllShopping = () => {
    setShoppingCart([]);
  };

  // Toggle ingredients inside physical Kulkas Pintar
  const handleToggleFridgeIngredient = (ingName: string) => {
    if (fridgeIngredients.includes(ingName)) {
      setFridgeIngredients(fridgeIngredients.filter(x => x !== ingName));
    } else {
      setFridgeIngredients([...fridgeIngredients, ingName]);
    }
  };

  // Like Toggle
  const handleToggleLike = (recipeId: string) => {
    if (likedRecipes.includes(recipeId)) {
      setLikedRecipes(likedRecipes.filter(id => id !== recipeId));
    } else {
      setLikedRecipes([...likedRecipes, recipeId]);
    }
  };

  // Social CookShare Creation Upload Handler
  const handleUploadRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRecipe: LocalRecipe = {
      id: `custom_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      image: newImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      calories: newCal,
      prepTime: newTime,
      difficulty: "Medium",
      ingredients: newIngredientsInput.split(",").map(x => x.trim()).filter(Boolean),
      suitableTemp: { min: -6, max: 35 },
      description: newDesc || "Karya kuliner autentik yang dibagikan secara bangga oleh zem.",
      likes: 1,
      commentsCount: 0,
      rating: 5.0
    };

    setRecipes([newRecipe, ...recipes]);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewTitle("");
    setNewImage("");
    setNewDesc("");
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus resep karya Anda ini secara permanen?")) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  // Simulated active user
  const activeUser = user || {
    name: "zem",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "admin"
  };

  return (
    <div className={`min-h-screen font-sans flex items-center justify-center p-0 sm:p-6 transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#030712] text-slate-150' : 'bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-white text-slate-800'}`}>
      
      {/* 3D PARALLAX AMBIENT BACKDROP SHELL FOR DESKTOP VIEWS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-20 hidden sm:block">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay " style={{ backgroundImage: `url(${bgDrop})`, animationDuration: '16s' }} />
        <div className="absolute inset-0 bg-repeat opacity-[0.015]" style={{ backgroundImage: `url(${foodPattern})`, backgroundSize: '300px' }} />
      </div>

      {/* CENTERED NATIVE ANDROID PORTVIEW SIMULATOR FRAME */}
      <div className="relative w-full sm:max-w-[430px] h-full sm:h-[880px] bg-sky-100/30 dark:bg-slate-900/65 sm:rounded-[50px] sm:border-[8px] sm:border-slate-800 sm:shadow-sm overflow-hidden flex flex-col z-10 backdrop-blur-sm border border-white/30">
        
        {/* Android Status Bar (Status Bar Notch matching high-end mockup) */}
        <div className="hidden sm:flex bg-slate-950/20 px-6 py-2.5 items-center justify-between text-[11px] font-bold text-slate-800 dark:text-sky-200 shrink-0 select-none z-30">
          <span>09:41 AM</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full absolute left-1/2 -translate-x-1/2 top-1.5" />
          <div className="flex items-center gap-1.5">
            <span className="w-4.5 h-3 bg-slate-800 dark:bg-sky-400 rounded-sm inline-block" />
            <span>4G LTE</span>
          </div>
        </div>

        {/* ================= FIXED MAIN HEADER VIEWPORT ================= */}
        <header className="p-4 flex items-center justify-between sticky top-0 z-40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-b border-white/40 dark:border-sky-400/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-sky-400 p-0.5 bg-white dark:bg-slate-800 shadow-sm relative shrink-0">
              <img 
                src={activeUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                alt="Profile Zem" 
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>
            <div onClick={() => navigate('/profile')} className="cursor-pointer text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold text-sky-600/80 dark:text-sky-300 block leading-none">Welcome back</span>
              <h1 className="text-base font-black text-slate-800 dark:text-white tracking-tight mt-0.5">Halo, {activeUser.name}</h1>
            </div>
          </div>

          {/* FLOATING ACTION PILL (Twin Buttons) */}
          <div className="flex items-center bg-white/80 dark:bg-slate-800/85 border border-sky-100 dark:border-sky-400/10 rounded-full p-1 shadow-sm backdrop-blur-sm">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 bg-gradient-to-tr from-sky-500 to-teal-500 text-white rounded-full shadow-md active:scale-95 transition-all relative"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              {shoppingCart.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white" />
              )}
            </button>
            <button 
              onClick={() => {
                setSelectedCategory(selectedCategory === "all" ? "Soup" : "all");
              }}
              className={`p-2.5 rounded-full active:scale-95 transition-all ml-0.5 ${selectedCategory !== "all" ? "bg-sky-100 dark:bg-sky-950 text-sky-600" : "text-slate-500 dark:text-slate-350"}`}
              aria-label="Configuration Toggle"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================= MODULAR ROUTING PANELS AREA ================= */}
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: BERANDA (HOME VIEW) */}
            {activeTab === 'home' && (
              <motion.div
                key="homepage-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 space-y-5 text-left"
              >
                
                {/* OCEAN-SHIMMER SEARCH BAR */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-300/40 via-teal-300/40 to-sky-400/40 rounded-2xl blur-md opacity-75 group-focus-within:opacity-100 transition-opacity  duration-[4000ms]"></div>
                  <div className="relative flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-sky-400/5 rounded-2xl p-3.5 shadow-inner">
                    <Search className="text-sky-500 w-5 h-5 mr-3 shrink-0" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Would you like to eat somethings?..." 
                      className="w-full bg-transparent border-none text-sm placeholder-slate-400/90 dark:placeholder-slate-500 focus:outline-none font-semibold text-slate-800 dark:text-white"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* HIGH-FIDELITY LIVE WEATHER CARD WITH OPENWEATHER GEOLOCATION */}
                <section className="relative rounded-3xl bg-gradient-to-br from-sky-500/95 to-teal-655/95 text-white p-5 shadow-sm shadow-sky-900/10 overflow-hidden border border-white/20">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Weather Interactive Address Geocoder */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-sky-100 font-semibold bg-white/15 px-2.5 py-0.5 rounded-full w-fit backdrop-blur-sm border border-white/10">
                        <MapPin className="w-3 h-3 text-sky-200" />
                        <input 
                          type="text" 
                          value={searchAddressInput}
                          onChange={(e) => setSearchAddressInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleFetchWeather(searchAddressInput)}
                          className="bg-transparent border-none text-[10px] text-white focus:outline-none uppercase w-28 placeholder:text-sky-250 font-bold"
                          placeholder="Bandung, ID"
                        />
                      </div>
                      <div className="text-4xl font-black tracking-tighter mt-2">{temperature}°C</div>
                      <p className="text-xs font-bold text-teal-50 uppercase tracking-widest">{weatherCondition}</p>
                    </div>

                    <button 
                      onClick={() => handleFetchWeather(searchAddressInput)}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-sm border border-white/20 shadow-sm active:scale-95 transition-transform"
                    >
                      <CloudSun className="w-10 h-10 text-white drop-shadow" />
                    </button>
                  </div>

                  {/* 4 Glass Dome Telemetry Indicators from Reference Image Mockup */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-white/15 relative z-10">
                    
                    {/* Pod 1: Feels like */}
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-sm flex flex-col justify-between h-18">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[8px]">🌡️</div>
                      <div>
                        <span className="block text-[10px] font-black">{temperature}°C</span>
                        <span className="text-[7px] text-sky-200 block uppercase font-medium">Feels like</span>
                      </div>
                    </div>

                    {/* Pod 2: Precipitation */}
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-sm flex flex-col justify-between h-18">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[8px]">💧</div>
                      <div>
                        <span className="block text-[10px] font-black">{precipitation}%</span>
                        <span className="text-[7px] text-sky-200 block uppercase font-medium">Precip</span>
                      </div>
                    </div>

                    {/* Pod 3: Visibility */}
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-sm flex flex-col justify-between h-18">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[8px]">👁️</div>
                      <div>
                        <span className="block text-[10px] font-black">{visibility}m</span>
                        <span className="text-[7px] text-sky-200 block uppercase font-medium">Visibility</span>
                      </div>
                    </div>

                    {/* Pod 4: Humidity */}
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-1.5 text-center backdrop-blur-sm flex flex-col justify-between h-18">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mx-auto text-[8px]">💦</div>
                      <div>
                        <span className="block text-[10px] font-black">{humidity}%</span>
                        <span className="text-[7px] text-sky-200 block uppercase font-medium">Humidity</span>
                      </div>
                    </div>

                  </div>
                  
                  {/* Weather Psychological Nudge */}
                  <div className="mt-4 pt-3.5 border-t border-white/20 relative z-10 text-xs font-semibold text-sky-50 leading-relaxed">
                    Feels like {weatherCondition}! Try cooking the <span className="font-black underline text-white cursor-pointer" onClick={() => navigate('/recipes/rec_soto_1')}>Soto Ayam</span> below.
                  </div>
                </section>

                {/* HORIZONTAL CATEGORY SWITCHER CAROUSEL (Mockup layout circular elements) */}
                <section className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none shrink-0 select-none">
                  {['all', 'Soup', 'Salad', 'Main Course', 'Dessert'].map((tab) => {
                    const isSelected = selectedCategory.toLowerCase() === tab.toLowerCase();
                    // Custom emoji markers for category buttons
                    const marker = tab === 'all' ? '✨' : tab === 'Soup' ? '🍲' : tab === 'Salad' ? '🥗' : tab === 'Main Course' ? '🥩' : '🍰';
                    return (
                      <button 
                        key={tab}
                        onClick={() => setSelectedCategory(tab)}
                        className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                          isSelected 
                            ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-md shadow-sky-600/20 border-sky-500' 
                            : 'bg-white/80 dark:bg-slate-800/80 border-sky-100 dark:border-sky-400/5 text-slate-500 dark:text-sky-200'
                        }`}
                      >
                        <span>{marker}</span>
                        <span>{tab === 'all' ? 'All Dishes' : tab}</span>
                      </button>
                    )
                  })}
                </section>

                {/* HOME WEATHER-OPTIMIZED FEED RECO_GRID */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-sky-350 tracking-wider">Top picks on cookedu</h3>
                    <span className="text-[10px] font-black text-sky-650 dark:text-cyan-400 bg-sky-50/70 dark:bg-slate-800/85 border border-sky-100/40 dark:border-sky-400/5 px-2.5 py-0.5 rounded-full">
                      {sortedRecipes.length} recipes
                    </span>
                  </div>

                  {sortedRecipes.length === 0 ? (
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-3xl p-10 text-center text-slate-400 border border-sky-100/40">
                      <AlertCircle className="w-8 h-8 text-sky-400/40 mx-auto mb-2 " />
                      <p className="text-xs font-bold text-slate-700 dark:text-white">Tidak ada menu untuk suhu saat ini</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto">Suhu {temperature}°C tidak mencakup catalog resep. Coba ganti suhu ideal kota Anda!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {sortedRecipes.map((recipe) => {
                        const isLiked = likedRecipes.includes(recipe.id);
                        const fridgeScore = getFridgeScore(recipe);
                        const isMatchingFridge = fridgeScore > 0;
                        
                        return (
                          <div 
                            key={recipe.id}
                            className="bg-white/85 dark:bg-slate-800/80 border border-sky-100/70 dark:border-sky-400/5 backdrop-blur-sm rounded-3xl p-3 shadow-md flex flex-col justify-between group transition-all duration-300 hover:shadow-sm relative"
                          >
                            {/* Card Image Frame */}
                            <div 
                              onClick={() => navigate('/recipes/' + recipe.id)}
                              className="relative rounded-2xl overflow-hidden aspect-square bg-slate-900 shadow-inner cursor-pointer"
                            >
                              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent z-10 pointer-events-none"></div>
                              
                              {/* Match Fridge Indicator Tag */}
                              {isMatchingFridge && (
                                <div className="absolute top-2 left-2 z-20 bg-teal-500/90 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                  Kulkas Match 🧊
                                </div>
                              )}

                              {/* Heart Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLike(recipe.id);
                                }}
                                className={`absolute top-2 right-2 z-20 p-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm rounded-full shadow-sm active:scale-90 transition-transform ${isLiked ? 'text-rose-500' : 'text-slate-400'}`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                              </button>

                              {/* Prep time floating badge */}
                              <span className="absolute bottom-2.5 left-2.5 z-20 text-[8px] font-black tracking-wider text-white uppercase bg-slate-900/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                {recipe.prepTime}
                              </span>
                            </div>

                            {/* Card Specs */}
                            <div className="mt-3.5 space-y-1.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black tracking-wider text-teal-600 dark:text-cyan-400 uppercase">{recipe.category} • {recipe.difficulty}</span>
                                {isMatchingFridge && <span className="text-[8px] text-teal-500 font-bold">({fridgeScore} Ing)</span>}
                              </div>
                              <h3 
                                onClick={() => navigate('/recipes/' + recipe.id)}
                                className="font-black text-xs text-slate-800 dark:text-white line-clamp-1 leading-tight group-hover:text-sky-500 transition-colors cursor-pointer"
                              >
                                {recipe.title}
                              </h3>
                              
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-bold text-slate-400">{recipe.calories}</span>
                                <button 
                                  onClick={() => handleAddRecipeIngredientsToShopping(recipe)}
                                  className="p-2 bg-sky-50 dark:bg-slate-700/65 hover:bg-sky-655 dark:hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-300 rounded-xl border border-sky-100/40 dark:border-transparent transition-colors active:scale-90"
                                  title="Add Ingredients to checklist"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

              </motion.div>
            )}

            {/* TAB 2: RESEP IBU (HERITAGE ARCHIVES) */}
            {activeTab === 'legacy' && (
              <motion.div
                key="legacy-recipes-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 space-y-4 text-left"
              >
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[28px] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-amber-300 uppercase tracking-widest">Resep Warisan Ibu</h3>
                      <p className="text-[9px] text-slate-450 dark:text-sky-200 mt-0.5 leading-normal">Cherished legacy and protected family recipes passed down generation to generation.</p>
                    </div>
                  </div>
                  
                  {/* DIRECT BRIDGE TO THE REAL CATATAN IBU FEATURE */}
                  <button
                    onClick={() => navigate('/catatan-ibu')}
                    className="w-full mt-1.5 py-2.5 bg-white dark:bg-slate-800 border border-amber-250 dark:border-transparent rounded-xl text-[10px] font-black text-amber-600 dark:text-amber-300 uppercase text-center active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Buka Resep Warisan Ibu Lengkap ➔
                  </button>
                </div>

                <div className="space-y-3.5">
                  {legacyRecipes.map((recipe) => (
                    <div 
                      key={recipe.id}
                      className="bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-sky-400/5 rounded-[30px] p-3 shadow-md relative overflow-hidden group"
                    >
                      <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-[7px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest z-10 shadow">
                        Resep Ibu 🤍
                      </div>

                      <div className="flex gap-4">
                        <div 
                          onClick={() => navigate('/recipes/' + recipe.id)}
                          className="w-20 h-20 rounded-[20px] overflow-hidden shrink-0 bg-slate-900 shadow cursor-pointer"
                        >
                          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 text-left">
                          <div>
                            <h4 
                              onClick={() => navigate('/recipes/' + recipe.id)}
                              className="text-xs font-black text-slate-800 dark:text-white leading-tight cursor-pointer hover:text-amber-550"
                            >
                              {recipe.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-normal">{recipe.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[8px] font-black text-amber-500 bg-amber-50 dark:bg-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">Heritage Badge</span>
                            <button
                              onClick={() => handleAddRecipeIngredientsToShopping(recipe)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase rounded-lg active:scale-95"
                            >
                              + Belanja
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: KULKAS PINTAR INVENTORY TRACKER */}
            {activeTab === 'fridge' && (
              <motion.div
                key="fridge-view-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 space-y-4 text-left"
              >
                <div className="bg-sky-500/10 border border-sky-400/20 rounded-[28px] p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Refrigerator className="w-8 h-8 text-sky-500 shrink-0" />
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-sky-300 uppercase tracking-widest">Kulkas Pintar Tracker</h3>
                      <p className="text-[9px] text-slate-450 dark:text-sky-200 mt-0.5 leading-normal">Smart ingredient parsing & inventory management. Tick ingredients inside your fridge to float compatible recipes at top of feed!</p>
                    </div>
                  </div>
                  
                  {/* DIRECT BRIDGE TO THE REAL FRIDGE SCANNER CAMERA SYSTEM */}
                  <button
                    onClick={() => navigate('/fridge')}
                    className="w-full mt-1.5 py-2.5 bg-white dark:bg-slate-800 border border-sky-250 dark:border-transparent rounded-xl text-[10px] font-black text-sky-600 dark:text-cyan-300 uppercase text-center active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Refrigerator className="w-3.5 h-3.5" />
                    Buka Scanner Kulkas Fisik ➔
                  </button>
                </div>

                {/* Veggies */}
                <div className="bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-sky-400/5 rounded-3xl p-4 shadow-sm space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider border-b pb-1">🥬 Sayuran & Bumbu</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Wortel", "Bawang", "Tomat", "Bayam", "Cabai"].map((ing) => {
                      const isChecked = fridgeIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          onClick={() => handleToggleFridgeIngredient(ing)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-xs font-bold active:scale-95 ${isChecked ? 'bg-sky-500/15 border-sky-400 text-sky-600 dark:text-sky-400' : 'bg-slate-50 dark:bg-slate-700/60 border-slate-100 dark:border-transparent text-slate-500 dark:text-sky-200'}`}
                        >
                          <span>{ing}</span>
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-350 bg-white'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Protein */}
                <div className="bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-sky-400/5 rounded-3xl p-4 shadow-sm space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider border-b pb-1">🍗 Protein & Lainnya</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Ayam", "Daging Sapi", "Tahu", "Telur", "Durian", "Santan"].map((ing) => {
                      const isChecked = fridgeIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          onClick={() => handleToggleFridgeIngredient(ing)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-xs font-bold active:scale-95 ${isChecked ? 'bg-sky-500/15 border-sky-400 text-sky-600 dark:text-sky-400' : 'bg-slate-50 dark:bg-slate-700/60 border-slate-100 dark:border-transparent text-slate-500 dark:text-sky-200'}`}
                        >
                          <span>{ing}</span>
                          <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${isChecked ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-350 bg-white'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: COOKSHARE HUB */}
            {activeTab === 'cookshare' && (
              <motion.div
                key="cookshare-hub-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 space-y-4 text-left"
              >
                <div className="bg-teal-500/15 border border-teal-400/25 rounded-[28px] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Share2 className="w-8 h-8 text-teal-500 shrink-0" />
                      <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-teal-300 uppercase tracking-widest">My CookShare Hub</h3>
                        <p className="text-[9px] text-slate-450 dark:text-sky-200 mt-0.5 leading-normal">Manage your shared community recipes and upload creations instantly.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shadow active:scale-90 shrink-0"
                      title="Upload New Recipe"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* DIRECT BRIDGE TO THE REAL SOCIAL COOKSHARE SCROLLER PAGE */}
                  <button
                    onClick={() => navigate('/cookshare')}
                    className="w-full mt-1 py-2.5 bg-white dark:bg-slate-800 border border-teal-250 dark:border-transparent rounded-xl text-[10px] font-black text-teal-600 dark:text-teal-300 uppercase text-center active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Buka Feed CookShare Sosial Lengkap ➔
                  </button>
                </div>

                {/* Custom Uploader Listing */}
                <div className="space-y-3">
                  {recipes.map((recipe) => (
                    <div 
                      key={recipe.id}
                      className="bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-sky-400/5 rounded-[30px] p-3 shadow-md"
                    >
                      <div className="flex gap-4">
                        <div 
                          onClick={() => navigate('/recipes/' + recipe.id)}
                          className="w-20 h-20 rounded-[20px] overflow-hidden shrink-0 bg-slate-900 cursor-pointer"
                        >
                          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 text-left">
                          <div>
                            <h4 
                              onClick={() => navigate('/recipes/' + recipe.id)}
                              className="text-xs font-black text-slate-800 dark:text-white leading-tight cursor-pointer hover:text-teal-600"
                            >
                              {recipe.title}
                            </h4>
                            <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest leading-none mt-1 inline-block">{recipe.category}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] font-bold text-slate-400">🔥 {recipe.calories}</span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => handleDeleteRecipe(recipe.id)}
                                className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-transparent active:scale-90 transition-transform"
                                title="Delete Recipe"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: SCANNABLE PROFILE VIEW (Matches Redesigned layout) */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile-view-module"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-4 space-y-5 text-left"
              >
                
                {/* HERO PROFILE CARD */}
                <section className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-sky-400/5 rounded-3xl p-5 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/10 rounded-full blur-xl -mr-5 -mt-5"></div>
                  
                  <div className="relative inline-block mx-auto">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-teal-400 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-850 dark:text-white font-black text-2xl">
                        {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'Z'}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-800 shadow-sm" title="Verified Contributor">
                      <Award className="w-3 h-3" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-800 dark:text-white mt-3 tracking-tight">{activeUser.name || 'Zem'}</h3>
                  <p className="text-[11px] font-semibold text-sky-650 dark:text-sky-300 bg-sky-50 dark:bg-slate-700/60 px-3 py-0.5 rounded-full inline-block mt-1 border border-sky-100/50 dark:border-transparent">Verified Pro Chef</p>
                  
                  {/* STATS OVERVIEW MATRIX */}
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100/80 dark:border-sky-400/10">
                    <div>
                      <span className="block font-black text-sm text-slate-800 dark:text-white">{recipes.length}</span>
                      <span className="text-[10px] text-slate-400 font-medium">CookShare</span>
                    </div>
                    <div className="border-x border-slate-100/80 dark:border-sky-400/10">
                      <span className="block font-black text-sm text-slate-800 dark:text-white">{likedRecipes.length}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Bookmarks</span>
                    </div>
                    <div>
                      <span className="block font-black text-sm text-slate-800 dark:text-white">
                        {Math.round((fridgeIngredients.length / 11) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Fridge Match</span>
                    </div>
                  </div>
                </section>

                {/* CORE CORE APPLICATIONS NAVIGATION LINKS (Bridges directly to actual modules) */}
                <section className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">CookEdu Engine Features</h4>
                  
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-sky-400/5 rounded-2xl divide-y divide-slate-100 dark:divide-sky-400/10 overflow-hidden shadow-sm">
                    
                    {/* FEATURE 1: COOKSHARE HUB */}
                    <div onClick={() => navigate('/cookshare')} className="flex items-center justify-between p-4 active:bg-sky-50/50 dark:active:bg-slate-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-350 rounded-xl border border-sky-100 dark:border-sky-500/10"><Share2 className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">My CookShare Hub</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">Manage your shared community recipes</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                    </div>

                    {/* FEATURE 2: SMART FRIDGE */}
                    <div onClick={() => navigate('/fridge')} className="flex items-center justify-between p-4 active:bg-sky-50/50 dark:active:bg-slate-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-350 rounded-xl border border-teal-100 dark:border-teal-500/10"><Refrigerator className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">Kulkas Pintar Tracker</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">Ingredient parsing & inventory management</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>

                    {/* FEATURE 3: MOM'S RECIPE */}
                    <div onClick={() => navigate('/catatan-ibu')} className="flex items-center justify-between p-4 active:bg-sky-50/50 dark:active:bg-slate-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-350 rounded-xl border border-rose-100 dark:border-rose-500/10"><HeartHandshake className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">Resep Warisan Ibu</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">Protected heritage and family recipes</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </div>

                  </div>
                </section>

                {/* UTILITIES PANEL */}
                <section className="space-y-2">
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/60 dark:border-sky-400/5 rounded-2xl divide-y divide-slate-100 dark:divide-sky-400/10 overflow-hidden shadow-sm">
                    
                    {/* UTILITY: THEME CONTEXT SWITCHER */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-150 dark:bg-slate-700 text-slate-650 dark:text-sky-350 rounded-xl"><Moon className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">Neon-Ocean Mode</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">Flip theme to dark high-contrast view</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isDarkMode}
                          onChange={toggleTheme}
                        />
                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>

                    {/* PORTAL ACCESS (Dual-view Simulator portal) */}
                    <div 
                      onClick={() => {
                        if (onSwitchView) onSwitchView('admin');
                        else navigate('/admin');
                      }}
                      className="flex items-center justify-between p-4 active:bg-sky-50/50 dark:active:bg-slate-700/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-350 rounded-xl border border-sky-100 dark:border-sky-500/10"><Shield className="w-4 h-4" /></div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">Super Admin Portal</span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">Switch view parameters for simulation</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-350" />
                    </div>

                    {/* UTILITY: LOGOUT */}
                    <div onClick={() => navigate('/login')} className="flex items-center justify-between p-4 active:bg-rose-50/45 dark:active:bg-rose-950/20 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl"><LogOut className="w-4 h-4" /></div>
                        <span className="font-bold text-xs text-rose-600 dark:text-rose-400">Sign Out Channel</span>
                      </div>
                    </div>

                  </div>
                </section>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* ================= BACK TO HOME BUTTON ================= */}
        <nav className="absolute bottom-6 inset-x-0 z-40 flex justify-center">
          <motion.button 
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            onClick={() => navigate('/')}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-sky-100 dark:border-sky-400/10 rounded-full py-3 px-8 shadow-sm text-sky-600 dark:text-cyan-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all"
          >
            <Utensils className="w-4 h-4" />
            Back to Main App
          </motion.button>
        </nav>

        {/* ================= SLIDE-UP BOTTOM SHEET DRAWER (BELANJA SHEET) ================= */}
        <div className={`absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-10"
            aria-hidden="true"
          />
          
          <div className={`relative w-full bg-sky-50/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-t-[36px] shadow-sm border-t border-sky-300/35 flex flex-col max-h-[75vh] overflow-hidden transform transition-transform duration-300 ease-out z-20 ${isCartOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Draw Handle bar */}
            <div 
              className="w-12 h-1.5 bg-sky-300/40 rounded-full mx-auto my-3 shrink-0 cursor-pointer"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Redesigned light-themed header for the drawer */}
            <div className="px-5 py-3 border-b border-sky-200/40 dark:border-sky-400/5 flex items-center justify-between shrink-0 bg-white/90 dark:bg-slate-850/90 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-widest">Weekly Shopping List</span>
              </div>
              <div className="flex items-center gap-2">
                {shoppingCart.length > 0 && (
                  <button 
                    onClick={handleClearAllShopping}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-500 dark:text-rose-400 text-[8px] font-black uppercase border border-rose-200/50 dark:border-transparent active:scale-95"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 border border-sky-200/30 dark:border-sky-400/5 text-slate-500 dark:text-sky-300 flex items-center justify-center active:scale-90"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar text-left">
              {shoppingCart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 text-sky-400/35 mx-auto mb-3 " />
                  <p className="text-xs font-bold text-slate-700 dark:text-sky-200">Daftar belanja masih kosong</p>
                  <p className="text-[9px] text-slate-450 mt-1">Kembali ke home resep dan ketuk tombol + di rekomendasi masakan untuk memasukkan bahan!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {shoppingCart.map((group) => (
                      <div 
                        key={group.recipeTitle}
                        className="bg-white/80 dark:bg-slate-800/80 border border-sky-100/50 dark:border-sky-400/5 rounded-2xl p-3.5 shadow-md"
                      >
                        <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-sky-100/40">
                          <span className="text-[10px] font-black text-sky-600 dark:text-cyan-400 uppercase tracking-wider">{group.recipeTitle}</span>
                          <button 
                            onClick={() => handleRemoveGroupFromShopping(group.recipeTitle)}
                            className="text-[9px] text-rose-500 hover:text-rose-600 font-bold"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => handleToggleShoppingItem(group.recipeTitle, item.name)}
                              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100/40 dark:border-transparent active:scale-[0.99] text-left"
                            >
                              <span className={`text-xs font-bold transition-all ${item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                                {item.name}
                              </span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${item.checked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-350 bg-white'}`}>
                                {item.checked && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HIGH-FIDELITY ROUTE GATEWAY BUTTON TO THE REAL SHOPPING LIST PAGE */}
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/daftar-belanja');
                    }}
                    className="w-full mt-2 py-3.5 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-md shadow-sky-550/20 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buka Modul Belanja Lengkap ➔
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= SOCIAL COOKSHARE CREATION UPLOADER MODAL ================= */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
              <div onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-[360px] bg-sky-50 dark:bg-slate-900 border border-white/50 dark:border-sky-400/10 rounded-[36px] shadow-sm p-5 text-left z-10 overflow-hidden"
              >
                <div className="flex justify-between items-center pb-3 border-b mb-4 border-sky-100/40 dark:border-sky-400/5">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Upload Karya Baru</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Bagikan resep kreasi Anda</p>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <form onSubmit={handleUploadRecipe} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Judul Hidangan</label>
                    <input 
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Resep Soto Lamongan..."
                      className="w-full bg-white dark:bg-slate-800 border border-sky-200/50 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Tautan Gambar Masakan</label>
                    <input 
                      type="url"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white dark:bg-slate-800 border border-sky-200/50 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Kategori Menu</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-800 border border-sky-200/50 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none h-11"
                    >
                      <option value="Soup">Soup</option>
                      <option value="Salad">Salad</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Bahan (Pisahkan Koma)</label>
                    <input 
                      type="text"
                      value={newIngredientsInput}
                      onChange={(e) => setNewIngredientsInput(e.target.value)}
                      placeholder="Ayam, Garam, Bawang"
                      className="w-full bg-white dark:bg-slate-800 border border-sky-200/50 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Deskripsi Singkat</label>
                    <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Kuah soto gurih berlimpah..."
                      rows={2}
                      className="w-full bg-white dark:bg-slate-800 border border-sky-200/50 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
                    />
                  </div>

                  <div className="pt-3 flex gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-550 hover:bg-teal-600 text-white text-xs font-bold shadow active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Publish
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
