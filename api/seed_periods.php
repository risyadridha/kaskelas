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

// ---- MODE AMAN: tidak ada operasi DELETE di script ini ----

// Buat periode contoh HANYA jika kelas ini belum memiliki periode sama sekali
$stmtCountPeriods = $pdo->prepare("SELECT COUNT(*) FROM cash_periods WHERE class_id = ?");
$stmtCountPeriods->execute([$classId]);
$existingPeriods = (int)$stmtCountPeriods->fetchColumn();

if ($existingPeriods === 0) {
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
    echo "16 periode contoh dibuat.\n";
} else {
    echo "Kelas sudah memiliki {$existingPeriods} periode, pembuatan contoh dilewati.\n";
}

// Tambah pengeluaran contoh hanya jika kelas ini belum punya
// (data kelas lain tidak disentuh)
$stmtCountExpenses = $pdo->prepare("SELECT COUNT(*) FROM expenses WHERE class_id = ?");
$stmtCountExpenses->execute([$classId]);
$existingExpenses = (int)$stmtCountExpenses->fetchColumn();

$expenses = [
    ['Pembelian alat kebersihan', 'kebersihan', 75000, 'Pembelian sapu, pel, dan perlengkapan kebersihan kelas.'],
    ['Dekorasi kelas', 'dekorasi', 150000, 'Pembelian kertas krep, balon, dan bahan dekorasi.'],
];

if ($existingExpenses === 0) {
    foreach ($expenses as $exp) {
        $stmt = $pdo->prepare("
            INSERT INTO expenses (class_id, created_by, name, category, amount, description, expense_date)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE())
        ");
        $stmt->execute([$classId, $bendaharaId, $exp[0], $exp[1], $exp[2], $exp[3]]);
    }
    echo "2 pengeluaran contoh dibuat.\n";
} else {
    echo "Pengeluaran sudah ada ({$existingExpenses}), contoh dilewati.\n";
}

// Tambah pengumuman contoh hanya jika kelas ini belum punya
$stmtCountAnnouncements = $pdo->prepare("SELECT COUNT(*) FROM announcements WHERE class_id = ?");
$stmtCountAnnouncements->execute([$classId]);
$existingAnnouncements = (int)$stmtCountAnnouncements->fetchColumn();

if ($existingAnnouncements === 0) {
    $stmt = $pdo->prepare("
        INSERT INTO announcements (class_id, created_by, title, content, category, priority, published_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$classId, $bendaharaId, 'Reminder Pembayaran Kas', 'Jangan lupa membayar kas tepat waktu.', 'kas', 'normal']);
    $stmt->execute([$classId, $bendaharaId, 'Lomba Kebersihan Kelas', 'Kelas kita mengikuti lomba kebersihan.', 'informasi_kelas', 'important']);
    echo "2 pengumuman contoh dibuat.\n";
} else {
    echo "Pengumuman sudah ada ({$existingAnnouncements}), contoh dilewati.\n";
}

echo "Seed selesai untuk class_id = $classId (mode aman tanpa hapus data)";
?>