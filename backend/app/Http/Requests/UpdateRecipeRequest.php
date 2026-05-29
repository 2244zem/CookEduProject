<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|min:10',
            'difficulty' => 'sometimes|required|in:beginner,intermediate,advanced',
            'cooking_time' => 'sometimes|required|integer|min:1',
            'prep_time' => 'nullable|integer|min:0',
            'servings' => 'nullable|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_published' => 'nullable|boolean',

            // Strict JSON validation for ingredients
            'ingredients' => 'sometimes|required|array|min:1',
            'ingredients.*.item' => 'required_with:ingredients|string|max:255',
            'ingredients.*.amount' => 'required_with:ingredients|string|max:100',
            'ingredients.*.unit' => 'nullable|string|max:50',
            'ingredients.*.calories' => 'nullable|numeric|min:0',
            'ingredients.*.protein' => 'nullable|numeric|min:0',
            'ingredients.*.carbs' => 'nullable|numeric|min:0',
            'ingredients.*.fat' => 'nullable|numeric|min:0',

            // Strict JSON validation for steps
            'steps' => 'sometimes|required|array|min:1',
            'steps.*.instruction' => 'required_with:steps|string|min:5',
            'steps.*.duration' => 'nullable|integer|min:0',
            'steps.*.image' => 'nullable|string',
            'steps.*.tip' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'ingredients.*.item.required_with' => 'Nama bahan wajib diisi.',
            'ingredients.*.amount.required_with' => 'Jumlah bahan wajib diisi.',
            'steps.*.instruction.required_with' => 'Instruksi langkah wajib diisi.',
        ];
    }
}
