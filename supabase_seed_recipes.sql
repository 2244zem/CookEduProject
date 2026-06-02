-- CookEdu starter recipes seed
-- Project: lhjdwmkceagdtnexiuek
-- Run after supabase_schema.sql. Safe to re-run: existing recipe titles are skipped.

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
    ('Jus Alpukat Cokelat', 'minuman', 'Jus alpukat creamy dengan susu dan saus cokelat.', 'beginner', 5, 10, 2, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=1200&q=80', 360, 7, 48, 16, 'Alpukat matang', 'Susu cair')
),
numbered_seed as (
  select
    seed_recipes.*,
    row_number() over (order by title) as seed_order
  from seed_recipes
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
    null,
    s.title,
    c.name,
    c.id,
    s.description,
    s.image_url,
    s.difficulty,
    jsonb_build_array(
      jsonb_build_object('item', s.main_ingredient, 'amount', '1', 'unit', 'porsi utama'),
      jsonb_build_object('item', s.support_ingredient, 'amount', '1', 'unit', 'secukupnya'),
      jsonb_build_object('item', 'Bawang merah dan bawang putih', 'amount', '4', 'unit', 'siung'),
      jsonb_build_object('item', 'Garam, gula, dan merica', 'amount', '1', 'unit', 'secukupnya')
    ),
    case
      when s.category_slug = 'minuman' then jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan bahan minuman, cuci buah atau pelengkap sampai bersih.'),
        jsonb_build_object('instruction', 'Campur bahan utama dengan pemanis dan air atau susu sesuai kebutuhan.'),
        jsonb_build_object('instruction', 'Aduk atau blender sampai rata, lalu sajikan dingin.')
      )
      when s.category_slug = 'teknik-dasar' then jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan alat kerja yang bersih, stabil, dan aman digunakan.'),
        jsonb_build_object('instruction', 'Ikuti teknik dasar secara perlahan sambil menjaga ukuran dan konsistensi.'),
        jsonb_build_object('instruction', 'Rapikan hasil kerja dan simpan bahan siap pakai sesuai kebutuhan resep.')
      )
      else jsonb_build_array(
        jsonb_build_object('instruction', 'Siapkan semua bahan untuk ' || s.title || ' dan ukur sesuai kebutuhan.'),
        jsonb_build_object('instruction', 'Panaskan wajan atau panci, tumis bumbu dasar hingga harum.'),
        jsonb_build_object('instruction', 'Masukkan bahan utama dan pelengkap, lalu masak sampai matang dan bumbu meresap.'),
        jsonb_build_object('instruction', 'Koreksi rasa, matikan api, dan sajikan selagi hangat.')
      )
    end,
    s.cooking_time,
    s.prep_time,
    s.servings,
    jsonb_build_object(
      'calories', s.calories,
      'protein', s.protein,
      'carbs', s.carbs,
      'fat', s.fat
    ),
    null,
    null,
    null,
    true,
    true,
    now() - (s.seed_order * interval '3 minutes'),
    now()
  from numbered_seed s
  join public.categories c on c.slug = s.category_slug
  where not exists (
    select 1
    from public.recipes existing
    where lower(existing.title) = lower(s.title)
  )
  returning id
)
select count(*) as inserted_recipe_count
from inserted_recipes;

notify pgrst, 'reload schema';

commit;
