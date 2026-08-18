<?php
// api/config.php

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

session_start();
header('Content-Type: application/json; charset=utf-8');

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
