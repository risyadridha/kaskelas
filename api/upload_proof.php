<?php
// api/upload_proof.php
require 'config.php';
require 'helpers.php';

require_login();
require_csrf();

$userId = $_SESSION['user_id'];
$transactionId = $_POST['transaction_id'] ?? null;

if (!$transactionId) {
    json_response(['error' => 'Transaksi tidak valid'], 400);
}

// Pastikan transaksi milik user dan status 'menunggu' atau 'ditolak'
$stmt = $pdo->prepare("SELECT id, status FROM transactions WHERE id = ? AND user_id = ?");
$stmt->execute([$transactionId, $userId]);
$tx = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$tx) {
    json_response(['error' => 'Transaksi tidak ditemukan'], 404);
}
if (!in_array($tx['status'], ['menunggu', 'ditolak'], true)) {
    json_response(['error' => 'Transaksi tidak dalam status yang dapat diupload bukti'], 400);
}

if (!isset($_FILES['proof']) || $_FILES['proof']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'File tidak ditemukan'], 400);
}

$file = $_FILES['proof'];

// Validasi ukuran maksimum 5MB
if ($file['size'] > 5 * 1024 * 1024) {
    json_response(['error' => 'Ukuran file maksimal 5MB'], 400);
}

// Validasi MIME asli menggunakan finfo (jangan percaya $_FILES['type'])
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

$allowedMime = ['image/jpeg', 'image/png', 'application/pdf'];
if (!in_array($mime, $allowedMime)) {
    json_response(['error' => 'Tipe file tidak diizinkan'], 400);
}

// Validasi ekstensi file
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
if (!in_array($extension, $allowedExt)) {
    json_response(['error' => 'Ekstensi file tidak diizinkan'], 400);
}

// Pastikan file bukan executable (cek isi file tidak boleh PHP/script)
$handle = fopen($file['tmp_name'], 'rb');
$firstBytes = fread($handle, 4);
fclose($handle);
if (strpos($firstBytes, '<?php') !== false || strpos($firstBytes, '#!/') !== false) {
    json_response(['error' => 'File tidak valid'], 400);
}

// Simpan bukti di luar document root agar tidak dapat diakses langsung.
$uploadDir = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate nama file aman (server-generated)
$fileName = 'proof_' . bin2hex(random_bytes(16)) . '.' . $extension;
$uploadPath = $uploadDir . $fileName;

// Pastikan file tidak bisa dieksekusi
$safeMime = $mime;
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    json_response(['error' => 'Gagal menyimpan file'], 500);
}

$pdo->beginTransaction();
try {
    if ($tx['status'] === 'ditolak') {
        $submittedAt = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("
            UPDATE transactions
            SET status = 'menunggu', rejection_reason = NULL, submitted_at = ?
            WHERE id = ?
        ");
        $stmt->execute([$submittedAt, $transactionId]);
    }

    // Ambil bukti lama untuk dihapus DARI DISK SETELAH COMMIT BERHASIL
    $stmtOld = $pdo->prepare("SELECT file_name FROM payment_proofs WHERE transaction_id = ?");
    $stmtOld->execute([$transactionId]);
    $oldProofs = $stmtOld->fetchAll(PDO::FETCH_ASSOC);
    $oldFilesToDelete = [];
    foreach ($oldProofs as $oldP) {
        $oldFilePath = $uploadDir . $oldP['file_name'];
        if (file_exists($oldFilePath)) {
            $oldFilesToDelete[] = $oldFilePath;
        }
    }

    $stmtDel = $pdo->prepare("DELETE FROM payment_proofs WHERE transaction_id = ?");
    $stmtDel->execute([$transactionId]);

    // Simpan hanya penanda internal; path filesystem tidak pernah dikirim ke client.
    $stmt = $pdo->prepare("
        INSERT INTO payment_proofs (transaction_id, file_name, file_path, file_type, file_size)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $transactionId,
        $fileName,
        'private/' . $fileName,
        $safeMime,
        $file['size']
    ]);

    // Tambah notifikasi
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
        VALUES (?, 'bukti_diterima', 'Bukti Pembayaran Diterima', ?, 'transaction', ?)
    ");
    $message = "Bukti pembayaran untuk transaksi #{$transactionId} telah diupload.";
    $stmt->execute([$userId, $message, $transactionId]);

    // Tambah aktivitas
    $stmt = $pdo->prepare("
        INSERT INTO activities (user_id, type, description, icon)
        VALUES (?, 'upload_bukti', ?, '📤')
    ");
    $stmt->execute([$userId, "Bukti pembayaran untuk transaksi #{$transactionId} diupload"]);

    $pdo->commit();

    // Hapus file fisik lama HANYA SETELAH COMMIT BERHASIL
    foreach ($oldFilesToDelete as $oldPathToDelete) {
        if (file_exists($oldPathToDelete)) {
            @unlink($oldPathToDelete);
        }
    }

    json_response(['success' => true, 'file_name' => $fileName]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    if (file_exists($uploadPath)) {
        @unlink($uploadPath);
    }
    error_log($e->getMessage());
    json_response(['error' => 'Gagal menyimpan data bukti pembayaran'], 500);
}
?>
