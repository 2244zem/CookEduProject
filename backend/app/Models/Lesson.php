<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'video_url',
        'video_provider',
        'content',
        'summary',
        'thumbnail',
        'duration',
        'order_index',
        'level',
        'category_id',
        'prerequisite_id',
        'is_published',
        'fallback_content',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'fallback_content' => 'array',
        ];
    }

    /**
     * Lesson category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Prerequisite lesson (progression lock).
     */
    public function prerequisite()
    {
        return $this->belongsTo(Lesson::class, 'prerequisite_id');
    }

    /**
     * Lessons that require this lesson as prerequisite.
     */
    public function dependents()
    {
        return $this->hasMany(Lesson::class, 'prerequisite_id');
    }

    /**
     * Quiz results for this lesson.
     */
    public function quizResults()
    {
        return $this->hasMany(QuizResult::class);
    }

    /**
     * Check if a specific user has completed this lesson.
     */
    public function isCompletedByUser(int $userId): bool
    {
        return $this->quizResults()
            ->where('user_id', $userId)
            ->where('passed', true)
            ->exists();
    }

    /**
     * Check if a user can access this lesson (prerequisite check).
     */
    public function isAccessibleByUser(int $userId): bool
    {
        if (!$this->prerequisite_id) {
            return true;
        }

        return $this->prerequisite->isCompletedByUser($userId);
    }

    /**
     * Auto-generate slug.
     */
    protected static function booted(): void
    {
        static::creating(function (Lesson $lesson) {
            if (empty($lesson->slug)) {
                $lesson->slug = \Illuminate\Support\Str::slug($lesson->title);
                $count = static::withTrashed()->where('slug', 'like', $lesson->slug . '%')->count();
                if ($count > 0) {
                    $lesson->slug .= '-' . ($count + 1);
                }
            }
        });
    }
}
