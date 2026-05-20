<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Recipe;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RecipeControllerPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test category
        Category::factory()->create(['id' => 1]);
        
        // Create a test admin user
        User::factory()->create([
            'id' => 1,
            'role' => 'admin',
        ]);
    }

    /**
     * Test that recipe index returns desktop-specific fields when X-Platform is desktop.
     */
    public function test_recipe_index_returns_desktop_fields_for_desktop_platform(): void
    {
        // Create test recipes
        Recipe::factory()->count(3)->create([
            'moderation_status' => 'approved',
        ]);

        $response = $this->getJson('/api/recipes', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that desktop-specific fields are present
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'description',
                    'rating',
                    'review_count',
                    'is_bookmarked',
                    'is_favorited',
                    'formatted_cooking_time',
                    'difficulty_label',
                    'calories_per_serving',
                ]
            ]
        ]);
    }

    /**
     * Test that recipe index does NOT return desktop-specific fields for android platform.
     */
    public function test_recipe_index_excludes_desktop_fields_for_android_platform(): void
    {
        // Create test recipes
        Recipe::factory()->count(3)->create([
            'moderation_status' => 'approved',
        ]);

        $response = $this->getJson('/api/recipes', [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        
        // Get the first recipe data
        $firstRecipe = $response->json('data.0');
        
        // Check that desktop-specific fields are NOT present
        $this->assertArrayNotHasKey('rating', $firstRecipe);
        $this->assertArrayNotHasKey('review_count', $firstRecipe);
        $this->assertArrayNotHasKey('is_bookmarked', $firstRecipe);
        $this->assertArrayNotHasKey('is_favorited', $firstRecipe);
        $this->assertArrayNotHasKey('formatted_cooking_time', $firstRecipe);
        $this->assertArrayNotHasKey('difficulty_label', $firstRecipe);
        $this->assertArrayNotHasKey('calories_per_serving', $firstRecipe);
    }

    /**
     * Test that recipe show returns desktop-specific fields and metadata for desktop platform.
     */
    public function test_recipe_show_returns_desktop_fields_and_metadata_for_desktop_platform(): void
    {
        $recipe = Recipe::factory()->create([
            'moderation_status' => 'approved',
        ]);

        $response = $this->getJson("/api/recipes/{$recipe->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that desktop-specific fields are present
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'rating',
                'review_count',
                'is_bookmarked',
                'is_favorited',
                'formatted_cooking_time',
                'difficulty_label',
                'calories_per_serving',
            ],
            'meta' => [
                'platform',
                'layout',
            ]
        ]);
        
        // Check metadata values
        $response->assertJson([
            'meta' => [
                'platform' => 'desktop',
                'layout' => 'grid',
            ]
        ]);
    }

    /**
     * Test that recipe show does NOT return desktop-specific fields for android platform.
     */
    public function test_recipe_show_excludes_desktop_fields_for_android_platform(): void
    {
        $recipe = Recipe::factory()->create([
            'moderation_status' => 'approved',
        ]);

        $response = $this->getJson("/api/recipes/{$recipe->id}", [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        
        // Get the recipe data
        $recipeData = $response->json('data');
        
        // Check that desktop-specific fields are NOT present
        $this->assertArrayNotHasKey('rating', $recipeData);
        $this->assertArrayNotHasKey('review_count', $recipeData);
        $this->assertArrayNotHasKey('is_bookmarked', $recipeData);
        $this->assertArrayNotHasKey('is_favorited', $recipeData);
        $this->assertArrayNotHasKey('formatted_cooking_time', $recipeData);
        $this->assertArrayNotHasKey('difficulty_label', $recipeData);
        $this->assertArrayNotHasKey('calories_per_serving', $recipeData);
        
        // Check that metadata is NOT present for android
        $this->assertArrayNotHasKey('meta', $response->json());
    }

    /**
     * Test that recipe index defaults to desktop when no platform header is provided.
     * Per Requirement 12.1: When User-Agent cannot be detected, system defaults to desktop.
     */
    public function test_recipe_index_defaults_to_desktop_without_platform_header(): void
    {
        Recipe::factory()->count(3)->create([
            'moderation_status' => 'approved',
        ]);

        $response = $this->getJson('/api/recipes');

        $response->assertStatus(200);
        
        // Get the first recipe data
        $firstRecipe = $response->json('data.0');
        
        // Check that desktop-specific fields ARE present (desktop default)
        $this->assertArrayHasKey('rating', $firstRecipe);
        $this->assertArrayHasKey('review_count', $firstRecipe);
        $this->assertArrayHasKey('is_bookmarked', $firstRecipe);
        $this->assertArrayHasKey('is_favorited', $firstRecipe);
    }

    /**
     * Test that formatted_cooking_time is correctly formatted for desktop.
     */
    public function test_formatted_cooking_time_is_correct_for_desktop(): void
    {
        $recipe = Recipe::factory()->create([
            'moderation_status' => 'approved',
            'cooking_time' => 90, // 1 hour 30 minutes
        ]);

        $response = $this->getJson("/api/recipes/{$recipe->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'formatted_cooking_time' => '1 jam 30 menit',
            ]
        ]);
    }

    /**
     * Test that difficulty_label is correctly translated for desktop.
     */
    public function test_difficulty_label_is_translated_for_desktop(): void
    {
        $recipe = Recipe::factory()->create([
            'moderation_status' => 'approved',
            'difficulty' => 'beginner',
        ]);

        $response = $this->getJson("/api/recipes/{$recipe->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'difficulty_label' => 'Mudah',
            ]
        ]);
    }
}
