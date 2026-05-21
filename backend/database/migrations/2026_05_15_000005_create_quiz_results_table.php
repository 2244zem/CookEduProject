<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->integer('score');
            $table->integer('total_questions');
            $table->jsonb('answers')->nullable(); // Store user answers
            $table->boolean('passed')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']); // One result per user per lesson
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_results');
    }
};
