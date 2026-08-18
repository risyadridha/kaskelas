<?php
require 'config.php';
require 'helpers.php';

json_response(['csrf_token' => csrf_token()]);
?>
