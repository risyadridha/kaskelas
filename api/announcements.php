<?php
// api/announcements.php
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_response(['error' => 'User tidak ditemukan'], 404);
$classId = $user['class_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List pengumuman + status baca
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.content, a.category, a.priority, a.published_at,
               a.created_at, u.username AS creator_name,
               (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = ?) AS is_read
        FROM announcements a
        JOIN users u ON u.id = a.created_by
        WHERE a.class_id = ?
        ORDER BY a.published_at DESC
    ");
    $stmt->execute([$userId, $classId]);
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response(['announcements' => $announcements]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $title = $data['title'] ?? '';
    $content = $data['content'] ?? '';
    $category = $data['category'] ?? 'informasi_kelas';
    $priority = $data['priority'] ?? 'normal';
    $publishedAt = $data['published_at'] ?? date('Y-m-d H:i:s');

    if (empty($title) || empty($content)) {
        json_response(['error' => 'Judul dan isi wajib diisi'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO announcements (class_id, created_by, title, content, category, priority, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$classId, $userId, $title, $content, $category, $priority, $publishedAt]);
    json_response(['success' => true, 'id' => $pdo->lastInsertId()]);
}
?>
