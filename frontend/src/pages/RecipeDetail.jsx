/**
 * RecipeDetail Page — Detail resep lengkap
 * Menampilkan info resep, IngredientChecklist interaktif, dan StepList.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ChefHat, ArrowLeft, Printer } from 'lucide-react';
import { recipeAPI } from '../services/api';
import IngredientChecklist from '../components/recipe/IngredientChecklist';
import StepList from '../components/recipe/StepList';
import Badge from '../components/ui/Badge';

export default function RecipeDetail() {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await recipeAPI.getBySlug(slug);
        setRecipe(res.data);
      } catch (err) {
        console.error(err);
        // Fallback demo data
        setRecipe(demoRecipeDetail);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ChefHat className="w-16 h-16 text-cream-400" />
        <p className="text-lg text-charcoal-400">Resep tidak ditemukan</p>
        <Link to="/recipes" className="link">Kembali ke daftar resep</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Top bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/recipes" className="flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>

      {/* Recipe header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {recipe.image_url && (
          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-cream-200 mb-8 border border-cream-200">
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge difficulty={recipe.difficulty} />
          {recipe.category_name && <Badge color="neutral">{recipe.category_name}</Badge>}
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-charcoal-800 font-display mb-4">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-charcoal-500 leading-relaxed mb-6 max-w-2xl">{recipe.description}</p>
        )}

        {/* Meta info cards */}
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <div className="card p-3 text-center">
            <Clock className="w-4 h-4 text-terracotta-500 mx-auto mb-1" />
            <p className="text-xs text-charcoal-400">Persiapan</p>
            <p className="text-sm font-semibold text-charcoal-800">{recipe.prep_time || 0} min</p>
          </div>
          <div className="card p-3 text-center">
            <ChefHat className="w-4 h-4 text-terracotta-500 mx-auto mb-1" />
            <p className="text-xs text-charcoal-400">Memasak</p>
            <p className="text-sm font-semibold text-charcoal-800">{recipe.cook_time || 0} min</p>
          </div>
          <div className="card p-3 text-center">
            <Users className="w-4 h-4 text-terracotta-500 mx-auto mb-1" />
            <p className="text-xs text-charcoal-400">Porsi</p>
            <p className="text-sm font-semibold text-charcoal-800">{recipe.servings || 1}</p>
          </div>
        </div>
      </header>

      {/* Content: Ingredients + Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Ingredients (sidebar) */}
          <aside className="lg:col-span-2">
            <div className="card p-6 lg:sticky lg:top-24">
              <IngredientChecklist ingredients={recipe.ingredients || []} />
            </div>
          </aside>

          {/* Steps (main) */}
          <main className="lg:col-span-3">
            <div className="card p-6">
              <StepList steps={recipe.steps || []} />
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}

// Demo data fallback
const demoRecipeDetail = {
  id: 1, title: 'Nasi Goreng Spesial', slug: 'nasi-goreng-spesial',
  description: 'Nasi goreng khas Indonesia dengan bumbu rahasia yang membuat rasanya tak terlupakan.',
  category_name: 'Masakan Indonesia', difficulty: 'mudah', prep_time: 15, cook_time: 10, servings: 2,
  ingredients: [
    { id: 1, name: 'Nasi putih (sisa semalam)', quantity: '400', unit: 'gram' },
    { id: 2, name: 'Telur ayam', quantity: '2', unit: 'butir' },
    { id: 3, name: 'Bawang merah', quantity: '5', unit: 'siung' },
    { id: 4, name: 'Bawang putih', quantity: '3', unit: 'siung' },
    { id: 5, name: 'Cabai merah keriting', quantity: '3', unit: 'buah' },
    { id: 6, name: 'Kecap manis', quantity: '2', unit: 'sdm' },
    { id: 7, name: 'Garam', quantity: '1', unit: 'sdt' },
    { id: 8, name: 'Minyak goreng', quantity: '3', unit: 'sdm' },
    { id: 9, name: 'Daun bawang', quantity: '2', unit: 'batang' },
  ],
  steps: [
    { id: 1, step_number: 1, instruction: 'Haluskan bawang merah, bawang putih, dan cabai merah menggunakan cobek.' },
    { id: 2, step_number: 2, instruction: 'Panaskan minyak goreng di wajan besar dengan api sedang-tinggi.' },
    { id: 3, step_number: 3, instruction: 'Tumis bumbu halus hingga harum dan matang, sekitar 2-3 menit.' },
    { id: 4, step_number: 4, instruction: 'Sisihkan bumbu, pecahkan telur dan orak-arik hingga setengah matang.' },
    { id: 5, step_number: 5, instruction: 'Masukkan nasi putih, aduk rata dengan bumbu dan telur. Gunakan api besar.' },
    { id: 6, step_number: 6, instruction: 'Tambahkan kecap manis dan garam, aduk merata. Masak 3-4 menit.' },
    { id: 7, step_number: 7, instruction: 'Taburi daun bawang. Sajikan panas dengan kerupuk dan acar.' },
  ],
};
