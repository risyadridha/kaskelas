<?php
// api/activities.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
$offset = ($page - 1) * $limit;

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM activities WHERE user_id = ?");
$countStmt->execute([$userId]);
$total = (int)$countStmt->fetchColumn();

$stmt = $pdo->prepare("
    SELECT id, user_id, type, description, icon, created_at
    FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
");
$stmt->bindValue(1, $userId, PDO::PARAM_INT);
$stmt->bindValue(2, $limit, PDO::PARAM_INT);
$stmt->bindValue(3, $offset, PDO::PARAM_INT);
$stmt->execute();
$activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_response([
    'activities' => $activities,
    'pagination' => [
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]
]);
?>
