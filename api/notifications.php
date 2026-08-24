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

    if ($action === 'broadcast') {
        require_role('bendahara');
        $title = trim($data['title'] ?? '');
        $message = trim($data['message'] ?? '');
        $type = $data['type'] ?? 'info';

        if (empty($title) || empty($message)) {
            json_response(['error' => 'Judul dan pesan wajib diisi'], 400);
        }

        // Ambil class_id bendahara
        $stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $classId = $stmt->fetchColumn();

        // Ambil semua user aktif di kelas tersebut
        $stmt = $pdo->prepare("SELECT id FROM users WHERE class_id = ? AND status = 'active'");
        $stmt->execute([$classId]);
        $targetUsers = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $pdo->beginTransaction();
        try {
            $insertStmt = $pdo->prepare("
                INSERT INTO notifications (user_id, type, title, message, reference_type)
                VALUES (?, ?, ?, ?, 'broadcast')
            ");
            foreach ($targetUsers as $targetId) {
                $insertStmt->execute([$targetId, $type, $title, $message]);
            }
            $pdo->commit();

            if (function_exists('log_audit')) {
                log_audit($pdo, $userId, 'broadcast_notification', 'notifications', null, "Broadcast notifikasi: $title ke kelas $classId");
            }

            json_response(['success' => true, 'count' => count($targetUsers)]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            json_response(['error' => 'Gagal mengirim broadcast notifikasi'], 500);
        }
    } elseif ($action === 'mark_read') {
        $notificationId = $data['notification_id'] ?? null;
        if (!$notificationId) {
            json_response(['error' => 'Notification ID required'], 400);
        }

        $stmt = $pdo->prepare("SELECT id FROM notifications WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);
        if (!$stmt->fetch()) {
            json_response(['error' => 'Notifikasi tidak ditemukan'], 404);
        }

        try {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
            $stmt->execute([$notificationId, $userId]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            json_response(['error' => 'Gagal memperbarui notifikasi'], 500);
        }
        json_response(['success' => true]);
    } else {
        try {
            // Tandai semua dibaca untuk user_id ini saja
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
            $stmt->execute([$userId]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            json_response(['error' => 'Gagal memperbarui notifikasi'], 500);
        }
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
