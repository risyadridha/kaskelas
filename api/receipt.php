<?php
// api/receipt.php
// Menyajikan nota pengeluaran secara terproteksi:
// - semua anggota kelas yang sama bisa melihat nota.
require 'config.php';
require 'helpers.php';

require_login();

$expenseId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$expenseId) {
    json_response(['error' => 'Pengeluaran tidak valid'], 400);
}

$stmt = $pdo->prepare("
    SELECT e.receipt_file, e.class_id
    FROM expenses e
    JOIN users viewer ON viewer.id = ?
    WHERE e.id = ?
      AND e.receipt_file IS NOT NULL
      AND e.class_id = viewer.class_id
");
$stmt->execute([$_SESSION['user_id'], $expenseId]);
$expense = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$expense) {
    json_response(['error' => 'Nota tidak ditemukan'], 404);
}

// Validasi path internal: harus di dalam subfolder receipts/ dengan nama aman
$receipt = (string)$expense['receipt_file'];
if (!preg_match('#^receipts/[A-Za-z0-9._-]+$#', $receipt)) {
    error_log('Path nota pengeluaran tidak valid: ' . $receipt);
    json_response(['error' => 'Nota tidak ditemukan'], 404);
}

$filePath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'receipts' . DIRECTORY_SEPARATOR . basename($receipt);
if (!is_file($filePath)) {
    json_response(['error' => 'File nota tidak ditemukan'], 404);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($filePath) ?: 'application/octet-stream';
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($filePath));
header('X-Content-Type-Options: nosniff');
$disposition = isset($_GET['download']) ? 'attachment' : 'inline';
header("Content-Disposition: {$disposition}; filename=\"" . basename($receipt) . "\"");
readfile($filePath);
exit;
?>