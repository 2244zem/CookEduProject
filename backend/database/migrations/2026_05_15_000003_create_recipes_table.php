<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('image')->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced']);
            $table->jsonb('ingredients'); // JSONB for PostgreSQL performance
            $table->jsonb('steps');       // JSONB for PostgreSQL performance
            $table->integer('cooking_time'); // in minutes
            $table->integer('prep_time')->default(0); // in minutes
            $table->integer('servings')->default(1);
            $table->jsonb('nutrition')->nullable(); // {calories, protein, carbs, fat}
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignUuid('created_by')->constrained('users');
            $table->boolean('is_published')->default(true);
            $table->softDeletes();
            $table->timestamps();

            // Indexes for search performance
            $table->index('difficulty');
            $table->index('cooking_time');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
