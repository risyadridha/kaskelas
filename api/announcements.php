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
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM announcements WHERE class_id = ?");
    $countStmt->execute([$classId]);
    $total = (int)$countStmt->fetchColumn();

    // List pengumuman + status baca
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.content, a.category, a.priority, a.published_at,
               a.created_at, u.username AS creator_name,
               (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = ?) AS is_read
        FROM announcements a
        JOIN users u ON u.id = a.created_by
        WHERE a.class_id = ?
        ORDER BY a.published_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $classId, PDO::PARAM_INT);
    $stmt->bindValue(3, $limit, PDO::PARAM_INT);
    $stmt->bindValue(4, $offset, PDO::PARAM_INT);
    $stmt->execute();
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    json_response([
        'announcements' => $announcements,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
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
        try {
            $stmt = $pdo->prepare("
                INSERT IGNORE INTO announcement_reads (announcement_id, user_id)
                VALUES (?, ?)
            ");
            $stmt->execute([$announcementId, $userId]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            json_response(['error' => 'Gagal menandai pengumuman'], 500);
        }
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
    if (mb_strlen($title) > 255) {
        json_response(['error' => 'Judul pengumuman maksimal 255 karakter'], 400);
    }

    $validCategories = ['kas', 'kegiatan', 'informasi_kelas', 'penting'];
    $validPriorities = ['normal', 'important'];
    if (!in_array($category, $validCategories, true)) {
        json_response(['error' => 'Kategori pengumuman tidak valid'], 400);
    }
    if (!in_array($priority, $validPriorities, true)) {
        json_response(['error' => 'Prioritas tidak valid'], 400);
    }

    try {
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
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menyimpan pengumuman'], 500);
    }
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
    if (mb_strlen($title) > 255) {
        json_response(['error' => 'Judul pengumuman maksimal 255 karakter'], 400);
    }

    $validCategories = ['kas', 'kegiatan', 'informasi_kelas', 'penting'];
    $validPriorities = ['normal', 'important'];
    if (!in_array($category, $validCategories, true)) {
        json_response(['error' => 'Kategori pengumuman tidak valid'], 400);
    }
    if (!in_array($priority, $validPriorities, true)) {
        json_response(['error' => 'Prioritas tidak valid'], 400);
    }

    // Check ownership
    $stmt = $pdo->prepare("SELECT id FROM announcements WHERE id = ? AND class_id = ?");
    $stmt->execute([$announcementId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Pengumuman tidak ditemukan'], 404);
    }

    try {
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
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal memperbarui pengumuman'], 500);
    }
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

    try {
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ? AND class_id = ?");
        $stmt->execute([$announcementId, $classId]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'delete_announcement', 'announcements', $announcementId, "Menghapus pengumuman ID $announcementId");
        }

        json_response(['success' => true]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menghapus pengumuman'], 500);
    }
}
?>
