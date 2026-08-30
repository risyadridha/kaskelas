<?php
// api/import_students.php
require 'config.php';
require 'helpers.php';

require_login();
require_role('bendahara');
require_csrf();

$userId = $_SESSION['user_id'];

// Get current bendahara class_id
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
$classId = $user['class_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method tidak diizinkan'], 405);
}

$fileKey = isset($_FILES['file']) ? 'file' : (isset($_FILES['csv']) ? 'csv' : null);
if (!$fileKey || !isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'File CSV tidak ditemukan atau gagal diunggah'], 400);
}

$file = $_FILES[$fileKey];

if ($file['size'] > 2 * 1024 * 1024) {
    json_response(['error' => 'Ukuran file CSV maksimal 2MB'], 400);
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($ext !== 'csv' && $file['type'] !== 'text/csv' && $file['type'] !== 'text/plain' && $file['type'] !== 'application/vnd.ms-excel') {
    json_response(['error' => 'Format file harus berupa CSV'], 400);
}

$handle = fopen($file['tmp_filename'] ?? $file['tmp_name'], 'r');
if (!$handle) {
    json_response(['error' => 'Gagal membaca file CSV'], 500);
}

// Remove UTF-8 BOM if present
$bom = fread($handle, 3);
if ($bom !== "\xEF\xBB\xBF") {
    rewind($handle);
}

$header = fgetcsv($handle, 1000, ',');
if (!$header) {
    fclose($handle);
    json_response(['error' => 'File CSV kosong'], 400);
}

// Detect delimiter (comma vs semicolon)
if (count($header) === 1 && strpos($header[0], ';') !== false) {
    rewind($handle);
    if ($bom === "\xEF\xBB\xBF") fread($handle, 3);
    $header = fgetcsv($handle, 1000, ';');
    $delimiter = ';';
} else {
    $delimiter = ',';
}

$importedCount = 0;
$skippedCount = 0;
$errors = [];

$pdo->beginTransaction();
try {
    $defaultPassHash = password_hash('siswa123', PASSWORD_DEFAULT);

    $stmtCheckUser = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheckNis = $pdo->prepare("SELECT id FROM students WHERE nis = ?");

    $stmtInsertUser = $pdo->prepare("
        INSERT INTO users (class_id, username, password_hash, role, email, phone, status)
        VALUES (?, ?, ?, 'siswa', ?, ?, 'active')
    ");
    $stmtInsertStudent = $pdo->prepare("
        INSERT INTO students (user_id, nis, full_name, attendance_number)
        VALUES (?, ?, ?, ?)
    ");

    $line = 1;
    while (($row = fgetcsv($handle, 1000, $delimiter)) !== false) {
        $line++;
        if (count($row) < 3) continue; // Minimum required fields: username, nis, full_name

        $username = trim($row[0] ?? '');
        $nis = trim($row[1] ?? '');
        $fullName = trim($row[2] ?? '');
        $attendanceNumber = isset($row[3]) && is_numeric(trim($row[3])) ? (int)trim($row[3]) : null;
        $email = trim($row[4] ?? '');
        $phone = trim($row[5] ?? '');

        if (empty($username) || empty($nis) || empty($fullName)) {
            $skippedCount++;
            $errors[] = "Baris #{$line}: Data wajib (username, NIS, nama) tidak lengkap.";
            continue;
        }

        // Check uniqueness
        $stmtCheckUser->execute([$username]);
        if ($stmtCheckUser->fetch()) {
            $skippedCount++;
            $errors[] = "Baris #{$line}: Username '{$username}' sudah digunakan.";
            continue;
        }

        $stmtCheckNis->execute([$nis]);
        if ($stmtCheckNis->fetch()) {
            $skippedCount++;
            $errors[] = "Baris #{$line}: NIS '{$nis}' sudah digunakan.";
            continue;
        }

        $stmtInsertUser->execute([
            $classId,
            $username,
            $defaultPassHash,
            $email ?: null,
            $phone ?: null
        ]);
        $newUserId = $pdo->lastInsertId();

        $stmtInsertStudent->execute([
            $newUserId,
            $nis,
            $fullName,
            $attendanceNumber
        ]);

        $importedCount++;
    }

    fclose($handle);

    if ($importedCount > 0 && function_exists('log_audit')) {
        log_audit($pdo, $userId, 'import_students', 'students', null, "Mengimpor {$importedCount} siswa baru ke kelas #{$classId}");
    }

    $pdo->commit();
    json_response([
        'success' => true,
        'imported_count' => $importedCount,
        'skipped_count' => $skippedCount,
        'errors' => $errors
    ]);
} catch (Exception $e) {
    fclose($handle);
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    json_response(['error' => 'Gagal memproses import data siswa'], 500);
}
?>
