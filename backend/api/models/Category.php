<?php
/**
 * ============================================
 * Category Model — Query Logic untuk Kategori
 * ============================================
 */

class Category
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Ambil semua kategori beserta jumlah resep di masing-masing.
     * COUNT recipe berguna untuk ditampilkan di UI (misal: "Dessert (12 resep)").
     */
    public function getAll(): array
    {
        $stmt = $this->db->query("
            SELECT c.*, COUNT(r.id) as recipe_count
            FROM categories c
            LEFT JOIN recipes r ON c.id = r.category_id
            GROUP BY c.id
            ORDER BY c.name ASC
        ");
        return $stmt->fetchAll();
    }

    /**
     * Cari kategori berdasarkan ID.
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Buat kategori baru.
     * Slug di-generate otomatis dari nama kategori.
     */
    public function create(array $data): array
    {
        $slug = $this->generateSlug($data['name']);

        $stmt = $this->db->prepare("
            INSERT INTO categories (name, slug, description, image_url)
            VALUES (:name, :slug, :description, :image_url)
        ");
        $stmt->execute([
            ':name' => $data['name'],
            ':slug' => $slug,
            ':description' => $data['description'] ?? null,
            ':image_url' => $data['image_url'] ?? null
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    /**
     * Update kategori yang sudah ada.
     */
    public function update(int $id, array $data): array
    {
        $stmt = $this->db->prepare("
            UPDATE categories 
            SET name = :name, description = :description, image_url = :image_url
            WHERE id = :id
        ");
        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':image_url' => $data['image_url'] ?? null
        ]);

        return $this->findById($id);
    }

    /**
     * Hapus kategori.
     * Catatan: resep yang terkait juga akan terhapus (CASCADE).
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    private function generateSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        return trim($slug, '-');
    }
}
