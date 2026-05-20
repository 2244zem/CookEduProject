<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Lesson;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LessonControllerPlatformTest extends TestCase
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
     * Test that lesson index returns desktop-specific fields when X-Platform is desktop.
     */
    public function test_lesson_index_returns_desktop_fields_for_desktop_platform(): void
    {
        // Create test lessons
        Lesson::factory()->count(3)->create([
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/lessons', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that desktop-specific fields are present
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'slug',
                    'progress',
                    'is_completed',
                    'related_lessons',
                ]
            ]
        ]);
    }

    /**
     * Test that lesson index does NOT return desktop-specific fields for android platform.
     */
    public function test_lesson_index_excludes_desktop_fields_for_android_platform(): void
    {
        // Create test lessons
        Lesson::factory()->count(3)->create([
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/lessons', [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        
        // Get the first lesson data
        $firstLesson = $response->json('data.0');
        
        // Check that desktop-specific fields are NOT present
        // Note: progress and related_lessons should not be in the base LessonResource
        $this->assertArrayNotHasKey('progress', $firstLesson);
        $this->assertArrayNotHasKey('related_lessons', $firstLesson);
    }

    /**
     * Test that lesson show returns desktop-specific fields and metadata for desktop platform.
     */
    public function test_lesson_show_returns_desktop_fields_and_metadata_for_desktop_platform(): void
    {
        $user = User::factory()->create();
        
        $lesson = Lesson::factory()->create([
            'is_published' => true,
        ]);

        $response = $this->actingAs($user)->getJson("/api/lessons/{$lesson->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check that desktop-specific fields are present
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'slug',
                'progress',
                'is_completed',
                'related_lessons',
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
     * Test that lesson show does NOT return desktop-specific fields for android platform.
     */
    public function test_lesson_show_excludes_desktop_fields_for_android_platform(): void
    {
        $user = User::factory()->create();
        
        $lesson = Lesson::factory()->create([
            'is_published' => true,
        ]);

        $response = $this->actingAs($user)->getJson("/api/lessons/{$lesson->id}", [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        
        // Get the lesson data
        $lessonData = $response->json('data');
        
        // Check that desktop-specific fields are NOT present
        $this->assertArrayNotHasKey('progress', $lessonData);
        $this->assertArrayNotHasKey('related_lessons', $lessonData);
        
        // Check that metadata is NOT present for android
        $this->assertArrayNotHasKey('meta', $response->json());
    }

    /**
     * Test that lesson index defaults to desktop when no platform header is provided.
     * Per Requirement 12.1: When User-Agent cannot be detected, system defaults to desktop.
     */
    public function test_lesson_index_defaults_to_desktop_without_platform_header(): void
    {
        Lesson::factory()->count(3)->create([
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/lessons');

        $response->assertStatus(200);
        
        // Get the first lesson data
        $firstLesson = $response->json('data.0');
        
        // Check that desktop-specific fields ARE present (desktop default)
        $this->assertArrayHasKey('progress', $firstLesson);
        $this->assertArrayHasKey('is_completed', $firstLesson);
        $this->assertArrayHasKey('related_lessons', $firstLesson);
    }

    /**
     * Test that progress field contains expected structure for desktop.
     */
    public function test_progress_field_has_correct_structure_for_desktop(): void
    {
        $user = User::factory()->create();
        
        $lesson = Lesson::factory()->create([
            'is_published' => true,
        ]);

        $response = $this->actingAs($user)->getJson("/api/lessons/{$lesson->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        // Check progress structure
        $response->assertJsonStructure([
            'data' => [
                'progress' => [
                    'completed',
                    'attempts',
                    'best_score',
                    'last_attempt_at',
                ]
            ]
        ]);
    }

    /**
     * Test that related_lessons field is an array for desktop.
     */
    public function test_related_lessons_is_array_for_desktop(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        // Create main lesson and related lessons in the same category
        $lesson = Lesson::factory()->create([
            'is_published' => true,
            'category_id' => $category->id,
        ]);
        
        Lesson::factory()->count(3)->create([
            'is_published' => true,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->getJson("/api/lessons/{$lesson->id}", [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        
        $lessonData = $response->json('data');
        
        // Check that related_lessons is an array
        $this->assertIsArray($lessonData['related_lessons']);
        
        // Check that related lessons have expected structure
        if (count($lessonData['related_lessons']) > 0) {
            $this->assertArrayHasKey('id', $lessonData['related_lessons'][0]);
            $this->assertArrayHasKey('title', $lessonData['related_lessons'][0]);
            $this->assertArrayHasKey('slug', $lessonData['related_lessons'][0]);
        }
    }
}
