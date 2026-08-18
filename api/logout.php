<?php
// api/logout.php
require 'config.php';
require 'helpers.php';
require_csrf();

// Hancurkan session server
session_destroy();

// Kirim respons JSON valid
json_response(['success' => true]);
?>
