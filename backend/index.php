<?php
/**
 * ============================================
 * Entry Point / Router — Cooking Tutorial API
 * ============================================
 * 
 * Semua request HTTP masuk melalui file ini.
 * Router sederhana yang memetakan URI + method
 * ke controller yang sesuai.
 */

// CORS Headers — mengizinkan frontend React mengakses API
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload Composer dependencies (firebase/php-jwt)
require_once __DIR__ . '/vendor/autoload.php';

// Load controllers
require_once __DIR__ . '/api/config/database.php';
require_once __DIR__ . '/api/helpers/Response.php';
require_once __DIR__ . '/api/middleware/AuthMiddleware.php';
require_once __DIR__ . '/api/models/User.php';
require_once __DIR__ . '/api/models/Recipe.php';
require_once __DIR__ . '/api/models/Category.php';
require_once __DIR__ . '/api/models/TodoList.php';
require_once __DIR__ . '/api/controllers/AuthController.php';
require_once __DIR__ . '/api/controllers/RecipeController.php';
require_once __DIR__ . '/api/controllers/CategoryController.php';
require_once __DIR__ . '/api/controllers/TodoController.php';

// -----------------------------------------------
// Parsing URI dan method
// -----------------------------------------------
// Ambil path dari URI, hilangkan query string dan base path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Sesuaikan base path jika API di-host di subfolder XAMPP
// Contoh: jika di htdocs/Tutorial-Masak/backend/, sesuaikan ini
$basePath = '/Tutorial-Masak/backend';
$uri = str_replace($basePath, '', $uri);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Pecah URI menjadi segments untuk routing dinamis
// Contoh: /api/recipes/nasi-goreng → ['api', 'recipes', 'nasi-goreng']
$segments = explode('/', trim($uri, '/'));

// -----------------------------------------------
// Router — Mapping URI ke Controller
// -----------------------------------------------
try {
    // Auth Routes: /api/auth/*
    if ($segments[0] === 'api' && isset($segments[1]) && $segments[1] === 'auth') {
        $controller = new AuthController();
        $action = $segments[2] ?? '';

        switch ($action) {
            case 'register':
                if ($method === 'POST') $controller->register();
                break;
            case 'login':
                if ($method === 'POST') $controller->login();
                break;
            case 'me':
                if ($method === 'GET') $controller->me();
                break;
            default:
                Response::error('Route not found', 404);
        }
    }
    // Recipe Routes: /api/recipes/*
    elseif ($segments[0] === 'api' && isset($segments[1]) && $segments[1] === 'recipes') {
        $controller = new RecipeController();
        $param = $segments[2] ?? null;

        switch ($method) {
            case 'GET':
                // GET /api/recipes → list semua
                // GET /api/recipes/{slug} → detail satu resep
                $param ? $controller->show($param) : $controller->index();
                break;
            case 'POST':
                $controller->store();
                break;
            case 'PUT':
                if ($param) $controller->update($param);
                break;
            case 'DELETE':
                if ($param) $controller->delete($param);
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }
    // Category Routes: /api/categories/*
    elseif ($segments[0] === 'api' && isset($segments[1]) && $segments[1] === 'categories') {
        $controller = new CategoryController();
        $param = $segments[2] ?? null;

        switch ($method) {
            case 'GET':
                $controller->index();
                break;
            case 'POST':
                $controller->store();
                break;
            case 'PUT':
                if ($param) $controller->update($param);
                break;
            case 'DELETE':
                if ($param) $controller->delete($param);
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }
    // Todo Routes: /api/todos/*
    elseif ($segments[0] === 'api' && isset($segments[1]) && $segments[1] === 'todos') {
        $controller = new TodoController();
        $param = $segments[2] ?? null;
        $subAction = $segments[3] ?? null;

        switch ($method) {
            case 'GET':
                $controller->index();
                break;
            case 'POST':
                $controller->store();
                break;
            case 'PATCH':
                // PATCH /api/todos/items/{id} → toggle checklist
                if ($param === 'items' && $subAction) {
                    $controller->toggleItem($subAction);
                }
                break;
            case 'DELETE':
                if ($param) $controller->delete($param);
                break;
            default:
                Response::error('Method not allowed', 405);
        }
    }
    // Stats Route: /api/stats (untuk admin dashboard)
    elseif ($segments[0] === 'api' && isset($segments[1]) && $segments[1] === 'stats') {
        if ($method === 'GET') {
            // Ambil statistik untuk dashboard admin
            $auth = new AuthMiddleware();
            $user = $auth->authenticate();
            if ($user && $user['role'] === 'admin') {
                $db = Database::getInstance()->getConnection();
                $stats = [
                    'total_recipes' => $db->query("SELECT COUNT(*) FROM recipes")->fetchColumn(),
                    'total_users' => $db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
                    'total_categories' => $db->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
                    'recent_recipes' => $db->query("SELECT r.*, c.name as category_name FROM recipes r JOIN categories c ON r.category_id = c.id ORDER BY r.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC)
                ];
                Response::success($stats);
            } else {
                Response::error('Admin access required', 403);
            }
        }
    }
    else {
        Response::error('Route not found', 404);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
