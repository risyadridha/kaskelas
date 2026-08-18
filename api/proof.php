<?php
require 'config.php';
require 'helpers.php';

require_login();

$proofId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$proofId) {
    json_response(['error' => 'Bukti tidak valid'], 400);
}

$stmt = $pdo->prepare("
    SELECT pp.file_name, pp.file_path, pp.file_type, pp.file_size
    FROM payment_proofs pp
    JOIN transactions t ON t.id = pp.transaction_id
    JOIN users owner ON owner.id = t.user_id
    JOIN users viewer ON viewer.id = ?
    WHERE pp.id = ?
      AND (t.user_id = viewer.id OR (viewer.role = 'bendahara' AND owner.class_id = viewer.class_id))
");
$stmt->execute([$_SESSION['user_id'], $proofId]);
$proof = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$proof) {
    json_response(['error' => 'Bukti tidak ditemukan'], 404);
}

$fileName = basename($proof['file_name']);
$legacyFileName = basename($proof['file_path']);
$privatePath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . $fileName;
// Tetap layani bukti lama, tetapi direct access-nya ditolak oleh uploads/.htaccess.
$legacyPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $legacyFileName;
$filePath = is_file($privatePath) ? $privatePath : $legacyPath;
if (!is_file($filePath)) {
    json_response(['error' => 'File bukti tidak ditemukan'], 404);
}

header_remove('Content-Type');
header('Content-Type: ' . $proof['file_type']);
header('Content-Length: ' . filesize($filePath));
header('X-Content-Type-Options: nosniff');
$disposition = isset($_GET['download']) ? 'attachment' : 'inline';
header("Content-Disposition: {$disposition}; filename=\"{$fileName}\"");
readfile($filePath);
exit;
?>
