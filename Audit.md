# Audit Teknis Menyeluruh KasKelas

## Batasan Audit

- Sumber audit: seluruh isi `kaskelas-php.zip`
- Total: **27 file**, sekitar **204 KB**
- PHP: 22 file
- Frontend: `index.html`, `app.js`, `app.css`
- Database: `kaskelas.sql`
- Upload: 1 file JPEG
- Tidak ada file yang diubah atau dihapus
- Syntax JavaScript berhasil diperiksa dengan `node --check`
- PHP tidak dapat dijalankan di environment audit karena binary PHP tidak tersedia
- MySQL/MariaDB tidak dijalankan, sehingga perilaku runtime database belum dapat diverifikasi langsung

---

# 1. Executive Summary

## Overall Score

# **4,0/10**

## Status

# 🔴 **NOT READY**

Aplikasi sudah lebih dari sekadar mockup karena beberapa API PHP dan database sudah tersedia. Namun, aplikasi belum aman untuk testing lintas kelas, belum lengkap untuk operasional bendahara, dan masih memiliki beberapa masalah yang dapat menyebabkan kebocoran data atau manipulasi transaksi.

## 5 Masalah Terbesar

| Prioritas | Masalah | Dampak |
|---|---|---|
| P0 | Endpoint bendahara mengambil seluruh transaksi tanpa filter `class_id` | Bendahara Kelas A dapat melihat transaksi Kelas B |
| P0 | `verify_payment.php` tidak memvalidasi kelas transaksi terhadap kelas bendahara | Bendahara dapat menyetujui/menolak transaksi kelas lain jika mengetahui ID |
| P0 | Tidak ada perlindungan CSRF dan konfigurasi CORS menggunakan `*` | Request berbahaya dari situs lain berpotensi memakai session browser |
| P1 | Frontend masih menggunakan `fetch('api/...')`, bukan konfigurasi environment | Integrasi hanya berjalan bila frontend dan API berada di struktur host yang sama |
| P1 | Flow pembayaran, upload bukti, dan resubmit belum konsisten | Pembayaran ditolak tidak dapat benar-benar di-upload ulang karena status tetap `ditolak` |
| P1 | Data seed dan SQL tidak konsisten antar kelas | Data periode berada di `class_id=2`, pengeluaran dan pengumuman berada di `class_id=1` |

---

# 2. Inventory Project

## Struktur

| Kategori | File |
|---|---|
| Frontend HTML | `index.html` |
| Frontend JavaScript | `app.js` |
| Frontend CSS | `app.css` |
| API PHP | 20 endpoint utama |
| Helper/config PHP | `helpers.php`, `config.php` |
| Seed/testing | `seed.php`, `seed_periods.php` |
| Database | `kaskelas.sql` |
| Upload | `uploads/proof_6a826bdcab5c3.jpeg` |

## File yang Terlihat Legacy / Prototype

1. `app.js`
   - Masih memiliki konstanta hardcoded:
     - `WEEKLY_AMOUNT = 3000`
     - `MONTHLY_AMOUNT = 10000`
     - `CLASS_FREQUENCY = 'weekly'`
   - Masih memiliki demo login default:
     - `risyad`
     - `password123`
   - Masih terdapat komentar simulasi dan fallback dummy.

2. `app.js:1209-1215`
   - `resubmitBukti()` hanya mengarahkan user ke halaman upload.
   - Tidak mengubah status transaksi `ditolak` menjadi status yang dapat di-upload ulang.

3. `app.js:1193-1207`
   - Download bukti PDF masih menghasilkan toast:
     - `"File PDF tidak dapat diunduh pada demo"`

4. `app.js:1575`
   - Upload foto profil hanya menampilkan toast:
     - `"Upload foto"`

5. `app.js:1653`
   - Tombol “Hubungi” hanya menampilkan toast:
     - `"Menghubungi..."`

6. `api/seed.php`
   - Berisi credential development hardcoded dan mencetak username/password ke output.

7. `api/seed_periods.php`
   - Bersifat destruktif karena menghapus periode, pengeluaran, dan pengumuman tertentu sebelum mengisi data contoh.

## Duplicate Code

- `loadNotifications()` didefinisikan dua kali:
  - `app.js:473-489`
  - `app.js:1343-1361`
- Definisi kedua menimpa definisi pertama.
- Ini bukan sekadar duplication kosmetik karena format mapping field yang dipakai berbeda.

## File / Struktur yang Tidak Dipakai atau Belum Terpakai

| Item | Temuan |
|---|---|
| `audit_logs` | Tabel tersedia, tetapi tidak ada API yang menulis audit log |
| `cash_settings` update | Hanya endpoint GET, belum ada pengelolaan oleh bendahara |
| `announcement_reads` | Ada tabel, tetapi tidak ada endpoint untuk menandai pengumuman dibaca |
| `payment_date` | Kolom tersedia tetapi tidak pernah diisi saat pembayaran diverifikasi |
| `receipt_file` | Kolom expenses tersedia tetapi tidak ada upload receipt |
| `profile_photo` | Kolom tersedia tetapi tidak ada implementasi upload |
| `response` reports | Kolom tersedia tetapi tidak ada modul bendahara untuk merespons laporan |
| `language`, `email_notif` | Ada di database tetapi tidak dikelola penuh oleh frontend/backend |

---

# 3. Architecture Audit

| Area | Score | Penilaian |
|---|---:|---|
| Frontend architecture | 4/10 | Satu file JS sekitar 1.801 baris, rendering string HTML, global state besar |
| Backend architecture | 4/10 | Endpoint terpisah tetapi business logic, authorization, dan query bercampur |
| API architecture | 4/10 | Response belum konsisten dan tidak semua method/role terdokumentasi |
| Database architecture | 5/10 | Sudah menggunakan InnoDB, FK, index, dan DECIMAL, tetapi relasi tenant belum kuat |
| Authentication | 5/10 | Password hashing dan session regeneration sudah ada, tetapi session security belum lengkap |
| Authorization | 2/10 | Validasi role ada, validasi class ownership belum konsisten |
| Multi-class architecture | 2/10 | Belum aman untuk penggunaan Kelas A, B, C, dan seterusnya |

## Arsitektur Aktual

```text
index.html
  ↓
app.js
  ↓
fetch('api/*.php')
  ↓
PHP Session
  ↓
PDO
  ↓
MySQL/MariaDB
```

## Masalah Arsitektur Utama

1. `class_id` tidak menjadi bagian langsung dari transaksi.
2. Banyak endpoint mendapatkan `class_id` dari user, tetapi tidak menggunakannya untuk semua query.
3. `transactions` hanya memiliki `user_id`, sedangkan relasi kelas harus diturunkan dari user.
4. Tidak ada service/repository layer.
5. Frontend menggunakan state global yang sama untuk siswa dan bendahara.
6. Role hanya menyembunyikan menu di frontend, bukan menjadi satu-satunya pertahanan backend.
7. API mengembalikan data database langsung dengan `SELECT *` pada beberapa endpoint.

---

# 4. Bug List

## P0 — Fatal / Security / Data Exposure

| ID | File | Line | Masalah | Dampak | Root Cause | Rekomendasi |
|---|---|---:|---|---|---|---|
| P0-01 | `api/transactions.php` | 10-56 | Query bendahara tidak memiliki filter kelas | Bendahara dapat melihat semua transaksi semua kelas | Query hanya memeriksa role | Tambahkan validasi kelas bendahara dan transaksi |
| P0-02 | `api/verify_payment.php` | 21-29 | Transaksi dicari hanya dengan `id` | Bendahara dapat memproses transaksi kelas lain | Tidak ada `class_id` ownership check | Validasi `transaction.user_id → users.class_id` terhadap session bendahara |
| P0-03 | `api/config.php` | 7-17 | `Access-Control-Allow-Origin: *` pada API session | Origin mana pun dapat berinteraksi dengan API | CORS terlalu terbuka | Batasi origin dan konfigurasi credential dengan aman |
| P0-04 | `api/config.php` | 19-25 | Credential database hardcoded | Credential mudah terekspos dari repository/arsip | Tidak memakai environment config | Pindahkan konfigurasi ke environment server |
| P0-05 | `api/reports.php` | 21, 27-31 | `transaction_id` dari user tidak divalidasi ownership | Laporan dapat dikaitkan ke transaksi user lain | Tidak ada validasi transaksi terhadap session user/class | Validasi hubungan transaksi dan user sebelum insert |
| P0-06 | `api/transactions.php` | 84-87 | Path bukti pembayaran dikirim langsung ke frontend | File bukti berpotensi dapat diakses langsung user lain | File disimpan di folder web-accessible | Gunakan endpoint file terproteksi berdasarkan ownership/class |

## P1 — Critical

| ID | File | Line | Masalah | Dampak |
|---|---|---:|---|---|
| P1-01 | `api/submit_payment.php` | 43-61 | Validasi periode dilakukan satu per satu tanpa locking | Dua request bersamaan dapat membuat pembayaran ganda |
| P1-02 | `api/submit_payment.php` | 51-55 | Pengecekan transaksi existing tidak dilindungi unique constraint berbasis user-period | Race condition tetap mungkin terjadi |
| P1-03 | `api/upload_proof.php` | 73-88 | File dipindahkan sebelum seluruh insert database berhasil | File yatim dapat tertinggal jika insert gagal |
| P1-04 | `api/upload_proof.php` | 77-88 | Tidak ada transaction DB untuk insert proof, notification, activity | Data dapat tersimpan sebagian |
| P1-05 | `api/verify_payment.php` | 37-41 | Update transaksi tidak memakai conditional `WHERE status='menunggu'` | Dua request paralel secara konseptual dapat memproses transaksi bersamaan |
| P1-06 | `app.js` | 210 | API memakai URL relatif `api/` | Tidak mengikuti arsitektur frontend + PHP API terpisah |
| P1-07 | `app.js` | 1209-1215 | Resubmit hanya navigasi UI | User tidak dapat upload ulang bukti transaksi ditolak |
| P1-08 | `app.js` | 655-657 | Credential demo tampil dan password terisi default | Risiko credential terbawa ke production |
| P1-09 | `api/helpers.php` | 4-7 | Error response tidak memaksa header JSON untuk semua jalur | PHP warning/fatal dapat menjadi HTML |
| P1-10 | Banyak endpoint | — | Tidak ada CSRF token pada POST | Session user dapat disalahgunakan oleh request lintas situs |

## P2 — High

| ID | File | Line | Masalah |
|---|---|---:|---|
| P2-01 | `api/notifications.php` | 9-39 | POST tanpa action dianggap mark-all-read |
| P2-02 | `api/notifications.php` | 19-20 | Update notification kedua hanya berdasarkan ID, meskipun SELECT sebelumnya ownership-checked |
| P2-03 | `api/announcements.php` | 22 | `is_read` hanya berupa count, bukan boolean konsisten |
| P2-04 | `api/announcements.php` | — | Tidak ada endpoint mark announcement read |
| P2-05 | `api/cash_settings.php` | 11-15 | Jika settings tidak ada, response `cash_settings: false` atau null tidak ditangani jelas |
| P2-06 | `api/students.php` | 30-50 | N+1 query: satu query tambahan untuk setiap siswa |
| P2-07 | `api/transactions.php` | 20-51 | Banyak correlated subquery untuk setiap transaksi |
| P2-08 | `api/transactions.php` | 11-56 | Tidak ada pagination |
| P2-09 | `api/expenses.php` | 20-29 | Menggunakan `SELECT e.*` |
| P2-10 | `api/notifications.php` | 27 | Menggunakan `SELECT *` |
| P2-11 | `api/reports.php` | 10 | Menggunakan `SELECT *` |
| P2-12 | `app.js` | 56 | `showToast()` menggunakan `innerHTML` dengan message yang dapat berasal dari server |
| P2-13 | `app.js` | banyak lokasi render | Data server dimasukkan ke HTML tanpa escaping |
| P2-14 | `app.js` | 322, 805, 1165, 1322, 1339 | Risiko stored XSS dari nama, judul, isi pengumuman, deskripsi, alasan penolakan |
| P2-15 | `api/login.php` | 38-61 | Tidak ada rate limiting atau brute-force protection |
| P2-16 | `api/logout.php` | 7 | `session_destroy()` dipanggil tanpa menghapus cookie session |
| P2-17 | `api/config.php` | 13 | Tidak ada pengaturan cookie `HttpOnly`, `Secure`, dan `SameSite` yang terlihat |
| P2-18 | `api/verify_payment.php` | 48 | Alasan penolakan langsung dimasukkan ke notifikasi tanpa sanitasi tampilan frontend |

## P3 — Medium

- Tidak ada response schema formal.
- Banyak endpoint mengembalikan ID sebagai string dari `lastInsertId()`, sementara frontend kadang memperlakukan ID sebagai number.
- `payment_date` tidak diisi saat pembayaran berhasil.
- `last_login` tidak pernah diperbarui.
- `verified_by` hanya FK user, bukan FK bendahara satu kelas.
- Error exception dikembalikan bersama `$e->getMessage()` pada:
  - `submit_payment.php:113`
  - `verify_payment.php:60`
- `app.js` memiliki `console.log()` debug pada flow pembayaran.
- `app.js` melakukan render ulang setiap input search, yang kurang efisien.
- Tidak ada loading state global untuk `loadDataFromServer()`.
- `Promise.all()` membuat seluruh inisialisasi dianggap gagal jika satu endpoint gagal.
- Tidak ada retry atau fallback yang membedakan error unauthorized, server error, dan network error.

## P4 — Low / Cleanup

- `app.css` memiliki aturan `.quick-action-btn` berulang di sekitar line 307 dan 361.
- `profile-header .avatar-lg` didefinisikan ulang.
- Font menggunakan fallback default `Inter`, tetapi tidak ada import font.
- Banyak inline style.
- Tidak ada `data-testid` sama sekali.
- `getTimeliness()` dan `getStudentOverallStatus()` tampak tidak digunakan secara jelas.
- Konstanta dan field legacy masih bercampur dengan field API baru.

---

# 5. Authentication Audit

## Yang Sudah Benar

- `session_start()` dijalankan melalui `config.php`.
- Password diverifikasi menggunakan `password_verify()`.
- Status akun diperiksa:
  - `active`
  - `inactive`
  - `suspended`
- `session_regenerate_id(true)` dilakukan setelah login berhasil.

## Masalah

| Area | Status | Temuan |
|---|---|---|
| Login user aktif | ✅ Partial working | Query dan password verification tersedia |
| User inactive | ✅ | Ditolak dengan status 403 |
| User suspended | ✅ | Ditolak dengan status 403 |
| Session fixation | ✅ Partial | Regenerasi ID dilakukan setelah login |
| Session expiration | 🔴 Missing | Tidak terlihat timeout atau idle expiration |
| Logout | 🟡 Partial | Session dihancurkan, cookie tidak terlihat dihapus |
| Brute-force protection | 🔴 Missing | Tidak ada rate limit atau lockout |
| Cookie security | 🔴 Unverified/likely missing | Tidak ada konfigurasi cookie aman terlihat |
| Unauthorized API access | ✅ Partial | Banyak endpoint memakai `require_login()` |
| Login timestamp | 🔴 Missing | `last_login` tidak pernah di-update |

## Konseptual Test

| Skenario | Hasil audit statis |
|---|---|
| User belum login mengakses `periods.php` | Seharusnya 401 |
| User belum login mengakses `verify_payment.php` | Seharusnya 401 melalui `require_role()` |
| User logout lalu mengakses API privat | Bergantung apakah cookie session lama masih valid |
| User suspended login | 403 |
| User mengirim request POST dari situs eksternal | Berisiko karena tidak ada CSRF protection |

---

# 6. Authorization dan Multi-Class Audit

## Status

# 🔴 **Tidak aman untuk multi-class**

## Endpoint yang Relatif Aman

| Endpoint | Catatan |
|---|---|
| `periods.php` | Filter berdasarkan `class_id` user |
| `expenses.php` GET | Filter berdasarkan `class_id` user |
| `announcements.php` GET | Filter berdasarkan `class_id` user |
| `submit_payment.php` | Periode diverifikasi terhadap class user |
| `upload_proof.php` | Transaksi diverifikasi terhadap owner user |
| `students.php` | Mengambil siswa dengan `u.class_id = ?` |
| `transparansi.php` | Menghitung transaksi melalui user dalam kelas user |

## Endpoint Bermasalah

### `transactions.php`

```php
if ($role === 'bendahara') {
    $stmt = $pdo->query("SELECT ... FROM transactions t ...");
}
```

Tidak ada:

```text
WHERE user.class_id = bendahara.class_id
```

Akibatnya, seluruh transaksi semua kelas dikembalikan kepada bendahara mana pun.

### `verify_payment.php`

```php
SELECT id, user_id, status
FROM transactions
WHERE id = ?
```

Tidak ada validasi:

```text
transaction owner class == verifier class
```

Ini memungkinkan horizontal privilege escalation antar kelas.

### Relasi Database

`transactions` tidak memiliki `class_id`. Kelas hanya dapat diturunkan melalui:

```text
transactions.user_id → users.class_id
```

Sementara `transaction_items.period_id` mengarah ke `cash_periods`, tetapi database tidak memastikan:

```text
transaction.user.class_id == period.class_id
```

API submit payment melakukan validasi, tetapi database tidak memberikan jaminan integritas yang sama.

---

# 7. API Audit

| Endpoint | Method | Auth | Role | Input | Output | DB Dependency | Status |
|---|---|---|---|---|---|---|---|
| `login.php` | POST | Tidak | Semua | username, password | user, role | users, students | 🟡 |
| `logout.php` | POST | Tidak wajib | Semua | — | success | PHP session | 🟡 |
| `current_user.php` | GET | Ya | Semua | session | user | users, students | ✅ |
| `periods.php` | GET | Ya | Semua | session | periods | cash_periods, users | ✅ |
| `cash_settings.php` | GET | Ya | Semua | session | cash_settings | users, cash_settings | 🟡 |
| `transactions.php` | GET | Ya | Siswa/bendahara | session | transactions | transactions, users, students, items, proofs | 🔴 |
| `submit_payment.php` | POST | Ya | Siswa | period_ids, method | transaction ID/code | periods, transactions, items, notifications, activities | 🟡 |
| `upload_proof.php` | POST multipart | Ya | Secara praktik siswa owner transaksi | transaction_id, proof | file_name | transactions, payment_proofs, notifications, activities | 🟡 |
| `verify_payment.php` | POST | Ya | Bendahara | transaction_id, action, reason | success | transactions, notifications | 🔴 |
| `expenses.php` | GET/POST | Ya | POST bendahara | expense fields | expenses/success | expenses, users | 🟡 |
| `announcements.php` | GET/POST | Ya | POST bendahara | title, content, category, priority | announcements/success | announcements, users, reads | 🟡 |
| `notifications.php` | GET/POST | Ya | Semua | action, notification_id | notifications/success | notifications | 🟡 |
| `activities.php` | GET | Ya | Semua | session | activities | activities | ✅ |
| `students.php` | GET | Ya | Semua | session | students | users, students, payments | 🟡 |
| `transparansi.php` | GET | Ya | Semua | session | income, expense, balance | transactions, expenses | 🟡 |
| `reports.php` | GET/POST | Ya | Semua | report fields | reports/success | reports, transactions | 🟡 |
| `update_profile.php` | POST | Ya | Semua | email, phone | success | users | ✅ Partial |
| `user_settings.php` | GET/POST | Ya | Semua | settings | settings/success | user_settings | 🟡 |
| `seed.php` | GET/any | Tidak | Tidak ada | hardcoded | plain text | banyak tabel | 🔴 |
| `seed_periods.php` | GET/any | Tidak | Tidak ada | hardcoded | plain text | banyak tabel | 🔴 |

## Endpoint Missing

Belum tersedia endpoint untuk:

- Update/delete pengeluaran
- Update/delete pengumuman
- Create/update/delete periode
- Update cash settings oleh bendahara
- Mark announcement as read
- Upload ulang proof setelah ditolak
- Protected proof download/view
- Pengelolaan siswa
- Pengelolaan laporan oleh bendahara
- Statistik bendahara
- Audit log
- Notification broadcast ke satu kelas
- Pagination/filter server-side

---

# 8. Database Audit

## Ringkasan Tabel

| Tabel | Status | Temuan |
|---|---|---|
| `classes` | ⚠️ | Tidak ada unique constraint untuk kombinasi nama/sekolah/tahun; terdapat duplikat `XII RPL 3` |
| `users` | ✅/⚠️ | PK, username unique, FK class tersedia; email tidak unique |
| `students` | ✅ | `user_id` dan `nis` unique; belum ada unique attendance number per kelas |
| `cash_periods` | ✅/⚠️ | Ada index class/date; belum ada unique period per kelas |
| `cash_settings` | ✅ | Unique `class_id`; tidak ada data seed pada dump |
| `transactions` | ⚠️ | Tidak ada `class_id`, tidak ada unique user-period langsung |
| `transaction_items` | ✅/⚠️ | Unique transaction-period tersedia; tidak menjamin owner class consistency |
| `payment_proofs` | ⚠️ | Satu transaksi dapat memiliki banyak proof; tidak ada status/revision |
| `expenses` | ✅/⚠️ | FK class dan creator terpisah tanpa memastikan creator berasal dari class yang sama |
| `announcements` | ✅/⚠️ | FK class dan creator terpisah tanpa consistency class |
| `announcement_reads` | ✅ | Unique announcement-user sudah benar |
| `notifications` | ✅/⚠️ | FK user tersedia; tidak ada index reference |
| `activities` | ✅ | FK user dan index user/date tersedia |
| `reports` | ⚠️ | `transaction_id` tidak memvalidasi ownership user |
| `audit_logs` | ✅ schema / 🔴 usage | Tabel ada tetapi tidak pernah digunakan |
| `user_settings` | ✅ | PK user_id dan FK tersedia |

## Data Seed Tidak Konsisten

Di `kaskelas.sql`:

- `classes.id=1` dan `classes.id=2` memiliki nama sama: `XII RPL 3`
- `users` memakai `class_id=2`
- `cash_periods` memakai `class_id=2`
- `expenses` memakai `class_id=1`
- `announcements` memakai `class_id=1`
- `users` bendahara dan siswa berada di `class_id=2`

Akibatnya:

- Siswa aktif bisa melihat periode kelasnya.
- Siswa yang sama dapat tidak melihat pengeluaran dan pengumuman karena keduanya berada di kelas berbeda.
- Ini menjelaskan potensi empty state atau data yang tampak “hilang”.

## Data User Settings

`user_settings` hanya memiliki data untuk:

```text
user_id = 1
```

Sementara siswa `risyad` adalah:

```text
user_id = 2
```

Maka `user_settings.php` untuk siswa dapat mengembalikan null dan frontend memakai fallback lokal.

---

# 9. Payment dan Financial Logic Audit

## Flow Aktual

```text
Siswa submit_payment
  ↓
transactions status menunggu
  ↓
transaction_items dibuat
  ↓
notification + activity
  ↓
upload_proof
  ↓
payment_proofs dibuat
  ↓
Bendahara verify_payment
  ↓
status berhasil / ditolak
  ↓
notification siswa
```

## Masalah Flow Pembayaran

| Area | Temuan |
|---|---|
| Duplicate payment | Pengecekan aplikasi ada, tetapi race condition tetap mungkin |
| Double click | Tombol submit tidak dikunci secara konsisten sebelum request |
| Total amount | Frontend mengirim `total`, backend mengabaikannya dan menghitung ulang dari database; ini baik dari sisi keamanan tetapi kontraknya tidak terdokumentasi |
| Status rejected | Pembayaran ditolak tetap memiliki item transaksi, dan submit ulang ditolak oleh frontend |
| Upload proof | Tidak ada validasi bahwa transaksi masih belum memiliki proof sebelumnya |
| Verify payment | Tidak mengisi `payment_date` |
| Balance | Backend hanya menghitung transaksi `berhasil`, ini benar secara konsep |
| Opening balance | Tidak ada kolom atau sumber opening balance |
| Negative balance | Tidak ada validasi atau status khusus saldo negatif |
| Rollback | Submit dan verify memiliki transaction DB, upload proof tidak sepenuhnya atomic |
| Multi-period | Struktur item mendukung, tetapi validasi class dan duplicate masih bergantung aplikasi |
| Reconciliation | Tidak ada rekonsiliasi total header dengan total item |

## Rumus Finansial

Backend `transparansi.php` menggunakan:

```text
Approved Payments - Expenses = Balance
```

Ini sesuai dengan rumus dasar, tetapi:

- Tidak ada opening balance.
- Tidak ada filter periode/tahun.
- Grafik bulanan hanya berdasarkan bulan, bukan tahun.
- Frontend mengolah ulang dari state dan dapat berbeda dari backend.
- Tidak ada kontrol negative balance.
- Tidak ada audit perubahan saldo.

---

# 10. Upload Proof Audit

## Yang Sudah Ada

- Batas 5 MB
- Validasi MIME menggunakan `finfo`
- Validasi ekstensi
- Nama file server-generated dengan `random_bytes`
- Hanya JPEG, PNG, PDF yang diizinkan
- Transaksi harus milik user
- Transaksi harus berstatus `menunggu`

## Masalah

1. Folder upload berada di bawah web root:
   ```text
   /uploads/
   ```
2. Frontend menerima `file_path` langsung.
3. Tidak ada endpoint terproteksi untuk view/download.
4. Tidak ada konfigurasi server seperti:
   - deny execution
   - deny script serving
   - `X-Content-Type-Options`
5. Pemeriksaan `<?php` hanya membaca 4 byte pertama dan tidak relevan untuk seluruh jenis polyglot file.
6. Validasi ekstensi dan MIME belum menjamin isi file aman secara penuh.
7. Tidak ada validasi `UPLOAD_ERR_*` selain `UPLOAD_ERR_OK`.
8. Tidak ada cleanup jika insert database gagal setelah `move_uploaded_file()`.
9. Tidak ada batas jumlah upload per transaksi.
10. Tidak ada mekanisme penghapusan atau penggantian proof lama.
11. File sample terlihat seperti logo Instagram, bukan bukti pembayaran realistis:
   - `uploads/proof_6a826bdcab5c3.jpeg`
   - Ini menunjukkan data testing masih bersifat placeholder.

---

# 11. Frontend Audit

## Field Mapping Utama

| JS | PHP | SQL | Status |
|---|---|---|---|
| `periodIds` | `period_ids` | `transaction_items.period_id` | 🟡 |
| `total` | Tidak dipakai | `transactions.total_amount` | ⚠️ Mismatch kontrak |
| `periodLabel` | `period_label` | hasil GROUP_CONCAT | 🟡 |
| `studentName` | `student_name` | students/users | 🟡 |
| `proof` object | `proof_*` | payment_proofs | 🟡 |
| `rejectionReason` | `rejection_reason` | transactions | ✅ setelah mapping |
| `date` | `created_at` | transactions | ⚠️ Bukan payment_date |
| `desc` | `description` | expenses/reports | 🟡 |
| `isRead` | `is_read` | notifications | ✅ |
| announcement `isRead` | `is_read` | count alias `is_read` | ⚠️ Tidak konsisten secara semantic |
| `kelas` | Tidak dikembalikan oleh current_user/students | Tidak ada kolom user kelas | 🔴 Fallback hardcoded |

## Bug Logic Frontend

### 1. Nilai uang hardcoded

`app.js:758-761`, `app.js:817-832`, `app.js:1469`

Frontend menghitung total berdasarkan:

```javascript
WEEKLY_AMOUNT
MONTHLY_AMOUNT
```

Padahal nominal asli tersedia di `cash_periods.amount`.

Jika bendahara mengubah nominal di database, dashboard dapat menampilkan angka yang salah.

### 2. `cash_settings` tidak benar-benar menjadi sumber utama

Frontend memuat `cash_settings`, tetapi banyak halaman tetap menggunakan `CLASS_FREQUENCY`, `WEEKLY_AMOUNT`, dan `MONTHLY_AMOUNT`.

### 3. Tanggal tahun hardcoded

`app.js:1300` selalu menampilkan:

```text
${months[i]} 2026
```

Ini akan salah ketika data berada di tahun berbeda.

### 4. Status siswa tidak konsisten

Backend `students.php` menghitung status dengan:

```sql
SUM(CASE WHEN t.status = 'berhasil' ...)
```

Frontend juga menghitung status sendiri menggunakan `state.periods` dan `state.transactions`.

Dua sumber perhitungan ini dapat menghasilkan hasil berbeda.

### 5. Upload proof object tidak konsisten

Backend mengembalikan:

```javascript
proof: {
  file_name,
  file_path,
  file_type,
  file_size,
  url
}
```

Namun beberapa render lama memperlakukan `tx.proof` sebagai string.

Contoh `app.js:1167`, `1186`, `1202`.

### 6. API error tidak selalu menghentikan flow

`apiFetch()` pada `app.js:221-225` hanya melakukan log jika `!res.ok`, tetapi tetap mengembalikan JSON.

Akibatnya caller harus selalu memeriksa `data.success` atau `data.error`. Tidak semua flow memiliki pemeriksaan yang sama kuat.

### 7. `Promise.all()` terlalu rapuh

`loadDataFromServer()` memanggil sepuluh endpoint sekaligus. Jika satu endpoint gagal, seluruh proses dianggap gagal.

### 8. XSS dari server data

Data seperti berikut langsung dimasukkan ke `innerHTML`:

- nama user
- nama siswa
- judul pengumuman
- isi pengumuman
- deskripsi expense
- rejection reason
- notification message
- nama file

Tidak ada escaping helper.

### 9. Tidak ada `data-testid`

Audit menemukan:

```text
DATA_TESTID_COUNT: 0
```

Ini menyulitkan automated testing dan melanggar requirement testability yang ditetapkan.

---

# 12. Feature Audit

| Fitur | UI | Backend | Database | Persistent | Status | Severity |
|---|---:|---:|---:|---:|---|---|
| Login | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P1 |
| Logout | ✅ | ✅ | Session | 🟡 | 🟡 Partial | P2 |
| Dashboard | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P2 |
| Periode kas | ✅ | GET only | ✅ | ✅ | 🟡 Partial | P2 |
| Pembayaran | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P1 |
| Upload bukti | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P1 |
| Upload ulang proof | ✅ | ❌ | Schema belum mendukung revision | ❌ | 🔴 Broken | P1 |
| Riwayat transaksi | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P2 |
| Verifikasi bendahara | ✅ | ✅ | ✅ | ✅ | 🔴 Insecure | P0 |
| Reject + reason | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P1 |
| Pengeluaran | ✅ read | POST only | ✅ | ✅ | 🟡 Partial | P2 |
| Edit/delete pengeluaran | Tidak | Tidak | Ada tabel | — | ❌ Missing | P2 |
| Pengumuman | ✅ read | POST create | ✅ | ✅ | 🟡 Partial | P2 |
| Mark announcement read | Tidak | Tidak | Ada tabel | — | ❌ Missing | P2 |
| Notifikasi | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P2 |
| Transparansi | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P1 |
| Anggota | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P2 |
| Kalender | ✅ | Tidak ada API khusus | Menggunakan periode | — | 🟡 Partial | P3 |
| Profil | ✅ | update email/phone | ✅ | ✅ | 🟡 Partial | P2 |
| Foto profil | ✅ UI | ❌ | Kolom tersedia | ❌ | ❌ Missing | P3 |
| Pengaturan | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P3 |
| Laporan masalah | ✅ | ✅ | ✅ | ✅ | 🟡 Partial | P2 |
| Respons laporan bendahara | Tidak | Tidak | Kolom tersedia | ❌ | ❌ Missing | P2 |
| Statistik bendahara | Tidak jelas | Tidak | Tidak ada endpoint | — | ❌ Missing | P2 |
| Download proof | UI | Tidak ada protected endpoint | Path tersedia | 🟡 | 🔴 Insecure | P1 |

---

# 13. Audit Modul Bendahara

| Fitur | Status | Bug | Severity | File |
|---|---|---|---|---|
| Dashboard bendahara | 🟡 Partial | Menggunakan data transaksi tanpa isolasi kelas | P0 | `transactions.php` |
| Verifikasi pembayaran | 🔴 Broken security | Tidak validasi class ownership | P0 | `verify_payment.php` |
| Reject payment | 🟡 Partial | Reason tersedia, tetapi resubmit tidak selesai | P1 | `verify_payment.php`, `app.js` |
| Proof viewing | 🟡 Partial | Data proof tersedia, protected download tidak ada | P1 | `transactions.php`, `upload_proof.php` |
| Pengeluaran | 🟡 Partial | Create tersedia, update/delete tidak ada | P2 | `expenses.php` |
| Pengumuman | 🟡 Partial | Create tersedia, edit/delete/read tracking tidak ada | P2 | `announcements.php` |
| Periode kas | 🔴 Missing | Hanya GET, tidak ada create/update/delete | P1 | `periods.php` |
| Tagihan | 🔴 Missing | Tidak ada konfigurasi tagihan yang benar-benar dikelola | P1 | `cash_settings.php` |
| Anggota | 🟡 Partial | Read tersedia, CRUD siswa tidak ada | P2 | `students.php` |
| Laporan keuangan | 🟡 Partial | Transparansi read-only, tidak ada laporan periodik | P2 | `transparansi.php` |
| Statistik kelas | 🔴 Missing | Tidak ada endpoint statistik bendahara | P2 | — |
| Notifikasi siswa | 🟡 Partial | Hanya otomatis dari transaksi | P2 | `notifications.php` |
| Audit log | 🔴 Missing | Tabel ada, tidak ada pencatatan | P1 | `audit_logs` |

---

# 14. Security Ranking

## Critical

1. Cross-class transaction exposure pada `transactions.php`.
2. Cross-class transaction verification pada `verify_payment.php`.
3. CORS wildcard dengan session-based authentication.
4. Credential database hardcoded.
5. Direct access terhadap file proof.
6. Tidak ada CSRF protection.
7. Stored XSS dari konten database ke `innerHTML`.

## High

1. Tidak ada rate limiting login.
2. Tidak ada conditional update untuk mencegah concurrent verification.
3. Race condition submit payment.
4. `transaction_id` report tidak divalidasi ownership.
5. Error exception dapat bocor ke response.
6. Logout tidak terlihat menghapus session cookie.
7. Seed script menyimpan credential plaintext dan berpotensi bisa diakses jika guard salah konfigurasi.

## Medium

1. Security headers tidak terlihat.
2. Tidak ada content security policy.
3. Tidak ada audit log.
4. Tidak ada file download authorization.
5. Tidak ada validasi bahwa bendahara yang membuat expense/announcement berasal dari class yang sama pada level database.

## Low

1. Console logging data pembayaran.
2. Demo credential di frontend.
3. Inline event handler dan inline HTML.
4. Tidak ada test IDs.
5. Tidak ada pemisahan development dan production yang jelas.

---

# 15. Performance Audit

## Actual Bottleneck dari Code

### 1. N+1 Query pada `students.php`

`students.php:30-50`

- Satu query mengambil semua siswa.
- Untuk setiap siswa, dilakukan query tambahan untuk status pembayaran.

Jika ada 40 siswa, minimal terdapat sekitar 41 query.

### 2. Correlated Subquery pada `transactions.php`

`transactions.php:20-51` dan `67-98`

Untuk setiap transaksi, terdapat beberapa subquery:

- period label
- period IDs
- proof ID
- proof filename
- proof path
- proof type
- proof size

Ini berpotensi lambat ketika transaksi bertambah banyak.

### 3. Tidak Ada Pagination

Endpoint berikut mengambil semua data:

- transactions
- expenses
- announcements
- notifications
- activities
- reports
- students

Saat data kelas bertambah, payload dan waktu query akan meningkat.

### 4. Frontend Render Berulang

Search menggunakan:

```javascript
oninput="... renderPage()"
```

Setiap karakter menyebabkan seluruh halaman dirender ulang.

## Potential Optimization

- `SELECT *` pada `expenses.php`, `notifications.php`, `reports.php`, `user_settings.php`.
- Query data dapat dibuat lebih spesifik.
- `GROUP_CONCAT` dapat menghasilkan payload besar.
- Semua endpoint dipanggil sekaligus saat `loadDataFromServer()`.
- Data transparansi diambil seluruh periode/tahun tanpa filter.
- Tidak ada caching data yang aman.

## Yang Belum Terbukti sebagai Bottleneck

Tidak ada bukti dari code bahwa hal berikut sudah menjadi bottleneck aktual:

- Base64 image besar
- Polling berlebihan
- WebSocket overload
- Memory leak browser
- Database deadlock nyata
- Bottleneck akibat JOIN besar

Hal-hal tersebut memerlukan profiling runtime.

---

# 16. API Contract Conflict

## Konflik 1 — Nominal Pembayaran

Frontend `app.js:1006-1010` mengirim:

```json
{
  "period_ids": [1, 2],
  "method": "cash",
  "total": 6000
}
```

PHP `submit_payment.php` menerima:

```text
period_ids
method
```

PHP mengabaikan `total` dan menghitung ulang dari database.

Database menyimpan:

```text
transactions.total_amount
transaction_items.amount
```

### Kesimpulan

Keamanan perhitungan nominal di backend sudah lebih benar, tetapi frontend dan API contract tidak konsisten.

---

## Konflik 2 — Class Data

Frontend mengharapkan:

```javascript
user.kelas
```

PHP `current_user.php` tidak mengembalikan nama kelas.

Database menyimpan relasi:

```text
users.class_id → classes.id
```

### Akibat

Frontend memakai fallback:

```javascript
user.kelas || 'Kelas'
```

atau hardcoded:

```javascript
'XII RPL 3'
```

---

## Konflik 3 — Proof

Backend mengembalikan object:

```javascript
{
  file_name,
  file_path,
  file_type,
  file_size,
  url
}
```

Sebagian frontend lama memperlakukan `tx.proof` seperti string filename.

### Akibat

Preview/download proof dapat gagal atau menampilkan `[object Object]`.

---

## Konflik 4 — Nominal Kas

Database:

```text
cash_periods.amount
cash_settings.default_amount
```

Frontend:

```javascript
WEEKLY_AMOUNT = 3000
MONTHLY_AMOUNT = 10000
```

### Akibat

Dashboard dan statistik dapat berbeda dari nilai aktual database.

---

# 17. Testability Audit

## Yang Sudah Ada

- Seed script
- SQL dump
- Credential demo
- Data transaksi contoh
- Data proof contoh
- Environment development berbasis XAMPP secara dokumentasi

## Masalah

- Tidak ada test case otomatis.
- Tidak ada API collection.
- Tidak ada fixture multi-class.
- Tidak ada test user untuk:
  - Kelas A
  - Kelas B
  - dua bendahara
  - user suspended
  - transaksi ditolak
- Tidak ada test IDs.
- ID database hardcoded dalam data seed.
- Seed menghapus data tertentu.
- Tidak ada pemisahan konfigurasi development/production.
- Credential demo muncul di frontend dan seed script.

---

# 18. Recommended Fix Order

## PHASE 1 — Fatal Security

1. Hentikan akses lintas kelas pada `transactions.php`.
2. Tambahkan validasi kelas pada `verify_payment.php`.
3. Audit seluruh endpoint berdasarkan `class_id`.
4. Lindungi file proof dari akses langsung.
5. Hilangkan credential hardcoded dari konfigurasi dan frontend.
6. Tambahkan CSRF protection.
7. Batasi CORS.

## PHASE 2 — Critical Payment Integrity

1. Cegah duplicate payment pada level database dan transaction.
2. Tambahkan concurrency protection.
3. Pastikan transaksi rejected dapat memiliki flow resubmit yang benar.
4. Buat upload proof atomic dengan database.
5. Pastikan status verification tidak dapat diproses dua kali.
6. Isi `payment_date` dan catat audit log.

## PHASE 3 — API Contract

1. Tetapkan format field resmi.
2. Samakan mapping JS ↔ PHP ↔ SQL.
3. Hilangkan field yang tidak digunakan seperti `total` dari request atau dokumentasikan.
4. Buat response error JSON konsisten.
5. Tambahkan endpoint yang masih missing untuk bendahara.

## PHASE 4 — Feature Completion

1. CRUD periode.
2. CRUD pengeluaran.
3. CRUD pengumuman.
4. Pengelolaan laporan bendahara.
5. Mark announcement read.
6. Upload foto profil.
7. Download proof terproteksi.
8. Statistik bendahara.
9. Notification untuk satu kelas.

## PHASE 5 — Cleanup

1. Pecah `app.js` menjadi modul.
2. Hapus duplicate `loadNotifications()`.
3. Hapus console debug.
4. Hilangkan dummy fallback dan hardcoded dates.
5. Hilangkan inline event handler.
6. Tambahkan test IDs.
7. Hapus seed destruktif dari endpoint publik.

## PHASE 6 — Security Final

1. Session cookie flags.
2. Session expiration.
3. Login rate limiting.
4. Security headers.
5. XSS escaping.
6. Upload isolation.
7. Audit logging.
8. Error disclosure review.

## PHASE 7 — Performance

1. Hilangkan N+1 query pada students.
2. Optimalkan query transaksi.
3. Tambahkan pagination.
4. Kurangi `SELECT *`.
5. Kurangi render ulang saat search.
6. Tambahkan filter tanggal/periode pada laporan.

## PHASE 8 — Testing

Minimal test matrix:

- Siswa Kelas A melihat data sendiri.
- Siswa Kelas A mencoba membaca transaksi Kelas B.
- Bendahara Kelas A melihat transaksi.
- Bendahara Kelas A mencoba memverifikasi transaksi Kelas B.
- Siswa mencoba akses endpoint bendahara.
- User logout lalu mengakses API privat.
- Pembayaran dua kali secara paralel.
- Upload file PHP yang diberi ekstensi JPG.
- Upload file >5 MB.
- Rejected payment dan resubmit.
- Pengumuman dan notifikasi antar kelas.
- Saldo dengan pending, rejected, approved, dan expense.

---

# 19. Final Verdict

## Klasifikasi

# **Aplikasi saat ini adalah prototype terintegrasi awal yang belum siap untuk pilot kelas.**

### Prototype?

**Ya, tetapi sudah memiliki backend dan database nyata.**  
Bukan lagi frontend dummy murni.

### Siap testing?

**Terbatas.**  
Bisa digunakan untuk pengujian lokal single-class dengan data contoh, tetapi belum siap untuk security testing lintas kelas dan belum aman dianggap sebagai sistem multi-tenant.

### Siap pilot kelas?

**Tidak.**

Alasan utama:

- Kebocoran transaksi lintas kelas.
- Bendahara dapat memproses transaksi kelas lain.
- Flow resubmit pembayaran belum selesai.
- Fitur bendahara utama masih sebagian.
- Data seed tidak konsisten.
- Upload proof belum terlindungi dengan baik.
- Tidak ada CSRF dan rate limiting.
- Data frontend dan backend masih dapat berbeda.

### Siap production?

# **Tidak.**

Aplikasi perlu menyelesaikan seluruh isu P0 dan P1 terlebih dahulu, kemudian melakukan pengujian authorization lintas kelas, payment integrity, upload security, dan konsistensi data.