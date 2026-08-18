<?php
// api/logout.php
require 'config.php';
require 'helpers.php';
require_csrf();

// Unset semua variabel session
$_SESSION = [];

// Hapus session cookie jika ada
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Hancurkan session server
session_destroy();

// Kirim respons JSON valid
json_response(['success' => true]);
?>
