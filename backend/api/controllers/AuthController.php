<?php
/**
 * ============================================
 * Auth Controller — Login, Register, Profile
 * ============================================
 * 
 * Mengontrol alur autentikasi pengguna.
 * Menggunakan JWT untuk stateless authentication.
 */

class AuthController
{
    private User $userModel;
    private AuthMiddleware $auth;

    public function __construct()
    {
        $this->userModel = new User();
        $this->auth = new AuthMiddleware();
    }

    /**
     * POST /api/auth/register
     * 
     * Mendaftarkan user baru. Validasi input sebelum
     * menyimpan ke database. Password minimal 6 karakter.
     */
    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validasi input — memastikan semua field wajib terisi
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            Response::error('Nama, email, dan password wajib diisi', 422);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::error('Format email tidak valid', 422);
        }

        if (strlen($data['password']) < 6) {
            Response::error('Password minimal 6 karakter', 422);
        }

        // Role default 'user', admin hanya bisa dibuat oleh admin lain
        $role = $data['role'] ?? 'user';
        if ($role === 'admin') {
            // Hanya admin yang sudah login bisa membuat admin baru
            $currentUser = $this->auth->authenticate();
            if (!$currentUser || $currentUser['role'] !== 'admin') {
                $role = 'user'; // Paksa jadi user biasa
            }
        }

        $user = $this->userModel->create($data['name'], $data['email'], $data['password'], $role);
        $token = AuthMiddleware::generateToken($user);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * POST /api/auth/login
     * 
     * Login dengan email dan password.
     * Mengembalikan JWT token jika berhasil.
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            Response::error('Email dan password wajib diisi', 422);
        }

        // Cari user berdasarkan email
        $user = $this->userModel->findByEmail($data['email']);
        if (!$user) {
            Response::error('Email atau password salah', 401);
        }

        // Verifikasi password
        if (!$this->userModel->verifyPassword($data['password'], $user['password'])) {
            Response::error('Email atau password salah', 401);
        }

        // Generate token dan kembalikan data user (tanpa password)
        $token = AuthMiddleware::generateToken($user);
        unset($user['password']);

        Response::success([
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * GET /api/auth/me
     * 
     * Mengambil profil user yang sedang login.
     * Membutuhkan JWT token di header Authorization.
     */
    public function me(): void
    {
        $userData = $this->auth->requireAuth();
        $user = $this->userModel->findById($userData['id']);
        Response::success($user);
    }
}
