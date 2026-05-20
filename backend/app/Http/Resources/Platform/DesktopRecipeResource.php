<?php

namespace App\Http\Resources\Platform;

use Illuminate\Http\Request;
use App\Http\Resources\RecipeResource;

class DesktopRecipeResource extends RecipeResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        
        // Add desktop-specific fields
        $data['rating'] = $this->calculateRating();
        $data['review_count'] = $this->calculateReviewCount();
        $data['is_bookmarked'] = $this->isBookmarkedBy($request->user()?->id);
        $data['is_favorited'] = $this->isFavoritedBy($request->user()?->id);
        
        // Add formatted display fields for desktop
        $data['formatted_cooking_time'] = $this->formatCookingTime();
        $data['difficulty_label'] = $this->getDifficultyLabel();
        $data['calories_per_serving'] = $this->calculateCaloriesPerServing();
        
        return $data;
    }
    
    /**
     * Calculate average rating for the recipe.
     * Placeholder implementation - returns 0 until reviews table is created.
     *
     * @return float
     */
    private function calculateRating(): float
    {
        // TODO: Implement when reviews table is created
        // return round($this->resource->reviews()->avg('rating') ?? 0, 1);
        return 0.0;
    }
    
    /**
     * Calculate total review count for the recipe.
     * Placeholder implementation - returns 0 until reviews table is created.
     *
     * @return int
     */
    private function calculateReviewCount(): int
    {
        // TODO: Implement when reviews table is created
        // return $this->resource->reviews()->count() ?? 0;
        return 0;
    }
    
    /**
     * Check if the recipe is bookmarked by the given user.
     * Placeholder implementation - returns false until bookmarks table is created.
     *
     * @param int|null $userId
     * @return bool
     */
    private function isBookmarkedBy(?int $userId): bool
    {
        if (!$userId) {
            return false;
        }
        
        // TODO: Implement when user_bookmarks table is created
        // return \DB::table('user_bookmarks')
        //     ->where('user_id', $userId)
        //     ->where('recipe_id', $this->resource->id)
        //     ->exists();
        return false;
    }
    
    /**
     * Check if the recipe is favorited by the given user.
     * Placeholder implementation - returns false until favorites table is created.
     *
     * @param int|null $userId
     * @return bool
     */
    private function isFavoritedBy(?int $userId): bool
    {
        if (!$userId) {
            return false;
        }
        
        // TODO: Implement when user_favorites table is created
        // return \DB::table('user_favorites')
        //     ->where('user_id', $userId)
        //     ->where('recipe_id', $this->resource->id)
        //     ->exists();
        return false;
    }
    
    /**
     * Format cooking time in a human-readable format.
     *
     * @return string
     */
    private function formatCookingTime(): string
    {
        $minutes = $this->resource->cooking_time;
        
        if ($minutes < 60) {
            return "{$minutes} menit";
        }
        
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        return $mins > 0 ? "{$hours} jam {$mins} menit" : "{$hours} jam";
    }
    
    /**
     * Get localized difficulty label.
     *
     * @return string
     */
    private function getDifficultyLabel(): string
    {
        return match($this->resource->difficulty) {
            'beginner' => 'Mudah',
            'intermediate' => 'Sedang',
            'advanced' => 'Sulit',
            default => 'Tidak Diketahui'
        };
    }
    
    /**
     * Calculate calories per serving.
     *
     * @return int
     */
    private function calculateCaloriesPerServing(): int
    {
        $nutrition = $this->resource->nutritional_info ?? [];
        $servings = $this->resource->servings ?? 1;
        
        return isset($nutrition['calories']) 
            ? (int) round($nutrition['calories'] / max($servings, 1))
            : 0;
    }
}
