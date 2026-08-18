<?php
// api/seed_periods.php
// DEVELOPMENT ONLY - JANGAN DIAKSES DI PRODUCTION
require 'config.php';
if (!defined('ALLOW_SEED') || ALLOW_SEED !== true) {
    die('Akses ditolak');
}
// Tentukan user yang menjadi acuan
$siswaUsername = 'risyad';      // untuk mendapatkan class_id yang benar
$bendaharaUsername = 'bendahara'; // sebagai created_by

// Ambil class_id dari user risyad (bukan LIMIT 1)
$stmt = $pdo->prepare("SELECT id, class_id FROM users WHERE username = ?");
$stmt->execute([$siswaUsername]);
$userSiswa = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$userSiswa) {
    die("User $siswaUsername tidak ditemukan. Jalankan seed.php terlebih dahulu.");
}
$classId = $userSiswa['class_id'];

// Ambil id bendahara untuk created_by
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND role = 'bendahara'");
$stmt->execute([$bendaharaUsername]);
$userBendahara = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$userBendahara) {
    die("User $bendaharaUsername tidak ditemukan. Jalankan seed.php terlebih dahulu.");
}
$bendaharaId = $userBendahara['id'];

// Bersihkan data periode untuk kelas ini agar tidak duplikat
$stmt = $pdo->prepare("DELETE FROM cash_periods WHERE class_id = ?");
$stmt->execute([$classId]);

// Buat 16 periode mingguan
$frequency = 'weekly';
$amount = 3000;
$today = new DateTime();
$today->modify('last Monday'); // mulai dari Senin terakhir

for ($i = 0; $i < 16; $i++) {
    $start = clone $today;
    $end = clone $today;
    $end->modify('+6 days');
    $due = clone $end;

    $name = $start->format('d') . '–' . $end->format('d') . ' ' . $end->format('M Y');
    $startDate = $start->format('Y-m-d');
    $endDate = $end->format('Y-m-d');
    $dueDate = $due->format('Y-m-d');

    $stmt = $pdo->prepare("
        INSERT INTO cash_periods (class_id, name, frequency, start_date, end_date, due_date, amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')
    ");
    $stmt->execute([$classId, $name, $frequency, $startDate, $endDate, $dueDate, $amount]);

    $today->modify('+7 days');
}

// Hapus expenses dan announcements yang class_id tidak sesuai, lalu buat contoh baru
// supaya class_id dan created_by konsisten
$stmt = $pdo->prepare("DELETE FROM expenses WHERE class_id != ?");
$stmt->execute([$classId]);
$stmt = $pdo->prepare("DELETE FROM announcements WHERE class_id != ?");
$stmt->execute([$classId]);

// Tambah beberapa pengeluaran contoh
$expenses = [
    ['Pembelian alat kebersihan', 'kebersihan', 75000, 'Pembelian sapu, pel, dan perlengkapan kebersihan kelas.'],
    ['Dekorasi kelas', 'dekorasi', 150000, 'Pembelian kertas krep, balon, dan bahan dekorasi.'],
];

foreach ($expenses as $exp) {
    $stmt = $pdo->prepare("
        INSERT INTO expenses (class_id, created_by, name, category, amount, description, expense_date)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE())
    ");
    $stmt->execute([$classId, $bendaharaId, $exp[0], $exp[1], $exp[2], $exp[3]]);
}

// Tambah pengumuman contoh
$stmt = $pdo->prepare("
    INSERT INTO announcements (class_id, created_by, title, content, category, priority, published_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
");
$stmt->execute([$classId, $bendaharaId, 'Reminder Pembayaran Kas', 'Jangan lupa membayar kas tepat waktu.', 'kas', 'normal']);
$stmt->execute([$classId, $bendaharaId, 'Lomba Kebersihan Kelas', 'Kelas kita mengikuti lomba kebersihan.', 'informasi_kelas', 'important']);

// Pastikan cash_settings memakai class_id yang sama
$stmt = $pdo->prepare("UPDATE cash_settings SET class_id = ? WHERE class_id != ?");
$stmt->execute([$classId, $classId]);

echo "Seed periode, pengeluaran, pengumuman berhasil untuk class_id = $classId";
?>