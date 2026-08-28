<?php
require 'config.php';
require 'helpers.php';

require_login();

$file = filter_input(INPUT_GET, 'file', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
if (!$file) {
    json_response(['error' => 'File tidak valid'], 400);
}

$fileName = basename($file);

$stmt = $pdo->prepare("
    SELECT u.profile_photo, u.class_id, u.id
    FROM users u
    WHERE u.id = ?
");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !$user['profile_photo']) {
    json_response(['error' => 'Foto tidak ditemukan'], 404);
}

$storedFile = basename($user['profile_photo']);
if ($storedFile !== $fileName) {
    json_response(['error' => 'Akses ditolak'], 403);
}

$privatePath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'profiles' . DIRECTORY_SEPARATOR . $fileName;
if (!is_file($privatePath)) {
    json_response(['error' => 'File foto tidak ditemukan'], 404);
}

header_remove('Content-Type');
header('Content-Type: ' . mime_content_type($privatePath));
header('Content-Length: ' . filesize($privatePath));
header('X-Content-Type-Options: nosniff');
$disposition = isset($_GET['download']) ? 'attachment' : 'inline';
header("Content-Disposition: {$disposition}; filename=\"{$fileName}\"");
readfile($privatePath);
exit;
?>