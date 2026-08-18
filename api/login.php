<?php
// api/login.php
require 'config.php';
require 'helpers.php';
require_csrf();

// Baca input satu kali saja
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Fallback jika JSON tidak terbentuk
if (!$data) {
    $data = $_POST;
}

// Jika masih kosong, coba parse body
if (empty($data)) {
    parse_str($rawInput, $data);
}

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    json_response(['error' => 'Username dan password wajib diisi'], 400);
}

// Sederhana rate limiting berbasis session (maksimal 5 percobaan gagal per 5 menit)
$ipKey = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = [];
}
$attempts = $_SESSION['login_attempts'][$ipKey] ?? ['count' => 0, 'first_attempt' => $now];
if ($now - $attempts['first_attempt'] > 300) {
    $attempts = ['count' => 0, 'first_attempt' => $now];
}
if ($attempts['count'] >= 5) {
    json_response(['error' => 'Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 5 menit.'], 429);
}

// Query dengan JOIN untuk mendapatkan nama dan status
$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.password_hash, u.role, u.email, u.status,
           COALESCE(s.full_name, u.username) AS name
    FROM users u
    LEFT JOIN students s ON s.user_id = u.id
    WHERE u.username = ?
");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
    // Cek status akun
    if ($user['status'] !== 'active') {
        json_response(['error' => 'Akun tidak aktif atau ditangguhkan'], 403);
    }

    // Regenerasi session ID untuk mencegah session fixation
    session_regenerate_id(true);

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];

    unset($_SESSION['login_attempts'][$ipKey]);
    json_response([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'name' => $user['name'],
            'email' => $user['email'],
        ]
    ]);
} else {
    $attempts['count']++;
    $_SESSION['login_attempts'][$ipKey] = $attempts;
    json_response(['error' => 'Username atau password salah'], 401);
}
?>
