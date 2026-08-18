<?php
// api/user_settings.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM user_settings WHERE user_id = ?");
    $stmt->execute([$userId]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    json_response(['settings' => $settings]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);
    $theme = $data['theme'] ?? 'light';
    $paymentReminder = isset($data['payment_reminder']) ? (int)$data['payment_reminder'] : 1;
    $announcementNotif = isset($data['announcement_notif']) ? (int)$data['announcement_notif'] : 1;
    $soundNotif = isset($data['sound_notif']) ? (int)$data['sound_notif'] : 1;

    $stmt = $pdo->prepare("
        INSERT INTO user_settings (user_id, theme, payment_reminder, announcement_notif, sound_notif)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            theme = VALUES(theme),
            payment_reminder = VALUES(payment_reminder),
            announcement_notif = VALUES(announcement_notif),
            sound_notif = VALUES(sound_notif)
    ");
    $stmt->execute([$userId, $theme, $paymentReminder, $announcementNotif, $soundNotif]);
    json_response(['success' => true]);
}
?>
