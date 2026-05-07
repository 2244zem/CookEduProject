<?php
/**
 * ============================================
 * Database Configuration — PDO MySQL
 * ============================================
 * 
 * Menggunakan Singleton pattern agar hanya ada
 * satu koneksi database yang aktif sepanjang
 * lifecycle sebuah request.
 */

class Database
{
    // Konfigurasi koneksi — sesuaikan dengan setup XAMPP Anda
    private $host = 'localhost';
    private $db_name = 'cooking_tutorial';
    private $username = 'root';
    private $password = '';          
    private $charset = 'utf8mb4';

    private $conn = null;
    private static $instance = null;

    /**
     * Singleton — pastikan hanya ada satu instance Database
     * untuk menghindari koneksi ganda yang memboroskan resource.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Membuat koneksi PDO ke MySQL.
     * PDO dipilih karena mendukung prepared statements
     * yang melindungi dari SQL injection.
     */
    public function getConnection(): PDO
    {
        if ($this->conn === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,    // Throw exception jika ada error
                    PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,          // Return array assosiatif
                    PDO::ATTR_EMULATE_PREPARES    => false,                     // Gunakan prepared statement asli
                ];
                $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                // Jangan tampilkan detail error ke client di production
                Response::error('Database connection failed: ' . $e->getMessage(), 500);
                exit();
            }
        }
        return $this->conn;
    }

    // Cegah cloning dan unserialization untuk menjaga singleton
    private function __clone() {}
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
