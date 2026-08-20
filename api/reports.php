<?php
// api/reports.php
require 'config.php';
require 'helpers.php';

require_login();
$userId = $_SESSION['user_id'];

$role = $_SESSION['role'] ?? 'siswa';

// Fetch user's class_id
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$classId = $user['class_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    if ($role === 'bendahara') {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM reports r
            JOIN users u ON u.id = r.user_id
            WHERE u.class_id = ?
        ");
        $stmt->execute([$classId]);
        $total = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT r.id, r.user_id, r.category, r.title, r.description, r.attachment, r.transaction_id, r.status, r.response, r.created_at, r.updated_at,
                   u.username, COALESCE(s.full_name, u.username) AS reporter_name
            FROM reports r
            JOIN users u ON u.id = r.user_id
            LEFT JOIN students s ON s.user_id = u.id
            WHERE u.class_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $classId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM reports WHERE user_id = ?");
        $stmt->execute([$userId]);
        $total = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, user_id, category, title, description, attachment, transaction_id, status, response, created_at, updated_at
            FROM reports
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
    }
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'reports' => $reports,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    require_csrf();
    if ($role !== 'bendahara') json_response(['error' => 'Forbidden'], 403);

    $data = json_decode(file_get_contents('php://input'), true);
    $reportId = $data['id'] ?? null;
    $status = $data['status'] ?? 'diproses'; // dikirim, diproses, selesai
    $response = $data['response'] ?? null;

    if (!$reportId || !in_array($status, ['dikirim', 'diproses', 'selesai'])) {
        json_response(['error' => 'Data status laporan tidak valid'], 400);
    }

    // Verify report ownership belongs to member of treasurer's class
    $stmt = $pdo->prepare("
        SELECT r.id FROM reports r
        JOIN users u ON u.id = r.user_id
        WHERE r.id = ? AND u.class_id = ?
    ");
    $stmt->execute([$reportId, $classId]);
    if (!$stmt->fetch()) {
        json_response(['error' => 'Laporan tidak ditemukan'], 404);
    }

    $stmt = $pdo->prepare("
        UPDATE reports
        SET status = ?, response = ?
        WHERE id = ?
    ");
    $stmt->execute([$status, $response, $reportId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'respond_report', 'reports', $reportId, "Merespons laporan ID $reportId status $status");
    }

    json_response(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();

    $category = $_POST['category'] ?? 'lainnya';
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $transactionId = $_POST['transaction_id'] ?? null;

    if (empty($title) || empty($description)) {
        $jsonInput = json_decode(file_get_contents('php://input'), true);
        if ($jsonInput) {
            $category = $jsonInput['category'] ?? 'lainnya';
            $title = trim($jsonInput['title'] ?? '');
            $description = trim($jsonInput['description'] ?? '');
            $transactionId = $jsonInput['transaction_id'] ?? null;
        }
    }

    if (empty($title) || empty($description)) {
        json_response(['error' => 'Judul dan deskripsi wajib diisi'], 400);
    }

    if ($transactionId !== null && $transactionId !== '') {
        $stmt = $pdo->prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?');
        $stmt->execute([$transactionId, $userId]);
        if (!$stmt->fetch()) {
            json_response(['error' => 'Transaksi tidak ditemukan'], 404);
        }
    } else {
        $transactionId = null;
    }

    $attachmentPath = null;
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['attachment'];
        if ($file['size'] > 5 * 1024 * 1024) {
            json_response(['error' => 'Ukuran lampiran maksimal 5MB'], 400);
        }
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $allowedMime = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!in_array($mime, $allowedMime)) {
            json_response(['error' => 'Tipe file lampiran tidak diizinkan'], 400);
        }
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
        if (!in_array($extension, $allowedExt)) {
            json_response(['error' => 'Ekstensi file lampiran tidak diizinkan'], 400);
        }
        $uploadDir = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'reports' . DIRECTORY_SEPARATOR;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $fileName = 'report_' . bin2hex(random_bytes(12)) . '.' . $extension;
        $uploadPath = $uploadDir . $fileName;
        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            json_response(['error' => 'Gagal menyimpan lampiran'], 500);
        }
        $attachmentPath = 'reports/' . $fileName;
    }

    $stmt = $pdo->prepare("
        INSERT INTO reports (user_id, category, title, description, attachment, transaction_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $category, $title, $description, $attachmentPath, $transactionId]);
    $newReportId = $pdo->lastInsertId();

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'create_report', 'reports', $newReportId, "Membuat laporan '{$title}'");
    }

    json_response(['success' => true, 'id' => $newReportId, 'attachment' => $attachmentPath]);
}
?>
