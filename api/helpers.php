<?php
// api/helpers.php

function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function require_login() {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

function require_role($role) {
    require_login();
    if ($_SESSION['role'] !== $role) {
        json_response(['error' => 'Forbidden'], 403);
    }
}

function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_csrf() {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
        json_response(['error' => 'CSRF token tidak valid'], 403);
    }
}

function generate_transaction_code() {
    return 'TRX-' . strtoupper(uniqid());
}

function log_audit($pdo, $userId, $action, $entityType = null, $entityId = null, $description = null) {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $action, $entityType, $entityId, $description, $ip]);
    } catch (Exception $e) {
        error_log("Audit log failed: " . $e->getMessage());
    }
}

// Validasi tanggal format YYYY-MM-DD sesuai kolom DATE di database
function valid_date($value) {
    if (!is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }
    [$y, $m, $d] = array_map('intval', explode('-', $value));
    return checkdate($m, $d, $y);
}

// ---- Rate limiter login persisten (file-based) ----
// Tidak bisa direset hanya dengan menghapus cookie/session browser.

function login_throttle_file() {
    return sys_get_temp_dir() . '/kaskelas-login-throttle.json';
}

function login_throttle_read() {
    if (!is_file(login_throttle_file())) {
        return [];
    }
    $fp = @fopen(login_throttle_file(), 'r');
    if (!$fp) {
        return [];
    }
    @flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    @flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode((string)$raw, true);
    return is_array($data) ? $data : [];
}

function login_throttle_write(array $data) {
    $fp = @fopen(login_throttle_file(), 'c');
    if (!$fp) {
        return;
    }
    @flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    fwrite($fp, json_encode($data));
    fflush($fp);
    @flock($fp, LOCK_UN);
    fclose($fp);
}

function login_throttle_cleanup(array $data, $windowSeconds) {
    $now = time();
    foreach ($data as $k => $v) {
        if (!isset($v['last']) || ($now - (int)$v['last']) > $windowSeconds) {
            unset($data[$k]);
        }
    }
    return $data;
}

// Cek apakah key sedang diblokir. Return ['blocked' => bool]
function login_throttle_check($key, $maxAttempts = 5, $windowSeconds = 300) {
    $data = login_throttle_cleanup(login_throttle_read(), $windowSeconds);
    $entry = $data[$key] ?? null;
    if ($entry && (int)$entry['count'] >= $maxAttempts && (time() - (int)$entry['first']) <= $windowSeconds) {
        return ['blocked' => true];
    }
    return ['blocked' => false];
}

// Catat satu kegagalan login untuk key
function login_throttle_fail($key, $windowSeconds = 300) {
    $data = login_throttle_read();
    $now = time();
    if (isset($data[$key]) && ($now - (int)$data[$key]['first']) <= $windowSeconds) {
        $data[$key]['count'] = (int)$data[$key]['count'] + 1;
    } else {
        $data[$key] = ['count' => 1, 'first' => $now];
    }
    $data[$key]['last'] = $now;
    login_throttle_write($data);
}

// Hapus catatan key setelah login berhasil
function login_throttle_reset($key) {
    $data = login_throttle_read();
    if (isset($data[$key])) {
        unset($data[$key]);
        login_throttle_write($data);
    }
}

/**
 * Resize & kompres gambar (JPEG/PNG) di tempat (in-place) jika melebihi
 * dimensi maksimum. File PDF dilewati (tidak diproses, dikembalikan apa
 * adanya) karena bukan format gambar.
 * @param string $filePath Path file yang sudah tersimpan di disk
 * @param string $mimeType MIME type asli file (dari hasil finfo, bukan dari $_FILES)
 * @param int $maxDimension Dimensi terpanjang maksimum dalam pixel (default 1280)
 * @param int $jpegQuality Kualitas JPEG 0-100 (default 80)
 * @return bool true jika berhasil diproses atau memang dilewati (PDF), false jika gagal
 */
function compress_uploaded_image($filePath, $mimeType, $maxDimension = 1280, $jpegQuality = 80) {
    if (!extension_loaded('gd')) {
        return true; // GD tidak tersedia di server ini, lewati saja, jangan sampai upload gagal karena ini
    }
    if ($mimeType === 'application/pdf') {
        return true; // PDF tidak diproses
    }

    $imageInfo = @getimagesize($filePath);
    if ($imageInfo === false) {
        return false;
    }
    [$width, $height] = $imageInfo;

    if ($width <= $maxDimension && $height <= $maxDimension) {
        return true; // sudah cukup kecil, tidak perlu diproses
    }

    if ($mimeType === 'image/jpeg') {
        $srcImage = @imagecreatefromjpeg($filePath);
    } elseif ($mimeType === 'image/png') {
        $srcImage = @imagecreatefrompng($filePath);
    } elseif ($mimeType === 'image/webp') {
        $srcImage = @imagecreatefromwebp($filePath);
    } else {
        return true; // tipe tidak dikenal, lewati saja jangan sampai merusak file
    }

    if (!$srcImage) {
        return false;
    }

    $ratio = min($maxDimension / $width, $maxDimension / $height);
    $newWidth = (int)round($width * $ratio);
    $newHeight = (int)round($height * $ratio);

    $dstImage = imagecreatetruecolor($newWidth, $newHeight);

    if ($mimeType === 'image/png' || $mimeType === 'image/webp') {
        imagealphablending($dstImage, false);
        imagesavealpha($dstImage, true);
    }

    imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    if ($mimeType === 'image/jpeg') {
        imagejpeg($dstImage, $filePath, $jpegQuality);
    } elseif ($mimeType === 'image/png') {
        imagepng($dstImage, $filePath, 6);
    } elseif ($mimeType === 'image/webp') {
        imagewebp($dstImage, $filePath, $jpegQuality);
    }

    imagedestroy($srcImage);
    imagedestroy($dstImage);

    return true;
}
?>
