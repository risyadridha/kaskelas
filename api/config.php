<?php
// api/config.php
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$allowedOrigins = array_filter(array_map('trim', explode(',', getenv('KASKELAS_ALLOWED_ORIGINS') ?: '')));
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($requestOrigin !== '' && in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($requestOrigin !== '' && !in_array($requestOrigin, $allowedOrigins, true)) {
        http_response_code(403);
        exit;
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    http_response_code(204);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    ini_set('session.gc_maxlifetime', 20 * 24 * 60 * 60);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'");

$localConfig = __DIR__ . '/config.local.php';
$settings = is_file($localConfig) ? require $localConfig : [];
if (!is_array($settings)) {
    $settings = [];
}

$host = getenv('KASKELAS_DB_HOST') ?: ($settings['db_host'] ?? null);
$dbname = getenv('KASKELAS_DB_NAME') ?: ($settings['db_name'] ?? null);
$user = getenv('KASKELAS_DB_USER') ?: ($settings['db_user'] ?? null);
$pass = getenv('KASKELAS_DB_PASS');
if ($pass === false) {
    $pass = $settings['db_pass'] ?? null;
}
$proofStorageDir = getenv('KASKELAS_PROOF_STORAGE') ?: ($settings['proof_storage_dir'] ?? dirname(dirname(dirname(__DIR__))) . '/kaskelas-proofs');

if (!$host || !$dbname || $user === null || $pass === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Konfigurasi database server belum tersedia.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Terjadi kesalahan pada server.'], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
