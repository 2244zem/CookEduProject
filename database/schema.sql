-- ============================================
-- Cooking Tutorial Platform — Database Schema
-- ============================================
-- Skema ini menggunakan relasi one-to-many yang ternormalisasi.
-- Setiap tabel memiliki foreign key dengan ON DELETE CASCADE
-- untuk menjaga integritas data.

CREATE DATABASE IF NOT EXISTS cooking_tutorial;
USE cooking_tutorial;

-- -----------------------------------------------
-- Tabel: users
-- Menyimpan data pengguna (user biasa & admin).
-- Kolom 'role' membedakan hak akses.
-- -----------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- Hashed dengan password_hash()
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: categories
-- Kategori resep (misalnya: Makanan Indonesia,
-- Dessert, Minuman, dll.)
-- -----------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,       -- URL-friendly identifier
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: recipes
-- Data utama resep. Terhubung ke users (pembuat)
-- dan categories (klasifikasi).
-- -----------------------------------------------
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,       -- Untuk URL yang SEO-friendly
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    prep_time INT DEFAULT 0,                 -- Dalam menit
    cook_time INT DEFAULT 0,                 -- Dalam menit
    servings INT DEFAULT 1,
    difficulty ENUM('mudah', 'sedang', 'sulit') DEFAULT 'mudah',
    is_featured TINYINT(1) DEFAULT 0,        -- Untuk tampil di homepage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: ingredients
-- Bahan-bahan resep. Relasi one-to-many dari recipes.
-- sort_order mengatur urutan tampilan bahan.
-- -----------------------------------------------
CREATE TABLE ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    quantity VARCHAR(50) DEFAULT NULL,        -- Misalnya: "200"
    unit VARCHAR(30) DEFAULT NULL,            -- Misalnya: "gram", "sdm", "buah"
    sort_order INT DEFAULT 0,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_recipe (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: recipe_steps
-- Langkah-langkah memasak. Setiap step bisa
-- memiliki gambar opsional untuk ilustrasi.
-- -----------------------------------------------
CREATE TABLE recipe_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,      -- Gambar opsional per langkah

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_recipe_step (recipe_id, step_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: todo_lists
-- Daftar belanja milik user. Satu user bisa
-- punya banyak daftar belanja.
-- -----------------------------------------------
CREATE TABLE todo_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tabel: todo_items
-- Item-item dalam daftar belanja. is_checked
-- menandai apakah bahan sudah dibeli/disiapkan.
-- -----------------------------------------------
CREATE TABLE todo_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    todo_list_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity VARCHAR(50) DEFAULT NULL,
    is_checked TINYINT(1) DEFAULT 0,

    FOREIGN KEY (todo_list_id) REFERENCES todo_lists(id) ON DELETE CASCADE,
    INDEX idx_todo_list (todo_list_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------
-- Tabel: notifications
-- Notifikasi untuk user (bell icon di dashboard)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    message TEXT DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- SEED DATA — Data contoh untuk development
-- ============================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin Chef', 'admin@masakyuk.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Budi Santoso', 'budi@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Sari Dewi', 'sari@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Kategori
INSERT INTO categories (name, slug, description) VALUES
('Masakan Indonesia', 'masakan-indonesia', 'Aneka masakan tradisional dan modern dari Nusantara'),
('Dessert & Kue', 'dessert-kue', 'Hidangan penutup dan aneka kue yang manis'),
('Minuman', 'minuman', 'Resep minuman segar dan hangat'),
('Masakan Asia', 'masakan-asia', 'Kuliner dari berbagai negara Asia'),
('Sarapan', 'sarapan', 'Menu sarapan sehat dan praktis');

-- Resep contoh: Nasi Goreng
INSERT INTO recipes (user_id, category_id, title, slug, description, prep_time, cook_time, servings, difficulty, is_featured) VALUES
(1, 1, 'Nasi Goreng Spesial', 'nasi-goreng-spesial', 'Nasi goreng khas Indonesia dengan bumbu rahasia yang membuat rasanya tak terlupakan. Cocok untuk sarapan maupun makan malam.', 15, 10, 2, 'mudah', 1),
(1, 2, 'Brownies Kukus Amanda', 'brownies-kukus-amanda', 'Brownies kukus lembut dan moist dengan rasa cokelat yang pekat. Resep yang sudah terbukti anti gagal.', 20, 30, 8, 'sedang', 1),
(1, 3, 'Es Teh Tarik', 'es-teh-tarik', 'Minuman teh susu khas yang creamy dan menyegarkan. Sempurna untuk menemani hari yang panas.', 5, 5, 1, 'mudah', 0);

-- Bahan Nasi Goreng (recipe_id = 1)
INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(1, 'Nasi putih (sisa semalam)', '400', 'gram', 1),
(1, 'Telur ayam', '2', 'butir', 2),
(1, 'Bawang merah', '5', 'siung', 3),
(1, 'Bawang putih', '3', 'siung', 4),
(1, 'Cabai merah keriting', '3', 'buah', 5),
(1, 'Kecap manis', '2', 'sdm', 6),
(1, 'Garam', '1', 'sdt', 7),
(1, 'Minyak goreng', '3', 'sdm', 8),
(1, 'Daun bawang', '2', 'batang', 9),
(1, 'Udang kupas (opsional)', '100', 'gram', 10);

-- Langkah Nasi Goreng (recipe_id = 1)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(1, 1, 'Haluskan bawang merah, bawang putih, dan cabai merah menggunakan cobek atau blender hingga menjadi pasta bumbu yang halus.'),
(1, 2, 'Panaskan minyak goreng di wajan besar atau wok dengan api sedang-tinggi. Pastikan wajan sudah benar-benar panas.'),
(1, 3, 'Tumis bumbu halus hingga harum dan matang, sekitar 2-3 menit. Aduk terus agar tidak gosong.'),
(1, 4, 'Sisihkan bumbu ke pinggir wajan, pecahkan telur dan orak-arik hingga setengah matang.'),
(1, 5, 'Masukkan nasi putih, aduk rata dengan bumbu dan telur. Gunakan api besar agar nasi mendapat efek "wok hei".'),
(1, 6, 'Tambahkan kecap manis dan garam, aduk merata. Masak selama 3-4 menit sambil terus diaduk.'),
(1, 7, 'Taburi daun bawang yang sudah diiris. Sajikan panas dengan pelengkap kerupuk dan acar.');

-- Bahan Brownies (recipe_id = 2)
INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
(2, 'Dark cooking chocolate', '200', 'gram', 1),
(2, 'Mentega', '100', 'gram', 2),
(2, 'Telur ayam', '4', 'butir', 3),
(2, 'Gula pasir', '150', 'gram', 4),
(2, 'Tepung terigu', '100', 'gram', 5),
(2, 'Cokelat bubuk', '30', 'gram', 6),
(2, 'Vanilla extract', '1', 'sdt', 7);

-- Langkah Brownies (recipe_id = 2)
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
(2, 1, 'Tim dark cooking chocolate dan mentega hingga meleleh sempurna. Aduk rata dan sisihkan untuk didinginkan sedikit.'),
(2, 2, 'Kocok telur dan gula pasir menggunakan mixer dengan kecepatan tinggi selama 8-10 menit hingga mengembang kental berjejak.'),
(2, 3, 'Masukkan campuran cokelat yang sudah agak dingin ke adonan telur. Aduk balik (fold) perlahan dengan spatula.'),
(2, 4, 'Ayak tepung terigu dan cokelat bubuk, masukkan ke adonan. Aduk balik hingga tidak ada tepung yang tersisa.'),
(2, 5, 'Tuang adonan ke dalam loyang yang sudah dialasi kertas roti. Kukus selama 25-30 menit dengan api sedang.'),
(2, 6, 'Angkat dan dinginkan sebelum dipotong. Sajikan dengan taburan gula halus atau topping sesuai selera.');
