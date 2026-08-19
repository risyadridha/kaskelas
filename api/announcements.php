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
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'mark_read') {
        $announcementId = $data['announcement_id'] ?? null;
        if (!$announcementId) json_response(['error' => 'Announcement ID required'], 400);

        // Verifikasi pengumuman milik class_id user
        $stmt = $pdo->prepare("SELECT id FROM announcements WHERE id = ? AND class_id = ?");
        $stmt->execute([$announcementId, $classId]);
        if (!$stmt->fetch()) json_response(['error' => 'Pengumuman tidak ditemukan'], 404);

        // Insert ke announcement_reads jika belum ada
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO announcement_reads (announcement_id, user_id)
            VALUES (?, ?)
        ");
        $stmt->execute([$announcementId, $userId]);
        json_response(['success' => true]);
    }

    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

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
    $announcementId = $pdo->lastInsertId();

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'create_announcement', 'announcements', $announcementId, "Membuat pengumuman $title");
    }

    json_response(['success' => true, 'id' => $announcementId]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $announcementId = $data['id'] ?? null;
    $title = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');
    $category = $data['category'] ?? 'informasi_kelas';
    $priority = $data['priority'] ?? 'normal';

    if (!$announcementId || empty($title) || empty($content)) {
        json_response(['error' => 'Judul dan isi wajib diisi'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM announcements WHERE id = ? AND class_id = ?");
    $stmt->execute([$announcementId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengumuman tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("
        UPDATE announcements
        SET title = ?, content = ?, category = ?, priority = ?
        WHERE id = ? AND class_id = ?
    ");
    $stmt->execute([$title, $content, $category, $priority, $announcementId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'edit_announcement', 'announcements', $announcementId, "Mengubah pengumuman $title");
    }

    json_response(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $announcementId = $data['id'] ?? null;

    if (!$announcementId) {
        json_response(['error' => 'Announcement ID required'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM announcements WHERE id = ? AND class_id = ?");
    $stmt->execute([$announcementId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengumuman tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ? AND class_id = ?");
    $stmt->execute([$announcementId, $classId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'delete_announcement', 'announcements', $announcementId, "Menghapus pengumuman ID $announcementId");
    }

    json_response(['success' => true]);
}
?>
