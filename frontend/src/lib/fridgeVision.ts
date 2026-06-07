import { stapleIngredientsData } from '../data/stapleIngredients'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export type DetectedIngredient = {
  name: string
  confidence: number
  source: 'vision-ai' | 'local-scan' | 'manual'
}

export type FridgeVisionResult = {
  ingredients: DetectedIngredient[]
  source: 'vision-ai' | 'local-scan'
  note: string
}

const KNOWN_INGREDIENTS = stapleIngredientsData.map((item) => item.name)

function normalizeIngredientName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueDetectedIngredients(items: DetectedIngredient[]) {
  const byName = new Map<string, DetectedIngredient>()

  items.forEach((item) => {
    const key = normalizeIngredientName(item.name)
    if (!key) return

    const existing = byName.get(key)
    if (!existing || item.confidence > existing.confidence) {
      byName.set(key, {
        ...item,
        name: item.name.trim(),
        confidence: Math.min(0.99, Math.max(0.1, item.confidence)),
      })
    }
  })

  return Array.from(byName.values()).slice(0, 8)
}

async function invokeVisionFunction(imageDataUrl: string) {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase.functions.invoke('fridge-vision', {
    body: {
      image_data_url: imageDataUrl,
      locale: 'id-ID',
      known_ingredients: KNOWN_INGREDIENTS,
    },
  })

  if (error) throw error
  return data as { ingredients?: Array<string | { name?: string; confidence?: number }>; note?: string } | null
}

function loadImage(imageDataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Foto kulkas tidak bisa dibaca. Coba ambil ulang dengan cahaya lebih terang.'))
    image.src = imageDataUrl
  })
}

async function analyzeImageLocally(imageDataUrl: string): Promise<FridgeVisionResult> {
  const image = await loadImage(imageDataUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Browser tidak mendukung pemindaian gambar lokal.')

  canvas.width = 80
  canvas.height = Math.max(1, Math.round((image.height / Math.max(1, image.width)) * 80))
  context.drawImage(image, 0, 0, canvas.width, canvas.height)

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  const bucketScores = {
    red: 0,
    green: 0,
    yellow: 0,
    white: 0,
    brown: 0,
  }

  for (let index = 0; index < pixels.length; index += 16) {
    const red = pixels[index] || 0
    const green = pixels[index + 1] || 0
    const blue = pixels[index + 2] || 0
    const max = Math.max(red, green, blue)
    const min = Math.min(red, green, blue)
    const brightness = (red + green + blue) / 3
    const saturation = max - min

    if (brightness > 185 && saturation < 42) bucketScores.white += 1
    if (red > 125 && red > green * 1.18 && red > blue * 1.18) bucketScores.red += 1
    if (green > 105 && green > red * 1.08 && green > blue * 1.08) bucketScores.green += 1
    if (red > 140 && green > 120 && blue < 110) bucketScores.yellow += 1
    if (red > 70 && red < 165 && green > 45 && green < 135 && blue < 95 && red > blue * 1.35) bucketScores.brown += 1
  }

  const candidates: DetectedIngredient[] = []
  if (bucketScores.green > 30) {
    candidates.push({ name: 'Bayam', confidence: 0.64, source: 'local-scan' })
    candidates.push({ name: 'Timun', confidence: 0.46, source: 'local-scan' })
  }
  if (bucketScores.red > 25) {
    candidates.push({ name: 'Tomat', confidence: 0.66, source: 'local-scan' })
    candidates.push({ name: 'Cabai', confidence: 0.44, source: 'local-scan' })
  }
  if (bucketScores.yellow > 24) {
    candidates.push({ name: 'Telur', confidence: 0.54, source: 'local-scan' })
    candidates.push({ name: 'Jagung', confidence: 0.48, source: 'local-scan' })
  }
  if (bucketScores.white > 45) {
    candidates.push({ name: 'Tahu', confidence: 0.52, source: 'local-scan' })
    candidates.push({ name: 'Bawang Putih', confidence: 0.42, source: 'local-scan' })
  }
  if (bucketScores.brown > 26) {
    candidates.push({ name: 'Tempe', confidence: 0.5, source: 'local-scan' })
    candidates.push({ name: 'Jamur', confidence: 0.43, source: 'local-scan' })
  }

  const fallback = candidates.length
    ? candidates
    : [
        { name: 'Telur', confidence: 0.38, source: 'local-scan' as const },
        { name: 'Bawang Putih', confidence: 0.34, source: 'local-scan' as const },
        { name: 'Tomat', confidence: 0.32, source: 'local-scan' as const },
      ]

  return {
    ingredients: uniqueDetectedIngredients(fallback),
    source: 'local-scan',
    note: 'AI cloud belum aktif, jadi CookEdu memakai pemindaian warna lokal sebagai fallback aman.',
  }
}

export async function analyzeFridgePhoto(imageDataUrl: string): Promise<FridgeVisionResult> {
  try {
    const data = await invokeVisionFunction(imageDataUrl)
    const detected = uniqueDetectedIngredients((data?.ingredients || []).map((item) => {
      if (typeof item === 'string') {
        return { name: item, confidence: 0.76, source: 'vision-ai' as const }
      }

      return {
        name: item.name || '',
        confidence: item.confidence || 0.76,
        source: 'vision-ai' as const,
      }
    }))

    if (detected.length) {
      return {
        ingredients: detected,
        source: 'vision-ai',
        note: data?.note || 'Bahan terdeteksi memakai Supabase Edge Function fridge-vision.',
      }
    }
  } catch (error) {
    console.warn('CookEdu fridge vision fallback:', error)
  }

  return analyzeImageLocally(imageDataUrl)
}

function getIngredientText(ingredient: any) {
  if (typeof ingredient === 'string') return ingredient
  return ingredient?.name || ingredient?.item || ingredient?.ingredient || ingredient?.title || ''
}

export function recommendRecipesFromIngredients(recipes: any[], ingredients: string[]) {
  const normalizedIngredients = ingredients
    .map(normalizeIngredientName)
    .filter(Boolean)

  if (!normalizedIngredients.length) return []

  return recipes
    .map((recipe) => {
      const recipeIngredientText = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(getIngredientText).join(' ')
        : ''
      const searchable = normalizeIngredientName([
        recipe.title,
        recipe.category,
        recipe.description,
        recipeIngredientText,
      ].filter(Boolean).join(' '))

      const matchedIngredients = normalizedIngredients.filter((ingredient) => searchable.includes(ingredient))
      const matchCount = matchedIngredients.length
      const matchRatio = matchCount / normalizedIngredients.length

      return {
        ...recipe,
        matchCount,
        matchedIngredients,
        matchScore: Math.round(Math.min(98, 38 + (matchRatio * 48) + (matchCount * 8))),
      }
    })
    .filter((recipe) => recipe.matchCount > 0)
    .sort((first, second) => {
      if (second.matchCount !== first.matchCount) return second.matchCount - first.matchCount
      return second.matchScore - first.matchScore
    })
}
