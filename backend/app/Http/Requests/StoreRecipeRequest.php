<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'cooking_time' => 'required|integer|min:1',
            'prep_time' => 'nullable|integer|min:0',
            'servings' => 'nullable|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_published' => 'nullable|boolean',

            // Strict JSON validation for ingredients
            'ingredients' => 'required|array|min:1',
            'ingredients.*.item' => 'required|string|max:255',
            'ingredients.*.amount' => 'required|string|max:100',
            'ingredients.*.unit' => 'nullable|string|max:50',
            'ingredients.*.calories' => 'nullable|numeric|min:0',
            'ingredients.*.protein' => 'nullable|numeric|min:0',
            'ingredients.*.carbs' => 'nullable|numeric|min:0',
            'ingredients.*.fat' => 'nullable|numeric|min:0',

            // Strict JSON validation for steps
            'steps' => 'required|array|min:1',
            'steps.*.instruction' => 'required|string|min:5',
            'steps.*.duration' => 'nullable|integer|min:0',
            'steps.*.image' => 'nullable|string',
            'steps.*.tip' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'ingredients.required' => 'Minimal satu bahan harus diisi.',
            'ingredients.*.item.required' => 'Nama bahan wajib diisi.',
            'ingredients.*.amount.required' => 'Jumlah bahan wajib diisi.',
            'steps.required' => 'Minimal satu langkah harus diisi.',
            'steps.*.instruction.required' => 'Instruksi langkah wajib diisi.',
            'steps.*.instruction.min' => 'Instruksi langkah minimal 5 karakter.',
        ];
    }
}
