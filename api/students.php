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

// Hitung total periode untuk kelas ini sekali saja
$stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM cash_periods WHERE class_id = ?");
$stmtTotal->execute([$classId]);
$totalPeriods = (int)$stmtTotal->fetchColumn();

// Optimasi N+1: Ambil semua siswa beserta aggregasi status pembayaran dalam 1 single query
$stmt = $pdo->prepare("
    SELECT u.id, u.username, u.role, u.email, u.phone,
           s.nis, s.full_name, s.attendance_number,
           COUNT(DISTINCT CASE WHEN t.status = 'berhasil' THEN ti.period_id END) AS lunas,
           COUNT(DISTINCT CASE WHEN t.status = 'menunggu' THEN ti.period_id END) AS menunggu
    FROM users u
    JOIN students s ON s.user_id = u.id
    LEFT JOIN transactions t ON t.user_id = u.id
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    WHERE u.class_id = ?
    GROUP BY u.id, u.username, u.role, u.email, u.phone, s.nis, s.full_name, s.attendance_number
    ORDER BY s.attendance_number ASC
");
$stmt->execute([$classId]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($students as &$student) {
    $lunas = (int)$student['lunas'];
    $menunggu = (int)$student['menunggu'];

    if ($totalPeriods > 0 && $lunas === $totalPeriods) {
        $student['status'] = 'lunas';
    } elseif ($menunggu > 0) {
        $student['status'] = 'menunggu';
    } else {
        $student['status'] = 'belum';
    }

    unset($student['lunas'], $student['menunggu']);
}
unset($student);

json_response(['students' => $students]);
?>
