<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LessonResource;
use App\Models\Lesson;
use App\Models\QuizResult;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    /**
     * List published lessons grouped by category.
     */
    public function index(Request $request)
    {
        $query = Lesson::with(['category', 'prerequisite'])
            ->where('is_published', true)
            ->orderBy('order_index');

        if ($level = $request->query('level')) {
            $query->where('level', $level);
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $lessons = $query->paginate($request->query('per_page', 20));

        return LessonResource::collection($lessons);
    }

    /**
     * Show a single lesson with accessibility check.
     */
    public function show(Request $request, Lesson $lesson)
    {
        $lesson->load(['category', 'prerequisite']);

        // Check progression lock for regular users
        if ($request->user() && !$request->user()->isAdmin()) {
            if (!$lesson->isAccessibleByUser($request->user()->id)) {
                return response()->json([
                    'message' => 'Anda harus menyelesaikan materi prasyarat terlebih dahulu.',
                    'prerequisite' => new LessonResource($lesson->prerequisite),
                ], 403);
            }
        }

        return response()->json([
            'data' => new LessonResource($lesson),
        ]);
    }

    /**
     * Submit quiz result for a lesson.
     */
    public function submitQuiz(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'score' => 'required|integer|min:0',
            'total_questions' => 'required|integer|min:1',
        ]);

        $passed = ($validated['score'] / $validated['total_questions']) >= 0.7; // 70% pass threshold

        $result = QuizResult::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'score' => $validated['score'],
                'total_questions' => $validated['total_questions'],
                'answers' => $validated['answers'],
                'passed' => $passed,
            ]
        );

        return response()->json([
            'message' => $passed
                ? 'Selamat! Anda lulus kuis ini.'
                : 'Maaf, Anda belum lulus. Coba lagi!',
            'passed' => $passed,
            'score' => $result->score,
            'total_questions' => $result->total_questions,
            'percentage' => $result->percentage,
        ]);
    }

    /**
     * Get user's learning progress.
     */
    public function progress(Request $request)
    {
        $user = $request->user();

        $totalLessons = Lesson::where('is_published', true)->count();
        $completedLessons = QuizResult::where('user_id', $user->id)
            ->where('passed', true)
            ->count();

        $results = QuizResult::with('lesson:id,title,slug,level')
            ->where('user_id', $user->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'total_lessons' => $totalLessons,
            'completed_lessons' => $completedLessons,
            'progress_percentage' => $totalLessons > 0
                ? round(($completedLessons / $totalLessons) * 100, 1)
                : 0,
            'results' => $results,
        ]);
    }

    /**
     * Admin: Create lesson.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video_url' => 'nullable|url',
            'content' => 'required|string',
            'summary' => 'nullable|string',
            'duration' => 'nullable|integer|min:0',
            'order_index' => 'nullable|integer|min:0',
            'level' => 'required|in:beginner,intermediate,advanced',
            'category_id' => 'required|exists:categories,id',
            'prerequisite_id' => 'nullable|exists:lessons,id',
            'is_published' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        $lesson = Lesson::create($validated);
        $lesson->load(['category', 'prerequisite']);

        return response()->json([
            'message' => 'Modul edukasi berhasil ditambahkan!',
            'data' => new LessonResource($lesson),
        ], 201);
    }

    /**
     * Admin: Update lesson.
     */
    public function update(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'video_url' => 'nullable|url',
            'content' => 'sometimes|string',
            'summary' => 'nullable|string',
            'duration' => 'nullable|integer|min:0',
            'order_index' => 'nullable|integer|min:0',
            'level' => 'sometimes|in:beginner,intermediate,advanced',
            'category_id' => 'sometimes|exists:categories,id',
            'prerequisite_id' => 'nullable|exists:lessons,id',
            'is_published' => 'nullable|boolean',
        ]);

        $lesson->update($validated);
        $lesson->load(['category', 'prerequisite']);

        return response()->json([
            'message' => 'Modul edukasi berhasil diperbarui!',
            'data' => new LessonResource($lesson->fresh()),
        ]);
    }

    /**
     * Admin: Delete lesson.
     */
    public function destroy(Lesson $lesson)
    {
        $lesson->delete();

        return response()->json([
            'message' => 'Modul edukasi berhasil dihapus.',
        ]);
    }
}
