const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type ChatHistoryItem = {
  role?: string
  content?: string
  text?: string
  parts?: Array<{ text?: string }>
}

type RecipeHint = {
  id?: string
  title?: string
  category?: string
  description?: string | null
  ingredients?: unknown
  steps?: unknown
  cooking_time?: number | null
  difficulty?: string | null
}

type GeminiPart = {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

type DraftRecipe = {
  title: string
  category: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  cooking_time: number
  prep_time: number
  servings: number
  ingredients: Array<{ item: string; amount?: string; unit?: string }>
  steps: Array<{ instruction: string; duration?: number; tip?: string }>
  nutritional_info?: Record<string, unknown>
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function normalizeRole(role?: string) {
  return role === 'model' || role === 'assistant' || role === 'ai' ? 'model' : 'user'
}

function extractText(item: ChatHistoryItem) {
  if (typeof item.content === 'string') return item.content
  if (typeof item.text === 'string') return item.text
  if (Array.isArray(item.parts)) {
    return item.parts.map((part) => part.text || '').join('\n').trim()
  }
  return ''
}

function buildHistory(history: unknown) {
  if (!Array.isArray(history)) return []

  return history
    .slice(-10)
    .map((item) => {
      const chat = item as ChatHistoryItem
      const text = extractText(chat)
      if (!text) return null

      return {
        role: normalizeRole(chat.role),
        parts: [{ text }],
      }
    })
    .filter(Boolean)
}

function extractGeminiText(payload: any) {
  const parts = payload?.candidates?.[0]?.content?.parts || []
  const text = parts.map((part: { text?: string }) => part.text || '').join('\n').trim()
  return text || ''
}

function extractJsonPayload(value: string) {
  const cleaned = value
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const objectStart = cleaned.indexOf('{')
  const objectEnd = cleaned.lastIndexOf('}')
  if (objectStart >= 0 && objectEnd > objectStart) {
    try {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1))
    } catch {
      // Continue to array parsing below.
    }
  }

  const arrayStart = cleaned.indexOf('[')
  const arrayEnd = cleaned.lastIndexOf(']')
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    try {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1))
    } catch {
      return null
    }
  }

  return null
}

function cleanChefReply(value: string) {
  return value
    .replace(/[*#]/g, '')
    .replace(/(^|\n)\s*[-•]\s+/g, '$1')
    .replace(/-/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function normalizeText(value: unknown) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function recipeArrayText(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return item
      const candidate = item as Record<string, unknown>
      return [
        candidate.name,
        candidate.item,
        candidate.ingredient,
        candidate.title,
        candidate.instruction,
        candidate.text,
        candidate.step,
      ].filter(Boolean).join(' ')
    }).join(' ')
  }

  if (typeof value === 'string') return value
  return ''
}

function recipeSearchText(recipe: RecipeHint) {
  return normalizeText([
    recipe.title,
    recipe.category,
    recipe.description,
    recipeArrayText(recipe.ingredients),
    recipeArrayText(recipe.steps),
  ].filter(Boolean).join(' '))
}

function promptTokens(prompt: string) {
  const ignored = new Set(['aku', 'saya', 'mau', 'ingin', 'buat', 'bikin', 'resep', 'masak', 'dengan', 'pakai', 'yang', 'dan', 'atau', 'ada', 'apa', 'untuk'])
  return normalizeText(prompt)
    .split(' ')
    .filter((token) => token.length > 2 && !ignored.has(token))
    .slice(0, 16)
}

function rankRecipes(prompt: string, recipes: RecipeHint[]) {
  const tokens = promptTokens(prompt)
  if (!tokens.length) return recipes.slice(0, 3)

  return recipes
    .map((recipe) => {
      const text = recipeSearchText(recipe)
      const score = tokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0)
      return { recipe, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.recipe)
    .slice(0, 3)
}

async function fetchRecipeHints(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  if (!supabaseUrl || !anonKey) return []

  const endpoint = `${supabaseUrl}/rest/v1/recipes?select=id,title,category,description,ingredients,steps,cooking_time,difficulty&is_published=eq.true&order=created_at.desc&limit=32`
  const response = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: authHeader || `Bearer ${anonKey}`,
    },
  })

  if (!response.ok) return []
  const data = await response.json().catch(() => [])
  return Array.isArray(data) ? data as RecipeHint[] : []
}

async function fetchRequestUser(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  if (!supabaseUrl || !anonKey || !authHeader) return null

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: authHeader,
    },
  })

  if (!response.ok) return null
  return await response.json().catch(() => null) as { id?: string; email?: string } | null
}

async function fetchProfileRole(userId: string, authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')
  if (!supabaseUrl || !anonKey || !authHeader) return ''

  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(userId)}&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: authHeader,
      Accept: 'application/json',
    },
  })

  if (!response.ok) return ''
  const rows = await response.json().catch(() => [])
  return String(rows?.[0]?.role || '')
}

async function requireAdmin(authHeader: string) {
  const user = await fetchRequestUser(authHeader)
  if (!user?.id) {
    return jsonResponse({ status: 'error', message: 'Sesi Supabase tidak ditemukan. Silakan login ulang.' }, 401)
  }

  const role = await fetchProfileRole(user.id, authHeader)
  if (role !== 'admin') {
    return jsonResponse({ status: 'error', message: 'Akses admin diperlukan untuk AI Manager.' }, 403)
  }

  return null
}

function recipeContextForPrompt(prompt: string, recipes: RecipeHint[]) {
  const matched = rankRecipes(prompt, recipes)
  if (!matched.length) return 'Tidak ada resep database yang sangat cocok. Tetap bantu dengan prinsip masak umum.'

  return matched.map((recipe, index) => {
    const ingredients = recipeArrayText(recipe.ingredients).split(/\s*,\s*|\s{2,}/).filter(Boolean).slice(0, 8).join(', ')
    const steps = recipeArrayText(recipe.steps).split(/\.\s+|\n/).filter(Boolean).slice(0, 3).join('. ')
    return `Kandidat ${index + 1}: ${recipe.title || 'Resep CookEdu'}, kategori ${recipe.category || 'umum'}, waktu ${recipe.cooking_time || 25} menit, level ${recipe.difficulty || 'beginner'}, bahan ${ingredients || 'lihat database'}, langkah ${steps || 'ikuti detail resep'}.`
  }).join('\n')
}

function isLimitOrProviderError(status: number, payload: any) {
  const message = normalizeText(payload?.error?.message || payload?.message || '')
  return status === 429 ||
    status === 402 ||
    status === 503 ||
    message.includes('quota') ||
    message.includes('limit') ||
    message.includes('resource exhausted') ||
    message.includes('overloaded') ||
    message.includes('rate')
}

function dataUrlToGeminiPart(value: unknown): GeminiPart | null {
  const dataUrl = String(value || '').trim()
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  const mimeType = match[1]
  const data = match[2].replace(/\s/g, '')
  if (!data || data.length > 18_000_000) return null

  return {
    inlineData: {
      mimeType,
      data,
    },
  }
}

async function callGeminiContent(options: {
  apiKey: string
  model: string
  systemPrompt: string
  parts: GeminiPart[]
  maxOutputTokens?: number
  temperature?: number
}) {
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent?key=${encodeURIComponent(options.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: options.systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: options.parts,
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.55,
          topP: 0.9,
          maxOutputTokens: options.maxOutputTokens || 900,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    },
  )

  const payload = await geminiResponse.json().catch(() => ({}))
  if (!geminiResponse.ok) {
    if (isLimitOrProviderError(geminiResponse.status, payload)) {
      throw new Error('Gemini sedang penuh atau limit. CookEdu Brain akan mengambil alih.')
    }

    throw new Error(payload?.error?.message || 'Gemini API gagal dipanggil.')
  }

  return cleanChefReply(extractGeminiText(payload))
}

function detectPromptIngredients(prompt: string) {
  const normalized = normalizeText(prompt)
  const ingredients = [
    'telur',
    'nasi',
    'ayam',
    'sapi',
    'ikan',
    'udang',
    'tahu',
    'tempe',
    'jamur',
    'bayam',
    'kangkung',
    'wortel',
    'kentang',
    'tomat',
    'cabai',
    'bawang putih',
    'bawang merah',
    'santan',
    'susu',
    'keju',
    'tepung',
    'mie',
    'pasta',
    'roti',
  ]

  return ingredients.filter((ingredient) => normalized.includes(ingredient)).slice(0, 6)
}

function buildCookingRoute(prompt: string, ingredients: string[]) {
  const normalized = normalizeText(prompt)

  if (normalized.includes('plating') || normalized.includes('hias') || normalized.includes('cantik')) {
    return 'Arah terbaiknya adalah bikin satu titik fokus, sisakan ruang kosong, lalu beri warna kontras kecil. Saus cukup tipis supaya makanan tetap terlihat sebagai pemeran utama.'
  }

  if (normalized.includes('gagal') || normalized.includes('gosong') || normalized.includes('lembek') || normalized.includes('keras')) {
    return 'Aku akan baca ini seperti troubleshooting dapur. Cek panas, ukuran potongan, dan waktu masuk cairan. Tiga titik itu paling sering membuat masakan terasa gagal.'
  }

  if (ingredients.includes('telur') || ingredients.includes('nasi')) {
    return 'Jalur paling aman adalah tumis cepat. Mulai dari aroma bawang, masukkan bahan utama, bumbui ringan, lalu koreksi rasa di akhir.'
  }

  if (ingredients.includes('ayam') || ingredients.includes('sapi') || ingredients.includes('ikan') || ingredients.includes('udang')) {
    return 'Mulai dari protein sebagai pusat rasa. Keringkan permukaannya dulu, beri panas cukup, lalu masukkan bumbu agar aroma tidak mentah.'
  }

  if (ingredients.includes('bayam') || ingredients.includes('kangkung') || ingredients.includes('jamur')) {
    return 'Masak cepat dengan panas stabil. Bahan lembut seperti sayur dan jamur sebaiknya masuk belakangan supaya teksturnya tetap segar.'
  }

  return 'Aku akan pakai pola dapur aman: pilih bahan utama, bangun aroma, tambah rasa gurih, lalu tutup dengan tekstur atau kesegaran.'
}

function buildLocalChefReply(prompt: string, userName: string, recipes: RecipeHint[], reason = 'CookEdu Brain') {
  const normalized = normalizeText(prompt)
  const matched = rankRecipes(prompt, recipes)
  const ingredients = detectPromptIngredients(prompt)
  const ingredientLine = ingredients.length
    ? `Aku menangkap bahan utama: ${ingredients.join(', ')}.`
    : 'Aku belum menangkap bahan spesifik, jadi aku mulai dari prinsip masak yang paling aman.'
  const cookingRoute = buildCookingRoute(prompt, ingredients)
  const recipeLine = matched.length
    ? `Database CookEdu yang paling dekat: ${matched.map((recipe) => recipe.title).filter(Boolean).slice(0, 3).join(', ')}.`
    : 'Aku belum menemukan resep database yang benar benar cocok, jadi aku pakai prinsip dapur dasar dulu.'

  if (normalized.includes('substitusi') || normalized.includes('ganti') || normalized.includes('pengganti')) {
    return cleanChefReply(`Aku jalankan ${reason}, ${userName}. ${ingredientLine} Untuk substitusi, lihat fungsi bahannya. Kalau bahan itu memberi lemak, pakai susu plus sedikit butter. Kalau memberi asin, pakai garam sedikit demi sedikit. Kalau memberi aroma, pakai bawang, daun jeruk, jahe, atau lada sesuai arah rasanya. ${recipeLine} Kirim bahan yang hilang dan resepnya, nanti aku pilihkan pengganti yang paling dekat.`)
  }

  if (normalized.includes('plating') || normalized.includes('hias') || normalized.includes('cantik')) {
    return cleanChefReply(`Aku jalankan ${reason}, ${userName}. ${cookingRoute} Taruh bahan utama sedikit ke samping, beri saus tipis, lalu tambahkan tekstur renyah paling akhir. Warna hijau kecil seperti daun bawang atau seledri sering cukup membuat piring terlihat hidup. ${recipeLine}`)
  }

  if (normalized.includes('bahan') || normalized.includes('kulkas') || normalized.includes('scan') || normalized.includes('telur') || normalized.includes('ayam') || normalized.includes('nasi')) {
    return cleanChefReply(`Aku jalankan ${reason}, ${userName}. ${ingredientLine} ${cookingRoute} Setelah itu pilih satu sentuhan akhir: jeruk nipis untuk segar, bawang goreng untuk renyah, atau saus ringan untuk lebih gurih. ${recipeLine} Kalau kamu kirim daftar isi kulkas yang lebih lengkap, aku bisa ubah jadi saran menu yang lebih presisi.`)
  }

  if (normalized.includes('gagal') || normalized.includes('kenapa') || normalized.includes('keras') || normalized.includes('gosong') || normalized.includes('lembek')) {
    return cleanChefReply(`Aku jalankan ${reason}, ${userName}. ${cookingRoute} Kalau gosong di luar tapi mentah di dalam, turunkan api dan beri waktu. Kalau lembek, biasanya air terlalu banyak atau bahan terlalu lama di panas. Ceritakan bahan dan tahap gagalnya, aku bantu bedah pelan pelan.`)
  }

  return cleanChefReply(`Aku jalankan ${reason}, ${userName}. ${ingredientLine} ${cookingRoute} Untuk masakan rumahan, alur yang rapi adalah siapkan bahan, panaskan alat, masak bahan yang paling lama dulu, baru masukkan bahan cepat matang. ${recipeLine} Kirim nama bahan atau target resepnya, nanti aku arahkan lebih spesifik.`)
}

function normalizedDetectedIngredients(payload: any) {
  const raw = Array.isArray(payload?.ingredients) ? payload.ingredients : Array.isArray(payload) ? payload : []
  return raw
    .map((item: unknown) => {
      if (typeof item === 'string') {
        return { name: item.trim(), confidence: 0.76 }
      }

      const record = item as Record<string, unknown>
      return {
        name: String(record.name || record.item || record.ingredient || '').trim(),
        confidence: Math.min(0.99, Math.max(0.1, Number(record.confidence || 0.76))),
      }
    })
    .filter((item: { name: string }) => item.name.length > 0)
    .slice(0, 10)
}

async function handleScanFridge(body: Record<string, unknown>, apiKey: string | undefined, model: string) {
  const imagePart = dataUrlToGeminiPart(body.image_data_url)
  if (!imagePart) {
    return jsonResponse({ status: 'error', message: 'Foto kulkas tidak valid atau terlalu besar.' }, 422)
  }

  if (!apiKey) {
    return jsonResponse({
      status: 'success',
      action: 'scan-fridge',
      source: 'cookedu_brain',
      ingredients: [],
      note: 'Gemini Vision belum aktif di Supabase secret, jadi aplikasi akan memakai scan lokal.',
      reply: 'Gemini Vision belum aktif, jadi CookEdu memakai scan lokal sebagai pengaman.',
    })
  }

  const knownIngredients = Array.isArray(body.known_ingredients)
    ? body.known_ingredients.slice(0, 120).join(', ')
    : 'telur, nasi, ayam, tahu, tempe, tomat, cabai, bawang, wortel, bayam, kangkung, susu, keju, mie'

  try {
    const text = await callGeminiContent({
      apiKey,
      model,
      systemPrompt: [
        'Kamu adalah CookEdu Vision, mesin deteksi bahan makanan untuk aplikasi kuliner.',
        'Balas hanya JSON valid. Jangan markdown. Jangan gunakan karakter *, #, atau bullet.',
        'Deteksi bahan makanan yang terlihat jelas. Abaikan piring, meja, botol kosong, dan objek non makanan.',
        'Gunakan nama bahan dalam Bahasa Indonesia yang natural.',
      ].join('\n'),
      parts: [
        imagePart,
        {
          text: `Baca foto kulkas atau bahan makanan ini. Cocokkan dengan daftar umum ini jika relevan: ${knownIngredients}. Format JSON wajib: {"ingredients":[{"name":"Tomat","confidence":0.82}],"note":"catatan singkat kualitas foto"}`,
        },
      ],
      maxOutputTokens: 620,
      temperature: 0.25,
    })

    const payload = extractJsonPayload(text)
    const ingredients = normalizedDetectedIngredients(payload)
    return jsonResponse({
      status: 'success',
      action: 'scan-fridge',
      source: ingredients.length ? 'gemini_vision' : 'cookedu_brain',
      ingredients,
      note: String(payload?.note || 'Deteksi bahan selesai memakai CookEdu Vision.'),
      reply: text,
    })
  } catch (error) {
    return jsonResponse({
      status: 'success',
      action: 'scan-fridge',
      source: 'cookedu_brain',
      ingredients: [],
      note: error instanceof Error ? error.message : 'Gemini Vision sedang tidak stabil, aplikasi memakai scan lokal.',
      reply: 'Vision cloud belum stabil, jadi CookEdu memakai scan lokal sebagai fallback.',
    })
  }
}

async function handleRecipeDoctor(body: Record<string, unknown>, apiKey: string | undefined, model: string, recipes: RecipeHint[]) {
  const prompt = String(body.prompt || body.question || '').trim()
  const preferences = String(body.preferences || '').trim()
  const imagePart = dataUrlToGeminiPart(body.image_data_url)
  if (!prompt && !imagePart) {
    return jsonResponse({ status: 'error', message: 'Ceritakan masalah resep atau unggah foto masakan dulu.' }, 422)
  }

  if (!apiKey) {
    const reply = buildLocalChefReply(prompt || 'masakan gagal', String(body.user_name || 'Koki CookEdu'), recipes, 'CookEdu Brain Recipe Doctor')
    return jsonResponse({ status: 'success', action: 'recipe-doctor', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
  }

  try {
    const text = await callGeminiContent({
      apiKey,
      model,
      systemPrompt: [
        'Kamu adalah CookEdu Recipe Doctor.',
        'Diagnosis masalah masakan dengan bahasa Indonesia yang manusiawi, ringkas, dan praktis.',
        'Jangan pakai markdown, bullet, karakter *, #, atau heading.',
        'Fokus pada penyebab, cara memperbaiki saat ini, dan pencegahan untuk masak berikutnya.',
        'Jangan memberi klaim medis.',
      ].join('\n'),
      parts: [
        ...(imagePart ? [imagePart] : []),
        {
          text: `Masalah user: ${prompt || 'foto masakan terlampir'}\nPreferensi user: ${preferences || 'belum ada'}\nKonteks resep CookEdu:\n${recipeContextForPrompt(prompt, recipes)}\nBerikan diagnosis yang terasa seperti mentor dapur.`,
        },
      ],
      maxOutputTokens: 850,
      temperature: 0.45,
    })

    return jsonResponse({ status: 'success', action: 'recipe-doctor', reply: text, response: text, mode: 'gemini', model })
  } catch {
    const reply = buildLocalChefReply(prompt || 'masakan gagal', String(body.user_name || 'Koki CookEdu'), recipes, 'CookEdu Brain Recipe Doctor')
    return jsonResponse({ status: 'success', action: 'recipe-doctor', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
  }
}

async function handleMealPlan(body: Record<string, unknown>, apiKey: string | undefined, model: string, recipes: RecipeHint[]) {
  const prompt = String(body.prompt || body.question || '').trim()
  const preferences = String(body.preferences || '').trim()
  if (!prompt && !preferences) {
    return jsonResponse({ status: 'error', message: 'Isi target menu mingguan atau preferensi makan dulu.' }, 422)
  }

  const fallbackReply = cleanChefReply(`Aku susun meal plan sederhana dari CookEdu Brain. Hari pertama pakai menu cepat berbasis telur atau tumis. Hari kedua pilih protein seperti ayam atau tahu. Hari ketiga buat menu sayur hangat. Hari keempat gunakan resep database yang paling dekat: ${rankRecipes(prompt || preferences, recipes).map((recipe) => recipe.title).filter(Boolean).slice(0, 3).join(', ') || 'resep praktis CookEdu'}. Ulangi pola protein, sayur, dan karbohidrat agar belanja tetap ringan.`)

  if (!apiKey) {
    return jsonResponse({ status: 'success', action: 'meal-plan', reply: fallbackReply, response: fallbackReply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
  }

  try {
    const text = await callGeminiContent({
      apiKey,
      model,
      systemPrompt: [
        'Kamu adalah CookEdu Meal Planner.',
        'Buat rencana menu yang realistis untuk dapur rumahan Indonesia.',
        'Jangan pakai markdown, bullet, karakter *, #, atau heading.',
        'Gunakan paragraf pendek dan angka hari jika perlu.',
        'Hubungkan dengan resep CookEdu bila relevan.',
      ].join('\n'),
      parts: [{
        text: `Target user: ${prompt}\nPreferensi dan batasan: ${preferences || 'belum ada'}\nKonteks resep CookEdu:\n${recipeContextForPrompt(prompt + ' ' + preferences, recipes)}\nBuat menu 7 hari, ide belanja, dan strategi meal prep singkat.`,
      }],
      maxOutputTokens: 1050,
      temperature: 0.55,
    })

    return jsonResponse({ status: 'success', action: 'meal-plan', reply: text, response: text, mode: 'gemini', model })
  } catch {
    return jsonResponse({ status: 'success', action: 'meal-plan', reply: fallbackReply, response: fallbackReply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
  }
}

function fallbackDraftRecipe(topic: string): DraftRecipe {
  const title = topic.trim() || 'Resep Rumahan CookEdu'
  return {
    title,
    category: 'Community',
    description: `Draft resep ${title} yang bisa dirapikan admin sebelum publish.`,
    difficulty: 'beginner',
    cooking_time: 25,
    prep_time: 10,
    servings: 2,
    ingredients: [
      { item: 'Bahan utama', amount: '250', unit: 'g' },
      { item: 'Bawang putih', amount: '2', unit: 'siung' },
      { item: 'Garam', amount: '1/2', unit: 'sdt' },
    ],
    steps: [
      { instruction: 'Siapkan semua bahan dan potong dengan ukuran seragam.', duration: 5, tip: 'Potongan seragam membuat matang lebih rata.' },
      { instruction: 'Masak bahan utama dengan api sedang sampai matang.', duration: 15, tip: 'Koreksi rasa di akhir.' },
      { instruction: 'Sajikan hangat dengan garnish sederhana.', duration: 2, tip: 'Tambahkan tekstur renyah jika ada.' },
    ],
    nutritional_info: { calories: 0 },
  }
}

function normalizeDraftRecipe(payload: any, topic: string): DraftRecipe {
  const fallback = fallbackDraftRecipe(topic)
  const raw = payload?.draft || payload?.recipe || payload || {}
  const difficulty = String(raw.difficulty || fallback.difficulty).toLowerCase()

  return {
    title: String(raw.title || fallback.title).slice(0, 120),
    category: String(raw.category || fallback.category).slice(0, 80),
    description: String(raw.description || fallback.description).slice(0, 1200),
    difficulty: difficulty === 'advanced' || difficulty === 'intermediate' ? difficulty : 'beginner',
    cooking_time: Math.max(5, Math.min(240, Number(raw.cooking_time || fallback.cooking_time))),
    prep_time: Math.max(0, Math.min(120, Number(raw.prep_time || fallback.prep_time))),
    servings: Math.max(1, Math.min(12, Number(raw.servings || fallback.servings))),
    ingredients: (Array.isArray(raw.ingredients) ? raw.ingredients : fallback.ingredients)
      .map((item: unknown) => {
        if (typeof item === 'string') return { item }
        const record = item as Record<string, unknown>
        return {
          item: String(record.item || record.name || record.ingredient || '').trim(),
          amount: String(record.amount || '').trim(),
          unit: String(record.unit || '').trim(),
        }
      })
      .filter((item: { item: string }) => item.item.length > 0)
      .slice(0, 18),
    steps: (Array.isArray(raw.steps) ? raw.steps : fallback.steps)
      .map((step: unknown) => {
        if (typeof step === 'string') return { instruction: step, duration: 0, tip: '' }
        const record = step as Record<string, unknown>
        return {
          instruction: String(record.instruction || record.text || record.step || '').trim(),
          duration: Number(record.duration || 0),
          tip: String(record.tip || '').trim(),
        }
      })
      .filter((step: { instruction: string }) => step.instruction.length > 0)
      .slice(0, 14),
    nutritional_info: raw.nutritional_info && typeof raw.nutritional_info === 'object' ? raw.nutritional_info : fallback.nutritional_info,
  }
}

async function handleAdminDraft(body: Record<string, unknown>, authHeader: string, apiKey: string | undefined, model: string, recipes: RecipeHint[]) {
  const adminError = await requireAdmin(authHeader)
  if (adminError) return adminError

  const topic = String(body.prompt || body.topic || '').trim()
  if (topic.length < 3) {
    return jsonResponse({ status: 'error', message: 'Isi brief resep atau masalah data yang ingin dirapikan.' }, 422)
  }

  if (!apiKey) {
    const draft = fallbackDraftRecipe(topic)
    return jsonResponse({
      status: 'success',
      action: 'admin-draft',
      draft,
      reply: 'Gemini belum aktif, jadi CookEdu membuat draft aman berbasis template lokal.',
      mode: 'cookedu_brain',
      model: 'cookedu-brain-v1',
    })
  }

  try {
    const text = await callGeminiContent({
      apiKey,
      model,
      systemPrompt: [
        'Kamu adalah CookEdu Admin Recipe Manager.',
        'Balas hanya JSON valid. Jangan markdown. Jangan gunakan karakter *, #, atau bullet.',
        'Buat draft resep yang masuk akal untuk database recipes CookEdu.',
        'Jangan mengubah schema. Field wajib: title, category, description, difficulty, cooking_time, prep_time, servings, ingredients, steps, nutritional_info.',
        'ingredients adalah array object {item, amount, unit}. steps adalah array object {instruction, duration, tip}.',
      ].join('\n'),
      parts: [{
        text: `Brief admin: ${topic}\nKonteks resep database untuk menghindari duplikasi:\n${recipeContextForPrompt(topic, recipes)}\nBalas JSON: {"draft":{...},"cleanup_notes":["catatan singkat"]}`,
      }],
      maxOutputTokens: 1300,
      temperature: 0.45,
    })

    const payload = extractJsonPayload(text)
    const draft = normalizeDraftRecipe(payload, topic)
    return jsonResponse({
      status: 'success',
      action: 'admin-draft',
      draft,
      cleanup_notes: Array.isArray(payload?.cleanup_notes) ? payload.cleanup_notes.slice(0, 8) : [],
      reply: 'Draft resep berhasil dibuat. Tinjau lagi sebelum disimpan ke Supabase.',
      mode: 'gemini',
      model,
    })
  } catch {
    const draft = fallbackDraftRecipe(topic)
    return jsonResponse({
      status: 'success',
      action: 'admin-draft',
      draft,
      cleanup_notes: ['Gemini belum stabil, draft dibuat dari CookEdu Brain lokal.'],
      reply: 'Draft lokal berhasil dibuat. Tinjau lagi sebelum disimpan.',
      mode: 'cookedu_brain',
      model: 'cookedu-brain-v1',
    })
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ status: 'error', message: 'Method not allowed' }, 405)
  }

  let fallbackPrompt = ''
  let fallbackUserName = 'Koki CookEdu'

  try {
    const body = await request.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash'
    const aiMode = String(Deno.env.get('COOKEDU_AI_MODE') || body.mode || (apiKey ? 'hybrid' : 'cookedu-brain')).toLowerCase()
    const action = String(body.action || 'chat').trim().toLowerCase()
    const authHeader = request.headers.get('Authorization') || ''
    const prompt = String(body.prompt || body.question || '').trim()
    const userName = String(body.user_name || 'Koki CookEdu').trim()
    const preferences = String(body.preferences || '').trim()
    const recipeHints = await fetchRecipeHints(authHeader)
    fallbackPrompt = prompt
    fallbackUserName = userName

    if (action === 'scan-fridge') {
      return await handleScanFridge(body, apiKey, model)
    }

    if (action === 'recipe-doctor') {
      return await handleRecipeDoctor(body, apiKey, model, recipeHints)
    }

    if (action === 'meal-plan') {
      return await handleMealPlan(body, apiKey, model, recipeHints)
    }

    if (action === 'admin-draft') {
      return await handleAdminDraft(body, authHeader, apiKey, model, recipeHints)
    }

    if (!prompt) {
      return jsonResponse({ status: 'error', message: 'Prompt tidak boleh kosong.' }, 400)
    }

    if (aiMode !== 'gemini' && aiMode !== 'hybrid') {
      const reply = buildLocalChefReply(prompt, userName, recipeHints)
      return jsonResponse({ status: 'success', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
    }

    if (!apiKey) {
      const reply = buildLocalChefReply(prompt, userName, recipeHints, 'CookEdu Brain')
      return jsonResponse({ status: 'success', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
    }

    const systemPrompt = [
      'Kamu adalah Chef AI CookEdu, asisten belajar memasak yang hangat, praktis, dan aman.',
      'Jawab dalam Bahasa Indonesia yang natural, seperti mentor dapur manusia.',
      'Jangan gunakan karakter *, #, atau - dalam jawaban.',
      'Jangan gunakan markdown, heading, bullet list, atau gaya template AI.',
      'Pakai paragraf pendek. Boleh pakai angka 1. 2. 3. hanya jika benar benar perlu.',
      'Fokus pada resep, teknik masak, substitusi bahan, plating, food safety dasar, dan ide menu.',
      'Jika pertanyaan bukan soal kuliner, arahkan kembali ke konteks memasak dengan ramah.',
      'Berikan jawaban ringkas, praktis, dan terasa ngobrol.',
      'Gunakan konteks resep CookEdu jika relevan.',
      'Jangan membuat klaim medis atau nutrisi ekstrem. Untuk alergi/penyakit, sarankan konsultasi ahli.',
      `Nama pengguna: ${userName}.`,
      `Memory preference user: ${preferences || 'belum ada preferensi tersimpan.'}`,
      `Konteks resep CookEdu:\n${recipeContextForPrompt(prompt, recipeHints)}`,
    ].join('\n')

    const contents = [
      ...buildHistory(body.history),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ]

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.65,
            topP: 0.9,
            maxOutputTokens: 720,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      },
    )

    const payload = await geminiResponse.json()

    if (!geminiResponse.ok) {
      if (isLimitOrProviderError(geminiResponse.status, payload)) {
        const reply = buildLocalChefReply(prompt, userName, recipeHints, 'CookEdu Brain')
        return jsonResponse({ status: 'success', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
      }

      return jsonResponse({
        status: 'error',
        message: payload?.error?.message || 'Gemini API gagal dipanggil.',
      }, geminiResponse.status)
    }

    const reply = cleanChefReply(extractGeminiText(payload))
    if (!reply) {
      const fallbackReply = buildLocalChefReply(prompt, userName, recipeHints, 'CookEdu Brain')
      return jsonResponse({ status: 'success', reply: fallbackReply, response: fallbackReply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
    }

    return jsonResponse({
      status: 'success',
      reply,
      response: reply,
      mode: 'gemini',
      model,
    })
  } catch (error) {
    if (fallbackPrompt) {
      const reply = buildLocalChefReply(fallbackPrompt, fallbackUserName, [], 'CookEdu Brain')
      return jsonResponse({ status: 'success', reply, response: reply, mode: 'cookedu_brain', model: 'cookedu-brain-v1' })
    }

    return jsonResponse({
      status: 'error',
      message: error instanceof Error ? error.message : 'Chef AI gagal memproses request.',
    }, 500)
  }
})
