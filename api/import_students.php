<?php
// api/import_students.php
// Import massal siswa dari CSV (bendahara only)
require 'config.php';
require 'helpers.php';

require_role('bendahara');
require_csrf();

$userId = $_SESSION['user_id'];

// Rate limit per user (5 request per menit)
$importThrottleKey = md5('import_students|' . $userId);
$importThrottle = login_throttle_check($importThrottleKey, 5, 60);
if ($importThrottle['blocked']) {
    json_response(['error' => 'Terlalu banyak permintaan import, coba lagi sebentar'], 429);
}

// Ambil class_id bendahara
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

if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'File CSV tidak ditemukan'], 400);
}

$file = $_FILES['csv_file'];

// Validasi ekstensi & MIME (CSV sering terdeteksi text/plain)
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowedMime = ['text/csv', 'text/plain', 'application/csv'];
if ($extension !== 'csv' || !in_array($mime, $allowedMime, true)) {
    json_response(['error' => 'File harus berformat CSV (.csv)'], 400);
}

$handle = fopen($file['tmp_name'], 'r');
if (!$handle) {
    json_response(['error' => 'Gagal membaca file CSV'], 400);
}

// Baca header (baris pertama)
$header = fgetcsv($handle);
if (!$header) {
    fclose($handle);
    json_response(['error' => 'File CSV kosong'], 400);
}

// Normalisasi header (trim, lowercase)
$expectedHeader = ['nama_lengkap', 'nis', 'username', 'nomor_absen', 'email', 'no_hp'];
$actualHeader = array_map(function($h) { return strtolower(trim($h)); }, $header);

if ($actualHeader !== $expectedHeader) {
    fclose($handle);
    json_response(['error' => 'Format header CSV tidak sesuai. Harus: nama_lengkap,nis,username,nomor_absen,email,no_hp'], 400);
}

$successCount = 0;
$failedRows = [];
$rowNumber = 1; // baris 1 = header, data mulai baris 2

while (($row = fgetcsv($handle)) !== false) {
    $rowNumber++;
    
    // Skip baris kosong
    if (count(array_filter($row, fn($v) => $v !== '')) === 0) {
        continue;
    }
    
    // Pastikan cukup kolom
    if (count($row) < 6) {
        $failedRows[] = ['row' => $rowNumber, 'reason' => 'Kolom tidak lengkap (butuh 6 kolom)'];
        continue;
    }
    
    [$fullName, $nis, $username, $attendanceNumber, $email, $phone] = $row;
    
    $fullName = strip_tags(trim($fullName));
    $nis = trim($nis);
    $username = trim($username);
    $attendanceNumber = $attendanceNumber !== '' ? (int)$attendanceNumber : null;
    $email = strip_tags(trim($email));
    $phone = strip_tags(trim($phone));
    
    // Validasi wajib (sama seperti POST students.php)
    if (empty($username) || empty($nis) || empty($fullName)) {
        $failedRows[] = ['row' => $rowNumber, 'reason' => 'Username, NIS, dan nama lengkap wajib diisi'];
        continue;
    }
    
    // Cek username unik
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) {
        $failedRows[] = ['row' => $rowNumber, 'reason' => "Username '$username' sudah digunakan"];
        continue;
    }
    
    // Cek NIS unik
    $stmtCheckNis = $pdo->prepare("SELECT id FROM students WHERE nis = ?");
    $stmtCheckNis->execute([$nis]);
    if ($stmtCheckNis->fetch()) {
        $failedRows[] = ['row' => $rowNumber, 'reason' => "NIS '$nis' sudah digunakan"];
        continue;
    }
    
    // Cek attendance_number unik di kelas yang sama
    if ($attendanceNumber !== null) {
        $stmtCheckAbsen = $pdo->prepare("
            SELECT s.id FROM students s
            JOIN users u ON u.id = s.user_id
            WHERE u.class_id = ? AND s.attendance_number = ?
        ");
        $stmtCheckAbsen->execute([$classId, $attendanceNumber]);
        if ($stmtCheckAbsen->fetch()) {
            $failedRows[] = ['row' => $rowNumber, 'reason' => "Nomor absen '$attendanceNumber' sudah digunakan siswa lain di kelas ini"];
            continue;
        }
    }
    
    // INSERT per baris dalam transaction terpisah
    $pdo->beginTransaction();
    try {
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
            log_audit($pdo, $userId, 'import_student', 'users', $newUserId, "Import siswa '{$fullName}' via CSV");
        }
        
        $pdo->commit();
        $successCount++;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("Import CSV row $rowNumber failed: " . $e->getMessage());
        $failedRows[] = ['row' => $rowNumber, 'reason' => 'Gagal menyimpan ke database: ' . $e->getMessage()];
    }
}

fclose($handle);

json_response([
    'success_count' => $successCount,
    'failed_rows' => $failedRows
]);
?>