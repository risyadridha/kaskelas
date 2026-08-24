<?php
require 'config.php';
require 'helpers.php';
require_login();

$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT class_id FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT frequency, default_amount, payment_deadline_days, bank_name, account_number, account_holder FROM cash_settings WHERE class_id = ?");
    $stmt->execute([$user['class_id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    json_response(['cash_settings' => $settings]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_role('bendahara');
    require_csrf();
    $data = json_decode(file_get_contents('php://input'), true);

    $frequency = $data['frequency'] ?? 'monthly';
    $defaultAmount = (float)($data['default_amount'] ?? 0);
    $deadlineDays = (int)($data['payment_deadline_days'] ?? 0);
    $bankName = $data['bank_name'] ?? null;
    $accountNumber = $data['account_number'] ?? null;
    $accountHolder = $data['account_holder'] ?? null;

    $classId = $user['class_id'];

    $validFrequencies = ['weekly', 'monthly'];
    if (!in_array($frequency, $validFrequencies, true)) {
        json_response(['error' => 'Frekuensi kas tidak valid'], 400);
    }
    if ($defaultAmount < 0 || $deadlineDays < 0) {
        json_response(['error' => 'Nominal atau batas hari tidak valid'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO cash_settings (class_id, frequency, default_amount, payment_deadline_days, bank_name, account_number, account_holder)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                frequency = VALUES(frequency),
                default_amount = VALUES(default_amount),
                payment_deadline_days = VALUES(payment_deadline_days),
                bank_name = VALUES(bank_name),
                account_number = VALUES(account_number),
                account_holder = VALUES(account_holder)
        ");
        $stmt->execute([$classId, $frequency, $defaultAmount, $deadlineDays, $bankName, $accountNumber, $accountHolder]);

        if (function_exists('log_audit')) {
            log_audit($pdo, $userId, 'update_cash_settings', 'cash_settings', $classId, "Mengubah pengaturan kas kelas $classId");
        }

        json_response(['success' => true]);
    } catch (Exception $e) {
        error_log($e->getMessage());
        json_response(['error' => 'Gagal menyimpan pengaturan kas'], 500);
    }
}
?>