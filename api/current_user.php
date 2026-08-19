<?php
// api/current_user.php
require 'config.php';
require 'helpers.php';

require_login();

$stmt = $pdo->prepare("
    SELECT u.id, u.class_id, c.name AS class_name, u.username, u.role, u.email, u.phone,
           COALESCE(s.full_name, u.username) AS name,
           s.nis, s.attendance_number
    FROM users u
    LEFT JOIN classes c ON c.id = u.class_id
    LEFT JOIN students s ON s.user_id = u.id
    WHERE u.id = ?
");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    json_response(['user' => $user]);
} else {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
?>