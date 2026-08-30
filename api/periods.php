<?php
// api/periods.php
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Ambil class_id user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_response(['error' => 'User tidak ditemukan'], 404);
$classId = $user['class_id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT id, class_id, name, frequency, start_date, end_date, due_date, amount, status
        FROM cash_periods
        WHERE class_id = ?
        ORDER BY start_date ASC
    ");
    $stmt->execute([$classId]);
    $periods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Auto-create reminder notifications for siswa (only for role='siswa')
    if ($role === 'siswa') {
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        // Get user's payment_reminder setting
        $stmtSet = $pdo->prepare("SELECT payment_reminder FROM user_settings WHERE user_id = ?");
        $stmtSet->execute([$userId]);
        $setting = $stmtSet->fetch(PDO::FETCH_ASSOC);
        $reminderEnabled = $setting && (int)$setting['payment_reminder'] === 1;

        if ($reminderEnabled) {
            foreach ($periods as $period) {
                $dueDate = $period['due_date'];
                $periodId = $period['id'];

                // Check if period is due tomorrow or already past due
                if ($dueDate <= $tomorrow) {
                    // Check if user already paid (berhasil or menunggu) for this period
                    $stmtPaid = $pdo->prepare("
                        SELECT 1 FROM transaction_items ti
                        JOIN transactions t ON t.id = ti.transaction_id
                        WHERE ti.period_id = ? AND t.user_id = ? AND t.status IN ('berhasil', 'menunggu')
                        LIMIT 1
                    ");
                    $stmtPaid->execute([$periodId, $userId]);
                    $alreadyPaid = $stmtPaid->fetch();

                    if (!$alreadyPaid) {
                        // Check if reminder notification already exists for this period
                        $stmtNotif = $pdo->prepare("
                            SELECT 1 FROM notifications
                            WHERE user_id = ? AND type = 'reminder' AND reference_type = 'period' AND reference_id = ?
                            LIMIT 1
                        ");
                        $stmtNotif->execute([$userId, $periodId]);
                        $notifExists = $stmtNotif->fetch();

                        if (!$notifExists) {
                            $isOverdue = $dueDate < $today;
                            $title = $isOverdue ? 'Kas Terlambat Dibayar' : 'Jatuh Tempo Kas Besok';
                            $message = $isOverdue
                                ? "Periode {$period['name']} sudah lewat jatuh tempo ({$dueDate}) dan belum dibayar."
                                : "Jangan lupa bayar kas periode {$period['name']}, jatuh tempo besok ({$dueDate}).";

                            $stmtIns = $pdo->prepare("
                                INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
                                VALUES (?, 'reminder', ?, ?, 'period', ?)
                            ");
                            $stmtIns->execute([$userId, $title, $message, $periodId]);
                        }
                    }
                }
            }
        }
    }

    json_response(['periods' => $periods]);
}

if ($method === 'POST') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');
    $frequency = $data['frequency'] ?? 'weekly';
    $startDate = $data['start_date'] ?? '';
    $endDate = $data['end_date'] ?? '';
    $dueDate = $data['due_date'] ?? '';
    $amount = (float)($data['amount'] ?? 0);
    $status = $data['status'] ?? 'upcoming';

    if (empty($name) || empty($startDate) || empty($endDate) || empty($dueDate) || $amount <= 0) {
        json_response(['error' => 'Semua field wajib diisi dan nominal harus > 0'], 400);
    }

    if (!in_array($frequency, ['weekly', 'monthly'], true) || !in_array($status, ['upcoming', 'active', 'closed'], true)) {
        json_response(['error' => 'Frekuensi atau status tidak valid'], 400);
    }

    if (!valid_date($startDate) || !valid_date($endDate) || !valid_date($dueDate)) {
        json_response(['error' => 'Format tanggal periode tidak valid'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO cash_periods (class_id, name, frequency, start_date, end_date, due_date, amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$classId, $name, $frequency, $startDate, $endDate, $dueDate, $amount, $status]);
        $periodId = $pdo->lastInsertId();

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'create_period', 'cash_periods', $periodId, "Membuat periode kas baru '{$name}' sebesar {$amount}");
        }

        json_response(['success' => true, 'id' => $periodId]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menyimpan periode'], 500);
    }
}

if ($method === 'PUT') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $periodId = $data['id'] ?? null;
    $name = trim($data['name'] ?? '');
    $startDate = $data['start_date'] ?? '';
    $endDate = $data['end_date'] ?? '';
    $dueDate = $data['due_date'] ?? '';
    $amount = (float)($data['amount'] ?? 0);
    $status = $data['status'] ?? 'upcoming';

    if (!$periodId || empty($name) || empty($startDate) || empty($endDate) || empty($dueDate) || $amount <= 0) {
        json_response(['error' => 'Data periode tidak valid'], 400);
    }

    if (!valid_date($startDate) || !valid_date($endDate) || !valid_date($dueDate)) {
        json_response(['error' => 'Format tanggal periode tidak valid'], 400);
    }

    // Verify ownership
    $stmtCheck = $pdo->prepare("SELECT id FROM cash_periods WHERE id = ? AND class_id = ?");
    $stmtCheck->execute([$periodId, $classId]);
    if (!$stmtCheck->fetch()) {
        json_response(['error' => 'Periode tidak ditemukan'], 404);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE cash_periods
            SET name = ?, start_date = ?, end_date = ?, due_date = ?, amount = ?, status = ?
            WHERE id = ? AND class_id = ?
        ");
        $stmt->execute([$name, $startDate, $endDate, $dueDate, $amount, $status, $periodId, $classId]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'edit_period', 'cash_periods', $periodId, "Mengubah periode kas '{$name}'");
        }

        json_response(['success' => true]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal memperbarui periode'], 500);
    }
}

if ($method === 'DELETE') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $periodId = $data['id'] ?? $_GET['id'] ?? null;

    if (!$periodId) {
        json_response(['error' => 'ID periode tidak valid'], 400);
    }

    $stmtCheck = $pdo->prepare("SELECT id, name FROM cash_periods WHERE id = ? AND class_id = ?");
    $stmtCheck->execute([$periodId, $classId]);
    $period = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    if (!$period) {
        json_response(['error' => 'Periode tidak ditemukan'], 404);
    }

    // Check financial history
    $stmtTx = $pdo->prepare("SELECT COUNT(*) FROM transaction_items WHERE period_id = ?");
    $stmtTx->execute([$periodId]);
    if ((int)$stmtTx->fetchColumn() > 0) {
        json_response(['error' => 'Periode tidak dapat dihapus karena sudah memiliki riwayat transaksi'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM cash_periods WHERE id = ? AND class_id = ?");
        $stmt->execute([$periodId, $classId]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'delete_period', 'cash_periods', $periodId, "Menghapus periode kas '{$period['name']}'");
        }

        json_response(['success' => true]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menghapus periode'], 500);
    }
}
?>
