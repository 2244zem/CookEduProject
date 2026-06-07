const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type VisionIngredient = {
  name: string
  confidence: number
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

function safeParseJson(text: string) {
  const clean = text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()

  return JSON.parse(clean)
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ status: 'error', message: 'Method not allowed' }, 405)
  }

  try {
    const apiKey = Deno.env.get('VISION_API_KEY') || Deno.env.get('OPENAI_API_KEY')
    const apiUrl = Deno.env.get('VISION_API_URL') || 'https://api.openai.com/v1/chat/completions'
    const model = Deno.env.get('VISION_MODEL') || 'gpt-4o-mini'

    if (!apiKey) {
      return jsonResponse({
        status: 'error',
        message: 'VISION_API_KEY atau OPENAI_API_KEY belum dipasang sebagai Supabase secret.',
      }, 503)
    }

    const body = await request.json()
    const imageDataUrl = String(body.image_data_url || '')
    const knownIngredients = Array.isArray(body.known_ingredients)
      ? body.known_ingredients.slice(0, 180).map((item: unknown) => String(item))
      : []

    if (!imageDataUrl.startsWith('data:image/')) {
      return jsonResponse({ status: 'error', message: 'image_data_url harus berupa data URL gambar.' }, 400)
    }

    const prompt = [
      'You are CookEdu Fridge Vision.',
      'Detect visible food ingredients from the refrigerator photo.',
      'Return only compact JSON, no markdown.',
      'Shape: {"ingredients":[{"name":"Tomat","confidence":0.86}],"note":"short Indonesian note"}',
      'Use Indonesian ingredient names where natural.',
      'Prefer names from this known ingredient list when visible:',
      knownIngredients.join(', '),
      'Only include ingredients that are likely visible. Max 8 items.',
    ].join('\n')

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    })

    const payload = await aiResponse.json()

    if (!aiResponse.ok) {
      return jsonResponse({
        status: 'error',
        message: payload?.error?.message || 'Vision provider request failed.',
      }, aiResponse.status)
    }

    const text = payload?.choices?.[0]?.message?.content || '{}'
    const parsed = safeParseJson(text)
    const ingredients: VisionIngredient[] = Array.isArray(parsed.ingredients)
      ? parsed.ingredients
        .map((item: Partial<VisionIngredient>) => ({
          name: String(item.name || '').trim(),
          confidence: Math.max(0.1, Math.min(0.99, Number(item.confidence) || 0.7)),
        }))
        .filter((item: VisionIngredient) => item.name.length > 1)
        .slice(0, 8)
      : []

    return jsonResponse({
      status: 'success',
      ingredients,
      note: parsed.note || 'Bahan berhasil dipindai dari foto kulkas.',
    })
  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error instanceof Error ? error.message : 'Fridge vision failed.',
    }, 500)
  }
})
