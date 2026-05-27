<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $fillable = [
        'user_id',
        'lesson_id',
        'score',
        'total_questions',
        'answers',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'passed' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Get pass percentage.
     */
    public function getPercentageAttribute(): float
    {
        if ($this->total_questions === 0) return 0;
        return round(($this->score / $this->total_questions) * 100, 1);
    }
}
