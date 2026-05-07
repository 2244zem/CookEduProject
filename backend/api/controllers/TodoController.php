<?php
/**
 * ============================================
 * Todo Controller — Daftar Belanja
 * ============================================
 * 
 * Semua endpoint membutuhkan autentikasi user.
 * Setiap user hanya bisa melihat/mengelola todo miliknya.
 */

class TodoController
{
    private TodoList $todoModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->todoModel = new TodoList();
        $this->auth = new AuthMiddleware();
    }

    /**
     * GET /api/todos
     * Mengambil semua todo list milik user yang sedang login.
     */
    public function index(): void
    {
        $user = $this->auth->requireAuth();
        $todos = $this->todoModel->getByUser($user['id']);
        Response::success($todos);
    }

    /**
     * POST /api/todos
     * Buat todo list baru dengan item-itemnya.
     * 
     * Body: {
     *   "title": "Belanja Nasi Goreng",
     *   "items": [
     *     {"item_name": "Bawang merah", "quantity": "5 siung"},
     *     {"item_name": "Telur", "quantity": "2 butir"}
     *   ]
     * }
     */
    public function store(): void
    {
        $user = $this->auth->requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['title'])) {
            Response::error('Judul daftar belanja wajib diisi', 422);
        }

        $todo = $this->todoModel->create(
            $user['id'],
            $data['title'],
            $data['items'] ?? []
        );

        Response::success($todo, 201);
    }

    /**
     * PATCH /api/todos/items/{id}
     * Toggle status checklist item (checked ↔ unchecked).
     */
    public function toggleItem(string $itemId): void
    {
        $this->auth->requireAuth();
        $item = $this->todoModel->toggleItem((int) $itemId);
        Response::success($item);
    }

    /**
     * DELETE /api/todos/{id}
     * Hapus todo list beserta semua itemnya.
     */
    public function delete(string $id): void
    {
        $this->auth->requireAuth();
        $this->todoModel->delete((int) $id);
        Response::success(['message' => 'Daftar belanja berhasil dihapus']);
    }
}
