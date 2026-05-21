<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->uuid('id')->primary();
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
            $table->foreignUuid('category_id')->constrained('categories');
            $table->foreignUuid('prerequisite_id')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->foreign('prerequisite_id')->references('id')->on('lessons')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
