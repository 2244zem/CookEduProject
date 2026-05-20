<?php

namespace App\Http\Resources\Platform;

use Illuminate\Http\Request;
use App\Http\Resources\LessonResource;

class DesktopLessonResource extends LessonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        
        $userId = $request->user()?->id;
        
        // Add desktop-specific fields
        $data['progress'] = $this->getProgress($userId);
        $data['is_completed'] = $userId ? $this->resource->isCompletedByUser($userId) : false;
        $data['related_lessons'] = $this->getRelatedLessons();
        
        return $data;
    }
    
    /**
     * Get user progress for this lesson.
     * Returns progress data including completion status and quiz attempts.
     *
     * @param int|null $userId
     * @return array
     */
    private function getProgress(?int $userId): array
    {
        if (!$userId) {
            return [
                'completed' => false,
                'attempts' => 0,
                'best_score' => null,
                'last_attempt_at' => null,
            ];
        }
        
        $quizResults = $this->resource->quizResults()
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        $completed = $quizResults->where('passed', true)->isNotEmpty();
        $attempts = $quizResults->count();
        $bestScore = $quizResults->max('score');
        $lastAttempt = $quizResults->first();
        
        return [
            'completed' => $completed,
            'attempts' => $attempts,
            'best_score' => $bestScore,
            'last_attempt_at' => $lastAttempt?->created_at?->toISOString(),
        ];
    }
    
    /**
     * Get related lessons (same category, excluding current lesson).
     * Returns up to 5 related lessons for desktop display.
     *
     * @return array
     */
    private function getRelatedLessons(): array
    {
        if (!$this->resource->category_id) {
            return [];
        }
        
        $relatedLessons = \App\Models\Lesson::where('category_id', $this->resource->category_id)
            ->where('id', '!=', $this->resource->id)
            ->where('is_published', true)
            ->orderBy('order_index', 'asc')
            ->limit(5)
            ->get();
        
        return $relatedLessons->map(function ($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'slug' => $lesson->slug,
                'thumbnail' => $lesson->thumbnail ? asset('storage/' . $lesson->thumbnail) : null,
                'duration' => $lesson->duration,
                'level' => $lesson->level,
                'level_label' => ucfirst($lesson->level),
            ];
        })->toArray();
    }
}
