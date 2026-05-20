<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Lesson;
use App\Models\Recipe;
use App\Models\User;
use App\Models\QuizResult;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Admin dashboard statistics.
     */
    public function stats(Request $request)
    {
        // Detect platform from request attributes
        $platform = $request->attributes->get('platform', 'android');

        $totalUsers = User::where('role', 'user')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalRecipes = Recipe::count();
        $totalLessons = Lesson::where('is_published', true)->count();
        $publishedRecipes = Recipe::where('is_published', true)->count();

        // New users this month
        $newUsersThisMonth = User::where('role', 'user')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // Most popular recipes (could be by views, but we'll use recent)
        $popularRecipes = Recipe::where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'title', 'slug', 'difficulty', 'cooking_time']);

        // Recent activity
        $recentActivity = AuditLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // User growth data (last 6 months)
        $userGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $userGrowth[] = [
                'month' => $date->format('M Y'),
                'count' => User::where('role', 'user')
                    ->where('created_at', '<=', $date->endOfMonth())
                    ->count(),
            ];
        }

        // Quiz completion stats
        $quizCompletions = QuizResult::where('passed', true)->count();

        // Difficulty distribution
        $difficultyDistribution = [
            ['name' => 'Beginner', 'value' => Recipe::where('difficulty', 'beginner')->count()],
            ['name' => 'Intermediate', 'value' => Recipe::where('difficulty', 'intermediate')->count()],
            ['name' => 'Advanced', 'value' => Recipe::where('difficulty', 'advanced')->count()],
        ];

        // Base response structure
        $response = [
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_recipes' => $totalRecipes,
                'published_recipes' => $publishedRecipes,
                'total_lessons' => $totalLessons,
                'new_users_this_month' => $newUsersThisMonth,
                'quiz_completions' => $quizCompletions,
            ],
            'popular_recipes' => $popularRecipes,
            'recent_activity' => $recentActivity,
            'user_growth' => $userGrowth,
            'difficulty_distribution' => $difficultyDistribution,
        ];

        // Add desktop-specific formatting and additional data
        if ($platform === 'desktop') {
            $response = $this->formatForDesktop($response, $request);
        }

        return response()->json($response);
    }

    /**
     * Format dashboard statistics for desktop platform.
     */
    private function formatForDesktop(array $baseResponse, Request $request): array
    {
        // Add formatted display fields for desktop
        $baseResponse['display'] = [
            'total_users_formatted' => number_format($baseResponse['stats']['total_users']),
            'total_recipes_formatted' => number_format($baseResponse['stats']['total_recipes']),
            'total_lessons_formatted' => number_format($baseResponse['stats']['total_lessons']),
            'new_users_growth' => $this->calculateGrowthPercentage(
                $baseResponse['stats']['new_users_this_month'],
                $baseResponse['stats']['total_users']
            ),
        ];

        // Add recommended recipes for desktop (top 3 most recent published)
        $baseResponse['recommended_recipes'] = Recipe::where('is_published', true)
            ->with(['category', 'creator'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get(['id', 'title', 'slug', 'difficulty', 'cooking_time', 'image_url', 'category_id', 'user_id']);

        // Add recommended lessons for desktop (top 3 most recent published)
        $baseResponse['recommended_lessons'] = Lesson::where('is_published', true)
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get(['id', 'title', 'slug', 'duration', 'level', 'thumbnail', 'category_id']);

        // Add completion stats for desktop
        $totalQuizzes = QuizResult::count();
        $passedQuizzes = QuizResult::where('passed', true)->count();
        $baseResponse['completion_stats'] = [
            'total_quizzes' => $totalQuizzes,
            'passed_quizzes' => $passedQuizzes,
            'pass_rate' => $totalQuizzes > 0 ? round(($passedQuizzes / $totalQuizzes) * 100, 1) : 0,
        ];

        // Add trending recipes for desktop (recipes created in last 7 days)
        $baseResponse['trending_recipes'] = Recipe::where('is_published', true)
            ->where('created_at', '>=', now()->subDays(7))
            ->with(['category', 'creator'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'title', 'slug', 'difficulty', 'cooking_time', 'image_url', 'category_id', 'user_id']);

        // Add platform metadata
        $baseResponse['meta'] = [
            'platform' => 'desktop',
            'layout' => 'grid',
            'version' => config('platform.api_version.desktop', '1.0.0'),
        ];

        return $baseResponse;
    }

    /**
     * Calculate growth percentage.
     */
    private function calculateGrowthPercentage(int $newCount, int $totalCount): string
    {
        if ($totalCount === 0) {
            return '0%';
        }

        $percentage = round(($newCount / $totalCount) * 100, 1);
        return $percentage > 0 ? "+{$percentage}%" : "{$percentage}%";
    }
}
