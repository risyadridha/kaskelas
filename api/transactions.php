<?php
// api/transactions.php
require 'config.php';
require 'helpers.php';
require_login();

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;
$offset = ($page - 1) * $limit;

if ($role === 'bendahara') {
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE u.class_id = (SELECT class_id FROM users WHERE id = ?)
    ");
    $countStmt->execute([$userId]);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT t.id,
               t.transaction_code,
               t.user_id,
               t.total_amount,
               t.total_amount AS amount,
               t.status,
               t.method,
               t.rejection_reason,
               t.payment_date,
               t.verified_at,
               t.created_at,
               COALESCE(s.full_name, u.username) AS student_name,
               GROUP_CONCAT(DISTINCT cp.name ORDER BY cp.id SEPARATOR ', ') AS period_label,
               GROUP_CONCAT(DISTINCT ti.period_id ORDER BY ti.period_id SEPARATOR ',') AS period_ids,
               pp.id AS proof_id,
               pp.file_name AS proof_file,
               pp.file_type AS proof_type,
               pp.file_size AS proof_size
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
        LEFT JOIN cash_periods cp ON cp.id = ti.period_id
        LEFT JOIN (
            SELECT pp1.*
            FROM payment_proofs pp1
            JOIN (
                SELECT transaction_id, MAX(id) AS max_id
                FROM payment_proofs
                GROUP BY transaction_id
            ) pp2 ON pp1.id = pp2.max_id
        ) pp ON pp.transaction_id = t.id
        WHERE u.class_id = (SELECT class_id FROM users WHERE id = ?)
        GROUP BY t.id, t.transaction_code, t.user_id, t.total_amount, t.status, t.method, t.rejection_reason, t.payment_date, t.verified_at, t.created_at, student_name, pp.id, pp.file_name, pp.file_type, pp.file_size
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();
} else {
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT t.id,
               t.transaction_code,
               t.user_id,
               t.total_amount,
               t.total_amount AS amount,
               t.status,
               t.method,
               t.rejection_reason,
               t.payment_date,
               t.verified_at,
               t.created_at,
               COALESCE(s.full_name, u.username) AS student_name,
               GROUP_CONCAT(DISTINCT cp.name ORDER BY cp.id SEPARATOR ', ') AS period_label,
               GROUP_CONCAT(DISTINCT ti.period_id ORDER BY ti.period_id SEPARATOR ',') AS period_ids,
               pp.id AS proof_id,
               pp.file_name AS proof_file,
               pp.file_type AS proof_type,
               pp.file_size AS proof_size
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
        LEFT JOIN cash_periods cp ON cp.id = ti.period_id
        LEFT JOIN (
            SELECT pp1.*
            FROM payment_proofs pp1
            JOIN (
                SELECT transaction_id, MAX(id) AS max_id
                FROM payment_proofs
                GROUP BY transaction_id
            ) pp2 ON pp1.id = pp2.max_id
        ) pp ON pp.transaction_id = t.id
        WHERE t.user_id = ?
        GROUP BY t.id, t.transaction_code, t.user_id, t.total_amount, t.status, t.method, t.rejection_reason, t.payment_date, t.verified_at, t.created_at, student_name, pp.id, pp.file_name, pp.file_type, pp.file_size
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bindValue(1, $userId, PDO::PARAM_INT);
    $stmt->bindValue(2, $limit, PDO::PARAM_INT);
    $stmt->bindValue(3, $offset, PDO::PARAM_INT);
    $stmt->execute();
}

$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Proses hasil
foreach ($transactions as &$t) {
    $t['id'] = (int)$t['id'];
    $t['user_id'] = (int)$t['user_id'];
    $t['total_amount'] = (float)$t['total_amount'];
    $t['amount'] = (float)$t['amount'];

    if (!empty($t['period_ids'])) {
        $t['period_ids'] = array_map('intval', explode(',', $t['period_ids']));
    } else {
        $t['period_ids'] = [];
    }

    if (!empty($t['proof_file'])) {
        $t['proof'] = [
            'id' => (int)$t['proof_id'],
            'filename' => $t['proof_file'],
            'file_name' => $t['proof_file'],
            'file_type' => $t['proof_type'],
            'file_size' => (int)$t['proof_size'],
            'url' => 'api/proof.php?id=' . (int)$t['proof_id']
        ];
    } else {
        $t['proof'] = null;
    }

    unset(
        $t['proof_id'],
        $t['proof_file'],
        $t['proof_type'],
        $t['proof_size']
    );
}
unset($t);

json_response([
    'transactions' => $transactions,
    'pagination' => [
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]
]);
?>
