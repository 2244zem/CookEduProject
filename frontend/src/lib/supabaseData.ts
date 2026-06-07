import { ensureProfileForUser, isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl, uploadPublicMedia } from './supabaseClient'
import { avatarFallbackUrl, resolveMediaUrl } from './media'

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

export type SocialCategory =
  | 'Cooking Technique'
  | 'Plating Art'
  | 'Baking Science'
  | 'Kitchen Hacks'
  | 'Recipe Story'
  | 'Ingredient Guide'

export type SupabaseSocialPostRow = {
  id: string
  user_id: string
  title: string
  category: SocialCategory | string
  description: string
  media_path: string
  created_at: string
  profiles?: {
    username?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
}

export type SupabaseSocialCommentRow = {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  attachment_path: string | null
  created_at: string
  profiles?: {
    username?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
}

export type SocialCommentView = SupabaseSocialCommentRow & {
  author_name: string
  author_avatar_url: string
  attachment_url: string
}

export type SocialPostView = SupabaseSocialPostRow & {
  author_name: string
  author_avatar_url: string
  author_role: string
  media_url: string
  media_type: 'image' | 'video'
  likes_count: number
  comments_count: number
  liked_by_user: boolean
  favorited_by_user: boolean
  comments: SocialCommentView[]
}

export type FavoriteItemView = {
  favorite_id: string
  item_id: string
  item_type: 'recipe' | 'post'
  title: string
  description: string
  category: string
  image_url: string
  href: string
  created_at: string
}

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi')
  }

  return supabase
}

async function requireSupabaseUser() {
  const client = assertSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Login diperlukan untuk melanjutkan')

  await ensureProfileForUser(data.user)
  return data.user
}

function getProfileName(profile?: { username?: string | null } | null, fallback?: string | null) {
  return profile?.username || fallback || 'Koki CookEdu'
}

function getProfileAvatar(profile?: { username?: string | null; avatar_url?: string | null } | null, fallback?: string | null) {
  return resolveMediaUrl(profile?.avatar_url) || avatarFallbackUrl(getProfileName(profile, fallback))
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

function parseRecipeArray(value: unknown) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
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
  return parseRecipeArray(ingredients)
    .map((ingredient, index) => normalizeRecipeIngredient(ingredient, index))
    .filter((ingredient) => ingredient.name.trim().length > 0)
}

function normalizeRecipeInstruction(step: any) {
  if (typeof step === 'string') return step
  return step?.instruction || step?.text || step?.step || step?.description || ''
}

function normalizeRecipeStep(step: any) {
  if (typeof step === 'string') {
    return {
      instruction: step,
      duration: 0,
      tip: '',
    }
  }

  const instruction = normalizeRecipeInstruction(step)
  return {
    ...step,
    instruction,
    duration: Number(step?.duration) || 0,
    tip: step?.tip || '',
  }
}

function normalizeRecipeSteps(steps: unknown) {
  return parseRecipeArray(steps)
    .map(normalizeRecipeStep)
    .filter((step) => step.instruction.trim().length > 0)
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
    steps: normalizeRecipeSteps(row.steps),
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
  const user = await requireSupabaseUser()

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const canCreateOfficial = profile?.role === 'admin'
  const isOfficial = input.isOfficial ?? canCreateOfficial

  let imageUrl = input.existingImageUrl || null
  if (input.image) {
    imageUrl = await uploadPublicMedia('recipe-media', input.image, user.id)
  }

  const categoryName = await resolveCategoryName(input.category_id, input.category || null)
  const payload = {
    user_id: user.id,
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
      user_id: user.id,
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
    steps: normalizeRecipeSteps(row.steps),
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

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    image_url: resolveMediaUrl(row.image_url) || '',
    description: row.description || 'Resep komunitas CookEdu.',
    cooking_time: row.cooking_time || 25,
    prep_time: row.prep_time || 0,
    servings: row.servings || 1,
    difficulty: row.difficulty || 'beginner',
    nutritional_info: row.nutritional_info || null,
    is_published: row.is_published !== false,
    ingredients: normalizeRecipeIngredients(row.ingredients),
    steps: normalizeRecipeSteps(row.steps),
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
  const user = await requireSupabaseUser()

  let mediaUrl: string | null = null
  if (input.mediaFile) {
    mediaUrl = await uploadPublicMedia('recipe-media', input.mediaFile, user.id)
  }

  const { data, error } = await client
    .from('recipes')
    .insert({
      user_id: user.id,
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
        user_id: user.id,
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

const SOCIAL_MEDIA_BUCKET = 'social-media-assets'
const SOCIAL_FILE_LIMIT = 100 * 1024 * 1024

function getSocialMediaType(pathOrMime: string): 'image' | 'video' {
  const value = pathOrMime.toLowerCase()
  return value.includes('video/') || /\.(mp4|mov|webm|m4v|avi)$/i.test(value) ? 'video' : 'image'
}

function safeStorageFileName(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`
}

function getSocialMediaPublicUrl(path?: string | null) {
  if (!path || !supabase) return ''
  return supabase.storage.from(SOCIAL_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

async function uploadWithProgress(path: string, file: File, accessToken: string, onProgress?: (progress: number) => void) {
  if (typeof XMLHttpRequest === 'undefined') {
    const client = assertSupabase()
    const { error } = await client.storage.from(SOCIAL_MEDIA_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (error) throw error
    onProgress?.(100)
    return
  }

  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const endpoint = `${supabaseUrl}/storage/v1/object/${SOCIAL_MEDIA_BUCKET}/${encodedPath}`

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', endpoint)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.setRequestHeader('apikey', supabaseAnonKey)
    request.setRequestHeader('x-upsert', 'false')
    if (file.type) request.setRequestHeader('content-type', file.type)

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.max(8, Math.min(92, Math.round((event.loaded / event.total) * 92))))
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }

      try {
        const payload = JSON.parse(request.responseText)
        reject(new Error(payload.message || payload.error || `Upload gagal (${request.status})`))
      } catch {
        reject(new Error(`Upload gagal (${request.status})`))
      }
    }
    request.onerror = () => reject(new Error('Koneksi upload media terputus'))
    request.send(file)
  })
}

export async function uploadSocialMediaAsset(file: File, scope: 'posts' | 'comments', onProgress?: (progress: number) => void) {
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('File harus berupa foto atau video.')
  }

  if (file.size > SOCIAL_FILE_LIMIT) {
    throw new Error('Ukuran file maksimal 100MB.')
  }

  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const { data: sessionData } = await client.auth.getSession()
  const accessToken = sessionData.session?.access_token
  if (!accessToken) throw new Error('Sesi Supabase tidak ditemukan. Silakan login ulang.')

  const path = `${user.id}/${scope}/${safeStorageFileName(file)}`
  onProgress?.(4)
  await uploadWithProgress(path, file, accessToken, onProgress)

  return {
    path,
    publicUrl: getSocialMediaPublicUrl(path),
    mediaType: getSocialMediaType(file.type || path),
  }
}

export async function createSocialPost(input: {
  title: string
  category: SocialCategory
  description: string
  mediaFile: File
  onProgress?: (progress: number) => void
}) {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const upload = await uploadSocialMediaAsset(input.mediaFile, 'posts', input.onProgress)

  const { data, error } = await client
    .from('social_posts')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      media_path: upload.path,
    })
    .select('id, user_id, title, category, description, media_path, created_at, profiles(username, avatar_url, role)')
    .single()

  if (error) throw error
  return normalizeSocialPost(data as SupabaseSocialPostRow, user.id, [], [], [])
}

function normalizeSocialComment(row: SupabaseSocialCommentRow): SocialCommentView {
  return {
    ...row,
    author_name: getProfileName(row.profiles),
    author_avatar_url: getProfileAvatar(row.profiles),
    attachment_url: getSocialMediaPublicUrl(row.attachment_path),
  }
}

function normalizeSocialPost(
  post: SupabaseSocialPostRow,
  currentUserId: string | null,
  likes: Array<{ post_id: string; user_id: string }>,
  favoriteKeys: Array<{ item_id: string; item_type: string }>,
  comments: SupabaseSocialCommentRow[]
): SocialPostView {
  const postLikes = likes.filter((like) => like.post_id === post.id)
  const postComments = comments.filter((comment) => comment.post_id === post.id).map(normalizeSocialComment)
  const mediaUrl = getSocialMediaPublicUrl(post.media_path)

  return {
    ...post,
    author_name: getProfileName(post.profiles),
    author_avatar_url: getProfileAvatar(post.profiles),
    author_role: post.profiles?.role === 'admin' ? 'Culinary Admin' : 'Home Cook',
    media_url: mediaUrl,
    media_type: getSocialMediaType(post.media_path),
    likes_count: postLikes.length,
    comments_count: postComments.length,
    liked_by_user: Boolean(currentUserId && postLikes.some((like) => like.user_id === currentUserId)),
    favorited_by_user: Boolean(currentUserId && favoriteKeys.some((favorite) => favorite.item_type === 'post' && favorite.item_id === post.id)),
    comments: postComments,
  }
}

export async function listSocialPosts() {
  const client = assertSupabase()
  const { data: authData } = await client.auth.getUser()
  const currentUserId = authData.user?.id || null

  const { data: posts, error } = await client
    .from('social_posts')
    .select('id, user_id, title, category, description, media_path, created_at, profiles(username, avatar_url, role)')
    .order('created_at', { ascending: false })

  if (error) throw error
  const rows = (posts || []) as SupabaseSocialPostRow[]
  const postIds = rows.map((post) => post.id)
  if (!postIds.length) return []

  const [likesResult, commentsResult, favoritesResult] = await Promise.all([
    client.from('likes').select('post_id, user_id').in('post_id', postIds),
    client
      .from('social_comments')
      .select('id, post_id, user_id, parent_id, content, attachment_path, created_at, profiles(username, avatar_url, role)')
      .in('post_id', postIds)
      .order('created_at', { ascending: true }),
    currentUserId
      ? client.from('favorites').select('item_id, item_type').eq('user_id', currentUserId).eq('item_type', 'post').in('item_id', postIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (likesResult.error) throw likesResult.error
  if (commentsResult.error) throw commentsResult.error
  if (favoritesResult.error) throw favoritesResult.error

  return rows.map((post) => normalizeSocialPost(
    post,
    currentUserId,
    likesResult.data || [],
    favoritesResult.data || [],
    (commentsResult.data || []) as SupabaseSocialCommentRow[]
  ))
}

export async function toggleSocialPostLike(postId: string) {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const { data: existing, error: lookupError } = await client
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (lookupError) throw lookupError

  if (existing?.id) {
    const { error } = await client.from('likes').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }

  const { error } = await client.from('likes').insert({ user_id: user.id, post_id: postId })
  if (error) throw error
  return true
}

export async function createSocialComment(input: {
  postId: string
  content: string
  parentId?: string | null
  attachmentFile?: File | null
  onProgress?: (progress: number) => void
}) {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  let attachmentPath: string | null = null

  if (input.attachmentFile) {
    const upload = await uploadSocialMediaAsset(input.attachmentFile, 'comments', input.onProgress)
    attachmentPath = upload.path
  }

  const { data, error } = await client
    .from('social_comments')
    .insert({
      post_id: input.postId,
      user_id: user.id,
      parent_id: input.parentId || null,
      content: input.content.trim(),
      attachment_path: attachmentPath,
    })
    .select('id, post_id, user_id, parent_id, content, attachment_path, created_at, profiles(username, avatar_url, role)')
    .single()

  if (error) throw error
  return normalizeSocialComment(data as SupabaseSocialCommentRow)
}

export async function toggleFavoriteItem(itemId: string, itemType: 'recipe' | 'post') {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const { data: existing, error: lookupError } = await client
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .maybeSingle()

  if (lookupError) throw lookupError

  if (existing?.id) {
    const { error } = await client.from('favorites').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }

  const { error } = await client.from('favorites').insert({ user_id: user.id, item_id: itemId, item_type: itemType })
  if (error) throw error
  return true
}

export async function listFavoriteKeys() {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const { data, error } = await client
    .from('favorites')
    .select('item_id, item_type')
    .eq('user_id', user.id)

  if (error) throw error
  return data || []
}

export async function listFavoriteItems() {
  const client = assertSupabase()
  const user = await requireSupabaseUser()
  const { data: favorites, error } = await client
    .from('favorites')
    .select('id, item_id, item_type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  const favoriteRows = favorites || []
  const recipeIds = favoriteRows.filter((favorite) => favorite.item_type === 'recipe').map((favorite) => favorite.item_id)
  const postIds = favoriteRows.filter((favorite) => favorite.item_type === 'post').map((favorite) => favorite.item_id)

  const [recipesResult, postsResult] = await Promise.all([
    recipeIds.length
      ? client.from('recipes').select('id, title, category, description, image_url, video_url').in('id', recipeIds)
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? client.from('social_posts').select('id, title, category, description, media_path').in('id', postIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (recipesResult.error) throw recipesResult.error
  if (postsResult.error) throw postsResult.error

  const recipeMap = new Map((recipesResult.data || []).map((recipe: any) => [recipe.id, recipe]))
  const postMap = new Map((postsResult.data || []).map((post: any) => [post.id, post]))

  return favoriteRows
    .map((favorite): FavoriteItemView | null => {
      if (favorite.item_type === 'recipe') {
        const recipe = recipeMap.get(favorite.item_id) as Partial<SupabaseRecipeRow> | undefined
        if (!recipe) return null
        return {
          favorite_id: favorite.id,
          item_id: favorite.item_id,
          item_type: 'recipe',
          title: recipe.title || 'Resep CookEdu',
          description: recipe.description || 'Resep tersimpan dari dapur CookEdu.',
          category: recipe.category || 'Recipe',
          image_url: resolveMediaUrl(recipe.image_url || recipe.video_url) || '',
          href: `/recipes/${favorite.item_id}`,
          created_at: favorite.created_at,
        }
      }

      const post = postMap.get(favorite.item_id) as SupabaseSocialPostRow | undefined
      if (!post) return null
      return {
        favorite_id: favorite.id,
        item_id: favorite.item_id,
        item_type: 'post',
        title: post.title,
        description: post.description,
        category: post.category,
        image_url: getSocialMediaPublicUrl(post.media_path),
        href: '/',
        created_at: favorite.created_at,
      }
    })
    .filter(Boolean) as FavoriteItemView[]
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
  const user = await requireSupabaseUser()

  let mediaUrl: string | null = null
  if (input.mediaFile) {
    mediaUrl = await uploadPublicMedia('recipe-media', input.mediaFile, user.id)
  }

  const { data, error } = await client
    .from('community_sharing')
    .insert({
      user_id: user.id,
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
  const user = await requireSupabaseUser()

  let photoUrl: string | null = null
  if (input.photoFile) {
    photoUrl = await uploadPublicMedia('comment-attachments', input.photoFile, user.id)
  }

  const { data, error } = await client
    .from('comments')
    .insert({
      recipe_id: input.recipeId,
      user_id: user.id,
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'social_comments' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
