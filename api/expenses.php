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
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM expenses WHERE class_id = ?");
    $stmt->execute([$classId]);
    $total = (int)$stmt->fetchColumn();

    // List pengeluaran untuk kelas user dengan kolom spesifik (ganti SELECT *)
    $stmt = $pdo->prepare("
        SELECT e.id, e.class_id, e.created_by, e.name, e.category, e.amount,
               e.description, e.expense_date, e.receipt_file, e.created_at,
               u.username AS created_by_name
        FROM expenses e
        JOIN users u ON u.id = e.created_by
        WHERE e.class_id = ?
        ORDER BY e.expense_date DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $classId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'expenses' => $expenses,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
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
    $expenseId = $pdo->lastInsertId();

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'create_expense', 'expenses', $expenseId, "Membuat pengeluaran $name sebesar $amount");
    }

    json_response(['success' => true, 'id' => $expenseId]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $expenseId = $data['id'] ?? null;
    $name = trim($data['name'] ?? '');
    $category = $data['category'] ?? 'lainnya';
    $amount = (float)($data['amount'] ?? 0);
    $description = $data['description'] ?? '';
    $expenseDate = $data['expense_date'] ?? date('Y-m-d');

    if (!$expenseId || empty($name) || $amount <= 0) {
        json_response(['error' => 'Data tidak valid'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM expenses WHERE id = ? AND class_id = ?");
    $stmt->execute([$expenseId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengeluaran tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("
        UPDATE expenses
        SET name = ?, category = ?, amount = ?, description = ?, expense_date = ?
        WHERE id = ? AND class_id = ?
    ");
    $stmt->execute([$name, $category, $amount, $description, $expenseDate, $expenseId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'edit_expense', 'expenses', $expenseId, "Mengubah pengeluaran $name");
    }

    json_response(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $expenseId = $data['id'] ?? null;

    if (!$expenseId) {
        json_response(['error' => 'Expense ID required'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM expenses WHERE id = ? AND class_id = ?");
    $stmt->execute([$expenseId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengeluaran tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND class_id = ?");
    $stmt->execute([$expenseId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'delete_expense', 'expenses', $expenseId, "Menghapus pengeluaran ID $expenseId");
    }

    json_response(['success' => true]);
}
?>
