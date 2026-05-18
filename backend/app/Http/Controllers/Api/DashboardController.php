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
    public function stats()
    {
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

        return response()->json([
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
        ]);
    }
}
