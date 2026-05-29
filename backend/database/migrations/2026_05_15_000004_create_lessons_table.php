<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('video_url')->nullable();
            $table->string('video_provider')->default('url'); // 'url', 'local', 'youtube'
            $table->text('content');
            $table->text('summary')->nullable();
            $table->string('thumbnail')->nullable();
            $table->integer('duration')->default(0); // in minutes
            $table->integer('order_index')->default(0);
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('prerequisite_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
