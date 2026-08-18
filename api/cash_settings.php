<?php
require 'config.php';
require 'helpers.php';
require_login();

$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$stmt = $pdo->prepare("SELECT frequency, default_amount, payment_deadline_days FROM cash_settings WHERE class_id = ?");
$stmt->execute([$user['class_id']]);
$settings = $stmt->fetch(PDO::FETCH_ASSOC);

json_response(['cash_settings' => $settings]);
?>