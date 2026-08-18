<?php
// api/periods.php
require 'config.php';
require 'helpers.php';

require_login();

// Ambil class_id user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}

$classId = $user['class_id'];

$stmt = $pdo->prepare("
    SELECT id, name, frequency, start_date, end_date, due_date, amount, status
    FROM cash_periods
    WHERE class_id = ?
    ORDER BY start_date ASC
");
$stmt->execute([$classId]);
$periods = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response(['periods' => $periods]);
?>