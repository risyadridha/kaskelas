<?php
// api/update_profile.php
require 'config.php';
require 'helpers.php';

require_login();
require_csrf();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');

// Validasi email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Email tidak valid'], 400);
}

// Validasi phone minimal 10 digit angka
if (empty($phone) || !preg_match('/^[0-9]{10,15}$/', $phone)) {
    json_response(['error' => 'Nomor HP harus 10-15 digit angka'], 400);
}

$userId = $_SESSION['user_id'];

// Check email or phone uniqueness across other users (BUG4-03)
$stmtCheck = $pdo->prepare("SELECT id, email, phone FROM users WHERE (email = ? OR phone = ?) AND id != ?");
$stmtCheck->execute([$email, $phone, $userId]);
$existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);
if ($existing) {
    if (strtolower($existing['email']) === strtolower($email)) {
        json_response(['error' => 'Email sudah digunakan pengguna lain'], 400);
    }
    if ($existing['phone'] === $phone) {
        json_response(['error' => 'Nomor HP sudah digunakan pengguna lain'], 400);
    }
}

try {
    $stmt = $pdo->prepare("UPDATE users SET email = ?, phone = ? WHERE id = ?");
    $stmt->execute([$email, $phone, $userId]);
} catch (Exception $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Gagal memperbarui profil'], 500);
}

if ($stmt->rowCount() > 0) {
    json_response(['success' => true]);
} else {
    // Jika tidak ada baris berubah (mungkin nilai sama), tetap sukses
    json_response(['success' => true, 'message' => 'Tidak ada perubahan']);
}
?>
