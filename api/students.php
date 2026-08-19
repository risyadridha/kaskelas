<?php
// api/students.php
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Ambil class_id user dari database berdasarkan session user_id
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) json_response(['error' => 'User tidak ditemukan'], 404);
$classId = $user['class_id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Hitung total periode untuk kelas ini sekali saja
    $stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM cash_periods WHERE class_id = ?");
    $stmtTotal->execute([$classId]);
    $totalPeriods = (int)$stmtTotal->fetchColumn();

    // Ambil semua siswa dalam kelas yang sama
    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.role, u.email, u.phone, u.status AS user_status,
               s.nis, s.full_name, s.attendance_number,
               COUNT(DISTINCT CASE WHEN t.status = 'berhasil' THEN ti.period_id END) AS lunas,
               COUNT(DISTINCT CASE WHEN t.status = 'menunggu' THEN ti.period_id END) AS menunggu
        FROM users u
        JOIN students s ON s.user_id = u.id
        LEFT JOIN transactions t ON t.user_id = u.id
        LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
        WHERE u.class_id = ?
        GROUP BY u.id, u.username, u.role, u.email, u.phone, u.status, s.nis, s.full_name, s.attendance_number
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
}

if ($method === 'POST') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $nis = trim($data['nis'] ?? '');
    $fullName = trim($data['full_name'] ?? '');
    $attendanceNumber = isset($data['attendance_number']) ? (int)$data['attendance_number'] : null;
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');

    if (empty($username) || empty($nis) || empty($fullName)) {
        json_response(['error' => 'Username, NIS, dan nama lengkap wajib diisi'], 400);
    }

    // Cek username / nis unik
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) {
        json_response(['error' => 'Username sudah digunakan'], 400);
    }

    $stmtCheckNis = $pdo->prepare("SELECT id FROM students WHERE nis = ?");
    $stmtCheckNis->execute([$nis]);
    if ($stmtCheckNis->fetch()) {
        json_response(['error' => 'NIS sudah digunakan'], 400);
    }

    $pdo->beginTransaction();
    try {
        // Password default untuk siswa baru: siswa123
        $defaultPassHash = password_hash('siswa123', PASSWORD_DEFAULT);
        $stmtUser = $pdo->prepare("
            INSERT INTO users (class_id, username, password_hash, role, email, phone, status)
            VALUES (?, ?, ?, 'siswa', ?, ?, 'active')
        ");
        $stmtUser->execute([$classId, $username, $defaultPassHash, $email ?: null, $phone ?: null]);
        $newUserId = $pdo->lastInsertId();

        $stmtStudent = $pdo->prepare("
            INSERT INTO students (user_id, nis, full_name, attendance_number)
            VALUES (?, ?, ?, ?)
        ");
        $stmtStudent->execute([$newUserId, $nis, $fullName, $attendanceNumber]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'add_member', 'users', $newUserId, "Menambah anggota siswa baru '{$fullName}' pada kelas #{$classId}");
        }

        $pdo->commit();
        json_response(['success' => true, 'user_id' => $newUserId]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menambah anggota'], 500);
    }
}

if ($method === 'PUT') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $targetUserId = $data['user_id'] ?? null;
    $fullName = trim($data['full_name'] ?? '');
    $attendanceNumber = isset($data['attendance_number']) ? (int)$data['attendance_number'] : null;
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $status = $data['status'] ?? 'active';

    if (!$targetUserId) {
        json_response(['error' => 'ID user tidak valid'], 400);
    }

    if (!in_array($status, ['active', 'inactive', 'suspended'], true)) {
        json_response(['error' => 'Status tidak valid'], 400);
    }

    // WAJIB: Authorization & ownership check
    // Pastikan user_id target ada di kelas yang sama dan role nya 'siswa'
    $stmtTarget = $pdo->prepare("SELECT id, role, class_id FROM users WHERE id = ?");
    $stmtTarget->execute([$targetUserId]);
    $targetUser = $stmtTarget->fetch(PDO::FETCH_ASSOC);

    if (!$targetUser) {
        json_response(['error' => 'User tidak ditemukan'], 404);
    }

    if ((int)$targetUser['class_id'] !== (int)$classId) {
        json_response(['error' => 'Forbidden: Tidak dapat mengelola anggota kelas lain'], 403);
    }

    if ($targetUser['role'] !== 'siswa') {
        json_response(['error' => 'Forbidden: Tidak dapat mengubah akun non-siswa'], 403);
    }

    $pdo->beginTransaction();
    try {
        $stmtUpdateUser = $pdo->prepare("
            UPDATE users
            SET email = ?, phone = ?, status = ?
            WHERE id = ?
        ");
        $stmtUpdateUser->execute([$email ?: null, $phone ?: null, $status, $targetUserId]);

        if (!empty($fullName)) {
            $stmtUpdateStudent = $pdo->prepare("
                UPDATE students
                SET full_name = ?, attendance_number = ?
                WHERE user_id = ?
            ");
            $stmtUpdateStudent->execute([$fullName, $attendanceNumber, $targetUserId]);
        }

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'update_member', 'users', $targetUserId, "Mengubah data siswa ID #{$targetUserId}");
        }

        $pdo->commit();
        json_response(['success' => true]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log($e->getMessage());
        json_response(['error' => 'Gagal memperbarui anggota'], 500);
    }
}

if ($method === 'DELETE') {
    require_role('bendahara');
    require_csrf();

    $data = json_decode(file_get_contents('php://input'), true);
    $targetUserId = $data['user_id'] ?? $_GET['user_id'] ?? null;

    if (!$targetUserId) {
        json_response(['error' => 'ID user tidak valid'], 400);
    }

    $stmtTarget = $pdo->prepare("SELECT id, role, class_id FROM users WHERE id = ?");
    $stmtTarget->execute([$targetUserId]);
    $targetUser = $stmtTarget->fetch(PDO::FETCH_ASSOC);

    if (!$targetUser) {
        json_response(['error' => 'User tidak ditemukan'], 404);
    }

    if ((int)$targetUser['class_id'] !== (int)$classId) {
        json_response(['error' => 'Forbidden: Tidak dapat mengelola anggota kelas lain'], 403);
    }

    if ($targetUser['role'] !== 'siswa') {
        json_response(['error' => 'Forbidden: Tidak dapat menonaktifkan/menghapus akun non-siswa'], 403);
    }

    // Nonaktifkan user secara aman daripada DELETE fisik yang merusak foreign key
    $stmtDisable = $pdo->prepare("UPDATE users SET status = 'inactive' WHERE id = ?");
    $stmtDisable->execute([$targetUserId]);

    if (function_exists('log_audit')) {
        log_audit($pdo, $userId, 'disable_member', 'users', $targetUserId, "Menonaktifkan anggota siswa ID #{$targetUserId}");
    }

    json_response(['success' => true]);
}
?>
