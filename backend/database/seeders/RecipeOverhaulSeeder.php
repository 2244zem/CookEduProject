<?php

namespace Database\Seeders;

use App\Models\Recipe;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RecipeOverhaulSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create(['role' => 'admin']);
        
        $techCategory = Category::updateOrCreate(['name' => 'Teknik Dasar'], ['slug' => 'teknik-dasar']);
        $vegCategory = Category::updateOrCreate(['name' => 'Sayuran'], ['slug' => 'sayuran']);
        $seafoodCategory = Category::updateOrCreate(['name' => 'Seafood'], ['slug' => 'seafood']);
        $soupCategory = Category::updateOrCreate(['name' => 'Sup & Kaldu'], ['slug' => 'sup-dan-kaldu']);
        $indoCategory = Category::updateOrCreate(['name' => 'Masakan Indonesia'], ['slug' => 'masakan-indonesia']);

        $recipes = [
            [
                'title' => 'Gado-Gado Siram Spesial',
                'description' => 'Menu salad khas Indonesia dengan bumbu kacang yang kental dan gurih. Belajar teknik merebus sayuran agar tetap renyah.',
                'image_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000',
                'difficulty' => 'intermediate',
                'cooking_time' => 45,
                'servings' => 2,
                'category_id' => $indoCategory->id,
                'ingredients' => [
                    ['item' => 'Kacang Tanah Goreng', 'amount' => 200, 'unit' => 'gram'],
                    ['item' => 'Gula Merah Sisir', 'amount' => 50, 'unit' => 'gram'],
                    ['item' => 'Santan Kental', 'amount' => 200, 'unit' => 'ml'],
                    ['item' => 'Kentang Rebus', 'amount' => 2, 'unit' => 'buah'],
                    ['item' => 'Tahu & Tempe Goreng', 'amount' => 4, 'unit' => 'potong'],
                    ['item' => 'Kacang Panjang (potong 3cm)', 'amount' => 100, 'unit' => 'gram'],
                    ['item' => 'Tauge (siangi)', 'amount' => 100, 'unit' => 'gram'],
                    ['item' => 'Bayam/Kangkung', 'amount' => 1, 'unit' => 'ikat'],
                    ['item' => 'Telur Rebus', 'amount' => 2, 'unit' => 'butir'],
                ],
                'steps' => [
                    ['instruction' => 'Persiapan Sayur: Rebus air hingga mendidih. Masukkan kacang panjang selama 2 menit, lalu angkat dan tiriskan. Ulangi untuk tauge (30 detik) dan bayam (1 menit). Jangan rebus terlalu lama agar vitamin terjaga.', 'duration' => 10],
                    ['instruction' => 'Membuat Bumbu Kacang: Haluskan kacang tanah goreng menggunakan blender atau ulekan hingga halus. Tumis bumbu halus (bawang putih, kencur, cabai) hingga harum.', 'duration' => 10],
                    ['instruction' => 'Masak Saus: Masukkan kacang halus ke wajan, tambahkan gula merah, air asam jawa, dan santan. Aduk terus dengan api kecil hingga saus mengental dan mengeluarkan minyak.', 'duration' => 15],
                    ['instruction' => 'Plating: Tata kentang, tahu, tempe, dan sayuran rebus di piring. Siram dengan bumbu kacang kental di atasnya. Taburkan bawang goreng dan kerupuk sebagai pelengkap.', 'duration' => 5],
                ],
                'nutritional_info' => [
                    'calories' => 450,
                    'protein' => 15,
                    'carbs' => 40,
                    'fat' => 25
                ]
            ],
            [
                'title' => 'Teknik Dasar Pisau (Basic Cuts)',
                'description' => 'Langkah pertama menjadi koki: Pelajari cara memegang pisau dan memotong sayuran dengan presisi standar restoran.',
                'image_url' => 'https://images.unsplash.com/photo-1594385208974-2e75f9d3a513?auto=format&fit=crop&q=80&w=1000',
                'difficulty' => 'beginner',
                'cooking_time' => 20,
                'servings' => 1,
                'category_id' => $techCategory->id,
                'ingredients' => [
                    ['item' => 'Bawang Bombay', 'amount' => 1, 'unit' => 'buah'],
                    ['item' => 'Wortel Ukuran Besar', 'amount' => 2, 'unit' => 'buah'],
                    ['item' => 'Seledri Impor', 'amount' => 2, 'unit' => 'batang'],
                ],
                'steps' => [
                    ['instruction' => 'Posisi Tangan (Claw Grip): Tekuk ujung jari tangan kiri Anda ke dalam seperti cakar. Tempelkan buku jari ke badan pisau untuk memandu pemotongan tanpa risiko jari teriris.', 'duration' => 5],
                    ['instruction' => 'Teknik Dice (Kotak): Kupas wortel, belah menjadi 4 bagian memanjang, lalu tumpuk dan potong melintang sehingga membentuk dadu ukuran 1x1 cm (Mirepoix).', 'duration' => 7],
                    ['instruction' => 'Teknik Julienne (Korek Api): Potong wortel sepanjang 5cm, iris tipis menjadi lembaran, tumpuk, lalu iris memanjang setebal 2mm hingga berbentuk seperti korek api.', 'duration' => 8],
                ],
                'nutritional_info' => [
                    'calories' => 50,
                    'protein' => 1,
                    'carbs' => 12,
                    'fat' => 0.5
                ]
            ],
            [
                'title' => 'Teknik Menumis Brokoli (Sautéing)',
                'description' => 'Rahasia sayuran tetap hijau cerah dan renyah. Pelajari teknik "Shocking" untuk menghentikan proses pemasakan.',
                'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000',
                'difficulty' => 'beginner',
                'cooking_time' => 15,
                'servings' => 1,
                'category_id' => $vegCategory->id,
                'ingredients' => [
                    ['item' => 'Brokoli (potong per kuntum)', 'amount' => 250, 'unit' => 'gram'],
                    ['item' => 'Bawang Putih (cincang kasar)', 'amount' => 3, 'unit' => 'siung'],
                    ['item' => 'Minyak Zaitun/Margarin', 'amount' => 2, 'unit' => 'sdm'],
                    ['item' => 'Garam & Kaldu Jamur', 'amount' => 1, 'unit' => 'secukupnya'],
                ],
                'steps' => [
                    ['instruction' => 'Blanching & Shocking: Didihkan air dengan sedikit garam. Masukkan brokoli selama 60 detik. Segera angkat dan masukkan ke wadah berisi air es (ini adalah teknik Shocking agar warna tetap hijau).', 'duration' => 3],
                    ['instruction' => 'Preheat Wajan: Panaskan wajan hingga benar-benar panas. Masukkan minyak, tunggu hingga minyak terlihat bergelombang (shimmering).', 'duration' => 2],
                    ['instruction' => 'Sauté: Masukkan bawang putih, tumis hingga kuning keemasan. Masukkan brokoli yang sudah ditiriskan, aduk cepat dengan api besar selama 2-3 menit saja.', 'duration' => 5],
                    ['instruction' => 'Seasoning: Tambahkan garam dan kaldu jamur di detik terakhir sebelum diangkat untuk menjaga tekstur sayuran tetap renyah.', 'duration' => 2],
                ],
                'nutritional_info' => [
                    'calories' => 135,
                    'protein' => 5,
                    'carbs' => 8,
                    'fat' => 10
                ]
            ],
            [
                'title' => 'Ayam Goreng Lengkuas Gurih',
                'description' => 'Ayam goreng dengan bumbu lengkuas parut yang melimpah, memberikan tekstur renyah dan aroma harum yang menggugah selera.',
                'image_url' => 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
                'difficulty' => 'intermediate',
                'cooking_time' => 45,
                'servings' => 4,
                'category_id' => $indoCategory->id,
                'ingredients' => [
                    ['item' => 'Daging Ayam', 'amount' => 1000, 'unit' => 'gram'],
                    ['item' => 'Lengkuas Parut', 'amount' => 200, 'unit' => 'gram'],
                    ['item' => 'Bawang Putih', 'amount' => 5, 'unit' => 'siung'],
                    ['item' => 'Sereh', 'amount' => 2, 'unit' => 'batang'],
                    ['item' => 'Kunyit', 'amount' => 2, 'unit' => 'cm'],
                    ['item' => 'Garam Dapur', 'amount' => 1.5, 'unit' => 'sdt'],
                ],
                'steps' => [
                    ['instruction' => 'Haluskan bawang putih, kunyit, dan garam dapur, lalu lumuri ke daging ayam.', 'duration' => 5],
                    ['instruction' => 'Campurkan parutan lengkuas dan sereh memar ke dalam ayam yang dimarinasi.', 'duration' => 5],
                    ['instruction' => 'Ungkep ayam bersama bumbu di atas api kecil hingga air menyusut dan bumbu meresap.', 'duration' => 25],
                    ['instruction' => 'Panaskan minyak goreng, lalu goreng ayam dan remahan lengkuas secara terpisah hingga kuning keemasan.', 'duration' => 10],
                ],
                'nutritional_info' => [
                    'calories' => 420,
                    'protein' => 35,
                    'carbs' => 12,
                    'fat' => 28
                ]
            ],
            [
                'title' => 'Soto Ayam Kuah Bening',
                'description' => 'Soto ayam khas Indonesia dengan kuah bening yang segar dan kaya rempah. Cocok dinikmati selagi hangat.',
                'image_url' => 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80',
                'difficulty' => 'intermediate',
                'cooking_time' => 40,
                'servings' => 4,
                'category_id' => $indoCategory->id,
                'ingredients' => [
                    ['item' => 'Daging Ayam', 'amount' => 500, 'unit' => 'gram'],
                    ['item' => 'Bawang Putih', 'amount' => 4, 'unit' => 'siung'],
                    ['item' => 'Sereh', 'amount' => 1, 'unit' => 'batang'],
                    ['item' => 'Daun Salam', 'amount' => 2, 'unit' => 'lembar'],
                    ['item' => 'Tauge', 'amount' => 100, 'unit' => 'gram'],
                    ['item' => 'Soun (rendam air)', 'amount' => 50, 'unit' => 'gram'],
                ],
                'steps' => [
                    ['instruction' => 'Rebus ayam hingga empuk, lalu suwir-suwir dagingnya. Sisihkan kaldunya.', 'duration' => 20],
                    ['instruction' => 'Tumis bumbu halus (bawang putih, kemiri, kunyit) lalu masukkan ke dalam air kaldu.', 'duration' => 5],
                    ['instruction' => 'Masukkan sereh dan daun salam, masak hingga harum.', 'duration' => 10],
                    ['instruction' => 'Sajikan suwiran ayam, tauge, dan soun di mangkuk, lalu siram dengan kuah panas.', 'duration' => 5],
                ],
                'nutritional_info' => [
                    'calories' => 280,
                    'protein' => 22,
                    'carbs' => 30,
                    'fat' => 10
                ]
            ],
            [
                'title' => 'Rahasia Kaldu Ayam Jernih (Consommé)',
                'description' => 'Belajar membuat stok dasar yang jernih tanpa lemak berlebih. Dasar dari semua sup lezat.',
                'image_url' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000',
                'difficulty' => 'intermediate',
                'cooking_time' => 240,
                'servings' => 4,
                'category_id' => $soupCategory->id,
                'ingredients' => [
                    ['item' => 'Tulang Ayam Bersih', 'amount' => 1, 'unit' => 'kg'],
                    ['item' => 'Air Es/Dingin', 'amount' => 3, 'unit' => 'Liter'],
                    ['item' => 'Bawang Bombay & Wortel', 'amount' => 200, 'unit' => 'gram'],
                    ['item' => 'Batang Seledri', 'amount' => 2, 'unit' => 'batang'],
                    ['item' => 'Merica Butiran', 'amount' => 5, 'unit' => 'butir'],
                ],
                'steps' => [
                    ['instruction' => 'Cold Start Method: Masukkan tulang ayam ke panci berisi air DINGIN. Panaskan perlahan dengan api sedang. Ini penting agar protein darah keluar perlahan dan tidak membuat kaldu keruh.', 'duration' => 20],
                    ['instruction' => 'Skimming: Saat mulai mendidih, akan muncul buih putih di permukaan. Buang buih tersebut menggunakan sendok sayur secara rutin. Jangan biarkan buih tercampur kembali ke air.', 'duration' => 30],
                    ['instruction' => 'Simmering: Kecilkan api ke tingkat paling rendah. Biarkan mendidih halus (hanya muncul gelembung kecil sesekali) selama 3 jam. Tambahkan sayuran di 1 jam terakhir.', 'duration' => 180],
                    ['instruction' => 'Straining: Saring kaldu menggunakan kain kasa atau saringan halus. Jangan menekan tulang/sayuran agar kaldu tetap jernih seperti kristal.', 'duration' => 10],
                ],
                'nutritional_info' => [
                    'calories' => 60,
                    'protein' => 7,
                    'carbs' => 0,
                    'fat' => 3
                ]
            ]
        ];

        foreach ($recipes as $r) {
            Recipe::updateOrCreate(
                ['slug' => Str::slug($r['title'])],
                array_merge($r, ['created_by' => $user->id])
            );
        }
    }
}
