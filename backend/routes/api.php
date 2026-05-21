<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\OAuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/otp', [AuthController::class, 'sendOTP']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// OAuth
Route::get('/auth/{provider}/redirect', [OAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [OAuthController::class, 'callback']);

// Webhook
Route::post('/payment/webhook', [SubscriptionController::class, 'webhook']);

// Public recipe browsing
Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);
Route::get('/recipes/{recipe}/steps', [RecipeController::class, 'steps']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/lessons', [LessonController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (User + Admin)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/add-xp', [AuthController::class, 'addXp']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Lessons (with progression lock)
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
    Route::post('/lessons/{lesson}/quiz', [LessonController::class, 'submitQuiz']);
    Route::get('/learning/progress', [LessonController::class, 'progress']);

    // ChefAI (Removed throttle for local development to isolate Gemini 429 issues)
    Route::post('/chef-ai', [\App\Http\Controllers\Api\ChefAiController::class, 'ask']);

    // Comments & Likes
    Route::get('/recipes/{recipe}/comments', [CommentController::class, 'index']);
    Route::post('/recipes/{recipe}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    
    Route::post('/recipes/{recipe}/like', [LikeController::class, 'toggle']);

    // Subscriptions
    Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('/payment/charge', [SubscriptionController::class, 'charge']);
    Route::post('/subscriptions/cancel', [SubscriptionController::class, 'cancel']);

    /*
    |--------------------------------------------------------------------------
    | Admin-Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(\App\Http\Middleware\EnsureIsAdmin::class)->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'stats']);

        // Recipe Management
        Route::get('/recipes', [RecipeController::class, 'adminIndex']);
        Route::post('/recipes', [RecipeController::class, 'store']);
        Route::put('/recipes/{recipe}', [RecipeController::class, 'update']);
        Route::patch('/recipes/{recipe}/moderate', [RecipeController::class, 'moderate']);
        Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy']);
        Route::post('/recipes/{id}/restore', [RecipeController::class, 'restore']);

        // Lesson Management
        Route::post('/lessons', [LessonController::class, 'store']);
        Route::put('/lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy']);

        // Category Management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // User Role Override
        Route::put('/users/{id}/role-override', [AdminController::class, 'roleOverride']);

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
    });
});
