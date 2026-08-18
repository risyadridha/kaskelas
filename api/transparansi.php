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

// Total pemasukan (berhasil)
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(total_amount), 0) AS total_income
    FROM transactions
    WHERE status = 'berhasil' AND user_id IN (
        SELECT id FROM users WHERE class_id = ?
    )
");
$stmt->execute([$classId]);
$income = $stmt->fetchColumn();

// Total pengeluaran
$stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE class_id = ?");
$stmt->execute([$classId]);
$expense = $stmt->fetchColumn();

$balance = $income - $expense;

// Data grafik bulanan (opsional)
$monthlyIncome = array_fill(0, 12, 0);
$stmt = $pdo->prepare("
    SELECT MONTH(created_at)-1 AS month, SUM(total_amount) AS total
    FROM transactions
    WHERE status='berhasil' AND user_id IN (SELECT id FROM users WHERE class_id = ?)
    GROUP BY MONTH(created_at)
");
$stmt->execute([$classId]);
while ($row = $stmt->fetch()) {
    $monthlyIncome[$row['month']] = (float)$row['total'];
}

$monthlyExpense = array_fill(0, 12, 0);
$stmt = $pdo->prepare("
    SELECT MONTH(expense_date)-1 AS month, SUM(amount) AS total
    FROM expenses WHERE class_id = ?
    GROUP BY MONTH(expense_date)
");
$stmt->execute([$classId]);
while ($row = $stmt->fetch()) {
    $monthlyExpense[$row['month']] = (float)$row['total'];
}

json_response([
    'total_income' => $income,
    'total_expense' => $expense,
    'balance' => $balance,
    'monthly_income' => $monthlyIncome,
    'monthly_expense' => $monthlyExpense,
]);
?>