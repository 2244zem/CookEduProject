<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Http\Resources\RecipeResource;
use App\Http\Resources\Platform\DesktopRecipeResource;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RecipeController extends Controller
{
    /**
     * List recipes with filters and search - platform-aware.
     */
    public function index(Request $request)
    {
        $query = Recipe::with(['category', 'creator'])
            ->where('moderation_status', 'approved');

        // Search by title or description
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        // Filter by difficulty
        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        // Filter by category
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter by cooking time range
        if ($maxTime = $request->query('max_cooking_time')) {
            $query->where('cooking_time', '<=', (int) $maxTime);
        }

        // Filter by ingredient (search in JSONB)
        if ($ingredient = $request->query('ingredient')) {
            $query->whereRaw(
                "EXISTS (SELECT 1 FROM jsonb_array_elements(ingredients) AS elem WHERE elem->>'item' ILIKE ?)",
                ["%{$ingredient}%"]
            );
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDir = $request->query('sort_dir', 'desc');
        $allowedSorts = ['title', 'cooking_time', 'difficulty', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $recipes = $query->paginate($request->query('per_page', 12));

        // Detect platform from request attributes (set by DetectPlatform middleware)
        $platform = $request->attributes->get('platform', 'android');
        
        // Return platform-appropriate resource
        if ($platform === 'desktop') {
            return DesktopRecipeResource::collection($recipes);
        }
        
        return RecipeResource::collection($recipes);
    }

    /**
     * Show a single recipe - platform-aware.
     */
    public function show(Request $request, Recipe $recipe)
    {
        $recipe->load(['category', 'creator']);

        // Detect platform from request attributes (set by DetectPlatform middleware)
        $platform = $request->attributes->get('platform', 'android');
        
        // Return platform-appropriate response
        if ($platform === 'desktop') {
            return response()->json([
                'data' => new DesktopRecipeResource($recipe),
                'meta' => [
                    'platform' => 'desktop',
                    'layout' => 'grid',
                ]
            ]);
        }
        
        return response()->json([
            'data' => new RecipeResource($recipe),
        ]);
    }

    /**
     * Get paginated steps for interactive cooking mode.
     */
    public function steps(Request $request, Recipe $recipe)
    {
        $steps = collect($recipe->steps);
        
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 1);
        
        $paginatedSteps = $steps->slice(($page - 1) * $perPage, $perPage)->values();
        
        return response()->json([
            'data' => $paginatedSteps,
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $steps->count(),
            'last_page' => ceil($steps->count() / $perPage),
        ]);
    }

    /**
     * Admin: Create a new recipe.
     */
    public function store(StoreRecipeRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $data['slug'] = Str::slug($data['title']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('recipes', 'public');
        }

        $recipe = Recipe::create($data);
        $recipe->load(['category', 'creator']);

        return response()->json([
            'message' => 'Resep berhasil ditambahkan!',
            'data' => new RecipeResource($recipe),
        ], 201);
    }

    /**
     * Admin: Update a recipe.
     */
    public function update(UpdateRecipeRequest $request, Recipe $recipe)
    {
        $data = $request->validated();
        $oldValues = $recipe->getRawOriginal();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($recipe->image_url && !str_starts_with($recipe->image_url, 'http')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($recipe->image_url);
            }
            $data['image_url'] = $request->file('image')->store('recipes', 'public');
        } else {
            // If image is present in request but not a file, it's likely the existing URL
            unset($data['image']);
        }

        $recipe->update($data);
        
        // Audit Log
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_recipe',
            'model_type' => Recipe::class,
            'model_id' => $recipe->id,
            'old_values' => $oldValues,
            'new_values' => $recipe->getChanges(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $recipe->load(['category', 'creator']);

        return response()->json([
            'message' => 'Resep berhasil diperbarui!',
            'data' => new RecipeResource($recipe->fresh()),
        ]);
    }

    /**
     * Admin: Soft delete a recipe.
     */
    public function destroy(Recipe $recipe)
    {
        $oldValues = $recipe->toArray();
        $recipe->delete();

        // Audit Log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deleted_recipe',
            'model_type' => Recipe::class,
            'model_id' => $recipe->id,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Resep berhasil dihapus (soft delete).',
        ]);
    }

    /**
     * Admin: Restore a soft-deleted recipe.
     */
    public function restore(int $id)
    {
        $recipe = Recipe::withTrashed()->findOrFail($id);
        $recipe->restore();

        // Audit Log
        \App\Models\AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'restored_recipe',
            'model_type' => Recipe::class,
            'model_id' => $recipe->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json([
            'message' => 'Resep berhasil dipulihkan!',
            'data' => new RecipeResource($recipe),
        ]);
    }

    /**
     * Admin: List all recipes including trashed (for management).
     */
    public function adminIndex(Request $request)
    {
        $query = Recipe::withTrashed()->with(['category', 'creator']);

        if ($search = $request->query('search')) {
            $query->where('title', 'ILIKE', "%{$search}%");
        }

        if ($status = $request->query('moderation_status')) {
            $query->where('moderation_status', $status);
        }

        $recipes = $query->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 15));

        return RecipeResource::collection($recipes);
    }

    /**
     * Admin: Update moderation status.
     */
    public function moderate(Request $request, Recipe $recipe)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $oldStatus = $recipe->moderation_status;
        $recipe->update([
            'moderation_status' => $request->status,
            'is_published' => $request->status === 'approved',
        ]);

        // Audit Log
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'moderated_recipe',
            'model_type' => Recipe::class,
            'model_id' => $recipe->id,
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $request->status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Status moderasi diperbarui menjadi ' . $request->status,
            'data' => new RecipeResource($recipe),
        ]);
    }
}
