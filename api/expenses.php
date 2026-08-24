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

    // List pengeluaran untuk kelas user
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
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $name = $_POST['name'] ?? '';
    if (empty($name)) {
        $jsonInput = json_decode(file_get_contents('php://input'), true);
        if ($jsonInput) {
            $name = $jsonInput['name'] ?? '';
            $category = $jsonInput['category'] ?? 'lainnya';
            $amount = (float)($jsonInput['amount'] ?? 0);
            $description = $jsonInput['description'] ?? '';
            $expenseDate = $jsonInput['expense_date'] ?? date('Y-m-d');
        }
    } else {
        $category = $_POST['category'] ?? 'lainnya';
        $amount = (float)($_POST['amount'] ?? 0);
        $description = $_POST['description'] ?? '';
        $expenseDate = $_POST['expense_date'] ?? date('Y-m-d');
    }

    if (empty($name) || $amount <= 0) {
        json_response(['error' => 'Nama dan nominal wajib diisi'], 400);
    }

    $validCategories = ['kebersihan', 'perlengkapan', 'kegiatan', 'dekorasi', 'sosial', 'lainnya'];
    if (!in_array($category, $validCategories, true)) {
        json_response(['error' => 'Kategori pengeluaran tidak valid'], 400);
    }
    if (!valid_date($expenseDate)) {
        json_response(['error' => 'Tanggal pengeluaran tidak valid'], 400);
    }

    $receiptFile = null;
    if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['receipt'];
        if ($file['size'] > 5 * 1024 * 1024) {
            json_response(['error' => 'Ukuran nota maksimal 5MB'], 400);
        }
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowedMime = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!in_array($mime, $allowedMime)) {
            json_response(['error' => 'Tipe file nota tidak diizinkan'], 400);
        }
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
        if (!in_array($extension, $allowedExt)) {
            json_response(['error' => 'Ekstensi file nota tidak diizinkan'], 400);
        }
        $uploadDir = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'receipts' . DIRECTORY_SEPARATOR;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $fileName = 'receipt_' . bin2hex(random_bytes(12)) . '.' . $extension;
        $uploadPath = $uploadDir . $fileName;
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            json_response(['error' => 'Gagal menyimpan file nota'], 500);
        }
        $receiptFile = 'receipts/' . $fileName;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO expenses (class_id, created_by, name, category, amount, description, expense_date, receipt_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$classId, $userId, $name, $category, $amount, $description, $expenseDate, $receiptFile]);
        $expenseId = $pdo->lastInsertId();

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'create_expense', 'expenses', $expenseId, "Membuat pengeluaran $name sebesar $amount");
        }

        json_response(['success' => true, 'id' => $expenseId, 'receipt_file' => $receiptFile]);
    } catch (Exception $e) {
        // Hindari file orphan jika INSERT gagal setelah move_uploaded_file
        if (!empty($receiptFile)) {
            $orphanPath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $receiptFile);
            if (file_exists($orphanPath)) {
                @unlink($orphanPath);
            }
        }
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menyimpan pengeluaran'], 500);
    }
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

    $validCategories = ['kebersihan', 'perlengkapan', 'kegiatan', 'dekorasi', 'sosial', 'lainnya'];
    if (!in_array($category, $validCategories, true)) {
        json_response(['error' => 'Kategori pengeluaran tidak valid'], 400);
    }
    if (!valid_date($expenseDate)) {
        json_response(['error' => 'Tanggal pengeluaran tidak valid'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM expenses WHERE id = ? AND class_id = ?");
    $stmt->execute([$expenseId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengeluaran tidak ditemukan'], 404);
    }

    try {
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
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal memperbarui pengeluaran'], 500);
    }
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
    $stmt = $pdo->prepare("SELECT id, receipt_file FROM expenses WHERE id = ? AND class_id = ?");
    $stmt->execute([$expenseId, $classId]);
    $exp = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$exp) {
        json_response(['error' => 'Pengeluaran tidak ditemukan'], 404);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND class_id = ?");
        $stmt->execute([$expenseId, $classId]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'delete_expense', 'expenses', $expenseId, "Menghapus pengeluaran ID $expenseId");
        }
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menghapus pengeluaran'], 500);
    }

    if (!empty($exp['receipt_file'])) {
        $receiptPath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $exp['receipt_file']);
        if (file_exists($receiptPath)) {
            @unlink($receiptPath);
        }
    }

    json_response(['success' => true]);
}
?>
