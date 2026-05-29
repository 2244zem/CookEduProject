<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class LessonFactory extends Factory
{
    public function definition(): array
    {
        $lessonsData = [
            ['title' => 'Teknik Dasar Pisau', 'video' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4'],
            ['title' => 'Cara Menumis Sayuran', 'video' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4'],
            ['title' => 'Rahasia Kaldu Ayam', 'video' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4'],
            ['title' => 'Tips Memilih Ikan Segar', 'video' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4'],
            ['title' => 'Teknik Plating Estetik', 'video' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4'],
        ];

        $data = $this->faker->randomElement($lessonsData);
        $title = $data['title'] . ' ' . $this->faker->numberBetween(1, 999999);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'video_url' => $data['video'],
            'video_provider' => 'youtube',
            'content' => '<h3>' . $title . '</h3><p>Modul ini akan membahas secara mendalam tentang ' . $data['title'] . '. Pelajari langkah-langkahnya dalam video tutorial di atas untuk menguasai teknik ini secara profesional.</p><p>' . $this->faker->paragraph(3) . '</p>',
            'summary' => 'Pelajari teknik ' . $data['title'] . ' dengan panduan ahli.',
            'thumbnail' => null,
            'duration' => $this->faker->numberBetween(10, 45),
            'order_index' => $this->faker->numberBetween(1, 100),
            'level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'category_id' => Category::all()->random()->id ?? 1,
            'prerequisite_id' => null,
            'is_published' => true,
            'fallback_content' => [
                [
                    'image' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop',
                    'text' => 'Siapkan area kerja yang bersih dan pisau yang tajam.'
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
                    'text' => 'Gunakan teknik "Claw Grip" untuk memegang bahan makanan agar tangan aman.'
                ],
                [
                    'image' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
                    'text' => 'Potong bahan dengan gerakan mengayun searah jarum jam.'
                ],
            ]
        ];
    }
}
