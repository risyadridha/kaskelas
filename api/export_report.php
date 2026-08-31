<?php
// api/export_report.php
require 'config.php';
require 'helpers.php';

require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

// Fetch class_id from user
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    json_response(['error' => 'User tidak ditemukan'], 404);
}
$classId = (int)$user['class_id'];

$type = $_GET['type'] ?? 'transactions';
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

if (!in_array($type, ['transactions', 'expenses'], true)) {
    json_response(['error' => 'Tipe laporan tidak valid'], 400);
}

if ($startDate && !valid_date($startDate)) {
    json_response(['error' => 'Tanggal mulai tidak valid'], 400);
}

if ($endDate && !valid_date($endDate)) {
    json_response(['error' => 'Tanggal akhir tidak valid'], 400);
}

$dateParams = [$classId];
$dateCond = "";

if ($type === 'transactions') {
    if ($startDate) {
        $dateCond .= " AND DATE(COALESCE(t.payment_date, t.created_at)) >= ?";
        $dateParams[] = $startDate;
    }
    if ($endDate) {
        $dateCond .= " AND DATE(COALESCE(t.payment_date, t.created_at)) <= ?";
        $dateParams[] = $endDate;
    }

    $stmt = $pdo->prepare("
        SELECT t.id,
               t.transaction_code,
               COALESCE(s.full_name, u.username) AS student_name,
               s.nis,
               t.total_amount,
               t.method,
               t.status,
               COALESCE(t.payment_date, t.created_at) AS date_record,
               GROUP_CONCAT(DISTINCT cp.name ORDER BY cp.id SEPARATOR '; ') AS period_names
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
        LEFT JOIN cash_periods cp ON cp.id = ti.period_id
        WHERE u.class_id = ? AND t.status = 'berhasil'" . $dateCond . "
        GROUP BY t.id, t.transaction_code, student_name, s.nis, t.total_amount, t.method, t.status, date_record
        ORDER BY date_record DESC
    ");
    $stmt->execute($dateParams);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $filename = 'laporan_transaksi_kas_' . date('Ymd_His') . '.csv';

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'w');
    // Write UTF-8 BOM for Excel compatibility
    fprintf($output, "\xEF\xBB\xBF");

    fputcsv($output, ['ID Transaksi', 'Kode Transaksi', 'NIS', 'Nama Siswa', 'Periode', 'Nominal', 'Metode', 'Status', 'Tanggal Pembayaran']);

    foreach ($rows as $r) {
        fputcsv($output, [
            $r['id'],
            $r['transaction_code'],
            $r['nis'] ?: '-',
            $r['student_name'],
            $r['period_names'] ?: '-',
            $r['total_amount'],
            strtoupper($r['method']),
            $r['status'],
            $r['date_record']
        ]);
    }
    fclose($output);
    exit;
} else {
    if ($startDate) {
        $dateCond .= " AND e.expense_date >= ?";
        $dateParams[] = $startDate;
    }
    if ($endDate) {
        $dateCond .= " AND e.expense_date <= ?";
        $dateParams[] = $endDate;
    }

    $stmt = $pdo->prepare("
        SELECT e.id, e.name, e.category, e.amount, e.description, e.expense_date, u.username AS created_by_name
        FROM expenses e
        JOIN users u ON u.id = e.created_by
        WHERE e.class_id = ?" . $dateCond . "
        ORDER BY e.expense_date DESC
    ");
    $stmt->execute($dateParams);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $filename = 'laporan_pengeluaran_kas_' . date('Ymd_His') . '.csv';

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'w');
    // Write UTF-8 BOM
    fprintf($output, "\xEF\xBB\xBF");

    fputcsv($output, ['ID Pengeluaran', 'Nama Pengeluaran', 'Kategori', 'Nominal', 'Deskripsi', 'Tanggal', 'Dibuat Oleh']);

    foreach ($rows as $r) {
        fputcsv($output, [
            $r['id'],
            $r['name'],
            $r['category'],
            $r['amount'],
            $r['description'] ?: '-',
            $r['expense_date'],
            $r['created_by_name']
        ]);
    }
    fclose($output);
    exit;
}
?>
