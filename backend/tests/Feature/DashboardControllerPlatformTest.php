<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Recipe;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Category;
use App\Models\QuizResult;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardControllerPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test category
        Category::factory()->create(['id' => 1]);
        
        // Create a test admin user
        $admin = User::factory()->create([
            'id' => 1,
            'role' => 'admin',
        ]);
        
        // Authenticate as admin
        $this->actingAs($admin);
    }

    /**
     * Test that dashboard stats returns desktop-specific fields when X-Platform is desktop.
     */
    public function test_dashboard_stats_returns_desktop_fields_for_desktop_platform(): void
    {
        // Create test data
        Recipe::factory()->count(5)->create(['is_published' => true]);
        Lesson::factory()->count(3)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that desktop-specific fields are present
        $response->assertJsonStructure([
            'stats' => [
                'total_users',
                'total_admins',
                'total_recipes',
                'published_recipes',
                'total_lessons',
                'new_users_this_month',
                'quiz_completions',
            ],
            'display' => [
                'total_users_formatted',
                'total_recipes_formatted',
                'total_lessons_formatted',
                'new_users_growth',
            ],
            'recommended_recipes',
            'recommended_lessons',
            'completion_stats' => [
                'total_quizzes',
                'passed_quizzes',
                'pass_rate',
            ],
            'trending_recipes',
            'meta' => [
                'platform',
                'layout',
                'version',
            ],
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
     * Test that dashboard stats does NOT return desktop-specific fields for android platform.
     */
    public function test_dashboard_stats_excludes_desktop_fields_for_android_platform(): void
    {
        // Create test data
        Recipe::factory()->count(5)->create(['is_published' => true]);
        Lesson::factory()->count(3)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        
        // Get the response data
        $responseData = $response->json();
        
        // Check that desktop-specific fields are NOT present
        $this->assertArrayNotHasKey('display', $responseData);
        $this->assertArrayNotHasKey('recommended_recipes', $responseData);
        $this->assertArrayNotHasKey('recommended_lessons', $responseData);
        $this->assertArrayNotHasKey('completion_stats', $responseData);
        $this->assertArrayNotHasKey('trending_recipes', $responseData);
        $this->assertArrayNotHasKey('meta', $responseData);
        
        // Check that base fields ARE present
        $this->assertArrayHasKey('stats', $responseData);
        $this->assertArrayHasKey('popular_recipes', $responseData);
        $this->assertArrayHasKey('recent_activity', $responseData);
        $this->assertArrayHasKey('user_growth', $responseData);
        $this->assertArrayHasKey('difficulty_distribution', $responseData);
    }

    /**
     * Test that dashboard stats defaults to desktop when no platform header is provided.
     */
    public function test_dashboard_stats_defaults_to_desktop_without_platform_header(): void
    {
        Recipe::factory()->count(5)->create(['is_published' => true]);
        Lesson::factory()->count(3)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertStatus(200);
        
        // Get the response data
        $responseData = $response->json();
        
        // Check that desktop-specific fields ARE present (desktop default)
        $this->assertArrayHasKey('display', $responseData);
        $this->assertArrayHasKey('recommended_recipes', $responseData);
        $this->assertArrayHasKey('recommended_lessons', $responseData);
        $this->assertArrayHasKey('completion_stats', $responseData);
        $this->assertArrayHasKey('trending_recipes', $responseData);
        $this->assertArrayHasKey('meta', $responseData);
    }

    /**
     * Test that formatted display fields are correctly formatted for desktop.
     */
    public function test_formatted_display_fields_are_correct_for_desktop(): void
    {
        // Create test data
        User::factory()->count(1000)->create(['role' => 'user']);
        Recipe::factory()->count(500)->create(['is_published' => true]);
        Lesson::factory()->count(50)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that numbers are formatted with commas
        $display = $response->json('display');
        $this->assertStringContainsString(',', $display['total_users_formatted']);
        $this->assertStringContainsString(',', $display['total_recipes_formatted']);
    }

    /**
     * Test that recommended recipes are limited to 3 for desktop.
     */
    public function test_recommended_recipes_are_limited_to_three_for_desktop(): void
    {
        // Create more than 3 recipes
        Recipe::factory()->count(10)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that only 3 recommended recipes are returned
        $recommendedRecipes = $response->json('recommended_recipes');
        $this->assertCount(3, $recommendedRecipes);
    }

    /**
     * Test that recommended lessons are limited to 3 for desktop.
     */
    public function test_recommended_lessons_are_limited_to_three_for_desktop(): void
    {
        // Create more than 3 lessons
        Lesson::factory()->count(10)->create(['is_published' => true]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that only 3 recommended lessons are returned
        $recommendedLessons = $response->json('recommended_lessons');
        $this->assertCount(3, $recommendedLessons);
    }

    /**
     * Test that trending recipes only include recipes from last 7 days for desktop.
     */
    public function test_trending_recipes_only_include_recent_recipes_for_desktop(): void
    {
        // Create old recipes (more than 7 days ago)
        Recipe::factory()->count(3)->create([
            'is_published' => true,
            'created_at' => now()->subDays(10),
        ]);
        
        // Create recent recipes (within last 7 days)
        Recipe::factory()->count(2)->create([
            'is_published' => true,
            'created_at' => now()->subDays(3),
        ]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that only 2 trending recipes are returned (the recent ones)
        $trendingRecipes = $response->json('trending_recipes');
        $this->assertCount(2, $trendingRecipes);
    }

    /**
     * Test that growth percentage is calculated correctly for desktop.
     */
    public function test_growth_percentage_is_calculated_correctly_for_desktop(): void
    {
        // Create 100 total users
        User::factory()->count(90)->create([
            'role' => 'user',
            'created_at' => now()->subMonths(2),
        ]);
        
        // Create 10 new users this month (10% growth)
        User::factory()->count(10)->create([
            'role' => 'user',
            'created_at' => now()->subDays(5),
        ]);

        $response = $this->getJson('/api/admin/dashboard', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that growth percentage is calculated correctly
        $display = $response->json('display');
        $this->assertEquals('+10%', $display['new_users_growth']);
    }
}
