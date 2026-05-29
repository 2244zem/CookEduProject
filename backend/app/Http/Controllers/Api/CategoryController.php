<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount(['recipes', 'lessons'])
            ->orderBy('order_index')
            ->get();
        return CategoryResource::collection($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'order_index' => 'nullable|integer|min:0',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $category = Category::create($validated);
        return response()->json(['message' => 'Kategori berhasil ditambahkan!', 'data' => new CategoryResource($category)], 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'order_index' => 'nullable|integer|min:0',
        ]);
        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $category->update($validated);
        return response()->json(['message' => 'Kategori berhasil diperbarui!', 'data' => new CategoryResource($category->fresh())]);
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
