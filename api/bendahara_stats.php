<?php
// api/bendahara_stats.php
require 'config.php';
require 'helpers.php';

require_role('bendahara');

$userId = $_SESSION['user_id'];

// Ambil class_id bendahara dari session
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
$classId = (int)$user['class_id'];

// Formula Opening Balance = 0.00 (kecuali ada konfigurasi eksplisit)
$openingBalance = 0.00;

// 1. Total Pemasukan Approved (status = 'berhasil')
$stmtIncome = $pdo->prepare("
    SELECT COALESCE(SUM(total_amount), 0)
    FROM transactions
    WHERE status = 'berhasil' AND user_id IN (SELECT id FROM users WHERE class_id = ?)
");
$stmtIncome->execute([$classId]);
$totalIncome = (float)$stmtIncome->fetchColumn();

// 2. Total Pengeluaran
$stmtExpense = $pdo->prepare("
    SELECT COALESCE(SUM(amount), 0)
    FROM expenses
    WHERE class_id = ?
");
$stmtExpense->execute([$classId]);
$totalExpense = (float)$stmtExpense->fetchColumn();

// Ending Balance = Opening Balance + Approved Income - Approved Expenses
$saldo = $openingBalance + $totalIncome - $totalExpense;

// 3. Status Transaksi (Count)
$stmtTxStatus = $pdo->prepare("
    SELECT status, COUNT(*) AS count
    FROM transactions
    WHERE user_id IN (SELECT id FROM users WHERE class_id = ?)
    GROUP BY status
");
$stmtTxStatus->execute([$classId]);
$txCounts = [
    'menunggu' => 0,
    'berhasil' => 0,
    'ditolak' => 0
];
while ($row = $stmtTxStatus->fetch(PDO::FETCH_ASSOC)) {
    $txCounts[$row['status']] = (int)$row['count'];
}

// 4. Jumlah Anggota (Siswa)
$stmtMembers = $pdo->prepare("
    SELECT COUNT(*) FROM users
    WHERE class_id = ? AND role = 'siswa' AND status = 'active'
");
$stmtMembers->execute([$classId]);
$memberCount = (int)$stmtMembers->fetchColumn();

// 5. Total Tunggakan & Jumlah Siswa Menunggak
// Hitung per siswa active di kelas ini hanya untuk periode yang sudah berjalan (start_date <= today)
$todayStr = date('Y-m-d');
$stmtPeriods = $pdo->prepare("SELECT id, amount FROM cash_periods WHERE class_id = ? AND start_date <= ?");
$stmtPeriods->execute([$classId, $todayStr]);
$periods = $stmtPeriods->fetchAll(PDO::FETCH_ASSOC);
$totalPeriods = count($periods);

$stmtStudents = $pdo->prepare("
    SELECT u.id
    FROM users u
    WHERE u.class_id = ? AND u.role = 'siswa' AND u.status = 'active'
");
$stmtStudents->execute([$classId]);
$studentIds = $stmtStudents->fetchAll(PDO::FETCH_COLUMN);

$totalArrearsAmount = 0.00;
$arrearsStudentCount = 0;

if (!empty($studentIds) && !empty($periods)) {
    foreach ($studentIds as $sId) {
        // Ambil period_ids yang sudah 'berhasil' atau 'menunggu'
        $stmtPaid = $pdo->prepare("
            SELECT DISTINCT ti.period_id, t.status
            FROM transactions t
            JOIN transaction_items ti ON ti.transaction_id = t.id
            WHERE t.user_id = ? AND t.status IN ('berhasil', 'menunggu')
        ");
        $stmtPaid->execute([$sId]);
        $paidRows = $stmtPaid->fetchAll(PDO::FETCH_ASSOC);

        $paidPeriodIds = [];
        foreach ($paidRows as $pr) {
            $paidPeriodIds[] = (int)$pr['period_id'];
        }

        $studentHasArrears = false;
        foreach ($periods as $p) {
            if (!in_array((int)$p['id'], $paidPeriodIds, true)) {
                $totalArrearsAmount += (float)$p['amount'];
                $studentHasArrears = true;
            }
        }
        if ($studentHasArrears) {
            $arrearsStudentCount++;
        }
    }
}

json_response([
    'class_id' => $classId,
    'opening_balance' => $openingBalance,
    'total_income' => $totalIncome,
    'total_expense' => $totalExpense,
    'saldo' => $saldo,
    'pending_payments' => $txCounts['menunggu'],
    'approved_payments' => $txCounts['berhasil'],
    'rejected_payments' => $txCounts['ditolak'],
    'member_count' => $memberCount,
    'total_arrears' => $totalArrearsAmount,
    'arrears_student_count' => $arrearsStudentCount
]);
?>
