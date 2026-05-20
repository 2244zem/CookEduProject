<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PlatformDetectionIntegrationTest extends TestCase
{
    /**
     * Test that platform detection middleware can be applied to routes.
     */
    public function test_middleware_can_be_applied_to_routes(): void
    {
        // Create a test route with the middleware
        $this->app['router']->get('/test-platform', function () {
            return response()->json([
                'platform' => request()->attributes->get('platform')
            ]);
        })->middleware(\App\Http\Middleware\DetectPlatform::class);

        $response = $this->getJson('/test-platform', [
            'X-Platform' => 'desktop'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['platform' => 'desktop']);
    }

    /**
     * Test that middleware works with Android platform.
     */
    public function test_middleware_works_with_android_platform(): void
    {
        $this->app['router']->get('/test-android', function () {
            return response()->json([
                'platform' => request()->attributes->get('platform')
            ]);
        })->middleware(\App\Http\Middleware\DetectPlatform::class);

        $response = $this->getJson('/test-android', [
            'X-Platform' => 'android'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['platform' => 'android']);
    }

    /**
     * Test that middleware works with tablet platform.
     */
    public function test_middleware_works_with_tablet_platform(): void
    {
        $this->app['router']->get('/test-tablet', function () {
            return response()->json([
                'platform' => request()->attributes->get('platform')
            ]);
        })->middleware(\App\Http\Middleware\DetectPlatform::class);

        $response = $this->getJson('/test-tablet', [
            'X-Platform' => 'tablet'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['platform' => 'tablet']);
    }

    /**
     * Test that middleware detects platform from User-Agent when header is missing.
     */
    public function test_middleware_detects_from_user_agent(): void
    {
        $this->app['router']->get('/test-ua', function () {
            return response()->json([
                'platform' => request()->attributes->get('platform')
            ]);
        })->middleware(\App\Http\Middleware\DetectPlatform::class);

        $response = $this->getJson('/test-ua', [
            'User-Agent' => 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 Mobile Safari/537.36'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['platform' => 'android']);
    }

    /**
     * Test that invalid platform defaults to android.
     */
    public function test_invalid_platform_defaults_to_android(): void
    {
        $this->app['router']->get('/test-invalid', function () {
            return response()->json([
                'platform' => request()->attributes->get('platform')
            ]);
        })->middleware(\App\Http\Middleware\DetectPlatform::class);

        $response = $this->getJson('/test-invalid', [
            'X-Platform' => 'invalid-value'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['platform' => 'android']);
    }
}
