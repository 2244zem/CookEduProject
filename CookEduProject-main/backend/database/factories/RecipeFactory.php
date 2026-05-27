<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RecipeFactory extends Factory
{
    public function definition(): array
    {
        $recipes = [
            'Nasi Goreng Spesial' => ['cal' => 450, 'prot' => 12, 'carbs' => 60, 'fat' => 15, 'keywords' => 'fried-rice'],
            'Sate Ayam Madura' => ['cal' => 500, 'prot' => 40, 'carbs' => 10, 'fat' => 25, 'keywords' => 'chicken-satay'],
            'Rendang Sapi Minang' => ['cal' => 650, 'prot' => 45, 'carbs' => 5, 'fat' => 50, 'keywords' => 'beef-rendang'],
            'Gado-Gado Betawi' => ['cal' => 350, 'prot' => 15, 'carbs' => 40, 'fat' => 15, 'keywords' => 'salad-peanut'],
            'Soto Ayam Lamongan' => ['cal' => 400, 'prot' => 30, 'carbs' => 20, 'fat' => 20, 'keywords' => 'chicken-soup'],
            'Pasta Carbonara' => ['cal' => 600, 'prot' => 20, 'carbs' => 70, 'fat' => 30, 'keywords' => 'pasta-carbonara'],
            'Sushi Roll Salmon' => ['cal' => 300, 'prot' => 25, 'carbs' => 45, 'fat' => 8, 'keywords' => 'sushi-salmon'],
            'Steak Tenderloin' => ['cal' => 700, 'prot' => 55, 'carbs' => 0, 'fat' => 45, 'keywords' => 'beef-steak'],
            'Pizza Margherita' => ['cal' => 800, 'prot' => 25, 'carbs' => 100, 'fat' => 35, 'keywords' => 'pizza-margherita'],
            'Ramen Tonkotsu' => ['cal' => 750, 'prot' => 35, 'carbs' => 80, 'fat' => 40, 'keywords' => 'ramen-noodle'],
        ];

        $name = $this->faker->randomKey($recipes);
        $data = $recipes[$name];
        $title = $name . ' ' . $this->faker->numberBetween(1, 999999);

        // Specific instructions for different types
        $steps = [
            ['instruction' => 'Siapkan semua bahan ' . $name . ' segar.', 'tip' => 'Cuci bersih sebelum digunakan.'],
        ];

        if (str_contains($name, 'Sushi')) {
            $steps[] = ['instruction' => 'Siapkan nasi sushi dan letakkan di atas nori.', 'tip' => 'Gunakan tangan basah agar tidak lengket.'];
            $steps[] = ['instruction' => 'Susun isian ' . $name . ' secara memanjang.', 'duration' => 5];
            $steps[] = ['instruction' => 'Gulung sushi dengan bantuan bamboo mat.', 'tip' => 'Tekan sedikit agar padat.'];
        } elseif (str_contains($name, 'Pasta') || str_contains($name, 'Ramen')) {
            $steps[] = ['instruction' => 'Rebus mie hingga Al Dente.', 'duration' => 8];
            $steps[] = ['instruction' => 'Siapkan saus/kaldu di panci terpisah.', 'duration' => 10];
            $steps[] = ['instruction' => 'Campurkan mie ke dalam saus, aduk merata.', 'duration' => 2];
        } else {
            $steps[] = ['instruction' => 'Tumis bumbu halus hingga mengeluarkan aroma harum.', 'duration' => 3];
            $steps[] = ['instruction' => 'Masukkan bahan utama, masak hingga bumbu meresap sempurna.', 'duration' => 15, 'tip' => 'Gunakan api sedang agar tidak gosong.'];
        }

        $steps[] = ['instruction' => 'Sajikan selagi hangat untuk rasa terbaik.', 'tip' => 'Tambahkan hiasan sayuran.'];

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => 'Resep lezat ' . $name . ' yang diolah dengan bahan pilihan dan bumbu rahasia CookEdu.',
            'image_url' => "https://source.unsplash.com/featured/800x600?food,{$data['keywords']}",
            'difficulty' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'ingredients' => [
                ['item' => 'Bahan Utama ' . $name, 'amount' => '500', 'unit' => 'gram', 'calories' => $data['cal'] * 0.7, 'protein' => $data['prot'] * 0.7, 'carbs' => $data['carbs'] * 0.7, 'fat' => $data['fat'] * 0.7],
                ['item' => 'Bumbu Pelengkap', 'amount' => 'Secukupnya', 'unit' => '-', 'calories' => 50, 'protein' => 1, 'carbs' => 5, 'fat' => 2],
            ],
            'steps' => $steps,
            'cooking_time' => $this->faker->numberBetween(20, 120),
            'prep_time' => $this->faker->numberBetween(10, 30),
            'servings' => $this->faker->numberBetween(1, 4),
            'nutritional_info' => [
                'calories' => $data['cal'],
                'protein' => $data['prot'],
                'carbs' => $data['carbs'],
                'fat' => $data['fat'],
            ],
            'category_id' => Category::all()->random()->id ?? 1,
            'created_by' => User::where('role', 'admin')->first()->id ?? 1,
            'is_published' => true,
        ];
    }
}
