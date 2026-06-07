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

function buildLocalChefReply(prompt: string, userName: string, recipes: RecipeHint[], reason = 'mode lokal') {
  const normalized = normalizeText(prompt)
  const matched = rankRecipes(prompt, recipes)
  const recipeLine = matched.length
    ? `Aku juga melihat yang paling dekat di database CookEdu: ${matched.map((recipe) => recipe.title).filter(Boolean).slice(0, 3).join(', ')}.`
    : 'Aku belum menemukan resep database yang benar benar cocok, jadi aku pakai prinsip dapur dasar dulu.'

  if (normalized.includes('substitusi') || normalized.includes('ganti') || normalized.includes('pengganti')) {
    return cleanChefReply(`Aku pakai ${reason} dulu, ${userName}. Untuk substitusi, lihat fungsi bahannya. Kalau bahan itu memberi lemak, pakai susu plus sedikit butter. Kalau memberi asin, pakai garam sedikit demi sedikit. Kalau memberi aroma, pakai bawang, daun jeruk, jahe, atau lada sesuai arah rasanya. ${recipeLine} Kirim bahan yang hilang dan resepnya, nanti aku bantu pilih pengganti yang paling dekat.`)
  }

  if (normalized.includes('plating') || normalized.includes('hias') || normalized.includes('cantik')) {
    return cleanChefReply(`Aku pakai ${reason} dulu, ${userName}. Untuk plating, pilih satu titik fokus di piring, jangan penuhi semua ruang. Taruh bahan utama sedikit ke samping, beri saus tipis, lalu tambahkan tekstur renyah paling akhir. Warna hijau kecil seperti daun bawang atau seledri sering cukup membuat piring terlihat hidup. ${recipeLine}`)
  }

  if (normalized.includes('bahan') || normalized.includes('kulkas') || normalized.includes('scan') || normalized.includes('telur') || normalized.includes('ayam') || normalized.includes('nasi')) {
    return cleanChefReply(`Aku pakai ${reason} dulu, ${userName}. Dari bahan yang kamu sebut, mulai dengan tiga keputusan: bahan utama, bumbu dasar, dan tekstur akhir. Kalau ada telur, nasi, atau ayam, jalur paling aman adalah tumis cepat dengan bawang, sedikit garam, lada, lalu koreksi rasa di akhir. ${recipeLine} Kalau kamu kirim daftar bahan yang ada di kulkas, aku bisa ubah jadi saran menu yang lebih tepat.`)
  }

  if (normalized.includes('gagal') || normalized.includes('kenapa') || normalized.includes('keras') || normalized.includes('gosong') || normalized.includes('lembek')) {
    return cleanChefReply(`Aku pakai ${reason} dulu, ${userName}. Cek tiga titik dulu: panas terlalu tinggi, potongan bahan tidak seragam, atau cairan masuk terlalu cepat. Kalau gosong di luar tapi mentah di dalam, turunkan api dan beri waktu. Kalau lembek, biasanya air terlalu banyak atau bahan terlalu lama di panas. Ceritakan bahan dan tahap gagalnya, aku bantu bedah pelan pelan.`)
  }

  return cleanChefReply(`Aku pakai ${reason} dulu, ${userName}. Jawaban cepatku: mulai dari bahan yang kamu punya, pilih teknik paling aman, lalu koreksi rasa di akhir. Untuk masakan rumahan, alur yang rapi adalah siapkan bahan, panaskan alat, masak bahan yang paling lama dulu, baru masukkan bahan cepat matang. ${recipeLine} Kirim nama bahan atau target resepnya, nanti aku arahkan lebih spesifik.`)
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
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'

    const body = await request.json()
    const prompt = String(body.prompt || body.question || '').trim()
    const userName = String(body.user_name || 'Koki CookEdu').trim()
    const recipeHints = await fetchRecipeHints(request.headers.get('Authorization') || '')
    fallbackPrompt = prompt
    fallbackUserName = userName

    if (!prompt) {
      return jsonResponse({ status: 'error', message: 'Prompt tidak boleh kosong.' }, 400)
    }

    if (!apiKey) {
      const reply = buildLocalChefReply(prompt, userName, recipeHints, 'mode lokal karena API key belum aktif')
      return jsonResponse({ status: 'success', reply, response: reply, mode: 'local_fallback', model: 'cookedu-local-brain' })
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
        const reply = buildLocalChefReply(prompt, userName, recipeHints, 'mode lokal karena kuota AI utama sedang penuh')
        return jsonResponse({ status: 'success', reply, response: reply, mode: 'local_fallback', model: 'cookedu-local-brain' })
      }

      return jsonResponse({
        status: 'error',
        message: payload?.error?.message || 'Gemini API gagal dipanggil.',
      }, geminiResponse.status)
    }

    const reply = cleanChefReply(extractGeminiText(payload))
    if (!reply) {
      const fallbackReply = buildLocalChefReply(prompt, userName, recipeHints, 'mode lokal karena AI utama tidak memberi jawaban')
      return jsonResponse({ status: 'success', reply: fallbackReply, response: fallbackReply, mode: 'local_fallback', model: 'cookedu-local-brain' })
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
      const reply = buildLocalChefReply(fallbackPrompt, fallbackUserName, [], 'mode lokal karena koneksi AI utama sedang terganggu')
      return jsonResponse({ status: 'success', reply, response: reply, mode: 'local_fallback', model: 'cookedu-local-brain' })
    }

    return jsonResponse({
      status: 'error',
      message: error instanceof Error ? error.message : 'Chef AI gagal memproses request.',
    }, 500)
  }
})
