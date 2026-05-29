<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StapleIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['name' => 'Ayam', 'average_price' => 45000, 'unit' => 'kg'],
            ['name' => 'Daging Sapi', 'average_price' => 120000, 'unit' => 'kg'],
            ['name' => 'Bawang Putih', 'average_price' => 5000, 'unit' => 'bonggol'],
            ['name' => 'Bawang Merah', 'average_price' => 3000, 'unit' => 'ons'],
            ['name' => 'Cabai Rawit', 'average_price' => 2000, 'unit' => 'ons'],
            ['name' => 'Telur', 'average_price' => 2000, 'unit' => 'butir'],
            ['name' => 'Santan', 'average_price' => 5000, 'unit' => 'bungkus'],
            ['name' => 'Minyak Goreng', 'average_price' => 18000, 'unit' => 'liter'],
            ['name' => 'Beras', 'average_price' => 15000, 'unit' => 'kg'],
        ];

        foreach ($data as $item) {
            \App\Models\StapleIngredient::updateOrCreate(['name' => $item['name']], $item);
        }
    }
}
