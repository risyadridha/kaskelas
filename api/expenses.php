<?php
// api/expenses.php
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List pengeluaran untuk kelas user
    $stmt = $pdo->prepare("
        SELECT e.*, u.username AS created_by_name
        FROM expenses e
        JOIN users u ON u.id = e.created_by
        WHERE e.class_id = ?
        ORDER BY e.expense_date DESC
    ");
    $stmt->execute([$classId]);
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['expenses' => $expenses]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    // Tambah pengeluaran (khusus bendahara)
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $category = $data['category'] ?? 'lainnya';
    $amount = $data['amount'] ?? 0;
    $description = $data['description'] ?? '';
    $expenseDate = $data['expense_date'] ?? date('Y-m-d');

    if (empty($name) || $amount <= 0) {
        json_response(['error' => 'Nama dan nominal wajib diisi'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO expenses (class_id, created_by, name, category, amount, description, expense_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$classId, $userId, $name, $category, $amount, $description, $expenseDate]);
    json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
}
?>
