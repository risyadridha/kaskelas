<?php
// api/students.php
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Ambil class_id
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_response(['error' => 'User tidak ditemukan'], 404);
$classId = $user['class_id'];

// Ambil semua siswa di kelas yang sama
$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.role, u.email, u.phone,
           s.nis, s.full_name, s.attendance_number
    FROM users u
    JOIN students s ON s.user_id = u.id
    WHERE u.class_id = ?
    ORDER BY s.attendance_number ASC
");
$stmt->execute([$classId]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Untuk setiap siswa, hitung status pembayaran (simplifikasi: hitung lunas/menunggu/belum)
foreach ($students as &$student) {
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT cp.id) AS total_periods,
               SUM(CASE WHEN t.status = 'berhasil' THEN 1 ELSE 0 END) AS lunas,
               SUM(CASE WHEN t.status = 'menunggu' THEN 1 ELSE 0 END) AS menunggu
        FROM cash_periods cp
        LEFT JOIN transaction_items ti ON ti.period_id = cp.id
        LEFT JOIN transactions t ON t.id = ti.transaction_id AND t.user_id = ?
        WHERE cp.class_id = ?
    ");
    $stmt->execute([$student['id'], $classId]);
    $status = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($status['total_periods'] > 0 && $status['lunas'] == $status['total_periods']) {
        $student['status'] = 'lunas';
    } elseif ($status['menunggu'] > 0) {
        $student['status'] = 'menunggu';
    } else {
        $student['status'] = 'belum';
    }
    unset($student);
}

json_response(['students' => $students]);
?>