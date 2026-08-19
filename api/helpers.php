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
?>
