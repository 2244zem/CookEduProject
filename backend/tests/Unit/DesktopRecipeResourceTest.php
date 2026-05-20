<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Recipe;
use App\Models\User;
use App\Models\Category;
use App\Http\Resources\Platform\DesktopRecipeResource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

class DesktopRecipeResourceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that DesktopRecipeResource includes all base fields from RecipeResource.
     */
    public function test_includes_base_recipe_fields(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $recipe = Recipe::factory()->create([
            'title' => 'Test Recipe',
            'difficulty' => 'beginner',
            'cooking_time' => 30,
            'created_by' => $user->id,
            'category_id' => $category->id,
            'nutritional_info' => ['calories' => 500],
            'servings' => 2,
        ]);
        
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        // Assert base fields exist
        $this->assertArrayHasKey('id', $array);
        $this->assertArrayHasKey('title', $array);
        $this->assertArrayHasKey('slug', $array);
        $this->assertArrayHasKey('description', $array);
        $this->assertArrayHasKey('difficulty', $array);
        $this->assertArrayHasKey('cooking_time', $array);
        $this->assertArrayHasKey('category', $array);
        $this->assertArrayHasKey('creator', $array);
        
        $this->assertEquals('Test Recipe', $array['title']);
        $this->assertEquals('beginner', $array['difficulty']);
        $this->assertEquals(30, $array['cooking_time']);
    }

    /**
     * Test that DesktopRecipeResource includes desktop-specific fields.
     */
    public function test_includes_desktop_specific_fields(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $recipe = Recipe::factory()->create([
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        // Assert desktop-specific fields exist
        $this->assertArrayHasKey('rating', $array);
        $this->assertArrayHasKey('review_count', $array);
        $this->assertArrayHasKey('is_bookmarked', $array);
        $this->assertArrayHasKey('is_favorited', $array);
        
        // Assert types
        $this->assertIsFloat($array['rating']);
        $this->assertIsInt($array['review_count']);
        $this->assertIsBool($array['is_bookmarked']);
        $this->assertIsBool($array['is_favorited']);
    }

    /**
     * Test that DesktopRecipeResource includes formatted display fields.
     */
    public function test_includes_formatted_display_fields(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $recipe = Recipe::factory()->create([
            'difficulty' => 'intermediate',
            'cooking_time' => 90,
            'nutritional_info' => ['calories' => 600],
            'servings' => 3,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        // Assert formatted fields exist
        $this->assertArrayHasKey('formatted_cooking_time', $array);
        $this->assertArrayHasKey('difficulty_label', $array);
        $this->assertArrayHasKey('calories_per_serving', $array);
        
        // Assert correct formatting
        $this->assertEquals('1 jam 30 menit', $array['formatted_cooking_time']);
        $this->assertEquals('Sedang', $array['difficulty_label']);
        $this->assertEquals(200, $array['calories_per_serving']); // 600 / 3
    }

    /**
     * Test formatted_cooking_time for various durations.
     */
    public function test_formatted_cooking_time_variations(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        // Test less than 60 minutes
        $recipe1 = Recipe::factory()->create([
            'cooking_time' => 45,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        $recipe1->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource1 = new DesktopRecipeResource($recipe1);
        $array1 = $resource1->toArray($request);
        $this->assertEquals('45 menit', $array1['formatted_cooking_time']);
        
        // Test exactly 60 minutes
        $recipe2 = Recipe::factory()->create([
            'cooking_time' => 60,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        $recipe2->load('category', 'creator');
        
        $resource2 = new DesktopRecipeResource($recipe2);
        $array2 = $resource2->toArray($request);
        $this->assertEquals('1 jam', $array2['formatted_cooking_time']);
        
        // Test more than 60 minutes with remainder
        $recipe3 = Recipe::factory()->create([
            'cooking_time' => 125,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        $recipe3->load('category', 'creator');
        
        $resource3 = new DesktopRecipeResource($recipe3);
        $array3 = $resource3->toArray($request);
        $this->assertEquals('2 jam 5 menit', $array3['formatted_cooking_time']);
    }

    /**
     * Test difficulty_label for all difficulty levels.
     */
    public function test_difficulty_label_variations(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $difficulties = [
            'beginner' => 'Mudah',
            'intermediate' => 'Sedang',
            'advanced' => 'Sulit',
        ];
        
        foreach ($difficulties as $difficulty => $expectedLabel) {
            $recipe = Recipe::factory()->create([
                'difficulty' => $difficulty,
                'created_by' => $user->id,
                'category_id' => $category->id,
            ]);
            $recipe->load('category', 'creator');
            
            $request = Request::create('/api/recipes', 'GET');
            $resource = new DesktopRecipeResource($recipe);
            $array = $resource->toArray($request);
            
            $this->assertEquals($expectedLabel, $array['difficulty_label']);
        }
    }

    /**
     * Test calories_per_serving calculation.
     */
    public function test_calories_per_serving_calculation(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $recipe = Recipe::factory()->create([
            'nutritional_info' => ['calories' => 800],
            'servings' => 4,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        $this->assertEquals(200, $array['calories_per_serving']); // 800 / 4
    }

    /**
     * Test calories_per_serving returns 0 when nutritional_info is missing.
     */
    public function test_calories_per_serving_with_missing_nutrition(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        // Create recipe with minimal ingredients to get low calories
        $recipe = Recipe::factory()->create([
            'ingredients' => [], // Empty ingredients array
            'nutritional_info' => [], // This will remain empty since no ingredients
            'servings' => 2,
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        
        // Manually update to ensure nutritional_info has no calories key
        $recipe->update(['nutritional_info' => ['protein' => 0, 'carbs' => 0, 'fat' => 0]]);
        $recipe->refresh();
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        $this->assertEquals(0, $array['calories_per_serving']);
    }

    /**
     * Test that is_bookmarked and is_favorited return false when user is not authenticated.
     */
    public function test_bookmark_and_favorite_false_when_not_authenticated(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        $recipe = Recipe::factory()->create([
            'created_by' => $user->id,
            'category_id' => $category->id,
        ]);
        $recipe->load('category', 'creator');
        
        $request = Request::create('/api/recipes', 'GET');
        $resource = new DesktopRecipeResource($recipe);
        $array = $resource->toArray($request);
        
        $this->assertFalse($array['is_bookmarked']);
        $this->assertFalse($array['is_favorited']);
    }
}
