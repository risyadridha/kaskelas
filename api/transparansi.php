<?php
require 'config.php';
require 'helpers.php';
require_login();

$userId = $_SESSION['user_id'];

// Ambil class_id user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_response(['error' => 'User tidak ditemukan'], 404);
$classId = $user['class_id'];

// Filter tahun opsional: ?year=YYYY.
// Tanpa parameter = gabungan semua tahun (perilaku lama tetap kompatibel).
$yearParam = isset($_GET['year']) ? (int)$_GET['year'] : null;
if ($yearParam !== null && ($yearParam < 2000 || $yearParam > 2100)) {
    json_response(['error' => 'Tahun tidak valid'], 400);
}
$incomeYearCond = $yearParam ? " AND YEAR(COALESCE(t.payment_date, t.created_at)) = " . $yearParam : '';
$expenseYearCond = $yearParam ? " AND YEAR(e.expense_date) = " . $yearParam : '';

// Konsep opening balance diset secara eksplisit (default 0)
$openingBalance = 0.00;

// Total pemasukan (hanya transaksi berstatus berhasil)
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(t.total_amount), 0) AS total_income
    FROM transactions t
    WHERE t.status = 'berhasil' AND t.user_id IN (
        SELECT id FROM users WHERE class_id = ?
    )" . $incomeYearCond . "
");
$stmt->execute([$classId]);
$income = (float)$stmt->fetchColumn();

// Total pengeluaran
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(e.amount), 0)
    FROM expenses e
    WHERE e.class_id = ?" . $expenseYearCond . "
");
$stmt->execute([$classId]);
$expense = (float)$stmt->fetchColumn();

// Ending Balance = Opening Balance + Approved Income - Approved Expenses
$balance = $openingBalance + $income - $expense;

// Data grafik bulanan (opsional)
$monthlyIncome = array_fill(0, 12, 0);
$stmt = $pdo->prepare("
    SELECT MONTH(COALESCE(t.payment_date, t.created_at))-1 AS m, SUM(t.total_amount) AS total
    FROM transactions t
    WHERE t.status='berhasil' AND t.user_id IN (SELECT id FROM users WHERE class_id = ?)" . $incomeYearCond . "
    GROUP BY MONTH(COALESCE(t.payment_date, t.created_at))
");
$stmt->execute([$classId]);
while ($row = $stmt->fetch()) {
    if ($row['m'] !== null) {
        $monthlyIncome[(int)$row['m']] = (float)$row['total'];
    }
}

$monthlyExpense = array_fill(0, 12, 0);
$stmt = $pdo->prepare("
    SELECT MONTH(e.expense_date)-1 AS m, SUM(e.amount) AS total
    FROM expenses e
    WHERE e.class_id = ?" . $expenseYearCond . "
    GROUP BY MONTH(e.expense_date)
");
$stmt->execute([$classId]);
while ($row = $stmt->fetch()) {
    if ($row['m'] !== null) {
        $monthlyExpense[(int)$row['m']] = (float)$row['total'];
    }
}

// Daftar tahun yang memiliki data (untuk selector tahun di frontend)
$stmt = $pdo->prepare("
    SELECT DISTINCT YEAR(COALESCE(t.payment_date, t.created_at)) AS y
    FROM transactions t
    WHERE t.status = 'berhasil' AND t.user_id IN (SELECT id FROM users WHERE class_id = ?)
    UNION
    SELECT DISTINCT YEAR(e.expense_date) AS y
    FROM expenses e
    WHERE e.class_id = ?
    ORDER BY y DESC
");
$stmt->execute([$classId, $classId]);
$years = array_values(array_map('intval', array_filter($stmt->fetchAll(PDO::FETCH_COLUMN), function ($y) {
    return $y !== null && $y !== false && (string)$y !== '';
})));

json_response([
    'opening_balance' => $openingBalance,
    'total_income' => $income,
    'total_expense' => $expense,
    'balance' => $balance,
    'monthly_income' => $monthlyIncome,
    'monthly_expense' => $monthlyExpense,
    'year' => $yearParam,
    'years' => $years,
]);
?>
