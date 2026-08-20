<?php
// api/change_password.php
require 'config.php';
require 'helpers.php';

require_login();
require_csrf();

$userId = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    json_response(['error' => 'Data tidak valid'], 400);
}

$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

if (empty($currentPassword) || empty($newPassword)) {
    json_response(['error' => 'Password saat ini dan password baru wajib diisi'], 400);
}

if (strlen($newPassword) < 6) {
    json_response(['error' => 'Password baru minimal 6 karakter'], 400);
}

// Verify current password
$stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
    json_response(['error' => 'Password saat ini salah'], 400);
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);

$stmtUpdate = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$stmtUpdate->execute([$newHash, $userId]);

if (function_exists('log_audit')) {
    log_audit($pdo, $userId, 'change_password', 'users', $userId, "Mengubah password akun");
}

json_response(['success' => true]);
?>
