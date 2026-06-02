import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark,
  ChefHat,
  Clock,
  Flame,
  Loader2,
  Plus,
  PlusCircle,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react'
import { recipeApi, categoryApi } from '../../lib/api'
import { recipes as initialRecipes } from '../../data/recipes'
import { useAuthStore } from '../../store'
import { useShoppingStore } from '../../store/shoppingStore'
import { avatarFallbackUrl, resolveMediaUrl, withImageFallback } from '../../lib/media'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import {
  createSupabaseRecipe,
  deleteSupabaseRecipe,
  listFavoriteKeys,
  listSupabaseRecipes,
  subscribeToCookEduRealtime,
  toggleFavoriteItem,
} from '../../lib/supabaseData'

type IngredientInput = {
  item: string
  amount: string
  unit: string
}

const emptyIngredient: IngredientInput = { item: '', amount: '', unit: '' }

const isUuid = (value: unknown) =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

function normalizeIngredientText(ingredient: any) {
  if (typeof ingredient === 'string') return ingredient
  const name = ingredient?.name || ingredient?.item || ingredient?.ingredient || 'Bahan'
  const quantity = [ingredient?.amount || ingredient?.quantity, ingredient?.unit].filter(Boolean).join(' ')
  return quantity ? `${name} (${quantity})` : name
}

function RecipeCard({
  recipe,
  isFavorite,
  canFavorite,
  canDelete,
  onFavorite,
  onDelete,
  onAdd,
}: {
  recipe: any
  isFavorite: boolean
  canFavorite: boolean
  canDelete: boolean
  onFavorite: () => void
  onDelete: () => void
  onAdd: () => void
}) {
  const imageUrl = resolveMediaUrl(recipe.imageUrl || recipe.image_url) || withImageFallback(recipe.title || 'CookEdu')
  const category = recipe.category?.name || recipe.category || 'Recipe'

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link to={`/recipes/${recipe.id}`} className="block text-left">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            onError={(event) => { event.currentTarget.src = avatarFallbackUrl(recipe.title || 'CookEdu') }}
            alt={recipe.title || 'Recipe'}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-700">
            {category}
          </span>
        </div>
      </Link>

      <div className="space-y-4 p-5 text-left">
        <div>
          <h2 className="line-clamp-2 min-h-[52px] text-xl font-black leading-tight text-slate-950">{recipe.title || 'Resep CookEdu'}</h2>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{recipe.description || 'Resep komunitas CookEdu.'}</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-black text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-cyan-700" />
            {recipe.cooking_time || recipe.prepTime || 20}m
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-rose-600" />
            {recipe.difficulty || 'beginner'}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={onAdd}
            className="flex h-10 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-cyan-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Belanja
          </button>

          <div className="flex items-center gap-2">
            {canFavorite && (
              <button
                onClick={onFavorite}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100"
                title="Simpan favorit"
              >
                <Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                title="Hapus resep"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function RecipeCreateModal({
  isOpen,
  onClose,
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  cookingTime,
  setCookingTime,
  difficulty,
  setDifficulty,
  ingredients,
  setIngredients,
  categories,
  error,
  isSaving,
  onSave,
}: any) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">Recipe Studio</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Tambah Resep</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-left md:col-span-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Judul</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-cyan-400 focus:bg-white"
              placeholder="Contoh: Ayam Woku Kemangi"
            />
          </label>

          <label className="block text-left">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Kategori</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-cyan-400 focus:bg-white"
            >
              {categories.map((item: string) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block text-left">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Level</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-cyan-400 focus:bg-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          <label className="block text-left md:col-span-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Deskripsi</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
              placeholder="Tulis ringkasan rasa, tips, atau konteks resep..."
            />
          </label>

          <label className="block text-left">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Waktu Masak</span>
            <input
              type="number"
              min={1}
              value={cookingTime}
              onChange={(event) => setCookingTime(Number(event.target.value))}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-cyan-400 focus:bg-white"
            />
          </label>

          <div className="text-left md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">Bahan</span>
              <button
                type="button"
                onClick={() => setIngredients([...ingredients, { ...emptyIngredient }])}
                className="rounded-xl bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 hover:bg-cyan-100"
              >
                Tambah Bahan
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {ingredients.map((ingredient: IngredientInput, index: number) => (
                <div key={index} className="grid grid-cols-[minmax(0,1fr)_90px_90px_40px] gap-2">
                  <input
                    value={ingredient.item}
                    onChange={(event) => {
                      const next = [...ingredients]
                      next[index] = { ...next[index], item: event.target.value }
                      setIngredients(next)
                    }}
                    placeholder="Nama bahan"
                    className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                  />
                  <input
                    value={ingredient.amount}
                    onChange={(event) => {
                      const next = [...ingredients]
                      next[index] = { ...next[index], amount: event.target.value }
                      setIngredients(next)
                    }}
                    placeholder="2"
                    className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                  />
                  <input
                    value={ingredient.unit}
                    onChange={(event) => {
                      const next = [...ingredients]
                      next[index] = { ...next[index], unit: event.target.value }
                      setIngredients(next)
                    }}
                    placeholder="sdm"
                    className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    disabled={ingredients.length === 1}
                    onClick={() => setIngredients(ingredients.filter((_: IngredientInput, itemIndex: number) => itemIndex !== index))}
                    className="flex h-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}

        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-cyan-700 disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5 text-cyan-300" />}
          {isSaving ? 'Menyimpan...' : 'Simpan Resep'}
        </button>
      </div>
    </div>
  )
}

export default function RecipeList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { addGroup, groups } = useShoppingStore()
  const [activeCategory, setActiveCategory] = useState('SEMUA')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Community')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [cookingTime, setCookingTime] = useState(20)
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ ...emptyIngredient }])

  useEffect(() => {
    return subscribeToCookEduRealtime(() => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-keys'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
    })
  }, [queryClient])

  const recipesQuery = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      if (isSupabaseConfigured) return { data: { data: await listSupabaseRecipes() } }
      return recipeApi.list()
    },
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (isSupabaseConfigured) return { data: { data: [] } }
      return categoryApi.list()
    },
  })

  const favoritesQuery = useQuery({
    queryKey: ['favorite-keys'],
    queryFn: listFavoriteKeys,
    enabled: isSupabaseConfigured,
  })

  const apiRecipes = (recipesQuery.data?.data?.data || []).filter(Boolean)
  const apiCategories = (categoriesQuery.data?.data?.data || []).map((item: any) => item.name).filter(Boolean)

  const recipes = useMemo(() => {
    return [...apiRecipes, ...initialRecipes].reduce((acc: any[], recipe: any) => {
      const normalized = {
        ...recipe,
        imageUrl: recipe.imageUrl || recipe.image_url,
        category: recipe.category?.name || recipe.category || 'Recipe',
        cooking_time: recipe.cooking_time || Number.parseInt(recipe.prepTime || '20', 10) || 20,
      }
      if (!acc.some((item) => String(item.title).toLowerCase() === String(normalized.title).toLowerCase())) {
        acc.push(normalized)
      }
      return acc
    }, [])
  }, [apiRecipes])

  const categories = useMemo(() => {
    const names = ['SEMUA', ...apiCategories, ...recipes.map((recipe: any) => recipe.category)].filter(Boolean)
    return [...new Set(names.map((item) => String(item).toUpperCase()))]
  }, [apiCategories, recipes])

  const selectedCategoryNames = useMemo(() => categories.map((item) => item === 'SEMUA' ? 'Community' : item), [categories])

  const favoriteSet = useMemo(() => {
    return new Set((favoritesQuery.data || []).filter((item: any) => item.item_type === 'recipe').map((item: any) => item.item_id))
  }, [favoritesQuery.data])

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return recipes.filter((recipe: any) => {
      const recipeCategory = String(recipe.category || '').toUpperCase()
      const matchesCategory = activeCategory === 'SEMUA' || recipeCategory === activeCategory
      const matchesSearch = !query || [recipe.title, recipe.description, recipe.category]
        .some((value) => String(value || '').toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, recipes, searchQuery])

  const createMutation = useMutation({
    mutationFn: async () => {
      const cleanIngredients = ingredients.filter((ingredient) => ingredient.item.trim())
      if (isSupabaseConfigured) {
        return createSupabaseRecipe({
          title,
          category,
          description: description || 'Resep baru dari komunitas CookEdu',
          difficulty,
          ingredients: cleanIngredients,
          steps: [{ instruction: 'Siapkan bahan dan masak sesuai langkah resep.', duration: cookingTime }],
          cookingTime,
          prepTime: 0,
          servings: 1,
        })
      }
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('description', description)
      formData.append('difficulty', difficulty)
      formData.append('cooking_time', String(cookingTime))
      formData.append('ingredients', JSON.stringify(cleanIngredients))
      return recipeApi.create(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setIsModalOpen(false)
      setCreateError('')
      setTitle('')
      setDescription('')
      setDifficulty('beginner')
      setCookingTime(20)
      setIngredients([{ ...emptyIngredient }])
    },
    onError: (error: any) => setCreateError(error?.message || error?.response?.data?.message || 'Gagal menyimpan resep.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => isSupabaseConfigured ? deleteSupabaseRecipe(String(id)) : recipeApi.delete(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })

  const favoriteMutation = useMutation({
    mutationFn: (id: string) => toggleFavoriteItem(id, 'recipe'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-keys'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-items'] })
    },
  })

  const handleSaveRecipe = () => {
    setCreateError('')
    if (!title.trim()) return setCreateError('Judul resep wajib diisi.')
    if (!ingredients.some((ingredient) => ingredient.item.trim())) return setCreateError('Minimal isi satu bahan.')
    createMutation.mutate()
  }

  const handleAddRecipeToShopping = (recipe: any) => {
    const items = Array.isArray(recipe.ingredients) && recipe.ingredients.length
      ? recipe.ingredients.map(normalizeIngredientText)
      : ['Bahan utama', 'Bumbu dasar', 'Pelengkap']
    addGroup(`Belanja ${recipe.title}`, items)
    navigate('/daftar-belanja')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                <ChefHat className="h-3.5 w-3.5" />
                Recipe Catalog
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">CookEdu Recipes</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                Browse, save, and prepare recipes from Supabase in a focused kitchen catalog.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-80">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-left">
                <p className="text-3xl font-black text-slate-950">{filteredRecipes.length}</p>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Resep siap</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-left">
                <p className="text-3xl font-black text-slate-950">{groups.length}</p>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Daftar belanja</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-700" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari resep, bahan, atau kategori..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold outline-none transition focus:border-cyan-400 focus:bg-white"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black uppercase tracking-widest text-white shadow-sm transition hover:bg-cyan-700"
            >
              <Plus className="h-5 w-5 text-cyan-300" />
              Tambah Resep
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="px-2 text-left text-sm font-black uppercase tracking-[0.2em] text-slate-500">Kategori</h2>
            <div className="mt-4 flex gap-2 overflow-x-auto lg:block lg:space-y-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveCategory(item)}
                  className={`h-11 shrink-0 rounded-2xl px-4 text-left text-xs font-black transition lg:flex lg:w-full lg:items-center lg:justify-between ${
                    activeCategory === item ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            {recipesQuery.isLoading ? (
              <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-700" />
                <p className="mt-3 text-sm font-black text-slate-500">Memuat resep...</p>
              </div>
            ) : filteredRecipes.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRecipes.map((recipe: any, index: number) => (
                  <RecipeCard
                    key={`${recipe.id || recipe.title}-${index}`}
                    recipe={recipe}
                    canFavorite={isSupabaseConfigured && isUuid(recipe.id)}
                    isFavorite={favoriteSet.has(recipe.id)}
                    canDelete={user?.role === 'admin' && isSupabaseConfigured && isUuid(recipe.id)}
                    onFavorite={() => isUuid(recipe.id) && favoriteMutation.mutate(recipe.id)}
                    onDelete={() => recipe.id && deleteMutation.mutate(recipe.id)}
                    onAdd={() => handleAddRecipeToShopping(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[30px] border border-dashed border-slate-200 bg-white p-12 text-center">
                <ChefHat className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-base font-black text-slate-600">Resep tidak ditemukan.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <RecipeCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        cookingTime={cookingTime}
        setCookingTime={setCookingTime}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        ingredients={ingredients}
        setIngredients={setIngredients}
        categories={selectedCategoryNames}
        error={createError}
        isSaving={createMutation.isPending}
        onSave={handleSaveRecipe}
      />
    </div>
  )
}
