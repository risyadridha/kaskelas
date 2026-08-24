<?php
// api/report_attachment.php
// Menyajikan lampiran laporan secara terproteksi:
// - pemilik laporan boleh melihat lampirannya;
// - bendahara satu kelas boleh melihat lampiran laporan anggota kelasnya.
require 'config.php';
require 'helpers.php';

require_login();

$reportId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$reportId) {
    json_response(['error' => 'Laporan tidak valid'], 400);
}

$stmt = $pdo->prepare("
    SELECT r.attachment
    FROM reports r
    JOIN users owner ON owner.id = r.user_id
    JOIN users viewer ON viewer.id = ?
    WHERE r.id = ?
      AND r.attachment IS NOT NULL
      AND (r.user_id = viewer.id OR (viewer.role = 'bendahara' AND owner.class_id = viewer.class_id))
");
$stmt->execute([$_SESSION['user_id'], $reportId]);
$report = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$report) {
    json_response(['error' => 'Lampiran tidak ditemukan'], 404);
}

// Validasi path internal: harus di dalam subfolder reports/ dengan nama aman
$attachment = (string)$report['attachment'];
if (!preg_match('#^reports/[A-Za-z0-9._-]+$#', $attachment)) {
    error_log('Path lampiran laporan tidak valid: ' . $attachment);
    json_response(['error' => 'Lampiran tidak ditemukan'], 404);
}

$filePath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'reports' . DIRECTORY_SEPARATOR . basename($attachment);
if (!is_file($filePath)) {
    json_response(['error' => 'File lampiran tidak ditemukan'], 404);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($filePath) ?: 'application/octet-stream';
header('Content-Type: ' . $mime);
header('Content-Length: ' . filesize($filePath));
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: inline; filename="' . basename($attachment) . '"');
readfile($filePath);
exit;
?>
