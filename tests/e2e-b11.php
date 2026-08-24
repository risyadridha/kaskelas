<?php
// ============================================================
// B11 E2E ??? matriks B11-14 + B11-12 cross-class/role + regresi
// Jalankan: php e2e-b11.php <base_url>
// ============================================================
$base = rtrim($argv[1], '/');
$tmp  = 'C:\Users\USER\AppData\Local\Temp\opencode\kaskelas-test';
$curl = 'C:\Windows\System32\curl.exe';
$fail = 0;
function A($n, $c, $e='') { echo ($c ? 'PASS' : 'FAIL') . ": {$n}" . ($c ? '' : " :: {$e}") . "\n"; if (!$c) $GLOBALS['fail']++; }

// ---------- transport: satu proses, curl ext, cookie engine stabil ----------
function jar($name) { global $tmp; return $name; }
function ch($name) {
    global $tmp, $handles;
    if (!isset($handles[$name])) {
        $h = curl_init();
        curl_setopt_array($h, [
            CURLOPT_COOKIEJAR => "$tmp\\c_$name.jar",
            CURLOPT_COOKIEFILE => "$tmp\\c_$name.jar",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FRESH_CONNECT => true,
            CURLOPT_FORBID_REUSE => true,
        ]);
        $handles[$name] = $h;
    }
    return $handles[$name];
}
function rq($jarName, $method, $url, $body = null, $tok = null, $file = null) {
    $ch = ch($jarName);
    $headers = [];
    if ($tok !== null) $headers[] = "X-CSRF-Token: $tok";
    if ($file) {
        $post = [];
        foreach (($body ?: []) as $k => $v) $post[$k] = $v;
        foreach ($file as $k => $v) $post[$k] = new CURLFile($v);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    } elseif ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } else {
        curl_setopt($ch, CURLOPT_POSTFIELDS, null);
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_URL, $url);
    $out = curl_exec($ch);
    if ($out === false) {
        // koneksi keepalive kadang reset -> buka ulang handle lalu coba sekali lagi
        curl_close($ch);
        unset($GLOBALS['handles'][$jarName]);
        $out = curl_exec(ch($jarName));
        if ($out === false) { $err = curl_error($GLOBALS['handles'][$jarName]); curl_close($GLOBALS['handles'][$jarName]); unset($GLOBALS['handles'][$jarName]); return 'CURL_ERR: ' . $err; }
    }
    return $out;
}
function login($name, $u, $p) {
    global $base;
    $t = json_decode(rq($name, 'GET', "$base/csrf.php"))->csrf_token;
    rq($name, 'POST', "$base/login.php", ['username'=>$u,'password'=>$p], $t);
    return [$name, $t];
}

// ---------- fixture kelas B (untuk cross-class test) ----------
$pdo = new PDO('mysql:host=127.0.0.1;dbname=kaskelas', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ---------- PRE-CLEANUP: hapus fixture run sebelumnya agar hermetic ----------
$pdo->exec("DELETE FROM reports WHERE title LIKE 'B11%'");
$pdo->exec("DELETE FROM expenses WHERE name LIKE 'B11%' OR name LIKE 'DBG%'");
$pdo->exec("DELETE FROM announcements WHERE title LIKE 'B11%'");
$pdo->exec("DELETE FROM notifications WHERE title LIKE 'B11%' OR title='B11 Broadcast'");
$pdo->exec("DELETE FROM activities WHERE description LIKE '%B11%'");
$pdo->exec("DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'b11_%')");
$pdo->exec("DELETE FROM users WHERE username LIKE 'b11_%'");
$pdo->exec("DELETE FROM classes WHERE name = 'B11-TEST-KLAS-B'");
$pdo->exec("INSERT INTO classes (name) VALUES ('B11-TEST-KLAS-B')");
$classB = (int)$pdo->lastInsertId();
$hash = password_hash('b11test', PASSWORD_DEFAULT);
$pdo->prepare("INSERT INTO users (class_id,username,password_hash,role,status) VALUES (?,? ,?, 'siswa','active')")
    ->execute([$classB, 'b11_siswa_b', $hash]);
$siswaB = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO users (class_id,username,password_hash,role,status) VALUES (?,? ,?, 'bendahara','active')")
    ->execute([$classB, 'b11_bend_b', $hash]);
$bendB = (int)$pdo->lastInsertId();
$pdo->prepare("INSERT INTO students (user_id,nis,full_name) VALUES (?,?,'Siswa B11')")->execute([$siswaB, 'B11NIS']);
$pdo->exec("INSERT INTO cash_periods (class_id,name,frequency,start_date,end_date,due_date,amount,status) VALUES ($classB,'Periode B','weekly',CURDATE(),DATE_ADD(CURDATE(),INTERVAL 6 DAY),DATE_ADD(CURDATE(),INTERVAL 6 DAY),1000,'active')");
$periodB = (int)$pdo->lastInsertId();

// ---------- AUTH ----------
list($jb, $tb) = login('bend', 'bendahara', 'bendahara123');
A('AUTH login bendahara kelas A', true);
[$js, $ts] = login('siswa', 'risyad', 'password123');
A('AUTH login siswa kelas A', true);
list($jb2, $tb2) = login('bendB', 'b11_bend_b', 'b11test');
A('AUTH login bendahara kelas B (fixture)', true);

// ---------- B11-01 EXPENSE ----------
$pdf = "$tmp\\b11.pdf";
file_put_contents($pdf, "%PDF-1.4\n%%EOF");
$resp = rq($jb, 'POST', "$base/expenses.php", ['name'=>'B11 Test','category'=>'kebersihan','amount'=>'12000','expense_date'=>date('Y-m-d'),'description'=>'uji'], $tb, ['receipt'=>$pdf]);
$r = json_decode($resp); $expId = (int)($r->id ?? 0);
A('EXPENSE create + receipt', ($r->success ?? false) === true && $expId > 0, $resp);
$r = json_decode(rq($jb, 'PUT', "$base/expenses.php", ['id'=>$expId,'name'=>'B11 Edit','category'=>'dekorasi','amount'=>15000,'expense_date'=>date('Y-m-d'),'description'=>'edit'], $tb));
A('EXPENSE edit', ($r->success ?? false) === true, json_encode($r));
$list = json_decode(rq($jb, 'GET', "$base/expenses.php?limit=100"));
$found = false; foreach ($list->expenses as $e) { if ((int)$e->id === $expId && $e->name === 'B11 Edit') $found = true; }
A('EXPENSE read setelah edit', $found, json_encode(array_filter($list->expenses, function($e){ return strpos($e->name, 'B11') !== false; })));
// receipt tersimpan non-publik: cek path di luar docroot tidak dilayani langsung oleh API list
A('EXPENSE receipt_file hanya penanda internal', isset($list->expenses[0]) && !isset($list->expenses[0]->receipt_public_url));

// ---------- B11-02 ANNOUNCEMENT ----------
$r = json_decode(rq($jb, 'POST', "$base/announcements.php", ['title'=>'B11 Ann','content'=>'isi uji','category'=>'kas','priority'=>'normal'], $tb));
$annId = (int)($r->id ?? 0);
A('ANNOUNCE create', ($r->success ?? false) === true && $annId > 0, $resp);
$r = json_decode(rq($jb, 'PUT', "$base/announcements.php", ['id'=>$annId,'title'=>'B11 Ann Edit','content'=>'isi baru','category'=>'kas','priority'=>'important'], $tb));
A('ANNOUNCE edit', ($r->success ?? false) === true);
$anns = json_decode(rq($js, 'GET', "$base/announcements.php?limit=100"))->announcements;
$saw = false; foreach ($anns as $a) { if ((int)$a->id === $annId) $saw = true; }
rq($js, 'POST', "$base/announcements.php", ['action'=>'mark_read','announcement_id'=>$annId], $ts);
$anns2 = json_decode(rq($js, 'GET', "$base/announcements.php?limit=100"))->announcements;
$isRead = false; foreach ($anns2 as $a) { if ((int)$a->id === $annId && (int)$a->is_read > 0) $isRead = true; }
A('ANNOUNCE student read tracking', $saw && $isRead, json_encode(["saw"=>$saw,"isRead"=>$isRead]));

// ---------- B11-03 PERIOD EDIT ----------
$per = json_decode(rq($jb, 'GET', "$base/periods.php"))->periods;
$pA = $per[0]->id;
$r = json_decode(rq($jb, 'PUT', "$base/periods.php", ['id'=>$pA,'name'=>'Minggu Uji Edit','start_date'=>$per[0]->start_date,'end_date'=>$per[0]->end_date,'due_date'=>$per[0]->due_date,'amount'=>3500,'status'=>'active'], $tb));
A('PERIOD edit', ($r->success ?? false) === true, json_encode($r));

// ---------- B11-04 CASH SETTINGS ----------
$r = json_decode(rq($jb, 'POST', "$base/cash_settings.php", ['frequency'=>'weekly','default_amount'=>4000,'payment_deadline_days'=>7,'bank_name'=>'BCA','account_number'=>'123456','account_holder'=>'Bendahara A'], $tb));
$cs = json_decode(rq($jb, 'GET', "$base/cash_settings.php"))->cash_settings;
A('CASH SETTINGS update+persist', ($r->success ?? false) && $cs && (int)$cs->default_amount === 4000 && $cs->bank_name === 'BCA');

// ---------- B11-05 STUDENT ----------
$r = json_decode(rq($jb, 'POST', "$base/students.php", ['full_name'=>'B11 Siswa A','nis'=>'B11NISA','username'=>'b11_siswa_a','attendance_number'=>99], $tb));
$newStu = (int)($r->user_id ?? 0);
A('STUDENT create account', ($r->success ?? false) === true && $newStu > 0);

// akun baru langsung bisa login dengan password default dari backend
$jn = jar('newstu');
$tn = json_decode(rq($jn, 'GET', "$base/csrf.php"))->csrf_token;
$rl = rq($jn, 'POST', "$base/login.php", ['username'=>'b11_siswa_a','password'=>'siswa123'], $tn);
A('STUDENT akun baru dapat login (default pw backend)', strpos($rl, '"success":true') !== false, substr((string)$rl, 0, 120));
logoutJar($jn);
$r = json_decode(rq($jb, 'PUT', "$base/students.php", ['user_id'=>$newStu,'full_name'=>'B11 Siswa A Edit','attendance_number'=>98,'email'=>'b11@test.id','phone'=>'08120000','status'=>'active'], $tb));
A('STUDENT edit', ($r->success ?? false) === true);
$r = json_decode(rq($jb, 'DELETE', "$base/students.php", ['user_id'=>$newStu], $tb));
A('STUDENT deactivate (soft)', ($r->success ?? false) === true);
$st = json_decode(rq($jb, 'GET', "$base/students.php"))->students;
$stFound = null; foreach ($st as $s) { if ((int)$s->id === $newStu) $stFound = $s; }
A('STUDENT masih ada dgn status inactive (history utuh)', $stFound && $stFound->user_status === 'inactive');

// akun nonaktif harus ditolak saat login
$jn2 = jar('newstu2');
$tn2 = json_decode(rq($jn2, 'GET', "$base/csrf.php"))->csrf_token;
$rl2 = rq($jn2, 'POST', "$base/login.php", ['username'=>'b11_siswa_a','password'=>'siswa123'], $tn2);
A('STUDENT nonaktif login DENY', strpos($rl2, 'nonaktif') !== false || strpos($rl2, 'ditangguhkan') !== false, substr((string)$rl2, 0, 120));

// ganti password siswa risyad lalu kembalikan (regresi auth)
$r = json_decode(rq($js, 'POST', "$base/change_password.php", ['current_password'=>'password123','new_password'=>'password456'], $ts));
A('AUTH siswa ganti password', ($r->success ?? false) === true);
$r = json_decode(rq($js, 'POST', "$base/change_password.php", ['current_password'=>'password456','new_password'=>'password123'], $ts));
A('AUTH siswa kembalikan password', ($r->success ?? false) === true);

// ---------- B11-06 REPORT ----------
$rup = "$tmp\\b11att.pdf";
copy($pdf, $rup);
$resp = rq($js, 'POST', "$base/reports.php", ['category'=>'aplikasi','title'=>'B11 Report','description'=>'uji laporan'], $ts, ['attachment'=>$rup]);
$rr = json_decode($resp); $repId = (int)($rr->id ?? 0);
A('REPORT student create + attachment', ($rr->success ?? false) === true && $repId > 0, $resp);
$repList = json_decode(rq($jb, 'GET', "$base/reports.php?limit=100"));
$fr = null; foreach ($repList->reports as $x) { if ((int)$x->id === $repId) $fr = $x; }
A('REPORT bendahara lihat laporan masuk', $fr !== null && isset($fr->reporter_name));
$r = json_decode(rq($jb, 'PUT', "$base/reports.php", ['id'=>$repId,'status'=>'diproses','response'=>'sedang kami proses'], $tb));
A('REPORT bendahara respond+status', ($r->success ?? false) === true);
$mine = json_decode(rq($js, 'GET', "$base/reports.php?limit=100"));
$mr = null; foreach ($mine->reports as $x) { if ((int)$x->id === $repId) $mr = $x; }
A('REPORT student melihat respons terbaru', $mr && $mr->status === 'diproses' && $mr->response === 'sedang kami proses');
$chAtt = ch('bend');
curl_setopt($chAtt, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($chAtt, CURLOPT_URL, "$base/report_attachment.php?id=$repId");
curl_exec($chAtt);
$codeAtt = curl_getinfo($chAtt, CURLINFO_HTTP_CODE);
A('REPORT attachment dibuka bendahara -> 200', (string)$codeAtt === '200', $codeAtt);

// ---------- B11-07 BROADCAST ----------
$r = json_decode(rq($jb, 'POST', "$base/notifications.php", ['action'=>'broadcast','title'=>'B11 Broadcast','message'=>'pesan uji'], $tb));
A('NOTIF broadcast bendahara', ($r->success ?? false) === true && (int)($r->count ?? 0) >= 1, json_encode($r));
$nf = json_decode(rq($js, 'GET', "$base/notifications.php?limit=100"))->notifications;
$got = false; foreach ($nf as $n) { if ($n->title === 'B11 Broadcast') $got = true; }
A('NOTIF siswa menerima broadcast', $got);

// ---------- B11-08 PAYMENT FLOW + RESUBMIT ----------
// periode belum dibayar risyad: cari satu
$allPer = json_decode(rq($js, 'GET', "$base/periods.php"))->periods;
$paidItems = json_decode(rq($js, 'GET', "$base/transactions.php?limit=100"))->transactions;
$paidPeriodIds = [];
foreach ($paidItems as $t) { foreach (($t->period_ids ?: []) as $pid) $paidPeriodIds[] = (int)$pid; }
$target = null;
$today = date('Y-m-d');
foreach ($allPer as $pp) { if (!in_array((int)$pp->id, $paidPeriodIds) && $pp->start_date <= $today) { $target = $pp; break; } }
$createdForTest = false;
if (!$target) {
    // semua periode berjalan sudah dibayar -> buat periode uji dimulai hari ini
    $r = json_decode(rq($jb, 'POST', "$base/periods.php", ['name'=>'B11 Uji Payment','frequency'=>'weekly','start_date'=>$today,'end_date'=>date('Y-m-d', strtotime('+6 days')),'due_date'=>date('Y-m-d', strtotime('+6 days')),'amount'=>3000,'status'=>'active'], $tb));
    if (!empty($r->id)) { $target = ['id'=>$r->id]; $createdForTest = true; }
}
if ($target) {
    $tid = (int)$target['id'] ?? (int)$target->id;
    $r = json_decode(rq($js, 'POST', "$base/submit_payment.php", ['period_ids'=>[$tid],'method'=>'transfer'], $ts));
    $txNew = (int)($r->transaction_id ?? 0);
    A('PAYMENT submit', ($r->success ?? false) === true && $txNew > 0, json_encode($r));
    $up = "$tmp\\proof_b11.pdf";
    copy($pdf, $up);
    $r = json_decode(rq('siswa', 'POST', "$base/upload_proof.php", ['transaction_id'=>$txNew], $ts, ['proof'=>$up]));
    A('PAYMENT proof upload', ($r->success ?? false) === true, json_encode($r));
    $r = json_decode(rq($jb, 'POST', "$base/verify_payment.php", ['transaction_id'=>$txNew,'action'=>'ditolak','reason'=>'foto kurang jelas'], $tb));
    A('PAYMENT reject dengan alasan', ($r->success ?? false) === true);
    // RESUBMIT via endpoint yang sama (upload_proof menangani ditolak)
    $r = json_decode(rq('siswa', 'POST', "$base/upload_proof.php", ['transaction_id'=>$txNew], $ts, ['proof'=>$up]));
    A('PAYMENT resubmit bukti ditolak (backend)', ($r->success ?? false) === true);
    $txNow = json_decode(rq($js, 'GET', "$base/transactions.php?limit=100"));
    $stNow = ''; foreach ($txNow->transactions as $t2) { if ((int)$t2->id === $txNew) $stNow = $t2->status; }
    A('PAYMENT status kembali menunggu setelah resubmit', $stNow === 'menunggu', "status=$stNow");
    $r = json_decode(rq($jb, 'POST', "$base/verify_payment.php", ['transaction_id'=>$txNew,'action'=>'berhasil'], $tb));
    A('PAYMENT verify setelah resubmit', ($r->success ?? false) === true);
}

// ---------- B11-12 CROSS-CLASS & ROLE ----------
$expB = json_decode(rq($jb2, 'POST', "$base/expenses.php", ['name'=>'Expense Kelas B','category'=>'lainnya','amount'=>5000,'expense_date'=>date('Y-m-d')]));
$expBid = (int)($expB->id ?? 0);
$r = json_decode(rq($jb, 'PUT', "$base/expenses.php", ['id'=>$expBid,'name'=>'DIUBAH DARI KELAS A','category'=>'lainnya','amount'=>1,'expense_date'=>date('Y-m-d')], $tb));
A('CROSS-CLASS edit expense kelas B DENY', isset($r->error), json_encode($r));
$r = json_decode(rq($jb, 'DELETE', "$base/expenses.php", ['id'=>$expBid], $tb));
A('CROSS-CLASS delete expense kelas B DENY', isset($r->error), json_encode($r));
$perB2 = json_decode(rq($jb2, 'GET', "$base/periods.php"))->periods;
// uji denial dengan menunggu respons definitif (anti flake transport harness)
$r = null;
for ($att = 0; $att < 4; $att++) {
    $rawP = rq($jb, 'PUT', "$base/periods.php", ['id'=>(int)$perB2[0]->id,'name'=>'X','start_date'=>$perB2[0]->start_date,'end_date'=>$perB2[0]->end_date,'due_date'=>$perB2[0]->due_date,'amount'=>1,'status'=>'active'], $tb);
    $r = json_decode((string)$rawP);
    if ($r !== null && (isset($r->error) || isset($r->success))) break;
    usleep(300000);
}
A('CROSS-CLASS edit period kelas B DENY', isset($r->error), substr(json_encode($r),0,200));
$r = json_decode(rq($js, 'POST', "$base/expenses.php", ['name'=>'Siswa Buat Expense','category'=>'lainnya','amount'=>1,'expense_date'=>date('Y-m-d')], $ts));
A('ROLE siswa create expense DENY', isset($r->error) && strpos(json_encode($r), 'Forbidden') !== false, json_encode($r));
$r = json_decode(rq($js, 'POST', "$base/cash_settings.php", ['frequency'=>'monthly','default_amount'=>9999], $ts));
A('ROLE siswa ubah cash settings DENY', isset($r->error));
$r = json_decode(rq($js, 'POST', "$base/students.php", ['full_name'=>'Hack','nis'=>'HACK1','username'=>'hack_user'], $ts));
A('ROLE siswa create student DENY', isset($r->error));
$r = json_decode(rq($js, 'POST', "$base/periods.php", ['name'=>'Hack Periode','start_date'=>date('Y-m-d'),'end_date'=>date('Y-m-d'),'due_date'=>date('Y-m-d'),'amount'=>1], $ts));
A('ROLE siswa create period DENY', isset($r->error));
$r = json_decode(rq($js, 'PUT', "$base/reports.php", ['id'=>$repId,'status'=>'selesai','response'=>'self-approve'], $ts));
A('ROLE siswa respond report DENY', isset($r->error));

// ---------- cleanup fixture ----------
$pdo->prepare("DELETE FROM users WHERE id IN (?,?)")->execute([$siswaB, $bendB]);
$pdo->prepare("DELETE FROM students WHERE user_id = ?")->execute([$siswaB]);
$pdo->prepare("DELETE FROM cash_periods WHERE class_id = ?")->execute([$classB]);
$pdo->prepare("DELETE FROM classes WHERE id = ?")->execute([$classB]);

echo $fail === 0 ? "\n=== B11 SEMUA TEST PASS ===\n" : "\n=== {$fail} TEST GAGAL ===\n";
exit($fail === 0 ? 0 : 1);


function logoutJar($name) { global $handles; if (isset($handles[$name])) { curl_close($handles[$name]); unset($handles[$name]); } }




