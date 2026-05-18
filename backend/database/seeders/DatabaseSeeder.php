<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Lesson;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin CookEdu',
            'email' => 'admin@cookedu.com',
            'password' => 'password123',
            'role' => 'admin',
            'phone' => '08123456789',
        ]);

        // Create Demo User
        User::create([
            'name' => 'Budi Santoso',
            'email' => 'user@cookedu.com',
            'password' => 'password123',
            'role' => 'user',
            'phone' => '08198765432',
            'preferences' => ['diet' => 'none', 'skill_level' => 'beginner'],
        ]);

        // Create Categories
        $categories = [
            ['name' => 'Masakan Indonesia', 'slug' => 'masakan-indonesia', 'description' => 'Resep tradisional Nusantara', 'icon' => '🇮🇩', 'order_index' => 1],
            ['name' => 'Teknik Dasar', 'slug' => 'teknik-dasar', 'description' => 'Teknik memasak fundamental', 'icon' => '🔪', 'order_index' => 2],
            ['name' => 'Pastry & Bakery', 'slug' => 'pastry-bakery', 'description' => 'Kue dan roti artisan', 'icon' => '🍰', 'order_index' => 3],
            ['name' => 'Masakan Asia', 'slug' => 'masakan-asia', 'description' => 'Resep dari berbagai negara Asia', 'icon' => '🥢', 'order_index' => 4],
            ['name' => 'Healthy Food', 'slug' => 'healthy-food', 'description' => 'Masakan sehat dan bergizi', 'icon' => '🥗', 'order_index' => 5],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // 4. Recipes (Mass Seeding)
        $this->command->info('Seeding 80 Recipes...');
        Recipe::factory()->count(80)->create();

        // 5. Lessons (Mass Seeding)
        $this->command->info('Seeding 20 Lessons...');
        Lesson::factory()->count(20)->create();

        $this->command->info('Database seeding completed with 100+ items!');
    }
}
