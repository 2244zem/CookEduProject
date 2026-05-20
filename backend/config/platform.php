<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supported Platforms
    |--------------------------------------------------------------------------
    |
    | This array defines the platforms supported by the CookEdu API.
    | Valid platform values that can be detected from X-Platform header
    | or User-Agent string.
    |
    */

    'supported_platforms' => [
        'android',
        'desktop',
        'tablet',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Platform
    |--------------------------------------------------------------------------
    |
    | The default platform to use when platform detection fails or
    | no platform information is provided in the request.
    |
    */

    'default_platform' => env('DEFAULT_PLATFORM', 'android'),

    /*
    |--------------------------------------------------------------------------
    | Platform Features
    |--------------------------------------------------------------------------
    |
    | Define which features are enabled for each platform.
    | This allows platform-specific functionality to be toggled
    | without code changes.
    |
    */

    'features' => [
        'android' => [
            'basic_recipe_view',
            'basic_lesson_view',
            'authentication',
            'chef_ai',
            'categories',
        ],
        'desktop' => [
            'basic_recipe_view',
            'basic_lesson_view',
            'authentication',
            'chef_ai',
            'categories',
            'recipe_ratings',
            'recipe_bookmarks',
            'recipe_favorites',
            'lesson_progress',
            'lesson_completion',
            'related_lessons',
            'advanced_dashboard',
        ],
        'tablet' => [
            'basic_recipe_view',
            'basic_lesson_view',
            'authentication',
            'chef_ai',
            'categories',
            'recipe_ratings',
            'lesson_progress',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform Response Fields
    |--------------------------------------------------------------------------
    |
    | Define which fields should be included in API responses for each
    | platform. This allows fine-grained control over response payloads
    | to optimize bandwidth and provide platform-appropriate data.
    |
    */

    'response_fields' => [
        'recipe' => [
            'android' => [
                // Base fields for Android
                'id',
                'title',
                'slug',
                'description',
                'image_url',
                'difficulty',
                'cooking_time',
                'servings',
                'ingredients',
                'instructions',
                'nutritional_info',
                'category',
                'creator',
                'is_system',
                'created_at',
                'updated_at',
            ],
            'desktop' => [
                // Base fields + desktop-specific fields
                'id',
                'title',
                'slug',
                'description',
                'image_url',
                'difficulty',
                'cooking_time',
                'servings',
                'ingredients',
                'instructions',
                'nutritional_info',
                'category',
                'creator',
                'is_system',
                'created_at',
                'updated_at',
                // Desktop-specific fields
                'rating',
                'review_count',
                'is_bookmarked',
                'is_favorited',
                'display', // Formatted display fields
            ],
            'tablet' => [
                // Base fields + some desktop fields
                'id',
                'title',
                'slug',
                'description',
                'image_url',
                'difficulty',
                'cooking_time',
                'servings',
                'ingredients',
                'instructions',
                'nutritional_info',
                'category',
                'creator',
                'is_system',
                'created_at',
                'updated_at',
                'rating',
                'review_count',
            ],
        ],

        'lesson' => [
            'android' => [
                // Base fields for Android
                'id',
                'title',
                'slug',
                'video_url',
                'thumbnail',
                'content',
                'summary',
                'duration',
                'level',
                'category',
                'is_published',
                'prerequisite',
                'created_at',
                'updated_at',
            ],
            'desktop' => [
                // Base fields + desktop-specific fields
                'id',
                'title',
                'slug',
                'video_url',
                'thumbnail',
                'content',
                'summary',
                'duration',
                'level',
                'category',
                'is_published',
                'prerequisite',
                'created_at',
                'updated_at',
                // Desktop-specific fields
                'progress',
                'is_completed',
                'related_lessons',
            ],
            'tablet' => [
                // Base fields + progress tracking
                'id',
                'title',
                'slug',
                'video_url',
                'thumbnail',
                'content',
                'summary',
                'duration',
                'level',
                'category',
                'is_published',
                'prerequisite',
                'created_at',
                'updated_at',
                'progress',
                'is_completed',
            ],
        ],

        'user' => [
            'android' => [
                'id',
                'name',
                'email',
                'role',
                'created_at',
            ],
            'desktop' => [
                'id',
                'name',
                'email',
                'avatar_url',
                'role',
                'created_at',
                'stats', // User statistics for desktop
            ],
            'tablet' => [
                'id',
                'name',
                'email',
                'avatar_url',
                'role',
                'created_at',
            ],
        ],

        'dashboard' => [
            'android' => [
                'total_recipes',
                'total_lessons',
                'user_progress',
            ],
            'desktop' => [
                'total_recipes',
                'total_lessons',
                'user_progress',
                'recent_activity',
                'recommended_recipes',
                'recommended_lessons',
                'completion_stats',
                'trending_recipes',
            ],
            'tablet' => [
                'total_recipes',
                'total_lessons',
                'user_progress',
                'recent_activity',
                'recommended_recipes',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform Layout Configuration
    |--------------------------------------------------------------------------
    |
    | Define layout preferences and display settings for each platform.
    | This helps the frontend understand how to render content.
    |
    */

    'layout' => [
        'android' => [
            'version' => '1.0.0',
            'grid_columns' => 1,
            'card_style' => 'compact',
            'navigation' => 'bottom_tabs',
        ],
        'desktop' => [
            'version' => '1.0.0',
            'grid_columns' => [
                'mobile' => 1,
                'tablet' => 2,
                'desktop' => 3,
                'wide' => 4,
            ],
            'card_style' => 'detailed',
            'navigation' => 'sidebar',
        ],
        'tablet' => [
            'version' => '1.0.0',
            'grid_columns' => 2,
            'card_style' => 'medium',
            'navigation' => 'sidebar',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform User-Agent Patterns
    |--------------------------------------------------------------------------
    |
    | Regular expressions or string patterns used to detect platforms
    | from User-Agent headers when X-Platform header is not present.
    |
    */

    'user_agent_patterns' => [
        'android' => [
            'android',
            'mobile',
        ],
        'tablet' => [
            'ipad',
            'tablet',
        ],
        // Desktop is the default fallback
    ],

    /*
    |--------------------------------------------------------------------------
    | Platform API Version
    |--------------------------------------------------------------------------
    |
    | Track API version for each platform to support versioned APIs
    | and backward compatibility.
    |
    */

    'api_version' => [
        'android' => '1.0.0',
        'desktop' => '1.0.0',
        'tablet' => '1.0.0',
    ],

];
