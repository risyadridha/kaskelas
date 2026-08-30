<?php
// api/leaderboard.php
// Leaderboard siswa paling rajin bayar (Top 5)
// Accessible by all roles (siswa & bendahara)
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Rate limit per user (30 request per menit)
$leaderboardThrottleKey = md5('leaderboard|' . $userId);
$lbThrottle = login_throttle_check($leaderboardThrottleKey, 30, 60);
if ($lbThrottle['blocked']) {
    json_response(['error' => 'Terlalu banyak permintaan, coba lagi sebentar'], 429);
}

// Ambil class_id user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
$classId = $user['class_id'];

// Query: ranking siswa berdasarkan jumlah periode yang sudah lunas
// Menggunakan logika yang sama seperti bendahara_stats.php / students.php
$todayStr = date('Y-m-d');
$stmt = $pdo->prepare("
    SELECT 
        u.id,
        u.username,
        COALESCE(s.full_name, u.username) AS name,
        s.nis,
        s.attendance_number,
        COUNT(DISTINCT CASE WHEN t.status = 'berhasil' THEN ti.period_id END) AS lunas_count,
        COUNT(DISTINCT CASE WHEN t.status = 'menunggu' THEN ti.period_id END) AS menunggu_count
    FROM users u
    JOIN students s ON s.user_id = u.id
    LEFT JOIN transactions t ON t.user_id = u.id
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    LEFT JOIN cash_periods cp ON cp.id = ti.period_id AND cp.start_date <= ?
    WHERE u.class_id = ? AND u.role = 'siswa'
    GROUP BY u.id, u.username, s.full_name, s.nis, s.attendance_number
    ORDER BY lunas_count DESC, name ASC
    LIMIT 5
");
$stmt->execute([$todayStr, $classId]);
$leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Format response
$formatted = [];
$rank = 1;
foreach ($leaderboard as $row) {
    $formatted[] = [
        'rank' => $rank++,
        'user_id' => (int)$row['id'],
        'name' => $row['name'],
        'username' => $row['username'],
        'nis' => $row['nis'],
        'attendance_number' => $row['attendance_number'] ?? null,
        'lunas_count' => (int)$row['lunas_count'],
        'menunggu_count' => (int)$row['menunggu_count']
    ];
}

json_response(['leaderboard' => $formatted]);
?>