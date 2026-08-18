<?php
// api/verify_payment.php
require 'config.php';
require 'helpers.php';

require_role('bendahara');
require_csrf();

$data = json_decode(file_get_contents('php://input'), true);
$transactionId = $data['transaction_id'] ?? null;
$action = $data['action'] ?? ''; // 'berhasil' atau 'ditolak'
$reason = $data['reason'] ?? null;

if (!$transactionId || !in_array($action, ['berhasil', 'ditolak'])) {
    json_response(['error' => 'Data tidak valid'], 400);
}

if ($action === 'ditolak' && empty($reason)) {
    json_response(['error' => 'Alasan penolakan wajib diisi'], 400);
}

$newStatus = $action; // 'berhasil' atau 'ditolak'
$verifiedAt = date('Y-m-d H:i:s');
$verifiedBy = $_SESSION['user_id'];

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare("SELECT t.id, t.user_id FROM transactions t JOIN users student ON student.id = t.user_id JOIN users verifier ON verifier.id = ? WHERE t.id = ? AND student.class_id = verifier.class_id FOR UPDATE");
    $stmt->execute([$verifiedBy, $transactionId]);
    $tx = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$tx) throw new RuntimeException('Transaksi tidak ditemukan');

    $paymentDate = $newStatus === 'berhasil' ? $verifiedAt : null;
    $stmt = $pdo->prepare("
        UPDATE transactions SET status = ?, verified_at = ?, verified_by = ?, rejection_reason = ?, payment_date = ?
        WHERE id = ? AND status = 'menunggu'
    ");
    $stmt->execute([$newStatus, $verifiedAt, $verifiedBy, $reason, $paymentDate, $transactionId]);
    if ($stmt->rowCount() !== 1) throw new RuntimeException('Transaksi sudah diverifikasi sebelumnya');

    // Tambah notifikasi ke siswa
    $type = $newStatus === 'berhasil' ? 'pembayaran_berhasil' : 'pembayaran_ditolak';
    $title = $newStatus === 'berhasil' ? 'Pembayaran Berhasil' : 'Pembayaran Ditolak';
    $message = $newStatus === 'berhasil'
        ? "Pembayaran Anda telah diverifikasi."
        : "Pembayaran Anda ditolak. Alasan: {$reason}";

    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
        VALUES (?, ?, ?, ?, 'transaction', ?)
    ");
    $stmt->execute([$tx['user_id'], $type, $title, $message, $transactionId]);

    $pdo->commit();
    json_response(['success' => true]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    $statusCode = $e instanceof RuntimeException ? 400 : 500;
    error_log($e->getMessage());
    json_response(['error' => $statusCode === 400 ? $e->getMessage() : 'Gagal memverifikasi pembayaran'], $statusCode);
}
?>
