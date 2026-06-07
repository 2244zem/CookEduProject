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
    const aiMode = String(Deno.env.get('COOKEDU_AI_MODE') || body.mode || 'cookedu-brain').toLowerCase()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
    const prompt = String(body.prompt || body.question || '').trim()
    const userName = String(body.user_name || 'Koki CookEdu').trim()
    const recipeHints = await fetchRecipeHints(request.headers.get('Authorization') || '')
    fallbackPrompt = prompt
    fallbackUserName = userName

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
