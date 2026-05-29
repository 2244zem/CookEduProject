<?php

namespace Database\Seeders;

use App\Models\Recipe;
use App\Models\Category;
use App\Models\User;
use App\Models\Lesson;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSyncSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin', 'name' => 'Chef Master']);
        
        // 1. Categories
        $categories = [
            'MASAKAN INDONESIA' => 'masakan-indonesia',
            'WESTERN' => 'western',
            'SALAD' => 'salad',
            'DESSERT' => 'dessert',
            'SOUP' => 'soup',
            'BEVERAGE' => 'beverage'
        ];

        $categoryModels = [];
        foreach ($categories as $name => $slug) {
            $categoryModels[$name] = Category::where('slug', $slug)->orWhere('name', $name)->first();
            if (!$categoryModels[$name]) {
                $categoryModels[$name] = Category::create(['name' => $name, 'slug' => $slug]);
            }
        }

        // 2. RECIPES FROM recipes.ts
        $recipesData = [
            [
                'title' => 'Ayam Goreng Lengkuas Gurih',
                'category' => 'MASAKAN INDONESIA',
                'image_url' => 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
                'cooking_time' => 45,
                'difficulty' => 'intermediate',
                'description' => 'Ayam Goreng Lengkuas Gurih adalah hidangan lezat kategori MASAKAN INDONESIA yang populer.',
                'ingredients' => [
                    ['item' => 'Daging Ayam', 'amount' => 1000, 'unit' => 'gram'],
                    ['item' => 'Lengkuas Parut', 'amount' => 200, 'unit' => 'gram'],
                    ['item' => 'Bawang Putih', 'amount' => 5, 'unit' => 'siung'],
                ],
                'steps' => [
                    ['instruction' => 'Haluskan bumbu, lumuri ayam.', 'duration' => 5],
                    ['instruction' => 'Ungkep hingga meresap.', 'duration' => 30],
                    ['instruction' => 'Goreng hingga keemasan.', 'duration' => 10],
                ]
            ],
            [
                'title' => 'Soto Ayam Kuah Bening',
                'category' => 'MASAKAN INDONESIA',
                'image_url' => 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80',
                'cooking_time' => 40,
                'difficulty' => 'intermediate',
                'description' => 'Soto ayam khas Indonesia dengan kuah bening yang segar dan kaya rempah.',
                'ingredients' => [
                    ['item' => 'Ayam', 'amount' => 500, 'unit' => 'g'],
                    ['item' => 'Soun', 'amount' => 50, 'unit' => 'g'],
                ],
                'steps' => [
                    ['instruction' => 'Rebus ayam.', 'duration' => 20],
                    ['instruction' => 'Siapkan kuah soto.', 'duration' => 15],
                ]
            ],
            [
                'title' => 'Beef Wagyu Steak Premium',
                'category' => 'WESTERN',
                'image_url' => 'https://images.unsplash.com/photo-1546248133-12832329b310?auto=format&fit=crop&w=600&q=80',
                'cooking_time' => 25,
                'difficulty' => 'advanced',
                'description' => 'Steak premium dengan tingkat marbling yang sempurna.',
                'ingredients' => [
                    ['item' => 'Beef Wagyu', 'amount' => 200, 'unit' => 'g'],
                    ['item' => 'Butter', 'amount' => 30, 'unit' => 'g'],
                ],
                'steps' => [
                    ['instruction' => 'Sear steak.', 'duration' => 5],
                    ['instruction' => 'Baste with butter.', 'duration' => 5],
                ]
            ],
            [
                'title' => 'Classic Caesar Salad',
                'category' => 'SALAD',
                'image_url' => 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
                'cooking_time' => 15,
                'difficulty' => 'beginner',
                'description' => 'Salad klasik dengan saus caesar yang creamy.',
                'ingredients' => [
                    ['item' => 'Romaine Lettuce', 'amount' => 1, 'unit' => 'head'],
                    ['item' => 'Croutons', 'amount' => 50, 'unit' => 'g'],
                ],
                'steps' => [
                    ['instruction' => 'Mix ingredients.', 'duration' => 10],
                ]
            ],
            [
                'title' => 'Berry Blast Smoothie',
                'category' => 'BEVERAGE',
                'image_url' => 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=600&q=80',
                'cooking_time' => 5,
                'difficulty' => 'beginner',
                'description' => 'Minuman segar kaya antioksidan.',
                'ingredients' => [
                    ['item' => 'Mixed Berries', 'amount' => 100, 'unit' => 'g'],
                    ['item' => 'Yogurt', 'amount' => 150, 'unit' => 'ml'],
                ],
                'steps' => [
                    ['instruction' => 'Blend all.', 'duration' => 5],
                ]
            ]
        ];

        foreach ($recipesData as $r) {
            Recipe::updateOrCreate(
                ['slug' => Str::slug($r['title'])],
                [
                    'title' => $r['title'],
                    'description' => $r['description'],
                    'image_url' => $r['image_url'],
                    'difficulty' => $r['difficulty'],
                    'cooking_time' => $r['cooking_time'],
                    'category_id' => $categoryModels[$r['category']]->id,
                    'ingredients' => $r['ingredients'],
                    'steps' => $r['steps'],
                    'created_by' => $user->id,
                    'is_published' => true,
                    'moderation_status' => 'approved',
                ]
            );
        }

        // 3. LESSONS WITH THUMBNAILS
        $lessonsData = [
            [
                'title' => 'Teknik Dasar Pisau',
                'thumbnail' => 'https://images.unsplash.com/photo-1594385208974-2e75f9d3a513?auto=format&fit=crop&q=80&w=1000',
                'summary' => 'Belajar memegang pisau dan teknik memotong yang aman.',
                'content' => 'Dalam pelajaran ini, Anda akan belajar Claw Grip dan teknik Dice.',
                'level' => 'beginner',
                'order_index' => 1,
            ],
            [
                'title' => 'Seni Menumis (Sautéing)',
                'thumbnail' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000',
                'summary' => 'Kuasai panas wajan untuk rasa sayuran yang maksimal.',
                'content' => 'Teknik tumis memerlukan wajan yang sangat panas.',
                'level' => 'beginner',
                'order_index' => 2,
            ],
            [
                'title' => 'Mastering Stock & Broth',
                'thumbnail' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000',
                'summary' => 'Rahasia kuah masakan yang jernih dan gurih.',
                'content' => 'Belajar teknik simmering untuk kaldu yang jernih.',
                'level' => 'intermediate',
                'order_index' => 3,
            ]
        ];

        foreach ($lessonsData as $l) {
            Lesson::updateOrCreate(
                ['slug' => Str::slug($l['title'])],
                array_merge($l, [
                    'category_id' => $categoryModels['WESTERN']->id, // Default to Western/Basic
                    'duration' => 20,
                    'is_published' => true
                ])
            );
        }
    }
}
