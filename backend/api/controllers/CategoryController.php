<?php
/**
 * ============================================
 * Category Controller — CRUD Kategori
 * ============================================
 * 
 * GET: publik (semua bisa lihat kategori).
 * POST/PUT/DELETE: admin only.
 */

class CategoryController
{
    private Category $categoryModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->categoryModel = new Category();
        $this->auth = new AuthMiddleware();
    }

    /**
     * GET /api/categories
     * Menampilkan semua kategori beserta jumlah resep.
     */
    public function index(): void
    {
        $categories = $this->categoryModel->getAll();
        Response::success($categories);
    }

    /**
     * POST /api/categories
     * Tambah kategori baru. Admin only.
     */
    public function store(): void
    {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['name'])) {
            Response::error('Nama kategori wajib diisi', 422);
        }

        $category = $this->categoryModel->create($data);
        Response::success($category, 201);
    }

    /**
     * PUT /api/categories/{id}
     * Update kategori. Admin only.
     */
    public function update(string $id): void
    {
        $this->auth->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['name'])) {
            Response::error('Nama kategori wajib diisi', 422);
        }

        $category = $this->categoryModel->update((int) $id, $data);
        Response::success($category);
    }

    /**
     * DELETE /api/categories/{id}
     * Hapus kategori. Admin only.
     */
    public function delete(string $id): void
    {
        $this->auth->requireAdmin();
        $this->categoryModel->delete((int) $id);
        Response::success(['message' => 'Kategori berhasil dihapus']);
    }
}
