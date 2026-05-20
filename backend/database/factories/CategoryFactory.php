<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Appetizers',
            'Main Course',
            'Desserts',
            'Beverages',
            'Salads',
            'Soups',
            'Breakfast',
            'Snacks',
            'Vegetarian',
            'Seafood',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'icon' => fake()->randomElement(['🍽️', '🥗', '🍰', '🥤', '🍜', '🥘']),
            'order_index' => fake()->numberBetween(1, 100),
        ];
    }
}
