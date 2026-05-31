import { isSupabaseConfigured, supabase, uploadPublicMedia } from './supabaseClient'
import { resolveMediaUrl } from './media'

export type SupabaseRecipeRow = {
  id: string
  user_id: string | null
  title: string
  category: string
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

export async function listSupabaseRecipes() {
  const client = assertSupabase()
  const { data, error } = await client
    .from('recipes')
    .select('id, user_id, title, category, description, image_url, difficulty, ingredients, steps, cooking_time, prep_time, servings, nutritional_info, min_temp_celsius, max_temp_celsius, video_url, is_official, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((row: SupabaseRecipeRow) => ({
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
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
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
    .select('id, user_id, title, category, description, image_url, difficulty, ingredients, steps, cooking_time, prep_time, servings, nutritional_info, min_temp_celsius, max_temp_celsius, video_url, is_official, is_published, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as SupabaseRecipeRow
  const steps = Array.isArray(row.steps)
    ? row.steps.map((step: any) => typeof step === 'string' ? step : step?.instruction || step?.text).filter(Boolean)
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
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
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
