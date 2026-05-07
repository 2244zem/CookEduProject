<?php
/**
 * ============================================
 * Response Helper — Format JSON Konsisten
 * ============================================
 * 
 * Semua response API menggunakan format yang sama
 * agar frontend mudah memparsing data.
 * 
 * Format sukses: { "success": true, "data": {...} }
 * Format error:  { "success": false, "message": "..." }
 */

class Response
{
    /**
     * Kirim response sukses dengan data.
     * 
     * @param mixed $data   Data yang dikembalikan
     * @param int   $code   HTTP status code (default 200)
     */
    public static function success($data, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }

    /**
     * Kirim response error dengan pesan.
     * 
     * @param string $message  Pesan error
     * @param int    $code     HTTP status code (default 400)
     */
    public static function error(string $message, int $code = 400): void
    {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Kirim response dengan data terpaginasi.
     * Berguna untuk list yang panjang seperti daftar resep.
     * 
     * @param array $data        Data halaman saat ini
     * @param int   $total       Total semua data
     * @param int   $page        Halaman saat ini
     * @param int   $perPage     Jumlah data per halaman
     */
    public static function paginated(array $data, int $total, int $page, int $perPage): void
    {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ]
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
}
