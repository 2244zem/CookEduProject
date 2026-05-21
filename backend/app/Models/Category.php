<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Category extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'order_index',
    ];

    /**
     * Recipes in this category.
     */
    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    /**
     * Lessons in this category.
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('order_index');
    }
}
