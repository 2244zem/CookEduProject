<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'image_url',
        'difficulty',
        'ingredients',
        'steps',
        'cooking_time',
        'prep_time',
        'servings',
        'nutritional_info',
        'category_id',
        'created_by',
        'is_published',
    ];

    /**
     * Cast JSON/JSONB fields properly.
     */
    protected function casts(): array
    {
        return [
            'ingredients' => 'array',
            'steps' => 'array',
            'nutritional_info' => 'array',
            'is_published' => 'boolean',
        ];
    }

    /**
     * The admin who created this recipe.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Recipe category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Calculate total nutrition from ingredients.
     * Each ingredient should have: {item, amount, unit, calories, protein, carbs, fat}
     */
    public function calculateNutrition(): array
    {
        $nutrition = [
            'calories' => 0,
            'protein' => 0,
            'carbs' => 0,
            'fat' => 0,
        ];

        if (!is_array($this->ingredients)) {
            return $nutrition;
        }

        foreach ($this->ingredients as $ingredient) {
            // Simplified logic: mapping common ingredients to standard values
            // In a real app, this would use a database of nutritional values
            $item = strtolower($ingredient['item'] ?? '');
            $amount = (float) ($ingredient['amount'] ?? 0);
            
            if (str_contains($item, 'ayam') || str_contains($item, 'chicken')) {
                $nutrition['calories'] += ($amount / 100) * 239;
                $nutrition['protein'] += ($amount / 100) * 27;
                $nutrition['fat'] += ($amount / 100) * 14;
            } elseif (str_contains($item, 'nasi') || str_contains($item, 'rice')) {
                $nutrition['calories'] += ($amount / 100) * 130;
                $nutrition['carbs'] += ($amount / 100) * 28;
                $nutrition['protein'] += ($amount / 100) * 2.7;
            } elseif (str_contains($item, 'telur') || str_contains($item, 'egg')) {
                $nutrition['calories'] += ($amount / 50) * 78; // assuming 50g per egg
                $nutrition['protein'] += ($amount / 50) * 6;
                $nutrition['fat'] += ($amount / 50) * 5;
            } else {
                // Default fallback from ingredient fields if they exist
                $nutrition['calories'] += (float) ($ingredient['calories'] ?? 0);
                $nutrition['protein'] += (float) ($ingredient['protein'] ?? 0);
                $nutrition['carbs'] += (float) ($ingredient['carbs'] ?? 0);
                $nutrition['fat'] += (float) ($ingredient['fat'] ?? 0);
            }
        }

        return [
            'calories' => round($nutrition['calories']),
            'protein' => round($nutrition['protein'], 1),
            'carbs' => round($nutrition['carbs'], 1),
            'fat' => round($nutrition['fat'], 1),
        ];
    }

    /**
     * Auto-generate slug from title.
     */
    protected static function booted(): void
    {
        static::creating(function (Recipe $recipe) {
            if (empty($recipe->slug)) {
                $recipe->slug = \Illuminate\Support\Str::slug($recipe->title);

                // Ensure unique slug
                $count = static::withTrashed()->where('slug', 'like', $recipe->slug . '%')->count();
                if ($count > 0) {
                    $recipe->slug .= '-' . ($count + 1);
                }
            }

            // Auto-calculate nutrition if not provided
            if (empty($recipe->nutritional_info)) {
                $recipe->nutritional_info = $recipe->calculateNutrition();
            }
        });

        static::updating(function (Recipe $recipe) {
            if ($recipe->isDirty('ingredients') && !$recipe->isDirty('nutritional_info')) {
                $recipe->nutritional_info = $recipe->calculateNutrition();
            }
        });
    }
}
