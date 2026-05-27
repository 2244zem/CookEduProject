<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChefAiController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
            'history' => 'nullable|array'
        ]);

        $prompt = $request->input('prompt');
        $history = $request->input('history', []);
        
        // Semantic Caching logic: check if similar prompt exists
        $cacheKey = 'ai_response_' . md5(strtolower(trim($prompt)));
        $isCached = Cache::has($cacheKey);

        $response = Cache::remember($cacheKey, 86400, function () use ($prompt, $history) {
            $apiKey = env('GEMINI_API_KEY');
            
            if (!$apiKey) {
                abort(500, 'Gemini API key is missing.');
            }

            $payload = [
                'contents' => array_merge($history, [
                    ['role' => 'user', 'parts' => [['text' => $prompt]]]
                ]),
                'systemInstruction' => [
                    'role' => 'system',
                    'parts' => [[
                        'text' => 'Anda adalah ChefAI, asisten koki ahli nutrisi dari CookEdu. Anda WAJIB menjelaskan tutorial memasak secara sangat detail. Jangan pernah menyebutkan instruksi umum seperti "siapkan bahan masakan", tetapi sebutkan bahan baku satu per satu secara presisi (contoh: 4 siung bawang merah, 250 gram dada ayam, dll). Di setiap resep yang dibahas, Anda WAJIB secara otomatis menghitung estimasi kalori, lemak, protein, dan karbohidrat. Berikan juga PERINGATAN KESEHATAN yang jelas jika makanan tersebut berisiko bagi kondisi medis tertentu (contoh: Peringatan - Tinggi purin/kolesterol/gula, tidak cocok untuk penderita diabetes atau asam urat). Berikan respon yang akurat, berstruktur rapi, dan informatif.'
                    ]]
                ],
                'generationConfig' => [
                    'temperature' => 0.6,
                    'maxOutputTokens' => 1200
                ]
            ];

            $res = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", $payload);

            if ($res->failed()) {
                if ($res->status() === 429) {
                    abort(429, 'Too Many Requests from Gemini API');
                }
                Log::error('Gemini API Error: ' . $res->body());
                abort(500, 'Gagal terhubung ke API AI.');
            }

            $data = $res->json();
            return $data['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, saya sedang merapikan dapur.";
        });

        return response()->json([
            'success' => true,
            'reply' => $response,
            'cached' => $isCached
        ]);
    }

    public function recommend(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array',
            'ingredients.*' => 'string'
        ]);

        $ingredients = implode(', ', $request->input('ingredients'));
        $prompt = "Berikan 3 rekomendasi resep masakan yang bisa dibuat menggunakan bahan-bahan berikut: $ingredients.";
        
        $cacheKey = 'ai_recommend_' . md5(strtolower(trim($prompt)));
        $isCached = Cache::has($cacheKey);

        $response = Cache::remember($cacheKey, 86400, function () use ($prompt) {
            return $this->callGeminiApi($prompt);
        });

        return response()->json([
            'success' => true,
            'reply' => $response,
            'cached' => $isCached
        ]);
    }

    public function tips($recipeId)
    {
        // Try to fetch recipe if it exists, otherwise just ask for general tips for recipe ID
        $recipeTitle = "Resep ID $recipeId";
        try {
            $recipe = \App\Models\Recipe::find($recipeId);
            if ($recipe) {
                $recipeTitle = $recipe->title;
            }
        } catch (\Exception $e) {
            // Ignore
        }

        $prompt = "Berikan tips dan trik memasak khusus untuk resep: $recipeTitle.";
        
        $cacheKey = 'ai_tips_' . md5(strtolower(trim($prompt)));
        $isCached = Cache::has($cacheKey);

        $response = Cache::remember($cacheKey, 86400, function () use ($prompt) {
            return $this->callGeminiApi($prompt);
        });

        return response()->json([
            'success' => true,
            'reply' => $response,
            'cached' => $isCached
        ]);
    }

    private function callGeminiApi($prompt)
    {
        $apiKey = env('GEMINI_API_KEY');
        
        if (!$apiKey) {
            abort(500, 'Gemini API key is missing.');
        }

        $payload = [
            'contents' => [
                ['role' => 'user', 'parts' => [['text' => $prompt]]]
            ],
            'systemInstruction' => [
                'role' => 'system',
                'parts' => [[
                    'text' => 'Anda adalah ChefAI, asisten koki ahli nutrisi dari CookEdu. Anda WAJIB menjelaskan tutorial memasak secara sangat detail. Jangan pernah menyebutkan instruksi umum seperti "siapkan bahan masakan", tetapi sebutkan bahan baku satu per satu secara presisi (contoh: 4 siung bawang merah, 250 gram dada ayam, dll). Di setiap resep yang dibahas, Anda WAJIB secara otomatis menghitung estimasi kalori, lemak, protein, dan karbohidrat. Berikan juga PERINGATAN KESEHATAN yang jelas jika makanan tersebut berisiko bagi kondisi medis tertentu.'
                ]]
            ],
            'generationConfig' => [
                'temperature' => 0.6,
                'maxOutputTokens' => 1200
            ]
        ];

        $res = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", $payload);

        if ($res->failed()) {
            if ($res->status() === 429) {
                abort(429, 'Too Many Requests from Gemini API');
            }
            Log::error('Gemini API Error: ' . $res->body());
            abort(500, 'Gagal terhubung ke API AI.');
        }

        $data = $res->json();
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? "Maaf, saya sedang merapikan dapur.";
    }
}
