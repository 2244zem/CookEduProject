import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Award,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Image as ImageIcon,
  Send,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Timer,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { recipes } from '../../data/recipes'
import { useShoppingStore } from '../../store/shoppingStore'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import {
  createRecipeComment,
  getSupabaseRecipe,
  listFavoriteKeys,
  listRecipeComments,
  subscribeToCookEduRealtime,
  toggleFavoriteItem,
  type SupabaseCommentRow,
} from '../../lib/supabaseData'
import { avatarFallbackUrl, resolveMediaUrl, withImageFallback } from '../../lib/media'
import bgPattern from '../../assets/food_drawing.jpg'

type NativeRecipeIngredient = {
  name: string
  quantity: string
}

type NativeRecipeStep = {
  instruction: string
  duration?: number
  tip?: string
}

type DetailRecipeView = {
  id: string | number
  title: string
  category: string
  description: string
  image_url: string
  cooking_time: number
  prep_time: number
  servings: number
  difficulty: string
  calories: string
  rating: string
  nutritional_info: Record<string, unknown>
  ingredients: NativeRecipeIngredient[]
  steps: NativeRecipeStep[]
  motherNote?: string
}

const DEFAULT_STEPS: NativeRecipeStep[] = [
  { instruction: 'Siapkan bahan sesuai daftar resep.' },
  { instruction: 'Masak mengikuti urutan instruksi yang tersedia.' },
  { instruction: 'Sajikan saat rasa dan tekstur sudah sesuai.' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function asNativeArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function textValue(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback
  return String(value).trim() || fallback
}

function numberValue(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function normalizeDifficulty(value: unknown) {
  const difficulty = textValue(value, 'beginner')
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

function normalizeIngredient(item: unknown, index: number): NativeRecipeIngredient | null {
  if (typeof item === 'string') {
    const name = item.trim()
    return name ? { name, quantity: '' } : null
  }

  if (!isRecord(item)) return null

  const name = textValue(
    item.name ?? item.item ?? item.ingredient ?? item.title,
    `Bahan ${index + 1}`
  )
  const quantity = [
    textValue(item.quantity ?? item.amount ?? item.qty),
    textValue(item.unit ?? item.unit_name),
  ].filter(Boolean).join(' ')

  return { name, quantity }
}

function normalizeStep(item: unknown): NativeRecipeStep | null {
  if (typeof item === 'string') {
    const instruction = item.trim()
    return instruction ? { instruction } : null
  }

  if (!isRecord(item)) return null

  const instruction = textValue(
    item.instruction ?? item.text ?? item.step ?? item.description
  )
  if (!instruction) return null

  return {
    instruction,
    duration: numberValue(item.duration, 0),
    tip: textValue(item.tip),
  }
}

function normalizeNutrition(value: unknown, staticNutrition?: unknown) {
  if (isRecord(value)) return value
  if (isRecord(staticNutrition)) return staticNutrition
  return {}
}

function normalizeRecipeForDetail(source: any): DetailRecipeView {
  const nutritionalInfo = normalizeNutrition(source.nutritional_info, source.nutrition)
  const schemaIngredients = asNativeArray(source.ingredients)
  const schemaSteps = asNativeArray(source.steps)
  const legacySteps = asNativeArray(source.instructions)
  const ingredients = schemaIngredients
    .map((item, index) => normalizeIngredient(item, index))
    .filter(Boolean) as NativeRecipeIngredient[]
  const steps = (schemaSteps.length ? schemaSteps : legacySteps)
    .map(normalizeStep)
    .filter(Boolean) as NativeRecipeStep[]

  return {
    id: source.id,
    title: textValue(source.title, 'Resep CookEdu'),
    category: textValue(source.category, 'Recipe'),
    description: textValue(source.description, 'Resep komunitas CookEdu.'),
    image_url: resolveMediaUrl(source.image_url) || '',
    cooking_time: numberValue(source.cooking_time, numberValue(String(source.prepTime).replace(/\D/g, ''), 25)),
    prep_time: numberValue(source.prep_time, 0),
    servings: numberValue(source.servings, 1),
    difficulty: normalizeDifficulty(source.difficulty),
    calories: textValue(nutritionalInfo.calories, '0'),
    rating: textValue(source.rating, '-'),
    nutritional_info: nutritionalInfo,
    ingredients,
    steps: steps.length ? steps : DEFAULT_STEPS,
    motherNote: source.motherNote,
  }
}

function formatIngredientLine(ingredient: NativeRecipeIngredient) {
  return ingredient.quantity ? `${ingredient.name} (${ingredient.quantity})` : ingredient.name
}

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addGroup } = useShoppingStore()
  const { user } = useAuthStore()
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  const [isCookingMode, setIsCookingMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [remoteRecipe, setRemoteRecipe] = useState<any | null>(null)
  const [loadingRemoteRecipe, setLoadingRemoteRecipe] = useState(false)
  const [comments, setComments] = useState<SupabaseCommentRow[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null)
  const [commentError, setCommentError] = useState('')
  const [isSendingComment, setIsSendingComment] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)

  const username = user?.username || user?.name || user?.email?.split('@')[0] || 'Koki CookEdu'
  const staticRecipe = recipes.find((item) => item.id === Number(id))
  const staticRecipeForSchema = staticRecipe
    ? { ...staticRecipe, image_url: (staticRecipe as any).image_url || staticRecipe.imageUrl }
    : null
  const rawRecipe = staticRecipeForSchema || remoteRecipe
  const recipe = useMemo(() => rawRecipe ? normalizeRecipeForDetail(rawRecipe) : null, [rawRecipe])
  const isSupabaseRecipe = Boolean(!staticRecipe && id && isSupabaseConfigured)
  const canFavoriteRecipe = Boolean(isSupabaseRecipe && id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))

  useEffect(() => {
    let wakeLock: any = null
    const requestWakeLock = async () => {
      if (isCookingMode && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen')
        } catch (error) {
          console.warn('Wake lock unavailable:', error)
        }
      } else if (wakeLock) {
        wakeLock.release()
        wakeLock = null
      }
    }

    requestWakeLock()
    return () => {
      if (wakeLock) wakeLock.release()
    }
  }, [isCookingMode])

  useEffect(() => {
    setCurrentStep(0)
    setCheckedIngredients([])
  }, [id])

  useEffect(() => {
    let active = true

    const loadRemoteRecipe = async () => {
      if (!isSupabaseRecipe || !id) return
      setLoadingRemoteRecipe(true)
      try {
        const data = await getSupabaseRecipe(id)
        if (active) setRemoteRecipe(data)
      } catch (error) {
        console.warn('Recipe detail Supabase fallback:', error)
      } finally {
        if (active) setLoadingRemoteRecipe(false)
      }
    }

    loadRemoteRecipe()
    return () => {
      active = false
    }
  }, [id, isSupabaseRecipe])

  useEffect(() => {
    let active = true
    const loadFavorite = async () => {
      if (!canFavoriteRecipe || !id) {
        setIsFavorite(false)
        return
      }

      try {
        const keys = await listFavoriteKeys()
        if (active) setIsFavorite(keys.some((item: any) => item.item_type === 'recipe' && item.item_id === id))
      } catch (error) {
        console.warn('Favorite lookup failed:', error)
      }
    }

    loadFavorite()
    return () => {
      active = false
    }
  }, [canFavoriteRecipe, id])

  useEffect(() => {
    if (!isSupabaseRecipe || !id) return

    let active = true
    const loadComments = async () => {
      try {
        const rows = await listRecipeComments(id)
        if (active) setComments(rows)
      } catch (error) {
        console.warn('Comment sync failed:', error)
      }
    }

    loadComments()
    const unsubscribe = subscribeToCookEduRealtime(loadComments)
    return () => {
      active = false
      unsubscribe()
    }
  }, [id, isSupabaseRecipe])

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !commentText.trim()) return

    setIsSendingComment(true)
    setCommentError('')
    try {
      const row = await createRecipeComment({
        recipeId: id,
        content: commentText.trim(),
        photoFile: commentPhoto,
      })
      setComments((prev) => [...prev, row])
      setCommentText('')
      setCommentPhoto(null)
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Gagal mengirim komentar')
    } finally {
      setIsSendingComment(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!canFavoriteRecipe || !id || favoriteBusy) return
    setFavoriteBusy(true)
    try {
      const next = await toggleFavoriteItem(id, 'recipe')
      setIsFavorite(next)
    } catch (error) {
      console.warn('Favorite toggle failed:', error)
    } finally {
      setFavoriteBusy(false)
    }
  }

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  const handleStartCooking = () => {
    if (!recipe) return
    const items = recipe.ingredients.length
      ? recipe.ingredients.map(formatIngredientLine)
      : ['Bahan utama', 'Bumbu dasar', 'Pelengkap']
    addGroup(`Belanja ${recipe.title}`, items)
    navigate('/daftar-belanja')
  }

  if (loadingRemoteRecipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-6 text-center">
        <ChefHat className="mb-4 h-16 w-16 animate-pulse text-cyan-200" />
        <h2 className="mb-2 text-2xl font-black text-slate-800">Memuat Resep</h2>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sky-50 p-6 text-center">
        <ChefHat className="mb-4 h-16 w-16 text-cyan-200" />
        <h2 className="mb-2 text-2xl font-black text-slate-800">Recipe Not Found</h2>
        <Link to="/recipes" className="rounded-2xl bg-cyan-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-600/20">
          Back to Kitchen
        </Link>
      </div>
    )
  }

  const activeStepIndex = Math.min(currentStep, recipe.steps.length - 1)
  const activeStep = recipe.steps[activeStepIndex]
  const metricItems = [
    { icon: Clock, label: 'Waktu', value: `${recipe.cooking_time}m`, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { icon: Flame, label: 'Kalori', value: recipe.calories, color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Award, label: 'Level', value: recipe.difficulty, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Star, label: 'Rating', value: recipe.rating, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ]
  const nutritionItems = [
    { label: 'Kalori', value: recipe.calories, icon: Flame },
    { label: 'Protein', value: textValue(recipe.nutritional_info.protein, '0'), icon: Award },
    { label: 'Karbo', value: textValue(recipe.nutritional_info.carbs ?? recipe.nutritional_info.carbohydrates, '0'), icon: UtensilsCrossed },
    { label: 'Lemak', value: textValue(recipe.nutritional_info.fat, '0'), icon: Sparkles },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent pb-[10rem] font-sans text-slate-800 dark:text-slate-100 lg:pb-0">
      <AnimatePresence>
        {isCookingMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl md:p-8">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black uppercase tracking-widest text-white">{recipe.title}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-cyan-400">
                    Langkah {activeStepIndex + 1} dari {recipe.steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCookingMode(false)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-rose-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8 text-center">
              <motion.div
                key={activeStepIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-3xl"
              >
                <div className="mb-10 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-8 py-3 text-6xl font-black italic text-cyan-400">
                  {activeStepIndex + 1}
                </div>
                <h2 className="px-4 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                  {activeStep.instruction}
                </h2>
              </motion.div>
            </div>

            <div className="border-t border-white/10 bg-slate-900/80 p-8 backdrop-blur-3xl md:p-12">
              <div className="mx-auto flex max-w-4xl items-center gap-6">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-20 md:h-20 md:w-20"
                >
                  <ChevronLeft className="h-9 w-9" />
                </button>

                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeStepIndex + 1) / recipe.steps.length) * 100}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(42,77,136,0.32)]"
                  />
                </div>

                <button
                  onClick={() => {
                    if (activeStepIndex === recipe.steps.length - 1) {
                      setIsCookingMode(false)
                      setCurrentStep(0)
                    } else {
                      setCurrentStep((prev) => Math.min(recipe.steps.length - 1, prev + 1))
                    }
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500 text-white shadow-2xl shadow-cyan-500/20 transition hover:scale-105 active:scale-95 md:h-20 md:w-20"
                >
                  {activeStepIndex === recipe.steps.length - 1 ? <Check className="h-9 w-9" /> : <ChevronRight className="h-9 w-9" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 lg:hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${bgPattern})`, backgroundSize: 'cover' }} />
      </div>

      <div className="relative z-10 h-[34svh] min-h-[260px] max-h-[360px] w-full overflow-hidden rounded-none sm:h-[40vh] lg:h-[45vh] lg:max-h-none lg:rounded-[36px]">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          src={recipe.image_url}
          onError={(event) => { event.currentTarget.src = withImageFallback(recipe.title) }}
          alt={recipe.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

        <div className="absolute left-4 right-4 top-6 flex items-center justify-between sm:left-6 sm:right-6 sm:top-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-white shadow-2xl backdrop-blur-2xl sm:h-12 sm:w-12"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              disabled={!canFavoriteRecipe || favoriteBusy}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-white shadow-2xl backdrop-blur-2xl disabled:opacity-60 sm:h-12 sm:w-12"
              title="Simpan resep favorit"
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/20 text-white shadow-2xl backdrop-blur-2xl sm:h-12 sm:w-12"
            >
              <Share2 className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        <div className="absolute bottom-7 left-5 right-5 sm:bottom-12 sm:left-8 sm:right-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-cyan-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-xl shadow-cyan-500/30 sm:mb-4 sm:px-4 sm:text-[10px]"
          >
            <Sparkles className="h-3 w-3" />
            {recipe.category}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="line-clamp-2 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl"
          >
            {recipe.title}
          </motion.h1>
        </div>
      </div>

      <div className="relative z-20 -mt-6 mx-auto max-w-2xl px-3 pb-[11rem] sm:-mt-10 sm:px-4 lg:max-w-6xl lg:pb-32">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-2xl backdrop-blur-3xl sm:rounded-[40px] sm:p-6 md:p-10 lg:bg-white"
        >
          <div className="mb-8 grid grid-cols-2 gap-3 border-b border-cyan-50 pb-6 sm:mb-10 sm:grid-cols-4 sm:gap-4 sm:pb-8">
            {metricItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white ${item.bg} ${item.color} shadow-sm sm:h-12 sm:w-12`}>
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                <span className="max-w-full break-words text-xs font-black text-slate-800 sm:text-sm">{item.value}</span>
              </div>
            ))}
          </div>

          <p className="mb-8 px-1 text-center text-sm font-medium italic leading-relaxed text-slate-600 sm:px-4 sm:text-base">
            "{recipe.description}"
          </p>

          {recipe.motherNote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative mb-12 overflow-hidden rounded-[2rem] border-2 border-amber-100/50 bg-amber-50/50 p-6 backdrop-blur-sm"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Heart className="h-12 w-12 text-amber-600" />
              </div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-amber-800">Catatan Ibu</h4>
                  <p className="text-sm font-medium italic leading-relaxed text-amber-900/80">
                    {recipe.motherNote.replace('{username}', username)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <section className="mb-14">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-rose-500 p-3 shadow-lg shadow-rose-500/20">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">Informasi Gizi</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {nutritionItems.map((item) => (
                <div key={item.label} className="flex flex-col items-center justify-center rounded-3xl border border-white bg-white/50 p-4 text-center">
                  <item.icon className="mb-2 h-4 w-4 text-cyan-600" />
                  <span className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                  <span className="text-lg font-black text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-16 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:space-y-0">
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-500 p-3 shadow-lg shadow-cyan-500/20">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Daftar Bahan</h2>
              </div>

              {recipe.ingredients.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {recipe.ingredients.map((ingredient, index) => {
                    const checked = checkedIngredients.includes(ingredient.name)
                    return (
                      <motion.button
                        type="button"
                        key={`${ingredient.name}-${index}`}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleIngredient(ingredient.name)}
                        className={`flex min-h-16 items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                          checked
                            ? 'border-cyan-100 bg-cyan-50 opacity-70'
                            : 'border-white bg-white/60 shadow-sm hover:border-cyan-100 hover:bg-white'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-4">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                            checked ? 'border-cyan-500 bg-cyan-500' : 'border-slate-200 bg-white'
                          }`}>
                            {checked && <Check className="h-3.5 w-3.5 text-white" />}
                          </span>
                          <span className={`break-words text-sm font-bold text-slate-800 ${checked ? 'text-slate-400 line-through' : ''}`}>
                            {ingredient.name}
                          </span>
                        </span>
                        {ingredient.quantity && (
                          <span className="ml-3 shrink-0 rounded-full border border-cyan-50 bg-white px-3 py-1 text-xs font-black text-cyan-600">
                            {ingredient.quantity}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white bg-white/60 p-5 text-sm font-bold text-slate-500">
                  Bahan detail belum tersedia untuk resep ini.
                </div>
              )}
            </section>

            <section>
              <div className="mb-10 flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-500 p-3 shadow-lg shadow-cyan-500/20">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Cara Pembuatan</h2>
              </div>

              <div className="space-y-10 px-2">
                {recipe.steps.map((step, index) => (
                  <motion.div
                    key={`${step.instruction}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="group relative flex items-start gap-6"
                  >
                    {index !== recipe.steps.length - 1 && (
                      <div className="absolute left-6 top-12 h-[calc(100%+40px)] w-[2px] -translate-x-1/2 bg-cyan-100/50" />
                    )}

                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-cyan-500 bg-white text-lg font-black text-cyan-600 shadow-xl">
                      {index + 1}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="rounded-[2rem] border border-white bg-white/50 p-6 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:shadow-xl">
                        <p className="text-base font-medium leading-relaxed text-slate-700">{step.instruction}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <span className="flex items-center gap-1.5 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-[8px] font-black uppercase text-cyan-600">
                            <Timer className="h-3 w-3" />
                            Titik Fokus
                          </span>
                          {Boolean(step.duration) && (
                            <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase text-slate-500">
                              {step.duration}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {isSupabaseRecipe && (
            <section className="mt-16 border-t border-cyan-50 pt-12">
              <div className="mb-8 flex items-center gap-4">
                <div className="rounded-2xl bg-cyan-500 p-3 shadow-lg shadow-cyan-500/20">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">Komentar Komunitas</h2>
                  <p className="mt-1 text-xs font-bold text-slate-400">Realtime dengan dukungan foto lampiran</p>
                </div>
              </div>

              <div className="mb-8 space-y-4">
                {comments.length === 0 ? (
                  <div className="rounded-3xl border border-white bg-white/50 p-6 text-center text-sm font-bold text-slate-500">
                    Belum ada komentar. Jadilah yang pertama memberi feedback.
                  </div>
                ) : comments.map((comment) => {
                  const commentAuthor = comment.profiles?.username || username
                  return (
                    <div key={comment.id} className="rounded-3xl border border-white bg-white/60 p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <img
                          src={resolveMediaUrl(comment.profiles?.avatar_url) || avatarFallbackUrl(commentAuthor)}
                          alt={commentAuthor}
                          className="h-10 w-10 rounded-2xl bg-cyan-50 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="truncate text-sm font-black text-slate-800">{commentAuthor}</h4>
                            <span className="shrink-0 text-[10px] font-bold text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{comment.content}</p>
                          {comment.comment_photo_url && (
                            <img
                              src={resolveMediaUrl(comment.comment_photo_url)}
                              alt=""
                              className="mt-4 max-h-64 w-full rounded-2xl border border-cyan-50 object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-4 rounded-[2rem] border border-white bg-white/70 p-5">
                {commentError && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
                    {commentError}
                  </div>
                )}
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Tulis pengalaman atau foto hasil masakanmu..."
                  className="min-h-24 w-full resize-none rounded-2xl border border-cyan-50 bg-white/70 p-4 text-sm font-bold text-slate-700 outline-none focus:border-cyan-300"
                />
                <div className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 cursor-pointer items-center gap-2 text-xs font-black text-cyan-600">
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{commentPhoto ? commentPhoto.name : 'Tambah foto'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setCommentPhoto(event.target.files?.[0] || null)} />
                  </label>
                  <button
                    type="submit"
                    disabled={isSendingComment || !commentText.trim()}
                    className="flex shrink-0 items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-xs font-black text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Kirim
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="mt-20 flex flex-col gap-4 lg:flex-row">
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCooking}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[2rem] bg-cyan-600 py-6 text-lg font-black text-white shadow-2xl shadow-cyan-600/30"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              <ShoppingCart className="h-7 w-7" />
              MULAI BELANJA & MASAK
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCookingMode(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] border-2 border-cyan-100 bg-white py-4 text-sm font-black text-cyan-600 shadow-xl"
            >
              <ChefHat className="h-5 w-5" />
              MODE MEMASAK SAJA
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
