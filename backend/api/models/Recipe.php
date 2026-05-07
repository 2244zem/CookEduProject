<?php
/**
 * ============================================
 * Recipe Model — Query Logic untuk Resep
 * ============================================
 * 
 * Model ini menangani operasi CRUD untuk resep,
 * termasuk relasi ke ingredients dan recipe_steps.
 * Data dikembalikan dalam format nested (resep + bahan + langkah).
 */

class Recipe
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Ambil semua resep dengan pagination.
     * Menyertakan nama kategori melalui JOIN.
     * 
     * @param int         $page       Halaman saat ini
     * @param int         $perPage    Jumlah per halaman
     * @param int|null    $categoryId Filter berdasarkan kategori
     * @param string|null $search     Kata kunci pencarian
     * @return array      Data resep + informasi pagination
     */
    public function getAll(int $page = 1, int $perPage = 12, ?int $categoryId = null, ?string $search = null): array
    {
        $where = [];
        $params = [];

        // Bangun kondisi WHERE secara dinamis
        if ($categoryId) {
            $where[] = "r.category_id = :category_id";
            $params[':category_id'] = $categoryId;
        }
        if ($search) {
            $where[] = "(r.title LIKE :search OR r.description LIKE :search2)";
            $params[':search'] = "%{$search}%";
            $params[':search2'] = "%{$search}%";
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset = ($page - 1) * $perPage;

        // Hitung total data untuk pagination
        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM recipes r {$whereClause}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Ambil data resep dengan info kategori dan pembuat
        $stmt = $this->db->prepare("
            SELECT r.*, c.name as category_name, c.slug as category_slug,
                   u.name as author_name
            FROM recipes r
            JOIN categories c ON r.category_id = c.id
            JOIN users u ON r.user_id = u.id
            {$whereClause}
            ORDER BY r.created_at DESC
            LIMIT :limit OFFSET :offset
        ");

        // Bind parameter pagination secara terpisah karena tipenya INT
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'recipes' => $stmt->fetchAll(),
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage
        ];
    }

    /**
     * Ambil detail satu resep berdasarkan slug.
     * Mengembalikan data lengkap: resep + bahan + langkah.
     * 
     * Menggunakan slug (bukan ID) agar URL lebih SEO-friendly.
     * Contoh: /resep/nasi-goreng-spesial
     * 
     * @param string $slug  URL slug resep
     * @return array|null   Data resep lengkap atau null
     */
    public function findBySlug(string $slug): ?array
    {
        // Ambil data resep utama
        $stmt = $this->db->prepare("
            SELECT r.*, c.name as category_name, c.slug as category_slug,
                   u.name as author_name
            FROM recipes r
            JOIN categories c ON r.category_id = c.id
            JOIN users u ON r.user_id = u.id
            WHERE r.slug = :slug
        ");
        $stmt->execute([':slug' => $slug]);
        $recipe = $stmt->fetch();

        if (!$recipe) return null;

        // Ambil daftar bahan, diurutkan sesuai sort_order
        $stmtIngredients = $this->db->prepare("
            SELECT id, name, quantity, unit, sort_order
            FROM ingredients
            WHERE recipe_id = :recipe_id
            ORDER BY sort_order ASC
        ");
        $stmtIngredients->execute([':recipe_id' => $recipe['id']]);
        $recipe['ingredients'] = $stmtIngredients->fetchAll();

        // Ambil langkah-langkah memasak, diurutkan
        $stmtSteps = $this->db->prepare("
            SELECT id, step_number, instruction, image_url
            FROM recipe_steps
            WHERE recipe_id = :recipe_id
            ORDER BY step_number ASC
        ");
        $stmtSteps->execute([':recipe_id' => $recipe['id']]);
        $recipe['steps'] = $stmtSteps->fetchAll();

        return $recipe;
    }

    /**
     * Membuat resep baru beserta bahan dan langkah-langkahnya.
     * Menggunakan transaksi database agar data konsisten —
     * jika satu operasi gagal, semua di-rollback.
     * 
     * @param array $data  Data resep dari request body
     * @param int   $userId  ID user yang membuat resep
     * @return array       Resep yang baru dibuat (lengkap)
     */
    public function create(array $data, int $userId): array
    {
        $this->db->beginTransaction();

        try {
            // Buat slug dari title (URL-friendly)
            $slug = $this->generateSlug($data['title']);

            // Insert resep utama
            $stmt = $this->db->prepare("
                INSERT INTO recipes (user_id, category_id, title, slug, description, 
                                     image_url, prep_time, cook_time, servings, difficulty, is_featured)
                VALUES (:user_id, :category_id, :title, :slug, :description,
                        :image_url, :prep_time, :cook_time, :servings, :difficulty, :is_featured)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':category_id' => $data['category_id'],
                ':title' => $data['title'],
                ':slug' => $slug,
                ':description' => $data['description'] ?? '',
                ':image_url' => $data['image_url'] ?? null,
                ':prep_time' => $data['prep_time'] ?? 0,
                ':cook_time' => $data['cook_time'] ?? 0,
                ':servings' => $data['servings'] ?? 1,
                ':difficulty' => $data['difficulty'] ?? 'mudah',
                ':is_featured' => $data['is_featured'] ?? 0
            ]);

            $recipeId = $this->db->lastInsertId();

            // Insert bahan-bahan (ingredients)
            if (!empty($data['ingredients'])) {
                $stmtIng = $this->db->prepare("
                    INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order)
                    VALUES (:recipe_id, :name, :quantity, :unit, :sort_order)
                ");
                foreach ($data['ingredients'] as $index => $ingredient) {
                    $stmtIng->execute([
                        ':recipe_id' => $recipeId,
                        ':name' => $ingredient['name'],
                        ':quantity' => $ingredient['quantity'] ?? null,
                        ':unit' => $ingredient['unit'] ?? null,
                        ':sort_order' => $index + 1
                    ]);
                }
            }

            // Insert langkah-langkah (steps)
            if (!empty($data['steps'])) {
                $stmtStep = $this->db->prepare("
                    INSERT INTO recipe_steps (recipe_id, step_number, instruction, image_url)
                    VALUES (:recipe_id, :step_number, :instruction, :image_url)
                ");
                foreach ($data['steps'] as $index => $step) {
                    $stmtStep->execute([
                        ':recipe_id' => $recipeId,
                        ':step_number' => $index + 1,
                        ':instruction' => $step['instruction'],
                        ':image_url' => $step['image_url'] ?? null
                    ]);
                }
            }

            $this->db->commit();
            return $this->findBySlug($slug);

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update resep beserta bahan dan langkahnya.
     * Strategi: hapus bahan/langkah lama, insert yang baru.
     * Ini lebih sederhana daripada tracking perubahan individual.
     */
    public function update(int $id, array $data): array
    {
        $this->db->beginTransaction();

        try {
            // Update data resep utama
            $stmt = $this->db->prepare("
                UPDATE recipes 
                SET category_id = :category_id, title = :title, description = :description,
                    image_url = :image_url, prep_time = :prep_time, cook_time = :cook_time,
                    servings = :servings, difficulty = :difficulty, is_featured = :is_featured
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $id,
                ':category_id' => $data['category_id'],
                ':title' => $data['title'],
                ':description' => $data['description'] ?? '',
                ':image_url' => $data['image_url'] ?? null,
                ':prep_time' => $data['prep_time'] ?? 0,
                ':cook_time' => $data['cook_time'] ?? 0,
                ':servings' => $data['servings'] ?? 1,
                ':difficulty' => $data['difficulty'] ?? 'mudah',
                ':is_featured' => $data['is_featured'] ?? 0
            ]);

            // Hapus bahan lama lalu insert yang baru
            $this->db->prepare("DELETE FROM ingredients WHERE recipe_id = :id")->execute([':id' => $id]);
            if (!empty($data['ingredients'])) {
                $stmtIng = $this->db->prepare("
                    INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order)
                    VALUES (:recipe_id, :name, :quantity, :unit, :sort_order)
                ");
                foreach ($data['ingredients'] as $index => $ingredient) {
                    $stmtIng->execute([
                        ':recipe_id' => $id,
                        ':name' => $ingredient['name'],
                        ':quantity' => $ingredient['quantity'] ?? null,
                        ':unit' => $ingredient['unit'] ?? null,
                        ':sort_order' => $index + 1
                    ]);
                }
            }

            // Hapus langkah lama lalu insert yang baru
            $this->db->prepare("DELETE FROM recipe_steps WHERE recipe_id = :id")->execute([':id' => $id]);
            if (!empty($data['steps'])) {
                $stmtStep = $this->db->prepare("
                    INSERT INTO recipe_steps (recipe_id, step_number, instruction, image_url)
                    VALUES (:recipe_id, :step_number, :instruction, :image_url)
                ");
                foreach ($data['steps'] as $index => $step) {
                    $stmtStep->execute([
                        ':recipe_id' => $id,
                        ':step_number' => $index + 1,
                        ':instruction' => $step['instruction'],
                        ':image_url' => $step['image_url'] ?? null
                    ]);
                }
            }

            $this->db->commit();

            // Ambil slug untuk mengembalikan data lengkap
            $slugStmt = $this->db->prepare("SELECT slug FROM recipes WHERE id = :id");
            $slugStmt->execute([':id' => $id]);
            return $this->findBySlug($slugStmt->fetchColumn());

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Hapus resep. Bahan dan langkah otomatis terhapus
     * berkat ON DELETE CASCADE di foreign key.
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM recipes WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Generate URL slug dari judul resep.
     * "Nasi Goreng Spesial" → "nasi-goreng-spesial"
     * Jika slug sudah ada, tambahkan angka suffix.
     */
    private function generateSlug(string $title): string
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');

        // Cek apakah slug sudah ada, jika ya tambahkan suffix angka
        $original = $slug;
        $counter = 1;
        while (true) {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM recipes WHERE slug = :slug");
            $stmt->execute([':slug' => $slug]);
            if ($stmt->fetchColumn() == 0) break;
            $slug = $original . '-' . $counter++;
        }

        return $slug;
    }
}
