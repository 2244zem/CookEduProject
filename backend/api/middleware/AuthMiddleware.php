<?php
/**
 * ============================================
 * Auth Middleware — JWT Verification
 * ============================================
 * 
 * Memverifikasi JWT token dari header Authorization.
 * Menggunakan library firebase/php-jwt untuk
 * encoding dan decoding token.
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class AuthMiddleware
{
    // Secret key untuk signing JWT — ganti ini di production!
    private const SECRET_KEY = 'masak_yuk_secret_key_2024_ganti_di_production';
    private const ALGORITHM = 'HS256';
    private const TOKEN_EXPIRY = 86400; // 24 jam dalam detik

    /**
     * Generate JWT token setelah login berhasil.
     * Payload berisi user ID, email, dan role untuk
     * menghindari query database di setiap request.
     * 
     * @param array $user  Data user dari database
     * @return string      JWT token
     */
    public static function generateToken(array $user): string
    {
        $issuedAt = time();
        $payload = [
            'iss' => 'cooking-tutorial-api',      // Issuer
            'iat' => $issuedAt,                     // Issued at
            'exp' => $issuedAt + self::TOKEN_EXPIRY, // Expiration
            'sub' => $user['id'],                    // Subject (user ID)
            'data' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ];

        return JWT::encode($payload, self::SECRET_KEY, self::ALGORITHM);
    }

    /**
     * Autentikasi request berdasarkan JWT di header.
     * Mengambil token dari "Authorization: Bearer <token>".
     * 
     * @return array|null  Data user dari token, atau null jika gagal
     */
    public function authenticate(): ?array
    {
        $token = $this->extractToken();

        if (!$token) {
            return null;
        }

        try {
            $decoded = JWT::decode($token, new Key(self::SECRET_KEY, self::ALGORITHM));
            return (array) $decoded->data;
        } catch (ExpiredException $e) {
            Response::error('Token has expired, please login again', 401);
            return null;
        } catch (\Exception $e) {
            Response::error('Invalid token', 401);
            return null;
        }
    }

    /**
     * Middleware ketat — hentikan request jika tidak terautentikasi.
     * Gunakan di route yang membutuhkan login wajib.
     * 
     * @return array  Data user yang terverifikasi
     */
    public function requireAuth(): array
    {
        $user = $this->authenticate();
        if (!$user) {
            Response::error('Authentication required', 401);
        }
        return $user;
    }

    /**
     * Middleware untuk admin-only route.
     * Memastikan user sudah login DAN memiliki role admin.
     * 
     * @return array  Data user admin
     */
    public function requireAdmin(): array
    {
        $user = $this->requireAuth();
        if ($user['role'] !== 'admin') {
            Response::error('Admin access required', 403);
        }
        return $user;
    }

    /**
     * Mengekstrak JWT token dari header Authorization.
     * Format yang diharapkan: "Bearer <token>"
     * 
     * @return string|null  Token string atau null
     */
    private function extractToken(): ?string
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
