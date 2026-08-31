<?php
// api/export_report.php
// Ekspor laporan keuangan ke CSV (bendahara only)
require 'config.php';
require 'helpers.php';

require_role('bendahara');
require_login();

$userId = $_SESSION['user_id'];

// Rate limit per user (10 request per menit)
$exportThrottleKey = md5('export_report|' . $userId);
$exportThrottle = login_throttle_check($exportThrottleKey, 10, 60);
if ($exportThrottle['blocked']) {
    json_response(['error' => 'Terlalu banyak permintaan ekspor, coba lagi sebentar'], 429);
}

// Ambil class_id bendahara
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
$classId = $user['class_id'];

$type = $_GET['type'] ?? 'transactions'; // 'transactions' atau 'expenses'
$startDate = $_GET['start_date'] ?? '';
$endDate = $_GET['end_date'] ?? '';

// Validasi tipe
if (!in_array($type, ['transactions', 'expenses'], true)) {
    json_response(['error' => 'Tipe laporan tidak valid'], 400);
}

// Validasi tanggal
if ($startDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
    json_response(['error' => 'Format start_date tidak valid (YYYY-MM-DD)'], 400);
}
if ($endDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
    json_response(['error' => 'Format end_date tidak valid (YYYY-MM-DD)'], 400);
}

// Set header untuk download CSV
$fileName = 'laporan_' . $type . '_' . date('Ymd') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');

// Tambah BOM untuk UTF-8 agar Excel membaca karakter Indonesia dengan benar
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

if ($type === 'transactions') {
    // Header CSV untuk transaksi
    fputcsv($output, [
        'Tanggal', 'Siswa', 'NIS', 'Periode', 'Frekuensi', 
        'Jumlah', 'Metode', 'Status', 'Tanggal Verifikasi'
    ]);

    // Query transaksi dengan filter tanggal dan kelas
    $where = "WHERE u.class_id = ?";
    $params = [$classId];

    if ($startDate) {
        $where .= " AND t.payment_date >= ?";
        $params[] = $startDate;
    }
    if ($endDate) {
        $where .= " AND t.payment_date <= ?";
        $params[] = $endDate;
    }
    $where .= " AND t.status = 'berhasil'";

    $stmt = $pdo->prepare("
        SELECT t.payment_date, t.created_at, t.total_amount, t.method, t.status, t.verified_at,
               u.username, s.nis, s.full_name,
               cp.name AS period_name, cp.frequency
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN cash_periods cp ON cp.id = t.period_id
        $where
        ORDER BY t.payment_date DESC, t.created_at DESC
    ");
    $stmt->execute($params);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $periodLabel = $row['period_name'] ?? '-';
        if ($row['frequency']) {
            $periodLabel .= ' (' . $row['frequency'] . ')';
        }
        
        $statusLabel = match($row['status']) {
            'berhasil' => 'Lunas',
            'menunggu' => 'Menunggu Verifikasi',
            'ditolak' => 'Ditolak',
            default => $row['status']
        };

        fputcsv($output, [
            $row['payment_date'] ?? ($row['created_at'] ? date('Y-m-d', strtotime($row['created_at'])) : '-'),
            $row['full_name'] ?? $row['username'] ?? '-',
            $row['nis'] ?? '-',
            $periodLabel,
            $row['frequency'] ?? '-',
            $row['total_amount'],
            strtoupper($row['method'] ?? '-'),
            $statusLabel,
            $row['verified_at'] ?? '-'
        ]);
    }
} else {
    // Header CSV untuk pengeluaran
    fputcsv($output, [
        'Tanggal', 'Nama Pengeluaran', 'Kategori', 'Jumlah', 
        'Deskripsi', 'Dibuat Oleh', 'Ada Nota'
    ]);

    $where = "WHERE e.class_id = ?";
    $params = [$classId];

    if ($startDate) {
        $where .= " AND e.expense_date >= ?";
        $params[] = $startDate;
    }
    if ($endDate) {
        $where .= " AND e.expense_date <= ?";
        $params[] = $endDate;
    }

    $stmt = $pdo->prepare("
        SELECT e.expense_date, e.name, e.category, e.amount, e.description,
               e.receipt_file, u.username AS created_by_name
        FROM expenses e
        JOIN users u ON u.id = e.created_by
        $where
        ORDER BY e.expense_date DESC, e.created_at DESC
    ");
    $stmt->execute($params);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categoryLabel = match($row['category']) {
            'kebersihan' => 'Kebersihan',
            'perlengkapan' => 'Perlengkapan',
            'kegiatan' => 'Kegiatan',
            'dekorasi' => 'Dekorasi',
            'sosial' => 'Sosial',
            default => 'Lainnya'
        };

        fputcsv($output, [
            $row['expense_date'],
            $row['name'],
            $categoryLabel,
            $row['amount'],
            $row['description'] ?? '-',
            $row['created_by_name'] ?? '-',
            $row['receipt_file'] ? 'Ya' : 'Tidak'
        ]);
    }
}

fclose($output);
exit;
?>