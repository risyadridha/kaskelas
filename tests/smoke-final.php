<?php
// Smoke audit final: 5 endpoint kunci + alur csrf/login/logout dengan token segar
$base = 'http://127.0.0.1:' . ($argv[1] ?? '8131') . '/api';
$tmp  = 'C:\Users\USER\AppData\Local\Temp\opencode\kaskelas-test';
$curl = 'C:\Windows\System32\curl.exe';
$fail = 0;
function chk($n, $c) { echo ($c ? 'PASS' : 'FAIL') . ": {$n}\n"; if (!$c) $GLOBALS['fail']++; }
function rq($jar, $url, $post = null, $tok = null) {
    $cmd = "C:\Windows\System32\curl.exe -s -b " . escapeshellarg($GLOBALS['tmp'] . '\\' . $jar) . ' -c ' . escapeshellarg($GLOBALS['tmp'] . '\\' . $jar);
    if ($tok) $cmd .= " -H \"X-CSRF-Token: $tok\"";
    if ($post !== null) { $f = tempnam(sys_get_temp_dir(), 'sm'); file_put_contents($f, $post); $cmd .= " -H \"Content-Type: application/json\" --data @" . escapeshellarg($f) . ' -X POST'; }
    return shell_exec("$cmd $url");
}
function code($jar, $url, $post = null, $tok = null) {
    $cmd = "C:\Windows\System32\curl.exe -s -o NUL -w \"%{http_code}\" -b " . escapeshellarg($GLOBALS['tmp'] . '\\' . $jar) . ' -c ' . escapeshellarg($GLOBALS['tmp'] . '\\' . $jar);
    if ($tok) $cmd .= " -H \"X-CSRF-Token: $tok\"";
    if ($post !== null) { $f = tempnam(sys_get_temp_dir(), 'sm'); file_put_contents($f, $post); $cmd .= " -H \"Content-Type: application/json\" --data @" . escapeshellarg($f) . ' -X POST'; }
    return trim(shell_exec("$cmd $url"));
}

$j = 'final.jar'; @unlink($GLOBALS['tmp'] . "\\$j");
$t = json_decode(rq($j, "$base/csrf.php"))->csrf_token;
chk('csrf', (bool)$t);

$r = json_decode(rq($j, "$base/login.php", '{"username":"bendahara","password":"bendahara123"}', $t));
chk('login bendahara', $r->success === true);

foreach ([
    'transparansi.php?year=2026' => 'total_income',
    'announcements.php?limit=100' => 'announcements',
    'activities.php?limit=100' => 'activities',
    'transactions.php?limit=100' => 'transactions',
    'students.php' => 'students',
] as $ep => $key) {
    $d = json_decode(rq($j, "$base/$ep"));
    chk("GET {$ep}", isset($d->{$key}));
}

// logout lalu login pakai token BARU (perilaku pasca-fix F1)
$l = json_decode(rq($j, "$base/logout.php", '{}', $t));
chk('logout', $l->success === true);
$t2 = json_decode(rq($j, "$base/csrf.php"))->csrf_token;
$r2 = json_decode(rq($j, "$base/login.php", '{"username":"risyad","password":"password123"}', $t2));
chk('login ulang pasca-logout (token segar)', $r2->success === true);

echo $fail === 0 ? "\nSMOKE FINAL PASS\n" : "\n{$fail} GAGAL\n";
exit($fail === 0 ? 0 : 1);

