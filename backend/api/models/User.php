<?php
/**
 * ============================================
 * User Model — Query Logic untuk Tabel Users
 * ============================================
 * 
 * Menangani semua operasi database terkait user:
 * registrasi, login, dan pencarian user.
 */

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Membuat user baru (registrasi).
     * Password di-hash menggunakan bcrypt melalui password_hash()
     * yang secara otomatis menambahkan salt unik.
     * 
     * @param string $name     Nama lengkap user
     * @param string $email    Email (harus unik)
     * @param string $password Password plaintext (akan di-hash)
     * @param string $role     Role user: 'user' atau 'admin'
     * @return array           Data user yang baru dibuat
     */
    public function create(string $name, string $email, string $password, string $role = 'user'): array
    {
        // Cek apakah email sudah terdaftar
        if ($this->findByEmail($email)) {
            Response::error('Email sudah terdaftar', 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password, role)
            VALUES (:name, :email, :password, :role)
        ");
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':role' => $role
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    /**
     * Cari user berdasarkan email.
     * Digunakan saat login dan validasi registrasi.
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Cari user berdasarkan ID.
     * Tidak mengembalikan field password untuk keamanan.
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT id, name, email, role, avatar_url, created_at 
            FROM users WHERE id = :id
        ");
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    /**
     * Ambil semua user (untuk admin dashboard).
     * Tidak mengembalikan password.
     */
    public function getAll(): array
    {
        $stmt = $this->db->query("
            SELECT id, name, email, role, created_at 
            FROM users ORDER BY created_at DESC
        ");
        return $stmt->fetchAll();
    }

    /**
     * Verifikasi password saat login.
     * password_verify() membandingkan plaintext dengan hash bcrypt.
     */
    public function verifyPassword(string $plainPassword, string $hashedPassword): bool
    {
        return password_verify($plainPassword, $hashedPassword);
    }
}
