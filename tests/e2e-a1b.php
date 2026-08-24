<?php
// E2E A1 (transport shell-curl terbukti): lifecycle status akun siswa
$base = 'http://127.0.0.1:' . ($argv[1] ?? '8155') . '/api';
$tmp  = 'C:\Users\USER\AppData\Local\Temp\opencode\kaskelas-test';
$curl = 'C:\Windows\System32\curl.exe';
$fail = 0;
function A($n,$c,$e='') { echo ($c ? 'PASS' : 'FAIL') . ": {$n}" . ($c ? '' : " :: {$e}") . "\n"; if (!$c) $GLOBALS['fail']++; }
$j = "$tmp\\a1b.jar"; @unlink($j);
function rq($method,$url,$body=null,$tok=null) {
    global $curl,$j;
    $a = ['-s','-b',$j,'-c',$j];
    if ($tok) { $a[]='-H'; $a[]="X-CSRF-Token: $tok"; }
    if ($body !== null) {
        $f = tempnam(sys_get_temp_dir(),'a1');
        file_put_contents($f, json_encode($body));
        $a[]='-H'; $a[]='Content-Type: application/json';
        $a[]='--data'; $a[]="@$f";
        $a[]='-X'; $a[]=$method;
    }
    $a[] = $url;
    return shell_exec($curl . ' ' . implode(' ', array_map('escapeshellarg', $a)));
}

$t = json_decode(rq('GET',"$base/csrf.php"))->csrf_token;
A('csrf', (bool)$t);

// bersihkan fixture lama
$pdo = new PDO('mysql:host=127.0.0.1;dbname=kaskelas','root','');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec("DELETE FROM users WHERE username LIKE 'a1_siswa%'");
$pdo->exec("DELETE FROM students WHERE nis LIKE 'A1NIS%'");

$r = json_decode(rq('POST',"$base/login.php",['username'=>'bendahara','password'=>'bendahara123'],$t));
A('login bendahara', ($r->success ?? false) === true);

// tambah siswa
$r = json_decode(rq('POST',"$base/students.php",['full_name'=>'A1 Uji','nis'=>'A1NIS9','username'=>'a1_siswa_9'],$t));
$uid = (int)($r->user_id ?? 0);
A('create siswa', ($r->success ?? false) === true && $uid > 0, json_encode($r));

// user_status = active saat baru dibuat
$st = json_decode(rq('GET',"$base/students.php"))->students;
$row = null; foreach (($st ?: []) as $s) { if ((int)$s->id === $uid) $row = $s; }
A('user_status awal = active', $row && ($row->user_status ?? null) === 'active', json_encode($row ? ['user_status'=>$row->user_status,'status_pembayaran'=>$row->status] : null));

// nonaktifkan
$r = json_decode(rq('DELETE',"$base/students.php",['user_id'=>$uid],$t));
A('deactivate', ($r->success ?? false) === true);

// setelah deactivate: user_status harus 'inactive' -> inilah yang dibaca form edit pasca-fix
$st = json_decode(rq('GET',"$base/students.php"))->students;
$row = null; foreach (($st ?: []) as $s) { if ((int)$s->id === $uid) $row = $s; }
A('setelah deactivate user_status = inactive', $row && ($row->user_status ?? null) === 'inactive', json_encode($row ? ['user_status'=>$row->user_status,'status_pembayaran'=>$row->status] : null));
A('field status pembayaran tetap terpisah', $row && in_array($row->status, ['lunas','menunggu','belum'], true));

// login dengan akun nonaktif harus ditolak
$t2 = json_decode(rq('GET',"$base/csrf.php"))->csrf_token;
$r = json_decode(rq('POST',"$base/login.php",['username'=>'a1_siswa_9','password'=>'siswa123'],$t2));
A('login akun nonaktif DENY', isset($r->error), json_encode($r));

// cleanup
$pdo->prepare("DELETE FROM users WHERE id=?")->execute([$uid]);
$pdo->prepare("DELETE FROM students WHERE user_id=?")->execute([$uid]);

echo $fail === 0 ? "\nSEMUA E2E A1 PASS\n" : "\n{$fail} GAGAL\n";
exit($fail === 0 ? 0 : 1);
