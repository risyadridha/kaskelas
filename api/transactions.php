<?php
// api/transactions.php
require 'config.php';
require 'helpers.php';
require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

if ($role === 'bendahara') {
    $stmt = $pdo->prepare("
        SELECT t.id,
               t.transaction_code,
               t.user_id,
               t.total_amount AS amount,
               t.status,
               t.method,
               t.created_at,
               COALESCE(s.full_name, u.username) AS student_name,
               (SELECT GROUP_CONCAT(cp.name SEPARATOR ', ') 
                FROM transaction_items ti 
                JOIN cash_periods cp ON cp.id = ti.period_id 
                WHERE ti.transaction_id = t.id) AS period_label,
               (SELECT GROUP_CONCAT(ti.period_id) 
                FROM transaction_items ti 
                WHERE ti.transaction_id = t.id) AS period_ids,
               (SELECT pp.id
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_id,
               (SELECT pp.file_name
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_file,
               (SELECT pp.file_type
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_type,
               (SELECT pp.file_size
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_size
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        WHERE u.class_id = (SELECT class_id FROM users WHERE id = ?)
        ORDER BY t.created_at DESC
    ");
    $stmt->execute([$userId]);
} else {
    $stmt = $pdo->prepare("
        SELECT t.id,
               t.transaction_code,
               t.user_id,
               t.total_amount AS amount,
               t.status,
               t.method,
               t.created_at,
               COALESCE(s.full_name, u.username) AS student_name,
               (SELECT GROUP_CONCAT(cp.name SEPARATOR ', ') 
                FROM transaction_items ti 
                JOIN cash_periods cp ON cp.id = ti.period_id 
                WHERE ti.transaction_id = t.id) AS period_label,
               (SELECT GROUP_CONCAT(ti.period_id) 
                FROM transaction_items ti 
                WHERE ti.transaction_id = t.id) AS period_ids,
               (SELECT pp.id
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_id,
               (SELECT pp.file_name
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_file,
               (SELECT pp.file_type
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_type,
               (SELECT pp.file_size
                FROM payment_proofs pp
                WHERE pp.transaction_id = t.id
                ORDER BY pp.id DESC
                LIMIT 1) AS proof_size
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    ");
    $stmt->execute([$userId]);
}

$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Proses hasil
foreach ($transactions as &$t) {
    // period_ids menjadi array
    if (!empty($t['period_ids'])) {
        $t['period_ids'] = array_map('intval', explode(',', $t['period_ids']));
    } else {
        $t['period_ids'] = [];
    }

    // Bentuk objek proof jika ada
    if (!empty($t['proof_file'])) {
        $t['proof'] = [
            'id' => (int)$t['proof_id'],
            'file_name' => $t['proof_file'],
            'file_type' => $t['proof_type'],
            'file_size' => (int)$t['proof_size'],
            'url' => 'api/proof.php?id=' . (int)$t['proof_id']
        ];
    } else {
        $t['proof'] = null;
    }

    // Hapus kolom sementara
    unset(
        $t['proof_id'],
        $t['proof_file'],
        $t['proof_type'],
        $t['proof_size']
    );
}
unset($t);

json_response(['transactions' => $transactions]);
?>
