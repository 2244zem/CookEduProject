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

        // 4. Recipes (Curated global + Indonesian, unique titles)
        $this->seedCuratedRecipes($admin);

        // 5. Lessons (Mass Seeding)
        $this->command->info('Seeding 20 Lessons...');
        Lesson::factory()->count(20)->create();

        $this->command->info('Database seeding completed with 100+ items!');
    }

    private function seedCuratedRecipes(User $admin): void
    {
        $this->command->info('Seeding 120 curated unique recipes...');

        $indonesianTitles = [
            'Nasi Goreng Kampung', 'Rendang Daging Sapi', 'Soto Ayam Lamongan', 'Rawon Surabaya',
            'Gudeg Jogja', 'Gado-Gado Jakarta', 'Nasi Uduk Betawi', 'Pempek Palembang',
            'Mie Aceh Tumis', 'Ayam Betutu Bali', 'Sate Lilit Bali', 'Nasi Liwet Solo',
            'Sop Buntut Jakarta', 'Tongseng Kambing Solo', 'Semur Daging Betawi', 'Asinan Bogor',
            'Lontong Sayur Padang', 'Coto Makassar', 'Pallubasa Makassar', 'Konro Bakar Makassar',
            'Papeda Ikan Kuah Kuning', 'Ayam Taliwang Lombok', 'Plecing Kangkung', 'Nasi Kuning Manado',
            'Bubur Manado Tinutuan', 'Ikan Woku Belanga', 'Ayam Woku Kemangi', 'Sambal Goreng Ati',
            'Opor Ayam Lebaran', 'Sayur Asem Sunda', 'Karedok Sunda', 'Nasi Timbel Komplit',
            'Pepes Ikan Kemangi', 'Pecel Madiun', 'Lalapan Ayam Goreng', 'Bakso Urat Kuah',
            'Mie Kocok Bandung', 'Soto Banjar', 'Nasi Padang Komplit', 'Ayam Pop Padang',
            'Gulai Ikan Patin', 'Pindang Palembang', 'Lempah Kuning Bangka', 'Sate Maranggi Purwakarta',
            'Nasi Campur Bali', 'Lawar Bali', 'Bebek Goreng Madura', 'Sate Madura Bumbu Kacang',
            'Serabi Solo Kuah Santan', 'Nasi Bakar Ayam Kemangi', 'Ikan Bakar Rica-Rica', 'Capcay Jawa',
            'Bihun Goreng Jawa', 'Nasi Goreng Mawut', 'Pecak Lele Sambal Terasi', 'Sup Brenebon Manado',
            'Soto Kudus', 'Nasi Megono Pekalongan', 'Mie Celor Palembang', 'Lontong Balap Surabaya',
        ];

        $globalTitles = [
            'Beef Wellington', 'Fish and Chips', 'Shepherds Pie', 'Chicken Pot Pie', 'Clam Chowder',
            'Spaghetti Bolognese', 'Lasagna Al Forno', 'Risotto Mushroom', 'Gnocchi Pomodoro',
            'Margherita Pizza', 'Paella Valenciana', 'Gazpacho Andaluz', 'Tortilla Espanola',
            'Coq au Vin', 'Beef Bourguignon', 'Ratatouille Provencal', 'Croque Monsieur',
            'Greek Moussaka', 'Chicken Souvlaki', 'Shakshuka', 'Falafel Tahini Wrap', 'Hummus Bowl',
            'Turkish Adana Kebab', 'Pide Turkish Pizza', 'Butter Chicken', 'Chicken Tikka Masala',
            'Palak Paneer', 'Biryani Hyderabadi', 'Dal Tadka', 'Masala Dosa', 'Pad Thai',
            'Tom Yum Goong', 'Green Curry Thai', 'Pho Bo Vietnam', 'Banh Mi Chicken',
            'Korean Bibimbap', 'Bulgogi Beef', 'Kimchi Jjigae', 'Japanese Ramen Shoyu',
            'Chicken Katsu Curry', 'Okonomiyaki Osaka', 'Sushi Salmon Roll', 'Mapo Tofu',
            'Kung Pao Chicken', 'Peking Duck', 'Xiao Long Bao', 'Hong Kong Wonton Noodle',
            'Mexican Tacos Al Pastor', 'Chicken Quesadilla', 'Beef Burrito Bowl', 'Chili Con Carne',
            'Brazilian Feijoada', 'Argentinian Asado', 'Peruvian Lomo Saltado', 'Cuban Ropa Vieja',
            'Jamaican Jerk Chicken', 'Moroccan Chicken Tagine', 'South African Bobotie', 'Ethiopian Doro Wat',
        ];

        $titles = array_values(array_unique(array_merge($indonesianTitles, $globalTitles)));
        $categories = Category::all()->keyBy('slug');

        foreach ($titles as $index => $title) {
            $slug = Str::slug($title);
            $isIndonesian = $index < count($indonesianTitles);
            $categoryId = $isIndonesian
                ? ($categories['masakan-indonesia']->id ?? Category::inRandomOrder()->value('id'))
                : Category::inRandomOrder()->value('id');

            [$ingredients, $steps, $nutrition] = $this->buildRecipePayload($title, $isIndonesian);

            Recipe::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'description' => "Panduan memasak {$title} dengan langkah terstruktur, cocok untuk pemula hingga menengah.",
                    'image_url' => "https://source.unsplash.com/featured/1200x800?" . urlencode("food,$title"),
                    'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
                    'ingredients' => $ingredients,
                    'steps' => $steps,
                    'cooking_time' => fake()->numberBetween(20, 95),
                    'prep_time' => fake()->numberBetween(10, 30),
                    'servings' => fake()->numberBetween(2, 5),
                    'nutritional_info' => $nutrition,
                    'category_id' => $categoryId,
                    'created_by' => $admin->id,
                    'is_published' => true,
                    'moderation_status' => 'approved',
                ]
            );
        }

        $this->command->info('Curated recipes seeded: ' . count($titles));
    }

    private function buildRecipePayload(string $title, bool $isIndonesian): array
    {
        $baseProtein = $isIndonesian ? 'ayam fillet' : fake()->randomElement(['dada ayam', 'daging sapi', 'tahu', 'ikan']);
        $baseCarb = $isIndonesian ? fake()->randomElement(['nasi putih', 'mie telur', 'kentang']) : fake()->randomElement(['pasta', 'kentang', 'rice']);
        $herb = $isIndonesian ? fake()->randomElement(['daun jeruk', 'kemangi', 'serai']) : fake()->randomElement(['oregano', 'thyme', 'parsley']);

        $ingredients = [
            ['item' => $baseProtein, 'amount' => '400', 'unit' => 'gram'],
            ['item' => $baseCarb, 'amount' => '250', 'unit' => 'gram'],
            ['item' => 'bawang putih', 'amount' => '4', 'unit' => 'siung'],
            ['item' => 'bawang merah/bombay', 'amount' => '1', 'unit' => 'buah'],
            ['item' => $herb, 'amount' => '2', 'unit' => 'sdm'],
            ['item' => 'garam', 'amount' => '1', 'unit' => 'sdt'],
            ['item' => 'merica', 'amount' => '0.5', 'unit' => 'sdt'],
        ];

        $steps = [
            ['instruction' => "Siapkan seluruh bahan {$title}, cuci bersih lalu potong sesuai kebutuhan."],
            ['instruction' => 'Panaskan minyak, tumis bawang hingga harum dan sedikit keemasan.', 'duration' => 4],
            ['instruction' => "Masukkan bahan utama, aduk hingga matang merata dan bumbu menyatu.", 'duration' => 12],
            ['instruction' => 'Tambahkan bumbu pelengkap, koreksi rasa, lalu masak hingga tekstur ideal.', 'duration' => 8],
            ['instruction' => 'Sajikan hangat di piring saji, beri garnish segar sebelum disajikan.'],
        ];

        $nutrition = [
            'calories' => fake()->numberBetween(280, 760),
            'protein' => fake()->numberBetween(14, 48),
            'carbs' => fake()->numberBetween(18, 78),
            'fat' => fake()->numberBetween(8, 34),
        ];

        return [$ingredients, $steps, $nutrition];
    }
}
