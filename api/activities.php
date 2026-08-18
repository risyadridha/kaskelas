<?php
// api/activities.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$userId]);
$activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response(['activities' => $activities]);
?>