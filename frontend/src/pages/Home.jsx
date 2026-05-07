/**
 * Home Page — Landing page utama
 * Hero section, featured recipes, dan categories showcase.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, Clock, BookOpen, Users } from 'lucide-react';
import { recipeAPI, categoryAPI } from '../services/api';
import RecipeCard from '../components/recipe/RecipeCard';
import Button from '../components/ui/Button';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeRes, catRes] = await Promise.all([
          recipeAPI.getAll({ per_page: 6 }),
          categoryAPI.getAll(),
        ]);
        setRecipes(recipeRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        // Gunakan demo data jika API belum tersedia
        setRecipes(demoRecipes);
        setCategories(demoCategories);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-terracotta-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-600 text-xs font-medium mb-6">
                <ChefHat className="w-3.5 h-3.5" /> Platform Tutorial Memasak
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-800 leading-tight mb-6">
                Masak dengan <span className="text-gradient font-display italic">Percaya Diri</span>
              </h1>
              <p className="text-lg text-charcoal-500 leading-relaxed mb-8 max-w-lg">
                Temukan resep-resep pilihan dari dapur Indonesia. Panduan langkah demi langkah yang mudah diikuti untuk semua level memasak.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/recipes"><Button size="lg" icon={BookOpen}>Jelajahi Resep</Button></Link>
                <Link to="/register"><Button variant="secondary" size="lg">Daftar Gratis</Button></Link>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-terracotta-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-48 h-48 bg-sage-200/20 rounded-full blur-3xl" />
      </section>

      {/* Stats */}
      <section className="border-b border-cream-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, value: '100+', label: 'Resep' },
              { icon: Users, value: '1.2K', label: 'Pengguna' },
              { icon: ChefHat, value: '50+', label: 'Kategori' },
              { icon: Clock, value: '10K+', label: 'Tutorial Diikuti' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
                <stat.icon className="w-5 h-5 text-terracotta-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-charcoal-800">{stat.value}</p>
                <p className="text-xs text-charcoal-400 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-800">Kategori</h2>
            <p className="text-sm text-charcoal-400 mt-1">Jelajahi resep berdasarkan kategori</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(categories.length ? categories : demoCategories).map((cat, i) => (
            <motion.div key={cat.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link to={`/recipes?category=${cat.id}`}
                className="block card card-hover text-center p-5 group">
                <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-terracotta-100 transition-colors">
                  <ChefHat className="w-6 h-6 text-terracotta-500" />
                </div>
                <h3 className="text-sm font-semibold text-charcoal-700">{cat.name}</h3>
                <p className="text-xs text-charcoal-400 mt-1">{cat.recipe_count || 0} resep</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="bg-white border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-charcoal-800">Resep Pilihan</h2>
              <p className="text-sm text-charcoal-400 mt-1">Resep terpopuler pilihan chef kami</p>
            </div>
            <Link to="/recipes" className="text-sm text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1 font-medium">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recipes.length ? recipes : demoRecipes).slice(0, 6).map((r) => (
              <RecipeCard key={r.id || r.slug} recipe={r} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Demo data untuk development tanpa backend
const demoCategories = [
  { id: 1, name: 'Masakan Indonesia', slug: 'masakan-indonesia', recipe_count: 24 },
  { id: 2, name: 'Dessert & Kue', slug: 'dessert-kue', recipe_count: 18 },
  { id: 3, name: 'Minuman', slug: 'minuman', recipe_count: 12 },
  { id: 4, name: 'Masakan Asia', slug: 'masakan-asia', recipe_count: 15 },
  { id: 5, name: 'Sarapan', slug: 'sarapan', recipe_count: 9 },
];

const demoRecipes = [
  { id: 1, title: 'Nasi Goreng Spesial', slug: 'nasi-goreng-spesial', description: 'Nasi goreng khas Indonesia dengan bumbu rahasia.', difficulty: 'mudah', prep_time: 15, cook_time: 10, servings: 2, category_name: 'Masakan Indonesia' },
  { id: 2, title: 'Brownies Kukus Amanda', slug: 'brownies-kukus-amanda', description: 'Brownies kukus lembut dengan rasa cokelat pekat.', difficulty: 'sedang', prep_time: 20, cook_time: 30, servings: 8, category_name: 'Dessert & Kue' },
  { id: 3, title: 'Es Teh Tarik', slug: 'es-teh-tarik', description: 'Minuman teh susu yang creamy dan menyegarkan.', difficulty: 'mudah', prep_time: 5, cook_time: 5, servings: 1, category_name: 'Minuman' },
  { id: 4, title: 'Rendang Daging Sapi', slug: 'rendang-daging', description: 'Rendang empuk dengan bumbu rempah yang kaya.', difficulty: 'sulit', prep_time: 30, cook_time: 120, servings: 6, category_name: 'Masakan Indonesia' },
  { id: 5, title: 'Pancake Fluffy', slug: 'pancake-fluffy', description: 'Pancake lembut ala Jepang untuk sarapan sempurna.', difficulty: 'sedang', prep_time: 10, cook_time: 15, servings: 4, category_name: 'Sarapan' },
  { id: 6, title: 'Soto Ayam', slug: 'soto-ayam', description: 'Soto ayam kuning yang hangat dan menyegarkan.', difficulty: 'sedang', prep_time: 20, cook_time: 45, servings: 4, category_name: 'Masakan Indonesia' },
];
