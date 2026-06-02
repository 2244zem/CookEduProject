import { isSupabaseConfigured, supabase, uploadPublicMedia } from './supabaseClient'
import { resolveMediaUrl } from './media'

export type SupabaseRecipeRow = {
  id: string
  user_id: string | null
  title: string
  category: string
  category_id?: string | null
  description: string | null
  image_url: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null
  ingredients: unknown
  steps: unknown
  cooking_time: number | null
  prep_time: number | null
  servings: number | null
  nutritional_info: unknown
  min_temp_celsius: number | null
  max_temp_celsius: number | null
  video_url: string | null
  is_official: boolean
  is_published: boolean | null
  created_at: string
  updated_at?: string | null
  categories?: SupabaseCategoryRow | null
}

export type SupabaseCategoryRow = {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  created_at?: string | null
}

export type SupabaseCommunityPostRow = {
  id: string
  user_id: string
  title: string
  content: string
  media_url: string | null
  post_type: 'sharing' | 'tips_trick'
  upvotes: number
  created_at: string
  profiles?: {
    username?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
}

export type SupabaseCommentRow = {
  id: string
  recipe_id: string
  user_id: string
  content: string
  comment_photo_url: string | null
  created_at: string
  profiles?: {
    username?: string | null
    avatar_url?: string | null
  } | null
}

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi')
  }

  return supabase
}

function isMissingColumnError(error: unknown) {
  const err = error as { code?: string; message?: string } | null
  return err?.code === 'PGRST204' || /column .* does not exist|Could not find .* column/i.test(err?.message || '')
}

function getDifficultyLabel(difficulty?: string | null) {
  if (difficulty === 'advanced') return 'Advanced'
  if (difficulty === 'intermediate') return 'Intermediate'
  return 'Beginner'
}

function formatIngredientQuantity(ingredient: any) {
  const rawQuantity = ingredient?.quantity ?? ingredient?.amount ?? ingredient?.qty ?? ''
  const unit = ingredient?.unit ?? ingredient?.unit_name ?? ''
  return [rawQuantity, unit].filter(Boolean).join(' ').trim()
}

function normalizeRecipeIngredient(ingredient: any, index: number) {
  if (typeof ingredient === 'string') {
    return {
      name: ingredient,
      item: ingredient,
      quantity: '',
      amount: '',
      unit: '',
    }
  }

  const name = String(
    ingredient?.name
    || ingredient?.item
    || ingredient?.ingredient
    || ingredient?.title
    || `Bahan ${index + 1}`
  ).trim()
  const quantity = formatIngredientQuantity(ingredient)

  return {
    ...ingredient,
    name,
    item: ingredient?.item || name,
    quantity,
    amount: ingredient?.amount ?? ingredient?.quantity ?? '',
    unit: ingredient?.unit ?? '',
  }
}

function normalizeRecipeIngredients(ingredients: unknown) {
  if (!Array.isArray(ingredients)) return []
  return ingredients
    .map((ingredient, index) => normalizeRecipeIngredient(ingredient, index))
    .filter((ingredient) => ingredient.name.trim().length > 0)
}

function normalizeRecipeInstruction(step: any) {
  if (typeof step === 'string') return step
  return step?.instruction || step?.text || step?.step || step?.description || ''
}

function normalizeAdminRecipe(row: Partial<SupabaseRecipeRow>) {
  const categoryName = row.categories?.name || row.category || 'Community'
  const imageUrl = resolveMediaUrl(row.image_url || row.video_url) || ''
  const cookingTime = row.cooking_time || 25
  const prepTime = row.prep_time || 0

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title || '',
    description: row.description || '',
    category: row.categories || { id: row.category_id || '', name: categoryName },
    category_id: row.category_id || row.categories?.id || '',
    image_url: imageUrl,
    imageUrl,
    video_url: row.video_url || null,
    difficulty: row.difficulty || 'beginner',
    difficulty_label: getDifficultyLabel(row.difficulty),
    cooking_time: cookingTime,
    prep_time: prepTime,
    total_time: cookingTime + prepTime,
    servings: row.servings || 1,
    ingredients: normalizeRecipeIngredients(row.ingredients),
    steps: Array.isArray(row.steps) ? row.steps : [],
    nutritional_info: row.nutritional_info || null,
    min_temp_celsius: row.min_temp_celsius,
    max_temp_celsius: row.max_temp_celsius,
    is_official: Boolean(row.is_official),
    is_published: row.is_published !== false,
    deleted_at: row.is_published === false ? row.updated_at || row.created_at || new Date().toISOString() : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    isSupabase: true,
  }
}

export async function listSupabaseCategories() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function listSupabaseAdminRecipes() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('recipes')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  if (error && isMissingColumnError(error)) {
    const { data: legacyData, error: legacyError } = await client
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (legacyError) throw legacyError
    return {
      data: {
        data: (legacyData || []).map((row: Partial<SupabaseRecipeRow>) => normalizeAdminRecipe(row)),
      },
    }
  }

  if (error) throw error

  return {
    data: {
      data: (data || []).map((row: Partial<SupabaseRecipeRow>) => normalizeAdminRecipe(row)),
    },
  }
}

async function resolveCategoryName(categoryId?: string | null, fallback?: string) {
  if (!categoryId) return fallback || 'Community'

  const client = assertSupabase()
  const { data, error } = await client
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .maybeSingle()

  if (error) {
    console.warn('CookEdu category lookup failed:', error.message)
    return fallback || 'Community'
  }

  return data?.name || fallback || 'Community'
}

export async function saveSupabaseAdminRecipe(input: {
  id?: string | null
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  cooking_time: number
  prep_time: number
  servings: number
  category_id?: string | null
  category?: string | null
  ingredients: unknown[]
  steps: unknown[]
  image?: File | null
  existingImageUrl?: string | null
  videoUrl?: string | null
  is_published?: boolean
  isOfficial?: boolean
}) {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Login diperlukan untuk menyimpan resep')

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle()
  const canCreateOfficial = profile?.role === 'admin'
  const isOfficial = input.isOfficial ?? canCreateOfficial

  let imageUrl = input.existingImageUrl || null
  if (input.image) {
    imageUrl = await uploadPublicMedia('recipe-media', input.image, authData.user.id)
  }

  const categoryName = await resolveCategoryName(input.category_id, input.category || null)
  const payload = {
    user_id: authData.user.id,
    title: input.title,
    category: categoryName,
    category_id: input.category_id || null,
    description: input.description || null,
    image_url: imageUrl,
    difficulty: input.difficulty || 'beginner',
    ingredients: input.ingredients || [],
    steps: input.steps || [],
    cooking_time: Number(input.cooking_time) || 25,
    prep_time: Number(input.prep_time) || 0,
    servings: Number(input.servings) || 1,
    nutritional_info: null,
    video_url: input.videoUrl?.trim() || null,
    is_official: isOfficial,
    is_published: input.is_published ?? true,
  }

  const query = input.id
    ? client.from('recipes').update(payload).eq('id', input.id)
    : client.from('recipes').insert(payload)

  const { data, error } = await query.select('*, categories(*)').single()

  if (error && isMissingColumnError(error)) {
    const legacyPayload = {
      user_id: authData.user.id,
      title: input.title,
      category: categoryName,
      description: input.description || null,
      steps: input.steps || [],
      video_url: input.videoUrl?.trim() || imageUrl,
      is_official: isOfficial,
    }

    const legacyQuery = input.id
      ? client.from('recipes').update(legacyPayload).eq('id', input.id)
      : client.from('recipes').insert(legacyPayload)

    const { data: legacyData, error: legacyError } = await legacyQuery.select('*').single()
    if (legacyError) throw legacyError
    return normalizeAdminRecipe(legacyData as SupabaseRecipeRow)
  }

  if (error) throw error
  return normalizeAdminRecipe(data as SupabaseRecipeRow)
}

export async function setSupabaseRecipePublished(id: string, isPublished: boolean) {
  const client = assertSupabase()
  const { error } = await client
    .from('recipes')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (error && isMissingColumnError(error) && !isPublished) {
    const { error: deleteError } = await client.from('recipes').delete().eq('id', id)
    if (deleteError) throw deleteError
    return
  }

  if (error) throw error
}

export async function listSupabaseRecipes() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).filter((row: Partial<SupabaseRecipeRow>) => row.is_published !== false).map((row: Partial<SupabaseRecipeRow>) => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    imageUrl: resolveMediaUrl(row.image_url || row.video_url) || '',
    image_url: resolveMediaUrl(row.image_url || row.video_url) || '',
    cooking_time: row.cooking_time || 25,
    prep_time: row.prep_time || 0,
    prepTime: String(row.cooking_time || 25),
    difficulty: row.difficulty || (row.is_official ? 'intermediate' : 'beginner'),
    ingredients: normalizeRecipeIngredients(row.ingredients),
    steps: Array.isArray(row.steps) ? row.steps : [],
    servings: row.servings || 1,
    nutritional_info: row.nutritional_info || null,
    min_temp_celsius: row.min_temp_celsius,
    max_temp_celsius: row.max_temp_celsius,
    created_at: row.created_at,
    isSupabase: true,
  }))
}

export async function getSupabaseRecipe(id: string) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as Partial<SupabaseRecipeRow>
  const steps = Array.isArray(row.steps)
    ? row.steps.map(normalizeRecipeInstruction).filter(Boolean)
    : []

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: resolveMediaUrl(row.image_url || row.video_url),
    description: row.description || 'Resep komunitas CookEdu.',
    prepTime: `${row.cooking_time || 25}m`,
    calories: (row.nutritional_info as any)?.calories || '-',
    difficulty: row.difficulty || (row.is_official ? 'Official' : 'Community'),
    rating: '5.0',
    ingredients: normalizeRecipeIngredients(row.ingredients),
    instructions: steps.length ? steps : ['Siapkan bahan.', 'Masak sesuai instruksi resep.', 'Sajikan selagi hangat.'],
  }
}

export async function createSupabaseRecipe(input: {
  title: string
  category: string
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ingredients?: unknown[]
  steps?: unknown[]
  cookingTime?: number
  prepTime?: number
  servings?: number
  minTempCelsius?: number
  maxTempCelsius?: number
  mediaFile?: File | null
  imageUrl?: string | null
}) {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Login diperlukan untuk membuat resep')

  let mediaUrl: string | null = null
  if (input.mediaFile) {
    mediaUrl = await uploadPublicMedia('recipe-media', input.mediaFile, authData.user.id)
  }

  const { data, error } = await client
    .from('recipes')
    .insert({
      user_id: authData.user.id,
      title: input.title,
      category: input.category,
      description: input.description || null,
      image_url: mediaUrl || input.imageUrl || null,
      difficulty: input.difficulty || 'beginner',
      ingredients: input.ingredients || [],
      steps: input.steps || [],
      cooking_time: input.cookingTime || 25,
      prep_time: input.prepTime || 0,
      servings: input.servings || 1,
      nutritional_info: null,
      min_temp_celsius: input.minTempCelsius ?? 18,
      max_temp_celsius: input.maxTempCelsius ?? 32,
      video_url: null,
      is_official: false,
      is_published: true,
    })
    .select()
    .single()

  if (error && isMissingColumnError(error)) {
    const { data: legacyData, error: legacyError } = await client
      .from('recipes')
      .insert({
        user_id: authData.user.id,
        title: input.title,
        category: input.category,
        description: input.description || null,
        steps: input.steps || [],
        min_temp_celsius: input.minTempCelsius ?? 18,
        max_temp_celsius: input.maxTempCelsius ?? 32,
        video_url: mediaUrl || input.imageUrl || null,
        is_official: false,
      })
      .select()
      .single()

    if (legacyError) throw legacyError
    return legacyData as SupabaseRecipeRow
  }

  if (error) throw error
  return data as SupabaseRecipeRow
}

export async function deleteSupabaseRecipe(id: string) {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Login diperlukan untuk menghapus resep')

  const { error } = await client
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function listCommunityPosts() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('community_sharing')
    .select('id, user_id, title, content, media_url, post_type, upvotes, created_at, profiles(username, avatar_url, role)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as SupabaseCommunityPostRow[]
}

export async function createCommunityPost(input: {
  title: string
  content: string
  postType?: 'sharing' | 'tips_trick'
  mediaFile?: File | null
}) {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Login diperlukan untuk membuat postingan')

  let mediaUrl: string | null = null
  if (input.mediaFile) {
    mediaUrl = await uploadPublicMedia('recipe-media', input.mediaFile, authData.user.id)
  }

  const { data, error } = await client
    .from('community_sharing')
    .insert({
      user_id: authData.user.id,
      title: input.title,
      content: input.content,
      media_url: mediaUrl,
      post_type: input.postType || 'sharing',
    })
    .select()
    .single()

  if (error) throw error
  return data as SupabaseCommunityPostRow
}

export async function listRecipeComments(recipeId: string) {
  const client = assertSupabase()
  const { data, error } = await client
    .from('comments')
    .select('id, recipe_id, user_id, content, comment_photo_url, created_at, profiles(username, avatar_url)')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as SupabaseCommentRow[]
}

export async function createRecipeComment(input: {
  recipeId: string
  content: string
  photoFile?: File | null
}) {
  const client = assertSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Login diperlukan untuk berkomentar')

  let photoUrl: string | null = null
  if (input.photoFile) {
    photoUrl = await uploadPublicMedia('comment-attachments', input.photoFile, authData.user.id)
  }

  const { data, error } = await client
    .from('comments')
    .insert({
      recipe_id: input.recipeId,
      user_id: authData.user.id,
      content: input.content,
      comment_photo_url: photoUrl,
    })
    .select('id, recipe_id, user_id, content, comment_photo_url, created_at, profiles(username, avatar_url)')
    .single()

  if (error) throw error
  return data as SupabaseCommentRow
}

export function subscribeToCookEduRealtime(callback: () => void) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  const channel = supabase
    .channel('cookedu-live-data')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_sharing' }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
