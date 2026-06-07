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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ status: 'error', message: 'Method not allowed' }, 405)
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'

    if (!apiKey) {
      return jsonResponse({
        status: 'error',
        message: 'GEMINI_API_KEY belum dipasang sebagai Supabase secret.',
      }, 503)
    }

    const body = await request.json()
    const prompt = String(body.prompt || body.question || '').trim()
    const userName = String(body.user_name || 'Koki CookEdu').trim()

    if (!prompt) {
      return jsonResponse({ status: 'error', message: 'Prompt tidak boleh kosong.' }, 400)
    }

    const systemPrompt = [
      'Kamu adalah Chef AI CookEdu, asisten belajar memasak yang hangat, praktis, dan aman.',
      'Jawab dalam Bahasa Indonesia yang natural.',
      'Fokus pada resep, teknik masak, substitusi bahan, plating, food safety dasar, dan ide menu.',
      'Jika pertanyaan bukan soal kuliner, arahkan kembali ke konteks memasak dengan ramah.',
      'Berikan jawaban ringkas, bisa langsung dipraktikkan, dan gunakan bullet seperlunya.',
      'Jangan membuat klaim medis atau nutrisi ekstrem. Untuk alergi/penyakit, sarankan konsultasi ahli.',
      `Nama pengguna: ${userName}.`,
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
      return jsonResponse({
        status: 'error',
        message: payload?.error?.message || 'Gemini API gagal dipanggil.',
      }, geminiResponse.status)
    }

    const reply = extractGeminiText(payload)
    if (!reply) {
      return jsonResponse({
        status: 'error',
        message: 'Gemini tidak mengembalikan jawaban. Coba ulangi dengan prompt yang lebih spesifik.',
      }, 502)
    }

    return jsonResponse({
      status: 'success',
      reply,
      response: reply,
      model,
    })
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error instanceof Error ? error.message : 'Chef AI gagal memproses request.',
    }, 500)
  }
})
