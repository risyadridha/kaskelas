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
    // Single query to get all (user_id, period_id) pairs with status = 'berhasil' in this class
    $stmtPaid = $pdo->prepare("
        SELECT DISTINCT t.user_id, ti.period_id
        FROM transactions t
        JOIN transaction_items ti ON ti.transaction_id = t.id
        WHERE t.status = 'berhasil' AND t.user_id IN (SELECT id FROM users WHERE class_id = ?)
    ");
    $stmtPaid->execute([$classId]);
    $paidRows = $stmtPaid->fetchAll(PDO::FETCH_ASSOC);

    $paidMap = [];
    foreach ($paidRows as $pr) {
        $uId = (int)$pr['user_id'];
        $pId = (int)$pr['period_id'];
        if (!isset($paidMap[$uId])) {
            $paidMap[$uId] = [];
        }
        $paidMap[$uId][$pId] = true;
    }

    foreach ($studentIds as $sId) {
        $sIdInt = (int)$sId;
        $studentHasArrears = false;
        foreach ($periods as $p) {
            $pIdInt = (int)$p['id'];
            if (!isset($paidMap[$sIdInt][$pIdInt])) {
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
    'opening_balance' => round($openingBalance, 2),
    'total_income' => round($totalIncome, 2),
    'total_expense' => round($totalExpense, 2),
    'saldo' => round($saldo, 2),
    'pending_payments' => $txCounts['menunggu'],
    'approved_payments' => $txCounts['berhasil'],
    'rejected_payments' => $txCounts['ditolak'],
    'member_count' => $memberCount,
    'total_arrears' => round($totalArrearsAmount, 2),
    'arrears_student_count' => $arrearsStudentCount
]);
?>
