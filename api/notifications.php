<?php
// api/notifications.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['action']) && $data['action'] === 'mark_read') {
        $notificationId = $data['notification_id'] ?? null;
        if (!$notificationId) json_response(['error' => 'Notification ID required'], 400);

        $stmt = $pdo->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);
        if (!$stmt->fetch()) json_response(['error' => 'Notifikasi tidak ditemukan'], 404);

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
        $stmt->execute([$notificationId]);
        json_response(['success' => true]);
    }
    // ... kode mark all read tetap
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['notifications' => $notifications]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Tandai semua dibaca
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$userId]);
    json_response(['success' => true]);
}
?>
