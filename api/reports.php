<?php
// api/reports.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['reports' => $reports]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);
    $category = $data['category'] ?? 'lainnya';
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $transactionId = $data['transaction_id'] ?? null;

    if (empty($title) || empty($description)) {
        json_response(['error' => 'Judul dan deskripsi wajib diisi'], 400);
    }

    if ($transactionId !== null && $transactionId !== '') {
        $stmt = $pdo->prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?');
        $stmt->execute([$transactionId, $userId]);
        if (!$stmt->fetch()) {
            json_response(['error' => 'Transaksi tidak ditemukan'], 404);
        }
    } else {
        $transactionId = null;
    }

    $stmt = $pdo->prepare("
        INSERT INTO reports (user_id, category, title, description, transaction_id)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $category, $title, $description, $transactionId]);
    json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
}
?>
