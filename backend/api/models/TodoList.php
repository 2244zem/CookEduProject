<?php
/**
 * ============================================
 * TodoList Model — Daftar Belanja User
 * ============================================
 * 
 * Setiap user bisa membuat beberapa todo list
 * dengan item-item yang bisa di-checklist.
 */

class TodoList
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Ambil semua todo list milik user tertentu.
     * Menyertakan item-item di dalam setiap list.
     */
    public function getByUser(int $userId): array
    {
        // Ambil semua todo list milik user
        $stmt = $this->db->prepare("
            SELECT * FROM todo_lists 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        $lists = $stmt->fetchAll();

        // Untuk setiap list, ambil item-itemnya
        foreach ($lists as &$list) {
            $itemStmt = $this->db->prepare("
                SELECT * FROM todo_items 
                WHERE todo_list_id = :list_id 
                ORDER BY id ASC
            ");
            $itemStmt->execute([':list_id' => $list['id']]);
            $list['items'] = $itemStmt->fetchAll();
        }

        return $lists;
    }

    /**
     * Buat todo list baru dengan item-itemnya.
     * 
     * @param int   $userId  ID user pemilik
     * @param string $title  Judul list (misal: "Belanja untuk Nasi Goreng")
     * @param array $items   Array item [{item_name, quantity}]
     */
    public function create(int $userId, string $title, array $items = []): array
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("
                INSERT INTO todo_lists (user_id, title) VALUES (:user_id, :title)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':title' => $title
            ]);
            $listId = $this->db->lastInsertId();

            // Insert item-item ke todo_items
            if (!empty($items)) {
                $itemStmt = $this->db->prepare("
                    INSERT INTO todo_items (todo_list_id, item_name, quantity)
                    VALUES (:list_id, :item_name, :quantity)
                ");
                foreach ($items as $item) {
                    $itemStmt->execute([
                        ':list_id' => $listId,
                        ':item_name' => $item['item_name'],
                        ':quantity' => $item['quantity'] ?? null
                    ]);
                }
            }

            $this->db->commit();
            return $this->findById($listId);

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Toggle status checklist item.
     * Jika is_checked = 0 → jadi 1, dan sebaliknya.
     * Menggunakan XOR bitwise untuk toggle sederhana.
     */
    public function toggleItem(int $itemId): array
    {
        $stmt = $this->db->prepare("
            UPDATE todo_items SET is_checked = NOT is_checked WHERE id = :id
        ");
        $stmt->execute([':id' => $itemId]);

        // Kembalikan item yang diupdate
        $stmt = $this->db->prepare("SELECT * FROM todo_items WHERE id = :id");
        $stmt->execute([':id' => $itemId]);
        return $stmt->fetch();
    }

    /**
     * Hapus todo list beserta semua itemnya (CASCADE).
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM todo_lists WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Cari todo list berdasarkan ID.
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM todo_lists WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $list = $stmt->fetch();

        if ($list) {
            $itemStmt = $this->db->prepare("SELECT * FROM todo_items WHERE todo_list_id = :id ORDER BY id ASC");
            $itemStmt->execute([':id' => $id]);
            $list['items'] = $itemStmt->fetchAll();
        }

        return $list ?: null;
    }
}
