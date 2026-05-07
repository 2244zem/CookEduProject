/**
 * RecipeList Page — Grid daftar resep dengan filter kategori dan search
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { recipeAPI, categoryAPI } from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';

export default function RecipeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data || []);
      } catch { setCategories([]); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory) params.category_id = activeCategory;
        if (search) params.search = search;
        const res = await recipeAPI.getAll(params);
        setRecipes(res.data || []);
      } catch {
        // Demo data fallback
        setRecipes([
          { id: 1, title: 'Nasi Goreng Spesial', slug: 'nasi-goreng-spesial', description: 'Nasi goreng khas Indonesia.', difficulty: 'mudah', prep_time: 15, cook_time: 10, servings: 2, category_name: 'Masakan Indonesia' },
          { id: 2, title: 'Brownies Kukus', slug: 'brownies-kukus', description: 'Brownies lembut dan moist.', difficulty: 'sedang', prep_time: 20, cook_time: 30, servings: 8, category_name: 'Dessert' },
          { id: 3, title: 'Es Teh Tarik', slug: 'es-teh-tarik', description: 'Teh susu yang creamy.', difficulty: 'mudah', prep_time: 5, cook_time: 5, servings: 1, category_name: 'Minuman' },
        ]);
      } finally { setLoading(false); }
    };
    fetchRecipes();
  }, [activeCategory, search]);

  const handleCategoryFilter = (catId) => {
    const newCat = catId === activeCategory ? '' : catId;
    setActiveCategory(newCat);
    const params = {};
    if (newCat) params.category = newCat;
    if (search) params.search = search;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-charcoal-800 mb-2">Semua Resep</h1>
          <p className="text-sm text-charcoal-400">Temukan inspirasi memasak untuk hari ini</p>
          {/* Search */}
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input type="text" placeholder="Cari resep..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-300 bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <SlidersHorizontal className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
          <button onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeCategory ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal-600 hover:bg-cream-300'}`}>
            Semua
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => handleCategoryFilter(String(cat.id))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${String(activeCategory) === String(cat.id) ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal-600 hover:bg-cream-300'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Recipe grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-charcoal-400">Tidak ada resep ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
