<?php
// api/seed.php
require 'config.php';
if (!defined('ALLOW_SEED') || ALLOW_SEED !== true) {
    die('Akses ditolak');
}
// Development only: beri pengaman jika tidak ingin diakses publik di production
// if (!defined('ALLOW_SEED') || ALLOW_SEED !== true) {
//     die('Akses ditolak');
// }

// Nilai eksplisit untuk development
$className = 'XII RPL 3';
$bendaharaUsername = 'bendahara';
$bendaharaEmail = 'bendahara@kelas.id';
$bendaharaPassword = 'bendahara123';
$siswaUsername = 'risyad';
$siswaEmail = 'risyad@gmail.com';
$siswaPassword = 'password123';
$siswaNis = '2024100';
$siswaFullName = 'Risyad';
$siswaAttendanceNumber = 1;

// 1. Cari atau buat kelas
$stmt = $pdo->prepare("SELECT id FROM classes WHERE name = ?");
$stmt->execute([$className]);
$class = $stmt->fetch(PDO::FETCH_ASSOC);

if ($class) {
    $classId = $class['id'];
} else {
    $pdo->exec("INSERT INTO classes (name) VALUES ('$className')");
    $classId = $pdo->lastInsertId();
}

// 2. Buat bendahara jika belum ada
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$bendaharaUsername]);
if (!$stmt->fetch()) {
    $bendaharaPass = password_hash($bendaharaPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (class_id, username, password_hash, role, email) VALUES (?, ?, ?, 'bendahara', ?)");
    $stmt->execute([$classId, $bendaharaUsername, $bendaharaPass, $bendaharaEmail]);
}

// 3. Buat siswa risyad jika belum ada
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$siswaUsername]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    $siswaPass = password_hash($siswaPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (class_id, username, password_hash, role, email) VALUES (?, ?, ?, 'siswa', ?)");
    $stmt->execute([$classId, $siswaUsername, $siswaPass, $siswaEmail]);
    $userId = $pdo->lastInsertId();

    // 4. Isi tabel students untuk siswa
    $stmt = $pdo->prepare("INSERT INTO students (user_id, nis, full_name, attendance_number) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $siswaNis, $siswaFullName, $siswaAttendanceNumber]);
} else {
    $userId = $user['id'];
    // Cek apakah data student sudah ada
    $stmt = $pdo->prepare("SELECT id FROM students WHERE user_id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO students (user_id, nis, full_name, attendance_number) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $siswaNis, $siswaFullName, $siswaAttendanceNumber]);
    }
}

echo "Seed selesai. Class ID: $classId\n";
echo "Login siswa: username 'risyad', password 'password123'\n";
echo "Login bendahara: username 'bendahara', password 'bendahara123'\n";
?>