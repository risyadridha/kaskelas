<?php
// api/submit_payment.php
require 'config.php';
require 'helpers.php';

require_login();
require_csrf();

// Hanya siswa yang boleh mengirim pembayaran
if ($_SESSION['role'] !== 'siswa') {
    json_response(['error' => 'Hanya siswa yang dapat membayar'], 403);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    json_response(['error' => 'Data tidak valid'], 400);
}

$periodIds = $data['period_ids'] ?? [];
$method = $data['method'] ?? '';

if (empty($periodIds) || !is_array($periodIds)) {
    json_response(['error' => 'Pilih minimal satu periode'], 400);
}
if (!in_array($method, ['cash', 'transfer', 'qris'])) {
    json_response(['error' => 'Metode pembayaran tidak valid'], 400);
}
$periodIds = array_values(array_unique(array_map('intval', $periodIds)));
if (in_array(0, $periodIds, true)) {
    json_response(['error' => 'Periode tidak valid'], 400);
}

$userId = $_SESSION['user_id'];

$pdo->beginTransaction();

try {
    // Lock user and periods in a stable order before checking existing payments.
    $stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ? FOR UPDATE");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        throw new RuntimeException('User tidak ditemukan');
    }

    $placeholders = implode(',', array_fill(0, count($periodIds), '?'));
    $stmt = $pdo->prepare("SELECT id, amount, name FROM cash_periods WHERE class_id = ? AND id IN ($placeholders) ORDER BY id FOR UPDATE");
    $stmt->execute(array_merge([$user['class_id']], $periodIds));
    $validPeriods = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($validPeriods) !== count($periodIds)) {
        throw new RuntimeException('Periode tidak valid');
    }

    $totalAmount = 0;
    $existingStmt = $pdo->prepare("SELECT t.id FROM transactions t JOIN transaction_items ti ON ti.transaction_id = t.id WHERE t.user_id = ? AND ti.period_id = ? AND t.status IN ('menunggu','berhasil') LIMIT 1");
    foreach ($validPeriods as $period) {
        $existingStmt->execute([$userId, $period['id']]);
        if ($existingStmt->fetch()) {
            throw new RuntimeException("Periode {$period['name']} sudah dibayar atau menunggu verifikasi");
        }
        $totalAmount += $period['amount'];
    }

    $transactionCode = generate_transaction_code();
    $submittedAt = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("
        INSERT INTO transactions (transaction_code, user_id, total_amount, method, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$transactionCode, $userId, $totalAmount, $method, 'menunggu', $submittedAt]);
    $transactionId = $pdo->lastInsertId();

    // Simpan transaction_items
    $stmt = $pdo->prepare("
        INSERT INTO transaction_items (transaction_id, period_id, amount)
        VALUES (?, ?, ?)
    ");
    foreach ($validPeriods as $period) {
        $stmt->execute([$transactionId, $period['id'], $period['amount']]);
    }

    // Tambah notifikasi
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
        VALUES (?, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', ?, 'transaction', ?)
    ");
    $message = "Pembayaran untuk periode " . implode(', ', array_column($validPeriods, 'name')) . " sedang menunggu verifikasi.";
    $stmt->execute([$userId, $message, $transactionId]);

    // Tambah aktivitas
    $stmt = $pdo->prepare("
        INSERT INTO activities (user_id, type, description, icon)
        VALUES (?, 'payment', ?, '💳')
    ");
    $activityDesc = "Pembayaran untuk periode " . implode(', ', array_column($validPeriods, 'name')) . " dikirim";
    $stmt->execute([$userId, $activityDesc]);

    $pdo->commit();

    json_response([
        'success' => true,
        'transaction_id' => $transactionId,
        'transaction_code' => $transactionCode
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    $statusCode = $e instanceof RuntimeException ? 400 : 500;
    error_log($e->getMessage());
    json_response(['error' => $statusCode === 400 ? $e->getMessage() : 'Gagal menyimpan pembayaran'], $statusCode);
}
?>
