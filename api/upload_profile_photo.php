<?php
// api/upload_profile_photo.php
require 'config.php';
require 'helpers.php';

require_login();
require_csrf();

$userId = $_SESSION['user_id'];

if (!isset($_FILES['photo'])) {
    json_response(['error' => 'File photo tidak ditemukan'], 400);
}

if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    if ($_FILES['photo']['error'] === UPLOAD_ERR_INI_SIZE || $_FILES['photo']['error'] === UPLOAD_ERR_FORM_SIZE) {
        json_response(['error' => 'Ukuran foto melebihi batas maksimal server (2MB)'], 400);
    }
    json_response(['error' => 'Gagal mengunggah foto (kode error: ' . $_FILES['photo']['error'] . ')'], 400);
}

$file = $_FILES['photo'];

// Validasi ukuran maks 2MB
if ($file['size'] > 2 * 1024 * 1024) {
    json_response(['error' => 'Ukuran foto maksimal 2MB'], 400);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

$allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mime, $allowedMime)) {
    json_response(['error' => 'Tipe file foto tidak diizinkan'], 400);
}

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
if (!in_array($extension, $allowedExt)) {
    json_response(['error' => 'Ekstensi file foto tidak diizinkan'], 400);
}

$handle = fopen($file['tmp_name'], 'rb');
$headerBytes = fread($handle, 512);
fclose($handle);
if ($headerBytes !== false && (stripos($headerBytes, '<?php') !== false || strpos($headerBytes, '#!/') === 0)) {
    json_response(['error' => 'File tidak valid'], 400);
}

$uploadDir = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . 'profiles' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$fileName = 'avatar_' . $userId . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
$uploadPath = $uploadDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    json_response(['error' => 'Gagal menyimpan foto'], 500);
}

$photoPath = 'profiles/' . $fileName;

// Fetch old photo to delete
$stmtOld = $pdo->prepare("SELECT profile_photo FROM users WHERE id = ?");
$stmtOld->execute([$userId]);
$oldPhoto = $stmtOld->fetchColumn();

try {
    $stmt = $pdo->prepare("UPDATE users SET profile_photo = ? WHERE id = ?");
    $stmt->execute([$photoPath, $userId]);
} catch (Exception $e) {
    if (file_exists($uploadPath)) {
        @unlink($uploadPath);
    }
    error_log($e->getMessage());
    json_response(['error' => 'Gagal menyimpan foto profil'], 500);
}

if ($oldPhoto && $oldPhoto !== $photoPath) {
    $oldFilePath = rtrim($proofStorageDir, '/\\') . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $oldPhoto);
    if (file_exists($oldFilePath)) {
        @unlink($oldFilePath);
    }
}

if (function_exists('log_audit')) {
    log_audit($pdo, $userId, 'upload_profile_photo', 'users', $userId, "Mengubah foto profil");
}

json_response(['success' => true, 'profile_photo' => $photoPath]);
?>
