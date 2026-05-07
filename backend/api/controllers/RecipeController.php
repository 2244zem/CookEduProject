<?php
/**
 * ============================================
 * Recipe Controller — CRUD Resep
 * ============================================
 * 
 * Endpoint publik: list dan detail resep (GET).
 * Endpoint admin: create, update, delete (POST/PUT/DELETE).
 */

class RecipeController
{
    private Recipe $recipeModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->recipeModel = new Recipe();
        $this->auth = new AuthMiddleware();
    }

    /**
     * GET /api/recipes
     * 
     * Mengambil daftar resep dengan pagination.
     * Mendukung filter kategori dan pencarian.
     * 
     * Query params:
     * - page: halaman (default 1)
     * - per_page: jumlah per halaman (default 12)
     * - category_id: filter kategori
     * - search: kata kunci pencarian
     */
    public function index(): void
    {
        $page = (int) ($_GET['page'] ?? 1);
        $perPage = (int) ($_GET['per_page'] ?? 12);
        $categoryId = isset($_GET['category_id']) ? (int) $_GET['category_id'] : null;
        $search = $_GET['search'] ?? null;

        $result = $this->recipeModel->getAll($page, $perPage, $categoryId, $search);

        Response::paginated(
            $result['recipes'],
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    /**
     * GET /api/recipes/{slug}
     * 
     * Mengambil detail satu resep berdasarkan slug.
     * Mengembalikan data lengkap: resep + bahan + langkah.
     */
    public function show(string $slug): void
    {
        $recipe = $this->recipeModel->findBySlug($slug);

        if (!$recipe) {
            Response::error('Resep tidak ditemukan', 404);
        }

        Response::success($recipe);
    }

    /**
     * POST /api/recipes
     * 
     * Membuat resep baru. Hanya admin yang bisa mengakses.
     * Body request harus berisi data resep + array bahan + array langkah.
     * 
     * Contoh body:
     * {
     *   "title": "Nasi Goreng",
     *   "category_id": 1,
     *   "description": "...",
     *   "prep_time": 15,
     *   "cook_time": 10,
     *   "servings": 2,
     *   "difficulty": "mudah",
     *   "ingredients": [
     *     {"name": "Nasi putih", "quantity": "400", "unit": "gram"}
     *   ],
     *   "steps": [
     *     {"instruction": "Haluskan bumbu..."}
     *   ]
     * }
     */
    public function store(): void
    {
        // Hanya admin yang bisa membuat resep
        $user = $this->auth->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validasi input minimal
        if (empty($data['title']) || empty($data['category_id'])) {
            Response::error('Judul dan kategori wajib diisi', 422);
        }

        $recipe = $this->recipeModel->create($data, $user['id']);
        Response::success($recipe, 201);
    }

    /**
     * PUT /api/recipes/{id}
     * 
     * Update resep yang sudah ada. Admin only.
     */
    public function update(string $id): void
    {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['title']) || empty($data['category_id'])) {
            Response::error('Judul dan kategori wajib diisi', 422);
        }

        $recipe = $this->recipeModel->update((int) $id, $data);
        Response::success($recipe);
    }

    /**
     * DELETE /api/recipes/{id}
     * 
     * Hapus resep. Admin only.
     * Bahan dan langkah otomatis terhapus (CASCADE).
     */
    public function delete(string $id): void
    {
        $this->auth->requireAdmin();
        $this->recipeModel->delete((int) $id);
        Response::success(['message' => 'Resep berhasil dihapus']);
    }
}
