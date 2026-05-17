import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Thermometer, Plus, ShoppingBag, ArrowRight, Compass, Sparkles, X, Filter, Menu, User, ShoppingCart, ArrowLeft } from 'lucide-react';
import { getStoredRecipes, saveRecipesToStorage } from '../data/recipeStore';
import type { Recipe } from '../data/recipeStore';
import WeatherCard from '../components/WeatherCard';
import RecipeCard from '../components/RecipeCard';
import ShoppingList from '../components/ShoppingList';

// Premium background & photographic assets
import bgImage from '../assets/background.png';
import bgDrop from '../assets/backgrounddrop.jpg';
import foodPattern from '../assets/food_drawing.jpg';
import inspiration1 from '../assets/download (1).jpg';
import inspiration2 from '../assets/download (2).jpg';
import inspiration3 from '../assets/download (3).jpg';

const CURRENT_USER = { id: "user_zem123", username: "zem" };

interface UserDashboardProps {
  onSwitchView?: (view: 'user' | 'admin') => void;
}

export default function UserDashboard({ onSwitchView }: UserDashboardProps) {
  const navigate = useNavigate();
  // Recipes database state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [shoppingCart, setShoppingCart] = useState<Recipe[]>([]);
  
  // Weather API States
  const [temperature, setTemperature] = useState(74); 
  const [weatherCondition, setWeatherCondition] = useState("Partly Cloudy");
  const [userAddress, setUserAddress] = useState("Bandung, ID");

  // Mobile navigation & drawer states
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Recipe Creation & Editing Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Soup" | "Salad" | "Main Course" | "Dessert">("Main Course");
  const [formImage, setFormImage] = useState("");
  const [formTempMin, setFormTempMin] = useState(30);
  const [formTempMax, setFormTempMax] = useState(90);

  // Load recipes from local storage
  const loadRecipes = () => {
    setRecipes(getStoredRecipes());
  };

  useEffect(() => {
    loadRecipes();
    window.addEventListener("storage", loadRecipes);
    return () => window.removeEventListener("storage", loadRecipes);
  }, []);

  // Update recipes when database pool undergoes changes
  const updateRecipesState = (newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    saveRecipesToStorage(newRecipes);
    window.dispatchEvent(new Event("storage"));
  };

  // Weather update handler
  const handleWeatherUpdate = (temp: number, condition: string, resolvedAddress: string) => {
    setTemperature(temp);
    setWeatherCondition(condition);
    setUserAddress(resolvedAddress);
    
    // Sync with global AI Assistant chatbot
    const parts = resolvedAddress.split(',');
    const city = parts[0] ? parts[0].trim() : resolvedAddress;
    localStorage.setItem('cookedu_last_weather', JSON.stringify({ temp, condition, city }));
  };

  // Dynamic Fahrenheit Filter: matches current temperature with suitableTemp.min and max
  const recommendedRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWeather = temperature >= recipe.suitableTemp.min && temperature <= recipe.suitableTemp.max;
    const isApproved = recipe.status === "Approved";
    return matchesSearch && matchesWeather && isApproved;
  });

  // Shopping list toggle
  const handleToggleShoppingList = (recipe: Recipe) => {
    if (shoppingCart.some(item => item.id === recipe.id)) {
      setShoppingCart(shoppingCart.filter(item => item.id !== recipe.id));
    } else {
      setShoppingCart([...shoppingCart, recipe]);
    }
  };

  const handleRemoveFromCart = (recipe: Recipe) => {
    setShoppingCart(shoppingCart.filter(item => item.id !== recipe.id));
  };

  const handleClearCart = () => {
    setShoppingCart([]);
  };

  // CRUD: Open modal for creating a new recipe
  const handleOpenCreateModal = () => {
    setEditingRecipe(null);
    setFormTitle("");
    setFormCategory("Main Course");
    setFormImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80");
    setFormTempMin(50);
    setFormTempMax(90);
    setIsModalOpen(true);
  };

  // CRUD: Open modal for editing user's own recipe
  const handleOpenEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormTitle(recipe.title);
    setFormCategory(recipe.category);
    setFormImage(recipe.image);
    setFormTempMin(recipe.suitableTemp.min);
    setFormTempMax(recipe.suitableTemp.max);
    setIsModalOpen(true);
  };

  // CRUD: Save or update recipe
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingRecipe) {
      const updated = recipes.map(r => r.id === editingRecipe.id ? {
        ...r,
        title: formTitle,
        category: formCategory,
        image: formImage,
        suitableTemp: { min: Number(formTempMin), max: Number(formTempMax) }
      } : r);
      updateRecipesState(updated);
    } else {
      const newRecipe: Recipe = {
        id: `rec_${Date.now()}`,
        title: formTitle,
        category: formCategory,
        image: formImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        createdBy: CURRENT_USER.id,
        authorRole: "Standard User",
        isOfficial: false,
        suitableTemp: { min: Number(formTempMin), max: Number(formTempMax) },
        status: "Approved"
      };
      updateRecipesState([...recipes, newRecipe]);
    }

    setIsModalOpen(false);
  };

  // CRUD: Delete recipe
  const handleDeleteRecipe = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus resep ini dari katalog pribadi Anda?")) {
      const remaining = recipes.filter(r => r.id !== id);
      updateRecipesState(remaining);
      setShoppingCart(shoppingCart.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen text-slate-700 p-4 md:p-8 font-sans relative overflow-hidden transition-colors duration-300">
      
      {/* GLOBAL LUXURIOUS PARALLAX BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* 1. Ambient fluid gradient wallpaper */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* 2. Ethereal atmospheric drop overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25 animate-pulse"
          style={{ backgroundImage: `url(${bgDrop})`, animationDuration: '12s' }}
        />
        {/* 3. Culinary line-art grid texture */}
        <div 
          className="absolute inset-0 bg-repeat opacity-[0.02]"
          style={{ backgroundImage: `url(${foodPattern})`, backgroundSize: '360px' }}
        />
        {/* 4. Soft premium colored overlay orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-200/40 blur-[135px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-200/30 blur-[125px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* ================= HEADER & NAVIGATION (Android accessibility optimized) ================= */}
        <header className="bg-white/80 backdrop-blur-md border border-sky-100/70 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Welcome text */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 bg-gradient-to-tr from-sky-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-800">
                  Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600 font-extrabold">{CURRENT_USER.username}</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Smart Weather Cooking</p>
              </div>
            </div>
            
            {/* TWIN BUTTONS COMPONENT (Minimum 48x48px Android Tap Targets in glassmorphic Action Pill) */}
            <div className="flex items-center bg-sky-50/85 border border-sky-100/70 rounded-full p-1 shadow-sm shrink-0">
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="w-11 h-11 flex items-center justify-center bg-white text-sky-600 rounded-full shadow-sm hover:text-sky-700 active:scale-95 transition-all relative"
                aria-label="Keranjang Belanja"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {shoppingCart.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-teal-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {shoppingCart.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-sky-600 active:scale-95 transition-all ml-1.5"
                aria-label="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-sky-650" />
              </button>
            </div>
            </div>

          {/* Search bar & Desktop Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari hidangan lezat hari ini..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sky-50/50 border border-sky-100 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-750 placeholder:text-slate-400 shadow-inner h-12"
              />
            </div>
            
            <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-sky-500 to-teal-600 hover:from-sky-600 hover:to-teal-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md shadow-sky-500/10 flex items-center justify-center gap-1.5 transition-all shrink-0 h-12 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Resep Baru</span>
            </button>

            {/* Desktop Twin Buttons Action Pill Panel */}
            <div className="hidden md:flex items-center bg-sky-50/85 border border-sky-100/70 rounded-full p-1 shadow-sm shrink-0 ml-2">
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="w-11 h-11 flex items-center justify-center bg-white text-sky-600 rounded-full shadow-sm hover:text-sky-700 active:scale-95 transition-all relative"
                aria-label="Keranjang Belanja"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {shoppingCart.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-teal-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {shoppingCart.length}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-sky-600 active:scale-95 transition-all ml-1.5"
                aria-label="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-sky-650" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN DASHBOARD BODY (Mobile responsive grids) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* CATALOG AND WEATHER (Left/Center Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ================= INSPIRASI RASA HARI INI (Premium Culinary Gallery) ================= */}
            <div className="bg-white/70 backdrop-blur-md border border-sky-100/60 p-5 rounded-[32px] shadow-sm space-y-4 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-sky-50 pb-2.5">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Inspirasi Rasa Hari Ini</span>
                  </h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Ketuk galeri untuk memfilter masakan terbaik
                  </p>
                </div>
                <span className="text-[8px] font-black uppercase text-slate-450 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
                  Premium Gallery
                </span>
              </div>

              {/* Horizontal Scroll / Adaptive flex gallery */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Inspiration Card 1 (Dessert Artistry) */}
                <div 
                  onClick={() => setSearchQuery(searchQuery === "Dessert" ? "" : "Dessert")}
                  className={`group relative h-24 sm:h-28 rounded-2xl overflow-hidden border shadow-sm cursor-pointer transition-all duration-500 hover:shadow-md hover:border-sky-400 active:scale-98 ${
                    searchQuery === "Dessert" ? "ring-2 ring-sky-550 border-sky-450" : "border-sky-100/45"
                  }`}
                >
                  <img 
                    src={inspiration1} 
                    alt="Dessert Artistry" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-2.5 inset-x-2.5 text-left text-white space-y-0.5 pointer-events-none">
                    <span className="text-[7px] font-black bg-rose-500/90 px-1.5 py-0.5 rounded tracking-widest uppercase">Sweet</span>
                    <h4 className="text-[10px] font-black tracking-tight leading-tight line-clamp-1">Seni Dessert Klasik</h4>
                  </div>
                </div>

                {/* Inspiration Card 2 (Archipelago Heritage) */}
                <div 
                  onClick={() => setSearchQuery(searchQuery === "Soup" ? "" : "Soup")}
                  className={`group relative h-24 sm:h-28 rounded-2xl overflow-hidden border shadow-sm cursor-pointer transition-all duration-500 hover:shadow-md hover:border-sky-400 active:scale-98 ${
                    searchQuery === "Soup" ? "ring-2 ring-sky-550 border-sky-450" : "border-sky-100/45"
                  }`}
                >
                  <img 
                    src={inspiration2} 
                    alt="Archipelago Heritage" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-2.5 inset-x-2.5 text-left text-white space-y-0.5 pointer-events-none">
                    <span className="text-[7px] font-black bg-amber-500/90 px-1.5 py-0.5 rounded tracking-widest uppercase">Spice</span>
                    <h4 className="text-[10px] font-black tracking-tight leading-tight line-clamp-1">Rempah Nusantara</h4>
                  </div>
                </div>

                {/* Inspiration Card 3 (Western Symphony) */}
                <div 
                  onClick={() => setSearchQuery(searchQuery === "Main Course" ? "" : "Main Course")}
                  className={`group relative h-24 sm:h-28 rounded-2xl overflow-hidden border shadow-sm cursor-pointer transition-all duration-500 hover:shadow-md hover:border-sky-400 active:scale-98 ${
                    searchQuery === "Main Course" ? "ring-2 ring-sky-550 border-sky-450" : "border-sky-100/45"
                  }`}
                >
                  <img 
                    src={inspiration3} 
                    alt="Gourmet Dining Symphony" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-2.5 inset-x-2.5 text-left text-white space-y-0.5 pointer-events-none">
                    <span className="text-[7px] font-black bg-sky-500/90 px-1.5 py-0.5 rounded tracking-widest uppercase">Gourmet</span>
                    <h4 className="text-[10px] font-black tracking-tight leading-tight line-clamp-1">Simfoni Gastronomi</h4>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Weather Widget directly on user's home screen */}
            <WeatherCard
              temperature={temperature}
              weatherCondition={weatherCondition}
              userAddress={userAddress}
              onWeatherUpdate={handleWeatherUpdate}
            />

            {/* Recommended Feed section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 text-left">
                  <Thermometer className="w-5 h-5 text-sky-500" />
                  <span>Rekomendasi Menu Suhu {temperature}°F</span>
                </h2>
                <div className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100/60 px-3 py-1 rounded-full shadow-sm">
                  Aktif: {recommendedRecipes.length} Hidangan
                </div>
              </div>

              {recommendedRecipes.length === 0 ? (
                <div className="bg-white/80 border border-sky-100 rounded-3xl p-10 text-center text-slate-400 space-y-3 shadow-sm backdrop-blur-sm">
                  <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-full flex items-center justify-center mx-auto text-sky-300">
                    <Thermometer className="w-6 h-6 text-sky-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-700">Resep tidak ditemukan untuk suhu ini</p>
                    <p className="text-[10px] max-w-[320px] mx-auto leading-relaxed text-slate-400">
                      Suhu saat ini (<span className="font-bold text-slate-650">{temperature}°F</span>) tidak cocok dengan catalog resep kami. Cobalah mengganti kota atau buat resep baru!
                    </p>
                  </div>
                </div>
              ) : (
                // Responsive grid: Prevent horizontal scroll by wrapping beautifully
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      currentUser={CURRENT_USER}
                      isInCart={shoppingCart.some(item => item.id === recipe.id)}
                      onToggleCart={handleToggleShoppingList}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteRecipe}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ================= SHOPPING DRAWER / SIDEBAR (Dynamic mobile placement) ================= */}
          {/* Desktop side placement */}
          <div className="hidden lg:block lg:col-span-1">
            <ShoppingList
              cartItems={shoppingCart}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={handleClearCart}
            />
          </div>

          {/* 🧺 ANDROID THUMB-ZONE EXPANDABLE BOTTOM SHEET DRAWER */}
          <div className={`fixed inset-0 z-[100] lg:hidden flex flex-col justify-end transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop overlay */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            {/* Bottom Sheet Container */}
            <div className={`relative w-full bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden transform transition-transform duration-300 ease-out z-10 ${isCartOpen ? 'translate-y-0' : 'translate-y-full'}`}>
              
              {/* Drag/Indicator Handle bar */}
              <div 
                className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3 shrink-0 cursor-pointer"
                onClick={() => setIsCartOpen(false)}
                title="Tarik ke bawah untuk menutup"
              />

              <div className="p-4 border-b border-sky-100/60 flex items-center justify-between shrink-0 bg-sky-50/50">
                <span className="font-extrabold text-sm text-slate-800">Keranjang Belanja</span>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-white border border-sky-100 rounded-xl text-slate-500 active:scale-95 shrink-0"
                  aria-label="Tutup Keranjang"
                >
                  <X className="w-4 h-4 text-sky-600" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-white">
                <ShoppingList
                  cartItems={shoppingCart}
                  onRemoveItem={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL: CREATE AND EDIT RECIPE (Touch targets accessibility validated) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all p-6 text-left border border-sky-100/50">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {editingRecipe ? 'Edit Masterpiece Resep' : 'Kreasikan Resep Baru'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {editingRecipe ? 'Kalibrasi batas suhu ideal' : 'Tulis formula masakan cuaca terbaik'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                aria-label="Tutup form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              {/* Form Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Judul Hidangan</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Spicy Kimchi Ramen"
                  className="w-full bg-sky-50/50 border border-sky-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all h-12"
                />
              </div>

              {/* Form Category & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Kategori Menu</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-sky-50/50 border border-sky-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all h-12"
                  >
                    <option value="Soup">Soup</option>
                    <option value="Salad">Salad</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Tautan Gambar</label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-sky-50/50 border border-sky-100 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all h-12"
                  />
                </div>
              </div>

              {/* Temperature Calibration */}
              <div className="bg-sky-50/50 border border-sky-100/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-sky-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    Kalibrasi Suhu Ideal (Fahrenheit)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400">Minimal (°F)</label>
                    <input
                      type="number"
                      required
                      value={formTempMin}
                      onChange={(e) => setFormTempMin(Number(e.target.value))}
                      className="w-full bg-white border border-sky-150 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400">Maksimal (°F)</label>
                    <input
                      type="number"
                      required
                      value={formTempMax}
                      onChange={(e) => setFormTempMax(Number(e.target.value))}
                      className="w-full bg-white border border-sky-150 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons (Validated tap target area) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 h-12 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 h-12 bg-gradient-to-r from-sky-500 to-teal-650 hover:from-sky-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-100 animate-pulse" />
                  <span>{editingRecipe ? 'Perbarui Resep' : 'Sahkan Resep'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
