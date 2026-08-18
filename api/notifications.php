<?php
// api/notifications.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'mark_read') {
        $notificationId = $data['notification_id'] ?? null;
        if (!$notificationId) {
            json_response(['error' => 'Notification ID required'], 400);
        }

        $stmt = $pdo->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);
        if (!$stmt->fetch()) {
            json_response(['error' => 'Notifikasi tidak ditemukan'], 404);
        }

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);
        json_response(['success' => true]);
    } else {
        // Tandai semua dibaca untuk user_id ini saja
        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$userId]);
        json_response(['success' => true]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
    $stmt->execute([$userId]);
    $total = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT id, user_id, type, title, message, reference_type, reference_id, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'notifications' => $notifications,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}
?>
