import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Trash2, Edit3, Sparkles, CheckCircle, User, ArrowLeft, RefreshCw, Users, ChefHat, X, Thermometer } from 'lucide-react';
import { getStoredRecipes, saveRecipesToStorage, resetRecipesStorage } from '../data/recipeStore';
import type { Recipe } from '../data/recipeStore';

interface AdminDashboardProps {
  onSwitchView?: (view: 'user' | 'admin') => void;
}

export default function AdminDashboard({ onSwitchView }: AdminDashboardProps) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal state overrides
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<"Soup" | "Salad" | "Main Course" | "Dessert">("Main Course");
  const [editImage, setEditImage] = useState("");
  const [editTempMin, setEditTempMin] = useState(50);
  const [editTempMax, setEditTempMax] = useState(90);

  // Load recipes from local storage
  const loadRecipes = () => {
    setAllRecipes(getStoredRecipes());
  };

  useEffect(() => {
    loadRecipes();
    window.addEventListener("storage", loadRecipes);
    return () => window.removeEventListener("storage", loadRecipes);
  }, []);

  const updateRecipesState = (newRecipes: Recipe[]) => {
    setAllRecipes(newRecipes);
    saveRecipesToStorage(newRecipes);
    window.dispatchEvent(new Event("storage"));
  };

  // Content Promotion Logic: Promotes community recipe to Official Core System
  const handleMakeOfficial = (id: string) => {
    const updated = allRecipes.map(recipe => recipe.id === id ? {
      ...recipe,
      isOfficial: true,
      createdBy: "System (Approved)",
      authorRole: "Admin" as const,
      status: "Approved" as const
    } : recipe);
    updateRecipesState(updated);
  };

  // Admin Overridden Power: Delete ANY recipe permanently
  const handleDeleteForce = (id: string) => {
    if (confirm("🚨 HAPUS SUPER ADMIN: Apakah Anda yakin ingin memusnahkan resep ini secara permanen dari basis data global CookEdu?")) {
      const updated = allRecipes.filter(recipe => recipe.id !== id);
      updateRecipesState(updated);
    }
  };

  // Admin Overridden Power: Edit ANY recipe properties
  const handleOpenEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setEditTitle(recipe.title);
    setEditCategory(recipe.category);
    setEditImage(recipe.image);
    setEditTempMin(recipe.suitableTemp.min);
    setEditTempMax(recipe.suitableTemp.max);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe || !editTitle.trim()) return;

    const updated = allRecipes.map(r => r.id === selectedRecipe.id ? {
      ...r,
      title: editTitle,
      category: editCategory,
      image: editImage,
      suitableTemp: { min: Number(editTempMin), max: Number(editTempMax) }
    } : r);

    updateRecipesState(updated);
    setIsEditModalOpen(false);
  };

  // Reset database pool to default
  const handleResetCatalog = () => {
    if (confirm("Reset ulang basis data CookEdu ke default bawaan pabrik?")) {
      const defaults = resetRecipesStorage();
      setAllRecipes(defaults);
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Metric calculation for Bento grid counters
  const totalCatalog = allRecipes.length;
  const officialMenus = allRecipes.filter(r => r.isOfficial).length;
  const userSubmissions = allRecipes.filter(r => !r.isOfficial).length;

  const filteredAdminRecipes = allRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER DUAL SWITCHER NAVIGATION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-150 p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-md shadow-slate-900/25">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-850">CookEdu platform</h3>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                Central Control Center
              </p>
            </div>
          </div>
          
          <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onSwitchView?.('user')}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>User Client</span>
            </button>
            <button
              onClick={() => onSwitchView?.('admin')}
              className="px-4 py-2 rounded-lg text-xs font-black bg-white text-slate-800 shadow-sm border border-slate-200/40 flex items-center gap-1.5 transition-all"
            >
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* TITLE AND CONTROL HEADERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Catalog Control</h1>
            <p className="text-xs text-slate-400 mt-1">Supervise parameters, promote community submissions, and enforce quality control.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari judul resep atau kontributor..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 placeholder:text-slate-400 shadow-sm w-64"
              />
            </div>

            <button 
              onClick={handleResetCatalog}
              className="text-xs font-bold px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1 active:scale-95 shadow-sm"
              title="Reset Catalog to Default System"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Catalog</span>
            </button>
          </div>
        </div>

        {/* OVERVIEW BENTO GRID METRIC COUNTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Active Catalog */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Active Catalog</span>
              <h3 className="text-3xl font-black text-slate-900">{totalCatalog}</h3>
              <p className="text-[10px] font-medium text-slate-500">Live Recipes in Pool</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
              <ChefHat className="w-6 h-6 text-slate-500" />
            </div>
          </div>

          {/* Card 2: Verified Official Menus */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Verified Official Menus</span>
              <h3 className="text-3xl font-black text-emerald-700">{officialMenus}</h3>
              <p className="text-[10px] font-medium text-emerald-600/80">Approved Core Database</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center border border-emerald-200/40 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: User Contributions */}
          <div className="bg-amber-50/30 border border-amber-100/60 p-6 rounded-3xl flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">User Contributions</span>
              <h3 className="text-3xl font-black text-amber-700">{userSubmissions}</h3>
              <p className="text-[10px] font-medium text-amber-600/80">Community Submissions</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100/30 text-amber-600 flex items-center justify-center border border-amber-200/20 group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* GLOBAL MANAGEMENT DATA MATRIX TABLE */}
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Matrix Catalog Table</span>
            <span className="text-[10px] font-medium text-slate-400">Total Filtered: {filteredAdminRecipes.length} rows</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6]/40 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <th className="py-4 px-6">Identitas Hidangan</th>
                  <th className="py-4 px-6">Kalibrasi Fahrenheit Range</th>
                  <th className="py-4 px-6">Profil Kontributor</th>
                  <th className="py-4 px-6">Status Validasi</th>
                  <th className="py-4 px-6 text-right">Super Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-left">
                {filteredAdminRecipes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      Tidak ada data yang cocok dengan kriteria pencarian Admin.
                    </td>
                  </tr>
                ) : (
                  filteredAdminRecipes.map(recipe => (
                    <tr key={recipe.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Identity Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={recipe.image} 
                            alt={recipe.title} 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-100 bg-slate-100 shadow-inner shrink-0" 
                          />
                          <div>
                            <span className="font-extrabold text-slate-800 block">{recipe.title}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{recipe.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Celsius suitableTemp calibration range */}
                      <td className="py-4 px-6 font-mono text-slate-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{recipe.suitableTemp.min}°C - {recipe.suitableTemp.max}°C</span>
                        </div>
                      </td>

                      {/* Author Profil */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <User className="w-3 h-3 text-slate-500" />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700">{recipe.createdBy}</span>
                            <span className="text-[9px] text-slate-400 block">{recipe.authorRole}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status isOfficial Badge */}
                      <td className="py-4 px-6">
                        {recipe.isOfficial ? (
                          <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>System Official</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 text-[10px] inline-block">
                            User Generated
                          </span>
                        )}
                      </td>

                      {/* Admin Overridden Controls: Delete ANY / Edit ANY / Promote Community */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Make Official button shown ONLY if isOfficial: false */}
                          {!recipe.isOfficial && (
                            <button 
                              onClick={() => handleMakeOfficial(recipe.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-emerald-500/10 text-[9px] active:scale-95 transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-100" />
                              <span>Sahkan Menu</span>
                            </button>
                          )}
                          
                          {/* Super Admin overrides Edit & Delete buttons */}
                          <button
                            onClick={() => handleOpenEdit(recipe)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Super Admin: Edit parameters & Fahrenheit thresholds"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteForce(recipe.id)} 
                            className="p-1.5 text-rose-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Super Admin: Force delete from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SUPER ADMIN EDIT MODAL: Bypass ownership, manually edit title, category, and temperature boundaries */}
      {isEditModalOpen && selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsEditModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 overflow-hidden p-6 md:p-8 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Super Override Editor</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Bypass ownership: calibrate Fahrenheit ideal range
                </p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400">ID Resep: <strong className="font-mono text-slate-600">{selectedRecipe.id}</strong></span>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Judul Resep</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Category & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Soup">Soup</option>
                    <option value="Salad">Salad</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Gambar URL</label>
                  <input
                    type="url"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Fahrenheit Recalibration suitableTemp */}
              <div className="bg-[#FAF9F6] border border-slate-100 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Rekalibrasi Suhu Ideal (Celsius)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Minimal (°C)</label>
                    <input
                      type="number"
                      required
                      value={editTempMin}
                      onChange={(e) => setEditTempMin(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Maksimal (°C)</label>
                    <input
                      type="number"
                      required
                      value={editTempMax}
                      onChange={(e) => setEditTempMax(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
