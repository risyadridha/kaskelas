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

// Lapisan 2: rate limit persisten berbasis file (tidak bisa direset dengan hapus cookie)
// 2a: per username+IP — cegah brute force satu akun
$throttleKey = md5(strtolower($username) . '|' . $ipKey);
$throttle = login_throttle_check($throttleKey);
if ($throttle['blocked']) {
    json_response(['error' => 'Terlalu banyak percobaan login gagal. Silakan coba lagi dalam beberapa menit.'], 429);
}
// 2b: per IP (global) — cegah password spraying ke banyak username dari satu IP.
//     Batas longgar agar kelas berbagi Wi-Fi (NAT) tidak ikut terkena; tidak direset saat login sukses.
$ipThrottleKey = md5('IP|' . $ipKey);
$ipThrottle = login_throttle_check($ipThrottleKey, 100, 600);
if ($ipThrottle['blocked']) {
    json_response(['error' => 'Terlalu banyak percobaan login gagal dari jaringan ini. Silakan coba lagi nanti.'], 429);
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

$dummyHash = '$2y$10$abcdefghijklmnopqrstuOZJqQq6i0PJfg7yX9zK3nM1vB2cD4eF6';
    $passwordHashToCheck = $user['password_hash'] ?? $dummyHash;
    $passwordValid = password_verify($password, $passwordHashToCheck);

    if ($user && $passwordValid) {
    // Cek status akun
    if ($user['status'] !== 'active') {
        json_response(['error' => 'Akun tidak aktif atau ditangguhkan'], 403);
    }

    // Regenerasi session ID untuk mencegah session fixation
    session_regenerate_id(true);

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];

    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    $lifetime = ($user['role'] === 'bendahara') ? (60 * 60 * 24) : (60 * 60 * 24 * 20);
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    // Catat waktu login terakhir
    try {
        $stmtLastLogin = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmtLastLogin->execute([$user['id']]);
    } catch (Exception $e) {
        error_log('Gagal memperbarui last_login: ' . $e->getMessage());
    }

    unset($_SESSION['login_attempts'][$ipKey]);
    login_throttle_reset($throttleKey);
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
    login_throttle_fail($throttleKey);
    login_throttle_fail($ipThrottleKey, 600);
    json_response(['error' => 'Username atau password salah'], 401);
}
?>
