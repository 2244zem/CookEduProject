<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

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
