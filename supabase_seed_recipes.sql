-- CookEdu starter recipes seed
-- Project: lhjdwmkceagdtnexiuek
-- Run after supabase_schema.sql. Safe to re-run: existing recipe titles are
-- updated with cleaner ingredient/step data, missing recipe titles are inserted.

begin;

insert into public.categories (name, slug, description)
values
  ('Indonesian', 'indonesian', 'Resep masakan Indonesia untuk menu rumahan dan latihan memasak.'),
  ('Healthy', 'healthy', 'Menu seimbang dengan bahan segar dan langkah sederhana.'),
  ('Dessert', 'dessert', 'Kudapan manis, jajanan pasar, dan penutup makan.'),
  ('Masakan Asia', 'masakan-asia', 'Inspirasi menu populer dari berbagai dapur Asia.'),
  ('Western', 'western', 'Menu western yang mudah dibuat di dapur rumah.'),
  ('Sup & Kaldu', 'sup-dan-kaldu', 'Sup, kaldu, dan kuah dasar untuk banyak masakan.'),
  ('Teknik Dasar', 'teknik-dasar', 'Materi dasar memasak untuk meningkatkan skill dapur.'),
  ('Minuman', 'minuman', 'Minuman segar dan praktis untuk teman makan.')
on conflict (name) do update
set
  slug = excluded.slug,
  description = excluded.description;

with seed_recipes (
  title,
  category_slug,
  description,
  difficulty,
  cooking_time,
  prep_time,
  servings,
  image_url,
  calories,
  protein,
  carbs,
  fat,
  main_ingredient,
  support_ingredient
) as (
  values
    ('Nasi Goreng Kampung', 'indonesian', 'Nasi goreng rumahan dengan aroma bawang, cabai, dan kecap yang gurih.', 'beginner', 18, 10, 2, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 520, 18, 72, 17, 'Nasi putih dingin', 'Telur ayam'),
    ('Rendang Daging Sapi', 'indonesian', 'Rendang empuk dengan bumbu rempah pekat dan santan yang dimasak perlahan.', 'advanced', 160, 25, 6, 'https://images.unsplash.com/photo-1604908177522-4028d1b5ecfd?auto=format&fit=crop&w=1200&q=80', 640, 38, 18, 46, 'Daging sapi', 'Santan kental'),
    ('Soto Ayam Lamongan', 'indonesian', 'Soto ayam berkuah kuning dengan koya, kol, dan suwiran ayam.', 'intermediate', 55, 20, 4, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', 430, 29, 32, 18, 'Ayam kampung', 'Koya soto'),
    ('Rawon Surabaya', 'indonesian', 'Sup daging hitam khas Jawa Timur dengan kluwek dan taoge pendek.', 'advanced', 95, 25, 5, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 560, 35, 20, 34, 'Daging sandung lamur', 'Kluwek'),
    ('Gado-Gado Siram', 'indonesian', 'Sayuran rebus, lontong, telur, dan saus kacang gurih pedas.', 'beginner', 25, 20, 4, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 460, 17, 48, 22, 'Sayuran rebus', 'Saus kacang'),
    ('Ayam Goreng Lengkuas', 'indonesian', 'Ayam ungkep berbumbu kuning dengan serundeng lengkuas renyah.', 'intermediate', 50, 20, 4, 'https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=1200&q=80', 590, 34, 16, 40, 'Ayam potong', 'Lengkuas parut'),
    ('Pepes Ikan Kemangi', 'indonesian', 'Ikan berbumbu halus dibungkus daun pisang dengan aroma kemangi.', 'intermediate', 35, 20, 3, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 360, 32, 12, 18, 'Ikan fillet', 'Daun kemangi'),
    ('Sayur Asem Sunda', 'indonesian', 'Kuah segar asam manis dengan jagung, labu, kacang panjang, dan melinjo.', 'beginner', 30, 15, 4, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 190, 7, 32, 4, 'Jagung manis', 'Asam jawa'),
    ('Bakso Kuah Rumahan', 'indonesian', 'Bakso sapi dengan kuah kaldu bening dan pelengkap mie serta sawi.', 'intermediate', 45, 20, 4, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 470, 26, 43, 18, 'Bakso sapi', 'Kaldu sapi'),
    ('Mie Aceh Tumis', 'indonesian', 'Mie kuning berbumbu kari pedas dengan sayur dan protein pilihan.', 'intermediate', 25, 15, 3, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 560, 24, 76, 17, 'Mie kuning', 'Bumbu kari'),
    ('Sate Ayam Madura', 'indonesian', 'Sate ayam bakar dengan saus kacang, kecap, dan sambal.', 'intermediate', 30, 25, 4, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80', 510, 33, 31, 27, 'Daging ayam', 'Saus kacang'),
    ('Opor Ayam Kuning', 'indonesian', 'Opor ayam santan berbumbu kuning yang cocok untuk lontong atau nasi.', 'intermediate', 55, 20, 5, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 610, 31, 19, 43, 'Ayam potong', 'Santan encer'),
    ('Pempek Palembang', 'indonesian', 'Pempek ikan kenyal dengan kuah cuko asam pedas manis.', 'advanced', 65, 30, 5, 'https://images.unsplash.com/photo-1604908177522-4028d1b5ecfd?auto=format&fit=crop&w=1200&q=80', 430, 24, 56, 10, 'Ikan tenggiri', 'Tepung sagu'),
    ('Gudeg Nangka', 'indonesian', 'Gudeg manis gurih dengan nangka muda, santan, dan daun jati.', 'advanced', 140, 25, 6, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 480, 15, 58, 19, 'Nangka muda', 'Santan'),
    ('Coto Makassar', 'indonesian', 'Sup daging berbumbu kacang dan rempah dengan kuah tebal.', 'advanced', 90, 25, 5, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 570, 34, 24, 35, 'Daging sapi', 'Kacang tanah sangrai'),
    ('Bubur Manado', 'indonesian', 'Bubur beras dengan labu, jagung, kangkung, dan daun kemangi.', 'beginner', 40, 15, 4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 330, 10, 61, 6, 'Beras', 'Labu kuning'),
    ('Lontong Sayur Medan', 'indonesian', 'Lontong dengan kuah sayur santan, labu siam, dan telur.', 'intermediate', 45, 20, 4, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 540, 19, 62, 23, 'Lontong', 'Labu siam'),
    ('Sambal Matah Bali', 'indonesian', 'Sambal iris segar dengan serai, bawang, cabai, dan minyak panas.', 'beginner', 8, 15, 4, 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=1200&q=80', 130, 2, 9, 10, 'Bawang merah', 'Serai'),
    ('Salad Quinoa Ayam', 'healthy', 'Salad tinggi protein dengan quinoa, ayam panggang, dan sayuran renyah.', 'beginner', 15, 20, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 420, 31, 39, 14, 'Quinoa matang', 'Dada ayam panggang'),
    ('Sup Brokoli Ringan', 'healthy', 'Sup brokoli lembut tanpa krim berat, cocok untuk makan malam ringan.', 'beginner', 25, 10, 3, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 210, 9, 24, 8, 'Brokoli', 'Susu rendah lemak'),
    ('Overnight Oats Pisang', 'healthy', 'Oat dingin praktis untuk sarapan dengan pisang, yogurt, dan chia seed.', 'beginner', 5, 10, 1, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80', 350, 14, 58, 8, 'Rolled oats', 'Pisang'),
    ('Tumis Tahu Brokoli', 'healthy', 'Tumis cepat dengan tahu, brokoli, bawang putih, dan saus ringan.', 'beginner', 15, 10, 2, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 320, 21, 24, 15, 'Tahu putih', 'Brokoli'),
    ('Smoothie Bowl Mangga', 'healthy', 'Smoothie bowl buah tropis dengan topping granola dan kelapa.', 'beginner', 5, 10, 1, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 310, 8, 59, 6, 'Mangga beku', 'Yogurt plain'),
    ('Nasi Merah Ayam Panggang', 'healthy', 'Meal prep sederhana dengan nasi merah, ayam panggang, dan sayuran.', 'intermediate', 30, 15, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 510, 39, 55, 13, 'Nasi merah', 'Dada ayam'),
    ('Wrap Sayur Telur', 'healthy', 'Tortilla isi telur, sayuran segar, dan saus yogurt.', 'beginner', 12, 10, 2, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80', 380, 19, 42, 14, 'Tortilla gandum', 'Telur'),
    ('Ikan Kukus Jahe', 'healthy', 'Ikan kukus lembut dengan jahe, daun bawang, dan kecap asin.', 'intermediate', 18, 15, 2, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 290, 33, 8, 13, 'Ikan fillet', 'Jahe iris'),
    ('Klepon Gula Merah', 'dessert', 'Klepon kenyal berisi gula merah cair dan baluran kelapa.', 'intermediate', 25, 25, 5, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 260, 4, 49, 6, 'Tepung ketan', 'Gula merah'),
    ('Dadar Gulung', 'dessert', 'Crepe pandan lembut dengan isian kelapa gula merah.', 'intermediate', 25, 20, 5, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 280, 5, 45, 9, 'Tepung terigu', 'Kelapa parut'),
    ('Puding Cokelat', 'dessert', 'Puding cokelat lembut dengan saus susu vanila.', 'beginner', 15, 10, 4, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 310, 7, 44, 12, 'Cokelat bubuk', 'Susu cair'),
    ('Pancake Pisang', 'dessert', 'Pancake lembut dengan pisang matang dan sedikit madu.', 'beginner', 15, 10, 2, 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80', 390, 10, 61, 12, 'Tepung terigu', 'Pisang matang'),
    ('Es Buah Yogurt', 'dessert', 'Potongan buah segar dengan yogurt dingin dan madu.', 'beginner', 5, 15, 3, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 240, 7, 45, 4, 'Buah campur', 'Yogurt plain'),
    ('Brownies Kukus', 'dessert', 'Brownies kukus cokelat yang lembut dan mudah dipotong.', 'intermediate', 35, 20, 8, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80', 420, 7, 58, 18, 'Dark chocolate', 'Tepung terigu'),
    ('Pie Susu Mini', 'dessert', 'Pie kecil dengan kulit renyah dan custard susu yang lembut.', 'advanced', 40, 30, 8, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', 330, 6, 42, 15, 'Tepung terigu', 'Susu kental manis'),
    ('Kolak Pisang Ubi', 'dessert', 'Kolak santan hangat dengan pisang, ubi, dan gula merah.', 'beginner', 25, 15, 4, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', 360, 5, 67, 9, 'Pisang kepok', 'Ubi kuning'),
    ('Chicken Teriyaki', 'masakan-asia', 'Ayam saus teriyaki manis gurih dengan taburan wijen.', 'beginner', 20, 15, 3, 'https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=1200&q=80', 460, 34, 31, 20, 'Paha ayam fillet', 'Saus teriyaki'),
    ('Ramen Shoyu Sederhana', 'masakan-asia', 'Ramen kuah shoyu praktis dengan telur, jamur, dan daun bawang.', 'intermediate', 35, 15, 2, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 540, 24, 69, 18, 'Mie ramen', 'Kaldu ayam'),
    ('Pad Thai Udang', 'masakan-asia', 'Kwetiau tumis ala Thailand dengan udang, telur, dan saus asam manis.', 'intermediate', 25, 20, 3, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=80', 520, 27, 68, 14, 'Kwetiau kering', 'Udang kupas'),
    ('Bibimbap Sayur', 'masakan-asia', 'Nasi Korea dengan sayuran tumis, telur, dan saus gochujang.', 'intermediate', 30, 20, 2, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80', 560, 19, 78, 18, 'Nasi hangat', 'Gochujang'),
    ('Tom Yum Ayam', 'masakan-asia', 'Sup Thailand asam pedas dengan serai, daun jeruk, dan ayam.', 'intermediate', 30, 15, 4, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 310, 25, 18, 13, 'Daging ayam', 'Bumbu tom yum'),
    ('Mapo Tofu', 'masakan-asia', 'Tahu lembut dengan saus pedas gurih dan daging cincang.', 'intermediate', 20, 15, 3, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 430, 24, 23, 26, 'Tahu sutra', 'Daging cincang'),
    ('Spaghetti Bolognese', 'western', 'Pasta saus tomat daging yang pekat dan cocok untuk keluarga.', 'beginner', 35, 15, 4, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80', 620, 28, 82, 18, 'Spaghetti', 'Daging sapi cincang'),
    ('Fish and Chips Oven', 'western', 'Ikan berbalut tepung roti yang dipanggang dengan kentang renyah.', 'intermediate', 35, 20, 3, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 540, 33, 58, 18, 'Ikan fillet', 'Kentang'),
    ('Chicken Steak Mushroom', 'western', 'Steak ayam panggang dengan saus jamur creamy.', 'intermediate', 30, 15, 2, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 560, 41, 24, 32, 'Dada ayam', 'Jamur kancing'),
    ('Mushroom Risotto', 'western', 'Risotto creamy dengan jamur, kaldu, dan keju parmesan.', 'advanced', 40, 15, 3, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80', 520, 16, 64, 21, 'Beras arborio', 'Jamur'),
    ('Margherita Pizza Teflon', 'western', 'Pizza sederhana tanpa oven dengan saus tomat, mozzarella, dan basil.', 'intermediate', 35, 30, 4, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80', 610, 24, 78, 22, 'Adonan pizza', 'Keju mozzarella'),
    ('Beef Burger Rumahan', 'western', 'Burger sapi juicy dengan sayuran segar dan saus sederhana.', 'intermediate', 25, 20, 4, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 680, 35, 55, 34, 'Patty sapi', 'Roti burger'),
    ('Kaldu Ayam Jernih', 'sup-dan-kaldu', 'Kaldu ayam bening sebagai dasar soto, sup, atau mie kuah.', 'beginner', 75, 10, 6, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 90, 10, 4, 4, 'Tulang ayam', 'Daun bawang'),
    ('Sup Tomat Basil', 'sup-dan-kaldu', 'Sup tomat hangat dengan basil, bawang putih, dan sedikit krim.', 'beginner', 25, 10, 3, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 240, 6, 31, 10, 'Tomat merah', 'Daun basil'),
    ('Saus Bechamel Dasar', 'teknik-dasar', 'Saus putih dasar untuk lasagna, pasta panggang, dan gratin.', 'beginner', 15, 5, 4, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 210, 7, 18, 12, 'Susu cair', 'Tepung terigu'),
    ('Teknik Dasar Potong Bawang', 'teknik-dasar', 'Panduan memotong bawang dengan ukuran cincang, iris, dan dadu kecil.', 'beginner', 10, 10, 1, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 40, 1, 9, 0, 'Bawang bombai', 'Pisau tajam'),
    ('Es Teh Lemon Madu', 'minuman', 'Teh dingin segar dengan lemon dan madu yang mudah dibuat.', 'beginner', 5, 10, 3, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 120, 0, 31, 0, 'Teh hitam', 'Lemon'),
    ('Jus Alpukat Cokelat', 'minuman', 'Jus alpukat creamy dengan susu dan saus cokelat.', 'beginner', 5, 10, 2, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80', 360, 7, 48, 16, 'Alpukat matang', 'Susu cair'),
    ('Soft-Baked Choco Chip Cookies', 'dessert', 'Cookies lembut dengan pinggir renyah dan lelehan cokelat di setiap gigitan.', 'intermediate', 12, 20, 8, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80', 410, 6, 54, 19, 'Tepung terigu protein sedang', 'Chocochips'),
    ('Classic Virgin Mint Mojito', 'minuman', 'Mocktail mint, jeruk nipis, dan soda yang segar tanpa alkohol.', 'beginner', 5, 10, 2, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80', 130, 0, 32, 0, 'Daun mint segar', 'Jeruk nipis'),
    ('Creamy Smoked Beef Carbonara', 'western', 'Pasta creamy gurih dengan smoked beef, kuning telur, dan parmesan.', 'intermediate', 20, 15, 2, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80', 690, 29, 76, 28, 'Spaghetti', 'Smoked beef'),
    ('Nasi Goreng Kampung Spesial', 'indonesian', 'Nasi goreng terasi dengan telur, ayam suwir, dan aroma cabai rumahan.', 'beginner', 18, 12, 2, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80', 560, 20, 76, 18, 'Nasi putih dingin', 'Telur ayam'),
    ('Soto Betawi Kuah Susu', 'indonesian', 'Soto khas Jakarta dengan kuah susu santan yang gurih dan daging empuk.', 'advanced', 75, 25, 5, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=1200&q=80', 620, 34, 22, 42, 'Daging sapi sandung lamur', 'Susu evaporasi'),
    ('Sup Tom Yum Seafood Pedas', 'masakan-asia', 'Sup Thailand asam pedas dengan udang, cumi, serai, dan daun jeruk.', 'intermediate', 25, 20, 4, 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=1200&q=80', 340, 31, 20, 12, 'Udang segar', 'Pasta tom yum'),
    ('Matcha Mille Crepes Cake', 'dessert', 'Kue lapis crepes tipis rasa matcha dengan krim lembut.', 'advanced', 35, 45, 8, 'https://images.unsplash.com/photo-1536680465769-a369695f76ff?auto=format&fit=crop&w=1200&q=80', 390, 8, 44, 19, 'Bubuk matcha', 'Whipped cream'),
    ('Fresh Avocado Chicken Salad', 'healthy', 'Salad ayam panggang, alpukat, selada, dan dressing lemon madu.', 'beginner', 15, 18, 2, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 430, 34, 24, 22, 'Dada ayam fillet', 'Alpukat matang'),
    ('Premium Golden Butter Croissant', 'western', 'Croissant berlapis dengan aroma butter kuat dan tekstur flaky.', 'advanced', 35, 180, 8, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80', 360, 7, 42, 18, 'Tepung protein tinggi', 'Butter sheet'),
    ('Savoury Chicken Teriyaki Bento', 'masakan-asia', 'Ayam teriyaki manis gurih dengan nasi hangat dan wijen sangrai.', 'beginner', 22, 15, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 590, 34, 68, 18, 'Paha ayam fillet', 'Saus teriyaki'),
    ('Ayam Bakar Taliwang', 'indonesian', 'Ayam bakar pedas khas Lombok dengan bumbu cabai dan terasi.', 'intermediate', 45, 20, 4, 'https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=1200&q=80', 540, 36, 15, 36, 'Ayam kampung', 'Cabai merah keriting'),
    ('Nasi Liwet Solo', 'indonesian', 'Nasi gurih santan dengan suwiran ayam, labu siam, dan telur pindang.', 'intermediate', 55, 25, 5, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 610, 21, 84, 21, 'Beras putih', 'Santan encer'),
    ('Sop Buntut Jakarta', 'sup-dan-kaldu', 'Sop buntut bening dengan wortel, kentang, dan kaldu sapi yang dalam.', 'advanced', 120, 25, 5, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 580, 38, 28, 34, 'Buntut sapi', 'Wortel dan kentang'),
    ('Tongseng Kambing Solo', 'indonesian', 'Tongseng kambing santan dengan kol, tomat, dan kecap manis.', 'advanced', 65, 25, 4, 'https://images.unsplash.com/photo-1604908177522-4028d1b5ecfd?auto=format&fit=crop&w=1200&q=80', 650, 36, 24, 42, 'Daging kambing', 'Kol putih'),
    ('Ikan Bakar Jimbaran', 'indonesian', 'Ikan bakar bumbu merah manis pedas ala pantai Jimbaran.', 'intermediate', 35, 25, 3, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 430, 38, 18, 21, 'Ikan kakap', 'Kecap manis'),
    ('Pecel Madiun', 'indonesian', 'Sayuran rebus dengan sambal kacang wangi kencur dan rempeyek.', 'beginner', 20, 20, 4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 390, 14, 48, 16, 'Sayuran rebus', 'Sambal kacang pecel'),
    ('Karedok Sunda', 'healthy', 'Sayuran mentah segar dengan bumbu kacang kencur khas Sunda.', 'beginner', 5, 18, 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 280, 9, 35, 12, 'Mentimun dan taoge', 'Bumbu kacang kencur'),
    ('Nasi Uduk Betawi', 'indonesian', 'Nasi gurih santan dengan bawang goreng, telur, dan sambal kacang.', 'intermediate', 45, 20, 4, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 560, 16, 76, 20, 'Beras putih', 'Santan dan serai'),
    ('Ayam Woku Kemangi', 'indonesian', 'Ayam bumbu kuning pedas Manado dengan aroma kemangi dan daun jeruk.', 'intermediate', 40, 20, 4, 'https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=1200&q=80', 520, 35, 18, 34, 'Ayam potong', 'Daun kemangi'),
    ('Udang Balado Padang', 'indonesian', 'Udang tumis balado merah dengan rasa pedas gurih khas rumah makan Padang.', 'beginner', 18, 15, 3, 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=80', 360, 28, 18, 18, 'Udang kupas', 'Cabai merah giling'),
    ('Perkedel Kentang', 'indonesian', 'Perkedel kentang lembut dengan daging cincang dan pala.', 'beginner', 25, 20, 4, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 310, 9, 38, 13, 'Kentang kukus', 'Daging cincang'),
    ('Papeda Kuah Kuning', 'indonesian', 'Papeda sagu dengan ikan kuah kuning kunyit yang segar.', 'advanced', 45, 25, 4, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 420, 30, 54, 8, 'Tepung sagu', 'Ikan kuah kuning'),
    ('Capcay Kuah Rumahan', 'healthy', 'Tumis kuah sayuran warna-warni dengan bakso atau ayam suwir.', 'beginner', 20, 15, 4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 260, 13, 30, 9, 'Brokoli dan wortel', 'Bakso sapi'),
    ('Bihun Goreng Jawa', 'indonesian', 'Bihun goreng manis gurih dengan telur, sayuran, dan bawang goreng.', 'beginner', 18, 15, 3, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 470, 16, 72, 12, 'Bihun jagung', 'Telur ayam'),
    ('Lodeh Nangka Muda', 'indonesian', 'Sayur lodeh santan dengan nangka muda, kacang panjang, dan terong.', 'intermediate', 45, 20, 5, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 420, 11, 42, 22, 'Nangka muda', 'Santan'),
    ('Salmon Teriyaki Bowl', 'healthy', 'Bowl nasi merah dengan salmon panggang teriyaki dan edamame.', 'intermediate', 22, 15, 2, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 560, 38, 54, 21, 'Fillet salmon', 'Nasi merah'),
    ('Tempe Oat Burger', 'healthy', 'Patty tempe oat tinggi serat dengan sayuran segar.', 'intermediate', 25, 20, 4, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 420, 22, 48, 15, 'Tempe kukus', 'Rolled oats'),
    ('Greek Yogurt Parfait', 'healthy', 'Lapisan yogurt, buah, granola, dan madu untuk sarapan ringan.', 'beginner', 5, 8, 2, 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80', 290, 14, 42, 8, 'Greek yogurt', 'Granola'),
    ('Tiramisu Cup', 'dessert', 'Tiramisu praktis dalam cup dengan kopi, mascarpone, dan cocoa powder.', 'intermediate', 10, 25, 6, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 360, 7, 42, 18, 'Ladyfinger', 'Mascarpone'),
    ('Apple Crumble', 'dessert', 'Apel hangat berbumbu kayu manis dengan remah butter renyah.', 'beginner', 30, 15, 4, 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?auto=format&fit=crop&w=1200&q=80', 340, 5, 56, 12, 'Apel hijau', 'Oat crumble'),
    ('Mango Sticky Rice', 'dessert', 'Ketan santan Thailand dengan mangga manis dan wijen.', 'intermediate', 30, 25, 4, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 420, 7, 78, 9, 'Beras ketan', 'Mangga matang'),
    ('Churros Cokelat', 'dessert', 'Churros renyah dengan gula kayu manis dan saus cokelat.', 'intermediate', 25, 20, 5, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', 390, 6, 51, 18, 'Tepung terigu', 'Saus cokelat'),
    ('Onde-Onde Kacang Hijau', 'dessert', 'Onde-onde wijen dengan isian kacang hijau lembut.', 'advanced', 40, 35, 8, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80', 300, 7, 46, 10, 'Tepung ketan', 'Kacang hijau kupas'),
    ('Kimbap Sayur Telur', 'masakan-asia', 'Nasi gulung Korea dengan sayur, telur dadar, dan nori.', 'intermediate', 20, 25, 4, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80', 470, 15, 68, 14, 'Nasi pulen', 'Nori lembaran'),
    ('Pho Ga Vietnam', 'masakan-asia', 'Sup mie Vietnam dengan ayam, kaldu rempah, dan daun herbal.', 'advanced', 70, 25, 4, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80', 430, 31, 52, 10, 'Daging ayam', 'Rice noodle'),
    ('Thai Green Curry', 'masakan-asia', 'Kari hijau Thailand dengan ayam, santan, dan daun basil.', 'intermediate', 30, 20, 4, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80', 520, 29, 26, 34, 'Paha ayam fillet', 'Pasta kari hijau'),
    ('Kung Pao Chicken', 'masakan-asia', 'Ayam tumis pedas manis dengan kacang mede dan paprika.', 'intermediate', 22, 15, 3, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', 510, 35, 30, 27, 'Dada ayam', 'Kacang mede'),
    ('Mac and Cheese Panggang', 'western', 'Makaroni saus keju creamy yang dipanggang hingga atasnya renyah.', 'intermediate', 35, 15, 4, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80', 640, 24, 72, 28, 'Makaroni', 'Keju cheddar'),
    ('Shepherd Pie', 'western', 'Pie daging cincang dengan lapisan mashed potato lembut.', 'advanced', 45, 25, 5, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 590, 31, 48, 29, 'Daging sapi cincang', 'Kentang tumbuk'),
    ('Ratatouille Sayur', 'western', 'Sayuran panggang ala Perancis dengan saus tomat herbal.', 'intermediate', 40, 25, 4, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 240, 7, 34, 9, 'Zucchini dan terong', 'Saus tomat'),
    ('Chicken Alfredo', 'western', 'Fettuccine saus alfredo creamy dengan ayam panggang.', 'intermediate', 28, 15, 3, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80', 710, 36, 74, 30, 'Fettuccine', 'Dada ayam'),
    ('Minestrone Soup', 'sup-dan-kaldu', 'Sup sayur Italia dengan kacang merah, pasta kecil, dan tomat.', 'beginner', 35, 15, 5, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 290, 12, 45, 7, 'Sayuran campur', 'Kacang merah'),
    ('Cream Soup Jagung', 'sup-dan-kaldu', 'Sup jagung creamy dengan ayam suwir dan susu.', 'beginner', 25, 15, 4, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 330, 13, 42, 12, 'Jagung manis', 'Susu cair'),
    ('Miso Soup Tahu', 'sup-dan-kaldu', 'Sup Jepang ringan dengan miso, tahu sutra, dan wakame.', 'beginner', 12, 10, 3, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 140, 10, 13, 5, 'Pasta miso', 'Tahu sutra'),
    ('Sup Kacang Merah', 'sup-dan-kaldu', 'Sup kacang merah dengan daging, wortel, dan pala.', 'intermediate', 60, 20, 5, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 430, 24, 46, 16, 'Kacang merah', 'Daging sapi'),
    ('Adonan Pizza Dasar', 'teknik-dasar', 'Teknik membuat adonan pizza elastis untuk teflon atau oven.', 'intermediate', 20, 90, 4, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 260, 8, 48, 4, 'Tepung protein tinggi', 'Ragi instan'),
    ('Kaldu Sayur Dasar', 'teknik-dasar', 'Kaldu sayur serbaguna dari wortel, seledri, bawang, dan jamur.', 'beginner', 60, 15, 6, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 70, 3, 13, 1, 'Wortel dan seledri', 'Jamur kancing'),
    ('Iced Matcha Latte', 'minuman', 'Matcha dingin dengan susu creamy dan sedikit gula cair.', 'beginner', 5, 8, 2, 'https://images.unsplash.com/photo-1536680465769-a369695f76ff?auto=format&fit=crop&w=1200&q=80', 210, 8, 28, 7, 'Bubuk matcha', 'Susu cair dingin'),
    ('Wedang Jahe Madu', 'minuman', 'Minuman hangat jahe, serai, dan madu untuk cuaca dingin.', 'beginner', 12, 8, 3, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 110, 0, 28, 0, 'Jahe segar', 'Madu'),
    ('Es Kopi Susu Gula Aren', 'minuman', 'Kopi susu dingin dengan gula aren cair yang legit.', 'beginner', 5, 8, 2, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80', 230, 6, 36, 7, 'Kopi espresso', 'Gula aren cair'),
    ('Thai Tea Homemade', 'minuman', 'Thai tea pekat dengan susu evaporasi dan es batu.', 'beginner', 8, 10, 2, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 240, 6, 41, 6, 'Teh thailand', 'Susu evaporasi'),
    ('Lemon Cucumber Infused Water', 'minuman', 'Infused water lemon mentimun yang ringan dan menyegarkan.', 'beginner', 1, 8, 4, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 20, 0, 5, 0, 'Mentimun', 'Lemon'),
    ('Smoothie Stroberi Pisang', 'minuman', 'Smoothie buah creamy dari stroberi, pisang, dan yogurt.', 'beginner', 5, 8, 2, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 260, 8, 51, 4, 'Stroberi beku', 'Pisang matang'),
    ('Es Cincau Gula Merah', 'minuman', 'Cincau hitam dingin dengan santan ringan dan sirup gula merah.', 'beginner', 5, 10, 3, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 210, 2, 43, 5, 'Cincau hitam', 'Gula merah cair'),
    ('Susu Kurma Dingin', 'minuman', 'Susu dingin blender dengan kurma untuk minuman manis alami.', 'beginner', 5, 8, 2, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80', 280, 9, 48, 6, 'Kurma medjool', 'Susu cair'),
    ('Jamu Kunyit Asam', 'minuman', 'Jamu kunyit asam rumahan yang segar, hangat, dan ringan.', 'beginner', 18, 12, 4, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80', 90, 1, 22, 0, 'Kunyit segar', 'Asam jawa')
),
numbered_seed as (
  select
    seed_recipes.*,
    row_number() over (order by title) as seed_order
  from seed_recipes
),
recipe_payload as (
  select
    s.seed_order,
    null::uuid as user_id,
    s.title,
    c.name as category,
    c.id as category_id,
    s.description,
    s.image_url,
    s.difficulty,
    case
      when s.category_slug = 'minuman' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi bahan utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', case when lower(s.title) like '%wedang%' or lower(s.title) like '%jamu%' then 'Air matang hangat' else 'Es batu' end, 'amount', '1', 'unit', 'gelas'),
        jsonb_build_object('item', case when lower(s.title) like '%kopi%' then 'Susu cair dingin' else 'Madu atau gula cair' end, 'amount', '1-2', 'unit', 'sdm')
      )
      when s.category_slug = 'dessert' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Gula pasir atau gula halus', 'amount', '2-4', 'unit', 'sdm'),
        jsonb_build_object('item', 'Susu cair, santan, atau butter', 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Vanila atau garam halus', 'amount', '1', 'unit', 'sejumput')
      )
      when s.category_slug = 'healthy' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Sayuran segar', 'amount', '1', 'unit', 'mangkuk'),
        jsonb_build_object('item', 'Minyak zaitun atau perasan lemon', 'amount', '1-2', 'unit', 'sdm'),
        jsonb_build_object('item', 'Garam dan lada hitam', 'amount', '1', 'unit', 'secukupnya')
      )
      when s.category_slug = 'masakan-asia' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Bawang putih dan jahe', 'amount', '2-3', 'unit', 'siung/cm'),
        jsonb_build_object('item', 'Kecap asin atau saus tiram', 'amount', '1-2', 'unit', 'sdm'),
        jsonb_build_object('item', 'Daun bawang atau wijen', 'amount', '1', 'unit', 'secukupnya')
      )
      when s.category_slug = 'western' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Bawang bombai atau bawang putih', 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Butter atau minyak zaitun', 'amount', '1-2', 'unit', 'sdm'),
        jsonb_build_object('item', 'Keju, herba, garam, dan lada', 'amount', '1', 'unit', 'secukupnya')
      )
      when s.category_slug = 'sup-dan-kaldu' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Air atau kaldu dasar', 'amount', '1', 'unit', 'liter'),
        jsonb_build_object('item', 'Daun bawang atau seledri', 'amount', '1', 'unit', 'batang'),
        jsonb_build_object('item', 'Garam dan lada', 'amount', '1', 'unit', 'secukupnya')
      )
      when s.category_slug = 'teknik-dasar' then jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi latihan'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Alat dapur bersih', 'amount', '1', 'unit', 'set'),
        jsonb_build_object('item', 'Talenan dan lap bersih', 'amount', '1', 'unit', 'set')
      )
      else jsonb_build_array(
        jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
        jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Bawang merah dan bawang putih', 'amount', '4-6', 'unit', 'siung'),
        jsonb_build_object('item', 'Cabai atau rempah pilihan', 'amount', '1', 'unit', 'secukupnya'),
        jsonb_build_object('item', 'Garam, gula, dan merica', 'amount', '1', 'unit', 'secukupnya')
      )
    end as ingredients,
    case
      when s.category_slug = 'minuman' then jsonb_build_array(
        jsonb_build_object('instruction', 'Cuci atau siapkan ' || s.main_ingredient || ' dan ' || s.support_ingredient || ' sampai bersih.'),
        jsonb_build_object('instruction', 'Campur bahan utama dengan pemanis, air, susu, atau soda sesuai karakter minuman.'),
        jsonb_build_object('instruction', 'Aduk, kocok, atau blender sampai rata, lalu koreksi rasa.'),
        jsonb_build_object('instruction', 'Sajikan dingin dengan es batu atau hangat untuk wedang dan jamu.')
      )
      when s.category_slug = 'dessert' then jsonb_build_array(
        jsonb_build_object('instruction', 'Timbang bahan utama dan siapkan loyang, cetakan, atau gelas saji.'),
        jsonb_build_object('instruction', 'Campur ' || s.main_ingredient || ' dengan ' || s.support_ingredient || ' hingga adonan rata.'),
        jsonb_build_object('instruction', 'Masak, kukus, panggang, atau dinginkan sesuai tekstur dessert yang diinginkan.'),
        jsonb_build_object('instruction', 'Diamkan sebentar agar set, lalu sajikan dengan topping yang sesuai.')
      )
      when s.category_slug = 'healthy' then jsonb_build_array(
        jsonb_build_object('instruction', 'Cuci sayuran dan siapkan ' || s.main_ingredient || ' dalam ukuran mudah dimakan.'),
        jsonb_build_object('instruction', 'Masak protein atau bahan utama dengan sedikit minyak sampai matang.'),
        jsonb_build_object('instruction', 'Campur dengan ' || s.support_ingredient || ' dan sayuran segar.'),
        jsonb_build_object('instruction', 'Beri dressing ringan, koreksi rasa, lalu sajikan segera.')
      )
      when s.category_slug = 'masakan-asia' then jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan ' || s.main_ingredient || ' dan bumbu aromatik seperti bawang putih serta jahe.'),
        jsonb_build_object('instruction', 'Tumis bumbu sampai harum, lalu masukkan bahan utama.'),
        jsonb_build_object('instruction', 'Tambahkan ' || s.support_ingredient || ' dan saus sesuai kebutuhan.'),
        jsonb_build_object('instruction', 'Masak sampai bumbu meresap, taburi pelengkap, lalu sajikan hangat.')
      )
      when s.category_slug = 'western' then jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan bahan utama, panaskan pan atau oven sesuai kebutuhan resep.'),
        jsonb_build_object('instruction', 'Masak ' || s.main_ingredient || ' dengan butter atau minyak hingga matang.'),
        jsonb_build_object('instruction', 'Tambahkan ' || s.support_ingredient || ' lalu bumbui dengan garam, lada, dan herba.'),
        jsonb_build_object('instruction', 'Selesaikan saus atau topping, lalu sajikan saat masih hangat.')
      )
      when s.category_slug = 'sup-dan-kaldu' then jsonb_build_array(
        jsonb_build_object('instruction', 'Rebus air atau kaldu, lalu masukkan ' || s.main_ingredient || '.'),
        jsonb_build_object('instruction', 'Tambahkan ' || s.support_ingredient || ' dan bumbu aromatik.'),
        jsonb_build_object('instruction', 'Masak perlahan sampai kuah terasa gurih dan bahan empuk.'),
        jsonb_build_object('instruction', 'Koreksi rasa, saring jika perlu, lalu sajikan hangat.')
      )
      when s.category_slug = 'teknik-dasar' then jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan area kerja, alat, dan bahan dalam kondisi bersih.'),
        jsonb_build_object('instruction', 'Kerjakan teknik pada ' || s.main_ingredient || ' secara perlahan dan konsisten.'),
        jsonb_build_object('instruction', 'Periksa tekstur, ukuran, atau hasil akhir sebelum digunakan di resep lain.'),
        jsonb_build_object('instruction', 'Rapikan alat dan simpan hasil latihan sesuai kebutuhan.')
      )
      else jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan ' || s.main_ingredient || ', ' || s.support_ingredient || ', dan bumbu dasar.'),
        jsonb_build_object('instruction', 'Tumis bumbu sampai matang dan harum agar rasa tidak langu.'),
        jsonb_build_object('instruction', 'Masukkan bahan utama, aduk rata, lalu masak sampai bumbu meresap.'),
        jsonb_build_object('instruction', 'Koreksi rasa, tambahkan pelengkap, dan sajikan selagi hangat.')
      )
    end as steps,
    s.cooking_time,
    s.prep_time,
    s.servings,
    jsonb_build_object(
      'calories', s.calories,
      'protein', s.protein,
      'carbs', s.carbs,
      'fat', s.fat
    ) as nutritional_info
  from numbered_seed s
  join public.categories c on c.slug = s.category_slug
),
updated_recipes as (
  update public.recipes target
  set
    category = p.category,
    category_id = p.category_id,
    description = p.description,
    image_url = p.image_url,
    difficulty = p.difficulty,
    ingredients = p.ingredients,
    steps = p.steps,
    cooking_time = p.cooking_time,
    prep_time = p.prep_time,
    servings = p.servings,
    nutritional_info = p.nutritional_info,
    min_temp_celsius = null,
    max_temp_celsius = null,
    video_url = null,
    is_official = true,
    is_published = true,
    updated_at = now()
  from recipe_payload p
  where lower(target.title) = lower(p.title)
  returning target.id
),
inserted_recipes as (
  insert into public.recipes (
    user_id,
    title,
    category,
    category_id,
    description,
    image_url,
    difficulty,
    ingredients,
    steps,
    cooking_time,
    prep_time,
    servings,
    nutritional_info,
    min_temp_celsius,
    max_temp_celsius,
    video_url,
    is_official,
    is_published,
    created_at,
    updated_at
  )
  select
    p.user_id,
    p.title,
    p.category,
    p.category_id,
    p.description,
    p.image_url,
    p.difficulty,
    p.ingredients,
    p.steps,
    p.cooking_time,
    p.prep_time,
    p.servings,
    p.nutritional_info,
    null,
    null,
    null,
    true,
    true,
    now() - (p.seed_order * interval '3 minutes'),
    now()
  from recipe_payload p
  where not exists (
    select 1
    from public.recipes existing
    where lower(existing.title) = lower(p.title)
  )
  returning id
)
select
  (select count(*) from updated_recipes) as updated_recipe_count,
  (select count(*) from inserted_recipes) as inserted_recipe_count,
  (select count(*) from recipe_payload) as total_seed_recipe_count;

notify pgrst, 'reload schema';

commit;
