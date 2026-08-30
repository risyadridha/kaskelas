<?php
// api/export_report.php
require 'config.php';
require 'helpers.php';

require_login();
require_role('bendahara');

$userId = $_SESSION['user_id'];

// Get current bendahara class_id
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    header('HTTP/1.1 404 Not Found');
    echo "User tidak ditemukan";
    exit;
}
$classId = $user['class_id'];

$type = $_GET['type'] ?? 'transactions'; // 'transactions' or 'expenses' or 'summary'
$year = isset($_GET['year']) ? (int)$_GET['year'] : null;

// Set headers for CSV download
$filename = "laporan_kas_kelas_" . $type . "_" . date('Ymd_His') . ".csv";
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$output = fopen('php://output', 'w');
// Output UTF-8 BOM for Excel compatibility
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

if ($type === 'expenses') {
    fputcsv($output, ['ID', 'Nama Pengeluaran', 'Kategori', 'Nominal (Rp)', 'Tanggal', 'Keterangan', 'Dibuat Oleh']);

    $query = "
        SELECT e.id, e.name, e.category, e.amount, e.expense_date, e.description, u.username
        FROM expenses e
        JOIN users u ON u.id = e.created_by
        WHERE e.class_id = ?
    ";
    $params = [$classId];
    if ($year) {
        $query .= " AND YEAR(e.expense_date) = ?";
        $params[] = $year;
    }
    $query .= " ORDER BY e.expense_date DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $row['id'],
            $row['name'],
            $row['category'],
            number_format($row['amount'], 2, '.', ''),
            $row['expense_date'],
            $row['description'],
            $row['username']
        ]);
    }
} else {
    // Default: transactions
    fputcsv($output, ['Kode Transaksi', 'Siswa / Anggota', 'Total Nominal (Rp)', 'Status', 'Metode', 'Tanggal Pembayaran', 'Tanggal Diverifikasi']);

    $query = "
        SELECT t.transaction_code, s.full_name, t.total_amount, t.status, t.payment_method, t.payment_date, t.verified_at
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        WHERE u.class_id = ?
    ";
    $params = [$classId];
    if ($year) {
        $query .= " AND YEAR(t.created_at) = ?";
        $params[] = $year;
    }
    $query .= " ORDER BY t.created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $row['transaction_code'],
            $row['full_name'] ?? 'N/A',
            number_format($row['total_amount'], 2, '.', ''),
            $row['status'],
            $row['payment_method'],
            $row['payment_date'],
            $row['verified_at']
        ]);
    }
}

fclose($output);
exit;
?>
