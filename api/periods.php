<?php
// api/periods.php
require 'config.php';
require 'helpers.php';

require_login();

// Ambil class_id user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}

$classId = $user['class_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT id, name, frequency, start_date, end_date, due_date, amount, status
        FROM cash_periods
        WHERE class_id = ?
        ORDER BY start_date ASC
    ");
    $stmt->execute([$classId]);
    $periods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response(['periods' => $periods]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_role('bendahara');
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);

    $name = trim($data['name'] ?? '');
    $frequency = $data['frequency'] ?? 'weekly';
    $startDate = $data['start_date'] ?? '';
    $endDate = $data['end_date'] ?? '';
    $dueDate = $data['due_date'] ?? $endDate;
    $amount = (float)($data['amount'] ?? 0);
    $status = $data['status'] ?? 'upcoming';

    if (empty($name) || empty($startDate) || empty($endDate) || $amount <= 0) {
        json_response(['error' => 'Data periode tidak lengkap atau nominal tidak valid'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO cash_periods (class_id, name, frequency, start_date, end_date, due_date, amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$classId, $name, $frequency, $startDate, $endDate, $dueDate, $amount, $status]);
    $periodId = $pdo->lastInsertId();

    if (function_exists('log_audit')) {
        log_audit($pdo, $_SESSION['user_id'], 'create_period', 'cash_periods', $periodId, "Membuat periode $name");
    }

    json_response(['success' => true, 'id' => $periodId]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_role('bendahara');
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);

    $periodId = $data['id'] ?? null;
    $name = trim($data['name'] ?? '');
    $amount = (float)($data['amount'] ?? 0);
    $status = $data['status'] ?? 'upcoming';

    if (!$periodId || empty($name) || $amount <= 0) {
        json_response(['error' => 'Data tidak valid'], 400);
    }

    // Verifikasi class ownership
    $stmt = $pdo->prepare("SELECT id FROM cash_periods WHERE id = ? AND class_id = ?");
    $stmt->execute([$periodId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Periode tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("
        UPDATE cash_periods
        SET name = ?, amount = ?, status = ?
        WHERE id = ? AND class_id = ?
    ");
    $stmt->execute([$name, $amount, $status, $periodId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $_SESSION['user_id'], 'edit_period', 'cash_periods', $periodId, "Mengubah periode $name");
    }

    json_response(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_role('bendahara');
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);
    $periodId = $data['id'] ?? null;

    if (!$periodId) {
        json_response(['error' => 'Period ID required'], 400);
    }

    // Verifikasi class ownership
    $stmt = $pdo->prepare("SELECT id FROM cash_periods WHERE id = ? AND class_id = ?");
    $stmt->execute([$periodId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Periode tidak ditemukan'], 404);
    }

    // Cek apakah ada transaksi yang terhubung
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM transaction_items WHERE period_id = ?");
    $stmt->execute([$periodId]);
    if ($stmt->fetchColumn() > 0) {
        json_response(['error' => 'Tidak dapat menghapus periode yang sudah memiliki transaksi'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM cash_periods WHERE id = ? AND class_id = ?");
    $stmt->execute([$periodId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $_SESSION['user_id'], 'delete_period', 'cash_periods', $periodId, "Menghapus periode ID $periodId");
    }

    json_response(['success' => true]);
}
?>