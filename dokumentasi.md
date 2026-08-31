# Dokumentasi Lengkap Aplikasi Smart Kas (KasKelas)

Selamat datang di dokumentasi resmi dan komprehensif untuk **Smart Kas (KasKelas)**. Dokumentasi ini disusun secara terstruktur, terperinci, dan profesional untuk memberikan gambaran menyeluruh mengenai arsitektur sistem, skema database, antarmuka RESTful API, katalog fitur untuk **User (Siswa)** dan **Bendahara (Admin Kelas)**, serta aturan bisnis keuangan yang diterapkan pada sistem.

---

## 1. Pendahuluan & Ringkasan Aplikasi

**Smart Kas (KasKelas)** adalah platform manajemen keuangan kas kelas berbasis web (*Single Page Application / SPA*) yang dirancang khusus untuk lingkungan sekolah. Sistem ini memudahkan siswa dalam melakukan pembayaran kas transparan secara digital dan membantu bendahara kelas mengelola pencatatan keuangan, verifikasi pembayaran, alokasi pengeluaran, pengumuman, hingga pelaporan secara terintegrasi dan akuntabel.

### Fitur Utama Kunci:
- **Multi-Tenancy Berbasis Kelas (`class_id`)**: Data terisolasi antar-kelas secara aman.
- **Dua Peran Pengguna (Role)**: *Siswa* (pembayar kas & konsumen informasi) dan *Bendahara* (manajer keuangan & administrator kelas).
- **Fleksibilitas Periode Kas**: Mendukung frekuensi pembayaran mingguan (*weekly*) maupun bulanan (*monthly*).
- **Sistem Pembayaran Multi-Metode**: Pembayaran Tunai (Cash), Transfer Bank, dan QRIS dengan verifikasi bukti transaksi (*upload proof*).
- **Pelaporan & Transparansi Real-Time**: Laporan kas terbuka dengan grafik pemasukan/pengeluaran bulanan dan opsi ekspor CSV.
- **Keamanan Tingkat Tinggi**: Proteksi CSRF, autentikasi berbasis sesi aman, validasi MIME file upload ketat, audit logging, dan rate limiting (throttling).

---

## 2. Arsitektur Sistem & Stack Teknologi

Smart Kas dirancang dengan arsitektur **Single Page Application (SPA)** yang dipadukan dengan **RESTful API Backend** menggunakan arsitektur monolitik ringan yang sangat efisien dan mudah didistribusikan.

### 2.1 Stack Teknologi Backend
- **Bahasa Pemrograman**: PHP 8.x (Native / Vanilla PHP tanpa framework berat untuk performa maksimal).
- **Database Engine**: MySQL / MariaDB (Driver PDO / PHP Data Objects dengan prepared statements untuk pencegahan SQL Injection).
- **Penyimpanan Sesi & Otentikasi**: PHP Session Manager dengan pengamanan cookie `httponly`, `samesite=Lax`, dan `secure`.
- **Manajemen File & Proteksi**: PHP File Upload Handling dengan verifikasi *magic byte* MIME type (`finfo`), ekstensi file, pembatasan ukuran file (maksimal 2MB - 5MB), dan pembatasan akses file langsung (diproteksi melalui script helper seperti `proof.php`, `receipt.php`, `avatar.php`, `report_attachment.php`).

### 2.2 Stack Teknologi Frontend
- **Arsitektur Client**: Single Page Application (SPA) murni dengan **Vanilla JavaScript (ES6+)** tanpa *framework Overhead* (React/Vue/Angular).
- **Tata Letak & Desain UI**: HTML5 & CSS3 (Custom CSS Variables, Flexbox, & Grid Layout) dengan arsitektur responsif (*Desktop Sidebar* & *Mobile Bottom Navigation Bar*).
- **Sistem Ikon UI**: Inline SVG Sprite System (`iconsSvg` & helper `ic()`) yang efisien dan tanpa dependensi font eksternal.
- **Manajemen State Frontend**: Centralized JavaScript `state` object untuk menyimpan caching sesi, transaksi, pengumuman, notifikasi, dan pengaturan.
- **Dynamic Theme Engine**: Dukungan *Light Mode*, *Dark Mode*, dan *System Theme Preference* yang tersimpan di `localStorage` dan tersinkronisasi ke basis data.

### 2.3 Prinsip Keamanan & Arsitektur Keuangan
1. **CSRF (Cross-Site Request Forgery) Protection**: Setiap metode mutasi data (`POST`, `PUT`, `DELETE`) mewajibkan token CSRF dinamis yang divalidasi via header `X-CSRF-Token`.
2. **Strict Class Isolation**: Seluruh kueri basis data pada endpoint API memfilter data berdasarkan `class_id` sesi pengguna yang aktif, mencegah kebocoran data (*IDOR / Insecure Direct Object References*) antar kelas.
3. **Audit Logging**: Aktivitas sensitif bendahara (verifikasi pembayaran, manipulasi pengeluaran, perubahan periode, impor siswa) dicatat secara otomatis ke dalam tabel `audit_logs` menggunakan fungsi `log_audit()`.
4. **Rate Limiting & Throttling**: Mencegah serangan *Brute Force* pada login dan perlindungan ekspor file menggunakan mekanisme `login_throttle_check()`.

---

## 3. Struktur Database & Schema

Database Smart Kas terdiri dari **16 tabel terelasi** yang dirancang secara terstruktur menggunakan *Engine InnoDB* dan *Collation utf8mb4_unicode_ci* dengan pengamanan integritas referensial (*Foreign Key Constraints*).

```
                       +-------------------+
                       |      classes      |
                       +---------+---------+
                                 |
        +------------------------+------------------------+
        |                        |                        |
+-------v-------+       +--------v-------+       +--------v-------+
| cash_settings |       |  cash_periods  |       |     users      |
+---------------+       +----------------+       +--------+-------+
                                                          |
        +-------------------+--------------------+--------+--------------------+
        |                   |                    |                             |
+-------v-------+   +-------v-------+    +-------v-------+             +-------v-------+
|   students    |   | transactions  |    | expenses      |             | announcements |
+---------------+   +-------+-------+    +---------------+             +-------+-------+
                            |                                                  |
                    +-------+-------+                                  +-------+-------+
                    |               |                                  |               |
             +------v------+  +-----v-------+                          v               v
             |transaction_ |  | payment_    |                  announcement_       activities
             |   items     |  |  proofs     |                      reads       notifications
             +-------------+  +-------------+                                    reports
                                                                               user_settings
                                                                                audit_logs
```

### 3.1 Detail Tabel Database

#### 1. `classes`
Menyimpan data identitas kelas yang terdaftar dalam sistem.
- `id` (INT, PK, Auto Increment): ID unik kelas.
- `name` (VARCHAR 50): Nama kelas (contoh: 'XII RPL 3').
- `school_name` (VARCHAR 150, NULL): Nama sekolah.
- `academic_year` (VARCHAR 20, NULL): Tahun ajaran (contoh: '2025/2026').
- `created_at`, `updated_at` (TIMESTAMP): Waktu pembuatan dan pembaruan data.

#### 2. `users`
Menyimpan data akun pengguna (Siswa dan Bendahara).
- `id` (INT, PK, Auto Increment): ID unik pengguna.
- `class_id` (INT, FK -> `classes.id`): ID kelas pengguna.
- `username` (VARCHAR 50, UNIQUE): Username unik untuk login.
- `password_hash` (VARCHAR 255): Hash password terkode (`password_hash()`).
- `role` (ENUM: 'siswa', 'bendahara'): Peran pengguna dalam aplikasi.
- `email` (VARCHAR 100, NULL): Alamat email pengguna.
- `phone` (VARCHAR 20, NULL): Nomor telepon/WhatsApp.
- `profile_photo` (VARCHAR 255, NULL): Nama file foto profil yang terupload.
- `status` (ENUM: 'active', 'inactive', 'suspended'): Status keaktifan akun.
- `last_login` (DATETIME, NULL): Waktu terakhir pengguna berhasil login.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 3. `students`
Menyimpan biodata rinci siswa yang terhubung dengan akun pengguna.
- `id` (INT, PK, Auto Increment): ID unik data siswa.
- `user_id` (INT, UNIQUE, FK -> `users.id` ON DELETE CASCADE): ID pengguna terkait.
- `nis` (VARCHAR 20, UNIQUE): Nomor Induk Siswa.
- `full_name` (VARCHAR 100): Nama lengkap siswa.
- `attendance_number` (INT, NULL): Nomor urut absen di kelas.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 4. `cash_settings`
Menyimpan konfigurasi parameter pembayaran kas untuk setiap kelas (*Authoritative Settings*).
- `id` (INT, PK, Auto Increment): ID unik konfigurasi.
- `class_id` (INT, UNIQUE, FK -> `classes.id` ON DELETE CASCADE): ID kelas.
- `frequency` (ENUM: 'weekly', 'monthly'): Frekuensi tagihan kas.
- `default_amount` (DECIMAL 12,2): Nominal baku kas per periode (contoh: 3000.00).
- `payment_deadline_days` (INT): Toleransi batas hari pembayaran setelah periode dibuka.
- `bank_name` (VARCHAR 100, NULL): Nama bank tujuan transfer (contoh: 'BCA').
- `account_number` (VARCHAR 100, NULL): Nomor rekening transfer.
- `account_holder` (VARCHAR 100, NULL): Atas nama pemilik rekening bank.
- `qris_image` (VARCHAR 255, NULL): File gambar QRIS pembayaran kelas.
- `updated_at` (TIMESTAMP): Waktu terakhir konfigurasi diubah.

#### 5. `cash_periods`
Menyimpan periode-periode tagihan kas kelas.
- `id` (INT, PK, Auto Increment): ID unik periode.
- `class_id` (INT, FK -> `classes.id` ON DELETE CASCADE): ID kelas pemilik periode.
- `name` (VARCHAR 100): Nama/Label periode (contoh: '10–16 Aug 2026').
- `frequency` (ENUM: 'weekly', 'monthly'): Jenis frekuensi periode.
- `start_date` (DATE): Tanggal awal periode.
- `end_date` (DATE): Tanggal akhir periode.
- `due_date` (DATE): Tanggal tenggat waktu (jatuh tempo) pembayaran.
- `amount` (DECIMAL 12,2): Nominal tagihan kas khusus periode tersebut.
- `status` (ENUM: 'upcoming', 'active', 'closed'): Status siklus hidup periode.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 6. `transactions`
Menyimpan entitas induk pembayaran kas yang diajukan oleh siswa.
- `id` (INT, PK, Auto Increment): ID unik transaksi.
- `transaction_code` (VARCHAR 50, UNIQUE): Kode referensi transaksi (contoh: 'TRX-6A8258EA8CDC8').
- `user_id` (INT, FK -> `users.id`): ID pengguna pembayar kas.
- `total_amount` (DECIMAL 12,2): Total nominal uang yang dibayarkan.
- `method` (ENUM: 'cash', 'transfer', 'qris'): Metode pembayaran yang digunakan.
- `status` (ENUM: 'menunggu', 'berhasil', 'ditolak'): Status verifikasi transaksi.
- `rejection_reason` (TEXT, NULL): Catatan/alasan penolakan dari bendahara jika transaksi ditolak.
- `payment_date` (DATETIME, NULL): Tanggal saat transaksi diverifikasi atau dibayar.
- `submitted_at` (DATETIME, NULL): Waktu pembayaran diajukan oleh siswa.
- `verified_at` (DATETIME, NULL): Waktu verifikasi oleh bendahara.
- `verified_by` (INT, NULL, FK -> `users.id` ON DELETE SET NULL): ID bendahara yang memverifikasi.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 7. `transaction_items`
Menyimpan pemetaan rincian periode yang dibayar dalam satu transaksi (mendukung pembayaran *multi-period*).
- `id` (INT, PK, Auto Increment): ID rincian item.
- `transaction_id` (INT, FK -> `transactions.id` ON DELETE CASCADE): ID induk transaksi.
- `period_id` (INT, FK -> `cash_periods.id`): ID periode kas yang dibayar.
- `amount` (DECIMAL 12,2): Nominal yang dialokasikan untuk periode tersebut.
- `created_at` (TIMESTAMP): Waktu pembuatan rincian.
- *Unique Constraint*: `(transaction_id, period_id)` mencegah duplikasi periode dalam satu transaksi.

#### 8. `payment_proofs`
Menyimpan metadata dan lokasi file bukti pembayaran yang diupload siswa.
- `id` (INT, PK, Auto Increment): ID unik bukti pembayaran.
- `transaction_id` (INT, FK -> `transactions.id` ON DELETE CASCADE): ID transaksi terkait.
- `file_name` (VARCHAR 255): Nama asli file saat diunggah.
- `file_path` (VARCHAR 500): Jalur relatif penyimpanan fisik file di server (contoh: `uploads/proof_xyz.jpeg`).
- `file_type` (VARCHAR 100): MIME type file (contoh: 'image/jpeg', 'application/pdf').
- `file_size` (INT): Ukuran file dalam satuan bytes.
- `uploaded_at` (TIMESTAMP): Waktu file diunggah.

#### 9. `expenses`
Menyimpan pencatatan pengeluaran kas kelas yang diinput oleh bendahara.
- `id` (INT, PK, Auto Increment): ID unik pengeluaran.
- `class_id` (INT, FK -> `classes.id` ON DELETE CASCADE): ID kelas pemilik pengeluaran.
- `created_by` (INT, FK -> `users.id`): ID bendahara pembuat catatan pengeluaran.
- `name` (VARCHAR 255): Judul/Nama item pengeluaran (contoh: 'Pembelian Alat Kebersihan').
- `category` (ENUM: 'kebersihan', 'perlengkapan', 'kegiatan', 'dekorasi', 'sosial', 'lainnya'): Kategori pengeluaran.
- `amount` (DECIMAL 12,2): Nominal pengeluaran uang kas.
- `description` (TEXT, NULL): Rincian atau keterangan tambahan pengeluaran.
- `expense_date` (DATE): Tanggal terjadinya pengeluaran.
- `receipt_file` (VARCHAR 500, NULL): Nama file nota/bukti resi pengeluaran yang diunggah.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 10. `announcements`
Menyimpan pengumuman resmi kelas yang diterbitkan oleh bendahara.
- `id` (INT, PK, Auto Increment): ID pengumuman.
- `class_id` (INT, FK -> `classes.id` ON DELETE CASCADE): ID kelas sasaran.
- `created_by` (INT, FK -> `users.id`): ID bendahara pembuat pengumuman.
- `title` (VARCHAR 255): Judul pengumuman.
- `content` (TEXT): Isi detail pesan pengumuman.
- `category` (ENUM: 'kas', 'kegiatan', 'informasi_kelas', 'penting'): Kategori informasi.
- `priority` (ENUM: 'normal', 'important'): Tingkat urgensi pengumuman.
- `published_at` (DATETIME, NULL): Waktu penerbitan pengumuman.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 11. `announcement_reads`
Menyimpan jejak pembacaan pengumuman oleh setiap siswa.
- `id` (INT, PK, Auto Increment): ID rekam baca.
- `announcement_id` (INT, FK -> `announcements.id` ON DELETE CASCADE): ID pengumuman.
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE): ID siswa yang membaca.
- `read_at` (TIMESTAMP): Waktu pengumuman dibaca.
- *Unique Constraint*: `(announcement_id, user_id)` memastikan setiap pembacaan hanya tercatat satu kali.

#### 12. `notifications`
Menyimpan notifikasi individual untuk setiap pengguna.
- `id` (INT, PK, Auto Increment): ID notifikasi.
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE): ID pengguna penerima notifikasi.
- `type` (VARCHAR 50): Jenis notifikasi (contoh: 'pembayaran_berhasil', 'pembayaran_ditolak', 'pembayaran_menunggu', 'bukti_diterima', 'tunggakan', 'pengumuman').
- `title` (VARCHAR 255): Judul notifikasi.
- `message` (TEXT): Pesan singkat notifikasi.
- `reference_type` (VARCHAR 50, NULL): Tipe referensi entitas (contoh: 'transaction', 'announcement', 'arrears').
- `reference_id` (INT, NULL): ID dari entitas referensi terkait.
- `is_read` (TINYINT 1): Status baca (`0` = Belum dibaca, `1` = Sudah dibaca).
- `created_at` (TIMESTAMP): Waktu notifikasi terbuat.

#### 13. `activities`
Menyimpan riwayat log aktivitas siswa pada aplikasi.
- `id` (INT, PK, Auto Increment): ID log aktivitas.
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE): ID pengguna pelaku aktivitas.
- `type` (VARCHAR 50): Kategori aktivitas (contoh: 'payment', 'upload_bukti', 'login').
- `description` (VARCHAR 255): Keterangan rinci tindakan yang dilakukan.
- `icon` (VARCHAR 50, NULL): Kode/simbol ikon penanda aktivitas.
- `created_at` (TIMESTAMP): Waktu aktivitas terjadi.

#### 14. `reports`
Menyimpan laporan masalah atau keluhan yang dikirimkan oleh siswa kepada bendahara.
- `id` (INT, PK, Auto Increment): ID unik laporan.
- `user_id` (INT, FK -> `users.id` ON DELETE CASCADE): ID siswa pelapor.
- `category` (ENUM: 'pembayaran', 'akun', 'bukti_pembayaran', 'data_kas', 'aplikasi', 'lainnya'): Kategori masalah.
- `title` (VARCHAR 255): Subjek/Judul laporan masalah.
- `description` (TEXT): Rincian kronologi atau masalah yang dihadapi.
- `attachment` (VARCHAR 500, NULL): Nama file lampiran pendukung masalah.
- `transaction_id` (INT, NULL, FK -> `transactions.id` ON DELETE SET NULL): Referensi ID transaksi terkait jika ada.
- `status` (ENUM: 'dikirim', 'diproses', 'selesai'): Status penanganan laporan oleh bendahara.
- `response` (TEXT, NULL): Pesan tanggapan/jawaban dari bendahara.
- `created_at`, `updated_at` (TIMESTAMP): Timestamp rekaman.

#### 15. `user_settings`
Menyimpan preferensi konfigurasi aplikasi dari masing-masing pengguna.
- `user_id` (INT, PK, FK -> `users.id` ON DELETE CASCADE): ID pengguna.
- `theme` (ENUM: 'light', 'dark', 'system'): Pilihan tema visual aplikasi.
- `language` (VARCHAR 10): Kode bahasa aplikasi (default: 'id').
- `payment_reminder` (TINYINT 1): Sakelar notifikasi pengingat pembayaran (`1` = Aktif).
- `announcement_notif` (TINYINT 1): Sakelar notifikasi pengumuman baru (`1` = Aktif).
- `sound_notif` (TINYINT 1): Sakelar efek suara notifikasi (`1` = Aktif).
- `email_notif` (TINYINT 1): Sakelar notifikasi email (`0` = Nonaktif).
- `updated_at` (TIMESTAMP): Waktu pembaruan pengaturan.

#### 16. `audit_logs`
Menyimpan log audit keamanan atas setiap tindakan manajemen sensitif yang dilakukan bendahara.
- `id` (BIGINT, PK, Auto Increment): ID rekam audit.
- `user_id` (INT, NULL, FK -> `users.id` ON DELETE SET NULL): ID bendahara eksekutor.
- `action` (VARCHAR 100): Jenis tindakan yang dilakukan (contoh: 'verify_payment', 'create_expense', 'import_students').
- `entity_type` (VARCHAR 50, NULL): Tipe objek yang dimodifikasi (contoh: 'transactions', 'expenses', 'students').
- `entity_id` (INT, NULL): ID dari objek terkait.
- `description` (TEXT, NULL): Deskripsi detail perubahan data.
- `ip_address` (VARCHAR 45, NULL): Alamat IP client pengeksekusi.
- `created_at` (TIMESTAMP): Waktu eksekusi tindakan.

---

## 4. Dokumentasi RESTful API Endpoint

Backend Smart Kas menyediakan API berbasis REST yang mengembalikan respons berformat JSON terstandarisasi. Seluruh endpoint memerlukan sesi autentikasi yang valid, kecuali endpoint `login.php` dan `csrf.php`.

### 4.1 Modul Autentikasi & Keamanan Sesi

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/csrf.php` | `GET` | Public | Mengambil token CSRF dinamis untuk sesi aktif. Respons: `{ "csrf_token": "..." }`. |
| `api/login.php` | `POST` | Public | Autentikasi pengguna. Body: `{ "username": "...", "password": "..." }`. Melakukan verifikasi password hash dan throttling login. |
| `api/logout.php` | `POST` | Logged In | Mengakhiri sesi pengguna, menghancurkan cookie sesi, dan mencatat waktu logout. |
| `api/current_user.php`| `GET` | Logged In | Mengambil informasi akun profil pengguna yang sedang login (`id`, `username`, `name`, `role`, `class_id`, `class_name`, `email`, `phone`, `profile_photo`). |

### 4.2 Modul Keuangan & Pembayaran Kas

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/periods.php` | `GET` | Logged In | Mengambil daftar periode kas kelas. |
| `api/periods.php` | `POST` | Bendahara | Membuat periode kas baru. Body: `{ "name": "...", "frequency": "...", "start_date": "...", "end_date": "...", "due_date": "...", "amount": 3000 }`. |
| `api/periods.php` | `PUT` | Bendahara | Memperbarui data periode kas yang ada. Body: `{ "id": 1, "name": "...", "amount": 3000, "status": "active", ... }`. |
| `api/periods.php` | `DELETE` | Bendahara | Menghapus periode kas berdasarkan ID. |
| `api/submit_payment.php`| `POST` | Siswa | Mengajukan pembayaran kas baru. Body: `{ "period_ids": [1, 2], "method": "cash", "total": 6000 }`. Validasi status periode dan pencegahan pembayaran ganda. |
| `api/upload_proof.php` | `POST` | Siswa | Mengunggah berkas bukti transaksi. FormData: `proof` (File), `transaction_id` (ID Transaksi). Melakukan verifikasi MIME type & batas ukuran 5MB. |
| `api/proof.php` | `GET` | Logged In | Membuka/mengunduh berkas bukti transaksi secara aman dengan pengecekan otorisasi kelas. Query: `?id={transaction_id}`. |
| `api/transactions.php` | `GET` | Logged In | Mengambil riwayat transaksi. Siswa hanya menerima data miliknya, Bendahara menerima data seluruh siswa kelas. Mendukung paginasi `?page=1&limit=100`. |
| `api/verify_payment.php`| `POST` | Bendahara | Verifikasi transaksi oleh bendahara. Body: `{ "transaction_id": 1, "action": "berhasil"|"ditolak", "reason": "..." }`. Otomatis mencatat audit log dan mengirim notifikasi ke siswa. |
| `api/cash_settings.php`| `GET` | Logged In | Mengambil konfigurasi kas kelas (frekuensi, nominal baku, batas hari deadline, dan detail rekening bank). |
| `api/cash_settings.php`| `POST` | Bendahara | Memperbarui konfigurasi kas kelas. Body: `{ "frequency": "weekly", "default_amount": 3000, "payment_deadline_days": 7, "bank_name": "...", "account_number": "...", "account_holder": "..." }`. |
| `api/transparansi.php` | `GET` | Logged In | Mengambil ringkasan saldo kas, total pemasukan disetujui, total pengeluaran, serta data grafik agregat bulanan. Query: `?year=2026`. |

### 4.3 Modul Pengeluaran Kelas

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/expenses.php` | `GET` | Logged In | Mengambil daftar pengeluaran kas kelas. Mendukung paginasi. |
| `api/expenses.php` | `POST` | Bendahara | Mencatat pengeluaran baru. FormData: `name`, `category`, `amount`, `expense_date`, `description`, `receipt` (File nota opsional). |
| `api/expenses.php` | `PUT` | Bendahara | Memperbarui catatan pengeluaran. Body: `{ "id": 1, "name": "...", "category": "...", "amount": 15000, "expense_date": "..." }`. |
| `api/expenses.php` | `DELETE` | Bendahara | Menghapus catatan pengeluaran kas. |
| `api/receipt.php` | `GET` | Logged In | Membuka berkas nota resi pengeluaran kas secara aman. Query: `?id={expense_id}`. |

### 4.4 Modul Pengumuman & Notifikasi

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/announcements.php`| `GET` | Logged In | Mengambil daftar pengumuman kelas beserta indikator status baca siswa. |
| `api/announcements.php`| `POST` | Bendahara | Mempublikasikan pengumuman baru atau menandai pengumuman telah dibaca. Body: `{ "title": "...", "content": "...", "category": "...", "priority": "normal"|"important" }` atau `{ "action": "mark_read", "announcement_id": 1 }`. |
| `api/announcements.php`| `PUT` | Bendahara | Mengedit isi pengumuman kelas. |
| `api/announcements.php`| `DELETE` | Bendahara | Menghapus pengumuman kelas. |
| `api/notifications.php`| `GET` | Logged In | Mengambil daftar notifikasi milik pengguna yang sedang login. |
| `api/notifications.php`| `POST` | Logged In | Menandai notifikasi telah dibaca (`action`: `mark_read`) atau melakukan Broadcast notifikasi kelas oleh Bendahara (`action`: `broadcast`, `title`: "...", `message`: "..."). |

### 4.5 Modul Manajemen Anggota & Profil

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/students.php` | `GET` | Logged In | Mengambil daftar seluruh siswa di kelas beserta status pembayaran dan status akunnya. |
| `api/students.php` | `POST` | Bendahara | Menambahkan siswa baru manual. Body: `{ "full_name": "...", "nis": "...", "username": "...", "attendance_number": 1, "email": "...", "phone": "..." }`. |
| `api/students.php` | `PUT` | Bendahara | Memperbarui data siswa atau status keaktifan akun siswa (`active`/`inactive`). |
| `api/students.php` | `DELETE` | Bendahara | Menonaktifkan akun siswa dari kelas. |
| `api/import_students.php`| `POST` | Bendahara | Mengimpor siswa secara masal melalui berkas CSV. FormData: `file` / `csv`. Mengurai CSV, memvalidasi keunikan username/NIS, dan mendaftarkan siswa secara otomatis dengan password default `siswa123`. |
| `api/update_profile.php`| `POST` | Logged In | Memperbarui data profil pribadi pengguna (email dan nomor telepon). |
| `api/upload_profile_photo.php`| `POST` | Logged In | Mengunggah foto profil baru. FormData: `photo` (File gambar maks 2MB). |
| `api/avatar.php` | `GET` | Logged In | Menampilkan gambar foto profil pengguna. Query: `?file={filename}`. |
| `api/change_password.php`| `POST` | Logged In | Mengubah password akun. Body: `{ "current_password": "...", "new_password": "..." }`. |
| `api/user_settings.php` | `GET` | Logged In | Mengambil preferensi tema dan notifikasi pengguna. |
| `api/user_settings.php` | `POST` | Logged In | Memperbarui preferensi tema (`light`/`dark`/`system`) dan toggle notifikasi. |

### 4.6 Modul Laporan Masalah, Statistik & Ekspor

| Endpoint | Method | Role Min. | Deskripsi & Parameter Utama |
| :--- | :--- | :--- | :--- |
| `api/reports.php` | `GET` | Logged In | Mengambil daftar laporan masalah (Siswa melihat laporan milik pribadi, Bendahara melihat seluruh laporan masuk kelas). |
| `api/reports.php` | `POST` | Siswa | Mengirimkan laporan masalah baru. FormData: `category`, `title`, `description`, `transaction_id`, `attachment` (File lampiran opsional). |
| `api/reports.php` | `PUT` | Bendahara | Memberikan umpan balik/respons dan memperbarui status laporan (`dikirim`/`diproses`/`selesai`). |
| `api/report_attachment.php`| `GET` | Logged In | Mengunduh/membuka file lampiran laporan masalah secara aman. Query: `?id={report_id}`. |
| `api/bendahara_stats.php`| `GET` | Bendahara | Mengambil statistik agregat kelas secara *live* (saldo, total pemasukan disetujui, pengeluaran, jumlah pembayaran menunggu/disetujui/ditolak, total tunggakan kelas, dan statistik siswa menunggak). |
| `api/export_report.php`| `GET` | Bendahara | Mengekspor laporan transaksi kas atau pengeluaran ke dalam format **CSV UTF-8 dengan BOM**. Query: `?type=transactions`\|`expenses` `&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`. Dilengkapi perlindungan rate limiting (10 req/menit). |
| `api/activities.php` | `GET` | Logged In | Mengambil log riwayat aktivitas siswa. |

---

## 5. Katalog & Penjelasan Fitur User (Siswa)

Peran **Siswa** difokuskan pada pemantauan tagihan kas pribadi, kemudahan pembayaran kas digital, keterbukaan informasi keuangan kelas, dan akses ke layanan bantuan.

```
+-------------------------------------------------------------------+
|                        PANEL SISWA (USER)                         |
+-------------------------------------------------------------------+
|  [1] Dashboard Utama           |  [9] Notifikasi Aplikasi         |
|  [2] Kas Saya (Kewajiban)      |  [10] Aktivitas Saya             |
|  [3] Pembayaran Kas Multi-Method| [11] Kalender Kas Kelas          |
|  [4] Upload Bukti Pembayaran   |  [12] Pengumuman Kelas           |
|  [5] Riwayat Transaksi         |  [13] Transparansi Kas           |
|  [6] Detail Transaksi & Timeline| [14] Pengeluaran Kas Kelas      |
|  [7] Tunggakan Kas Saya        |  [15] Pusat Laporan Masalah      |
|  [8] Profil & Keamanan Akun    |  [16] Bantuan & FAQ              |
+-------------------------------------------------------------------+
```

### 5.1 Fitur Dashboard Utama
- **Penjelasan**: Halaman depan interaktif yang menampilkan rangkuman pembayaran kas mingguan/bulanan terkini, sisa hari menuju jatuh tempo, persentase progress pembayaran kas pribadi, stat-cards (Total Dibayar, Tunggakan, Periode Lunas, Rate Progress), *Quick Action Buttons*, 5 transaksi terakhir, dan 3 pengumuman penting terbaru.
- **Tujuan**: Memberikan informasi instan kepada siswa mengenai status pembayaran kas mereka tanpa perlu berpindah halaman.

### 5.2 Fitur Kas Saya
- **Penjelasan**: Kartu ringkasan total kewajiban kas, total nominal yang telah dibayar, total tunggakan, serta daftar seluruh periode kas kelas (baik mingguan maupun bulanan). Dilengkapi dengan filter chip berdasarkan status (*semua*, *lunas*, *menunggu*, *ditolak*, *terlambat*).
- **Tujuan**: Memungkinkan siswa memeriksa seluruh histori riwayat kewajiban kas dari awal hingga akhir tahun ajaran.

### 5.3 Fitur Pembayaran Kas Multi-Metode
- **Penjelasan**: Antarmuka untuk melakukan pembayaran tagihan kas kelas. Siswa dapat memilih satu atau beberapa periode sekaligus (*multi-period payment*), melihat akumulasi total nominal, dan memilih metode pembayaran yang diinginkan:
  1. **Cash (Tunai)**: Pembayaran tunai langsung kepada bendahara di kelas.
  2. **Transfer Bank**: Transfer manual ke rekening bank kelas yang dikonfigurasi bendahara.
  3. **QRIS**: Pembayaran melalui kode QRIS kelas.
- **Tujuan**: Memberikan fleksibilitas metode pembayaran kas digital yang modern dan cepat.

### 5.4 Fitur Upload Bukti Pembayaran
- **Penjelasan**: Modul khusus untuk mengunggah foto atau file resi transfer/QRIS sebagai bukti pembayaran yang diajukan. Mendukung preview gambar, validasi format file (`.jpg`, `.jpeg`, `.png`, `.pdf`), pembatasan ukuran maksimal 5MB, serta penanganan pengunggahan ulang (*resubmit proof*) jika pembayaran sebelumnya ditolak oleh bendahara.
- **Tujuan**: Menjamin bahwa setiap pembayaran non-tunai atau pembuktian transaksi memiliki bukti sah yang dapat diverifikasi oleh bendahara.

### 5.5 Fitur Riwayat Transaksi
- **Penjelasan**: Daftar komprehensif seluruh pembayaran kas yang pernah dikirimkan siswa. Dilengkapi fitur pencarian berdasarkan ID transaksi/nama periode, filter berdasar status verifikasi (*berhasil*, *menunggu*, *ditolak*), filter metode pembayaran (*cash*, *transfer*, *qris*), filter per-periode, dan pengurutan data (*terbaru*, *terlama*, *nominal terbesar/terkecil*).
- **Tujuan**: Memudahkan siswa melacak status dan pengajuan pembayaran mereka secara transparan.

### 5.6 Fitur Detail Transaksi & Timeline
- **Penjelasan**: Tampilan rincian mendalam dari suatu transaksi kas, mencakup Kode Transaksi, Tanggal Pengajuan, Nominal, Metode, Status Verifikasi, Alasan Penolakan (jika ditolak), Penampil Bukti Pembayaran, serta *Visual Progress Timeline* (Pembayaran Dibuat -> Bukti Dikirim -> Verifikasi Bendahara).
- **Tujuan**: Memberikan kejelasan status alur verifikasi transaksi kepada siswa secara visual.

### 5.7 Fitur Tunggakan Saya
- **Penjelasan**: Halaman khusus yang menampilkan total akumulasi rupiah tunggakan kas yang belum dilunasi oleh siswa beserta daftar detail periode yang terlambat (*overdue*) atau belum dibayar. Dilengkapi tombol tindakan cepat *"Bayar Sekarang"*.
- **Tujuan**: Mengingatkan siswa secara proaktif mengenai kewajiban kas yang menunggak agar terhindar dari keterlambatan berkepanjangan.

### 5.8 Fitur Profil & Edit Profil
- **Penjelasan**: Halaman pengelola akun siswa untuk melihat NIS, Username, Email, No. HP, dan Foto Profil. Siswa dapat memperbarui Foto Profil (maks 2MB), memperbarui email, nomor telepon WhatsApp, serta mengubah password akun dengan memasukkan password saat ini demi keamanan.
- **Tujuan**: Memastikan data kontak siswa selalu terkini dan memberikan kendali keamanan akun secara mandiri.

### 5.9 Fitur Notifikasi Aplikasi
- **Penjelasan**: Pusat pemberitahuan pribadi yang menampilkan notifikasi terkait verifikasi pembayaran (berhasil/ditolak), pengumuman kelas baru, pengingat tunggakan, dan pesan dari bendahara. Notifikasi dilengkapi indikator status baca (dot merah) dan tombol *"Tandai semua dibaca"*.
- **Tujuan**: Memastikan siswa tidak ketinggalan informasi penting mengenai status pembayaran kas maupun pengumuman kelas.

### 5.10 Fitur Aktivitas Saya
- **Penjelasan**: Timeline histori jejak aktivitas fisik pengguna pada aplikasi, seperti waktu pengiriman pembayaran, waktu pengunggahan bukti, dan aktivitas akun lainnya.
- **Tujuan**: Menyediakan rekam jejak (*log activity*) pribadi untuk referensi siswa.

### 5.11 Fitur Kalender Kas Kelas
- **Penjelasan**: Tampilan kalender interaktif bulanan yang menandai tanggal-tanggal penting, seperti tanggal awal pembukaan periode kas, tanggal tenggat waktu jatuh tempo kas, dan tanggal pelaksanaan pengumuman/kegiatan kelas. Dilengkapi penanda indikator warna visual (Lunas, Belum Bayar, Menunggu, Deadline).
- **Tujuan**: Membantu siswa memvisualisasikan jadwal pembayaran kas bulanan dalam bentuk kalender.

### 5.12 Fitur Pengumuman Kelas
- **Penjelasan**: Modul informasi resmi kelas tempat siswa membaca pengumuman yang diterbitkan bendahara. Pengumuman dikategorikan (*kas*, *kegiatan*, *informasi_kelas*, *penting*) dan ditandai jika memiliki prioritas penting (*important badge*). Sistem secara otomatis mencatat status pembacaan saat siswa membuka detail pengumuman.
- **Tujuan**: Menjadi media komunikasi satu arah yang efisien dari bendahara ke seluruh siswa kelas.

### 5.13 Fitur Transparansi Kas
- **Penjelasan**: Halaman laporan keuangan kas terbuka yang dapat diakses oleh seluruh siswa. Menampilkan Total Saldo Kas Kelas saat ini, Total Pemasukan disetujui, Total Pengeluaran kelas, Grafik Bar Pemasukan Bulanan, Grafik Bar Pengeluaran Bulanan, dan Filter Pilihan Tahun/Bulan.
- **Tujuan**: Menciptakan akuntabilitas dan transparansi penuh atas pengelolaan uang kas kelas sehingga meningkatkan kepercayaan siswa.

### 5.14 Fitur Pengeluaran Kas Kelas
- **Penjelasan**: Daftar catatan penggunaan uang kas yang dibelanjakan oleh bendahara untuk keperluan kelas (alat kebersihan, dekorasi, kegiatan, dll). Siswa dapat melihat detail pengeluaran, deskripsi alasan belanja, dan melihat pratinjau foto nota/resi belanja asli.
- **Tujuan**: Memastikan seluruh uang kas yang keluar dapat dipertanggungjawabkan secara terbuka hingga ke bukti nota pembelian.

### 5.15 Fitur Pusat Laporan Masalah (Report Problem & My Reports)
- **Penjelasan**: Fasilitas bagi siswa untuk mengajukan pengaduan, keluhan, atau laporan kendala teknis/pembayaran kepada bendahara. Siswa dapat memilih kategori masalah, memasukkan judul, kronologi deskripsi, mencantumkan ID Transaksi terkait, serta melampirkan file foto bukti masalah. Siswa juga dapat memantau status laporan (*dikirim*, *diproses*, *selesai*) dan membaca tanggapan dari bendahara pada menu *"Laporan Saya"*.
- **Tujuan**: Menyediakan saluran komunikasi resmi untuk menyelesaikan kendala pembayaran atau kendala aplikasi secara teratur.

### 5.16 Fitur FAQ, Bantuan & Pengaturan Tema
- **Penjelasan**:
  - **FAQ**: Pertanyaan dan jawaban umum seputar cara pembayaran, nominal kas, deadline, dan verifikasi.
  - **Bantuan**: Informasi kontak telepon/WhatsApp bendahara kelas yang dapat dihubungi langsung.
  - **Pengaturan & Tema**: Opsi konfigurasi antarmuka untuk mengganti tema visual (*Light Mode*, *Dark Mode*, atau *System Default*) serta sakelar pengaturan suara dan notifikasi pengingat.
- **Tujuan**: Memberikan panduan mandiri dan fleksibilitas kenyamanan visual kepada pengguna.

---

## 6. Katalog & Penjelasan Fitur Bendahara (Admin Kelas)

Peran **Bendahara** memiliki hak akses khusus (*elevated privileges*) untuk mengelola operasional keuangan, administrasi anggota kelas, verifikasi transaksi, publikasi informasi, hingga ekspor data.

```
+-------------------------------------------------------------------+
|                     PANEL BENDAHARA (ADMIN KELAS)                 |
+-------------------------------------------------------------------+
|  [1] Panel Kelola & Live Stats |  [7] Impor Siswa Masal (CSV)     |
|  [2] Verifikasi Pembayaran     |  [8] Manajemen Pengeluaran Kas   |
|  [3] Modul Penolakan Transaksi |  [9] Manajemen Pengumuman Kelas  |
|  [4] Pengaturan Konfigurasi Kas| [10] Broadcast Notifikasi Kelas  |
|  [5] Manajemen Periode Kas     | [11] Kelola & Respons Laporan    |
|  [6] Manajemen Anggota Siswa   | [12] Ekspor Laporan Keuangan CSV |
+-------------------------------------------------------------------+
```

### 6.1 Fitur Panel Kelola Bendahara (Dashboard Live Stats)
- **Penjelasan**: Dashboard khusus bendahara dengan penanda visual *"Mode Bendahara Admin"* (Dark-Slate Theme). Menampilkan statistik keuangan kelas secara real-time langsung dari database backend, meliputi:
  - Saldo Kas Kelas Aktif (*Formula: Total Pemasukan Berhasil - Total Pengeluaran*).
  - Total Pemasukan Terverifikasi (*Approved Income*).
  - Total Pengeluaran Kas Terpakai.
  - Jumlah Pembayaran Menunggu Verifikasi (*Pending Count*).
  - Jumlah Pembayaran Disetujui & Ditolak.
  - Jumlah Anggota Kelas Aktif.
  - Total Rupiah Tunggakan Kelas & Jumlah Siswa yang Menunggak.
- **Tujuan**: Memberikan ringkasan eksekutif keuangan kelas secara akurat bagi bendahara untuk mengambil keputusan manajemen kas.

### 6.2 Fitur Verifikasi Pembayaran (Approve Payment)
- **Penjelasan**: Halaman antarmuka verifikasi tempat bendahara meninjau pengajuan pembayaran kas dari siswa. Bendahara dapat memeriksa nama siswa, periode yang dibayar, nominal, metode pembayaran, serta meninjau pratinjau file bukti transfer/QRIS yang diunggah. Dengan menekan tombol *"Setujui"*, status transaksi berubah menjadi `berhasil`, dana resmi masuk ke saldo kas kelas, periode terbukti lunas, log audit dicatat, dan notifikasi sukses otomatis dikirim ke siswa.
- **Tujuan**: Memastikan setiap pengajuan kas diperiksa keabsahannya sebelum dihitung sebagai saldo sah kelas.

### 6.3 Fitur Modul Penolakan Transaksi dengan Alasan (Reject Payment)
- **Penjelasan**: Apabila bukti pembayaran yang diunggah siswa tidak valid, tidak terbaca, atau nominal tidak sesuai, bendahara dapat menolak transaksi dengan menekan tombol *"Tolak"*. Dialog modal akan meminta bendahara memasukkan alasan penolakan (contoh: *"Bukti transfer buram/tidak terbaca"*). Setelah dikonfirmasi, status transaksi berubah menjadi `ditolak`, pesan penolakan disimpan, dan notifikasi beserta alasan ditolak dikirimkan ke siswa untuk diunggah ulang.
- **Tujuan**: Menghindari kelalaian verifikasi palsu dan memberikan kejelasan alasan penolakan kepada siswa.

### 6.4 Fitur Pengaturan Konfigurasi Kas Kelas (Cash Settings)
- **Penjelasan**: Panel pengaturan khusus untuk menentukan parameter aturan kas kelas:
  - **Frekuensi Kas**: Memilih frekuensi tagihan (*Mingguan / Weekly* atau *Bulanan / Monthly*).
  - **Nominal Baku Kas**: Menentukan jumlah tagihan standar kas per periode (contoh: Rp 3.000).
  - **Batas Hari Pembayaran**: Menentukan toleransi jumlah hari deadline pembayaran setelah periode dimulai.
  - **Rekening Transfer**: Mengatur Nama Bank, Nomor Rekening, dan Atas Nama Pemilik Rekening untuk metode transfer bank.
- **Tujuan**: Memberikan fleksibilitas penuh kepada bendahara dalam menyesuaikan kebijakan kas sesuai kesepakatan kelas.

### 6.5 Fitur Manajemen Periode Kas (Create, Edit, Delete Period)
- **Penjelasan**: Modul untuk mengelola rentang periode kas kelas. Bendahara dapat:
  - **Tambah Periode Baru**: Memasukkan Nama Periode, Tanggal Mulai, Tanggal Selesai, Tanggal Jatuh Tempo, Nominal Tagihan, dan Status awal (`upcoming`).
  - **Edit Periode**: Memperbarui tanggal, nominal, atau mengubah status periode (`upcoming`, `active`, `closed`).
  - **Hapus Periode**: Menghapus periode kas yang belum memiliki keterikatan transaksi lunas.
- **Tujuan**: Mengatur siklus penagihan kas secara berkesinambungan sepanjang tahun ajaran.

### 6.6 Fitur Manajemen Anggota Siswa (Add, Edit, Deactivate Student)
- **Penjelasan**: Modul administrasi data siswa di kelas. Bendahara dapat:
  - **Tambah Siswa Manual**: Menginput Nama Lengkap, NIS, Username Akun, Nomor Absen, Email, dan Nomor Telefon. Akun pengguna akan dibuatkan otomatis dengan password default `siswa123`.
  - **Edit Data Siswa**: Memperbarui profil siswa, nomor absen, email, nomor HP, dan status keaktifan akun.
  - **Nonaktifkan Siswa**: Mengubah status akun siswa menjadi `inactive` atau `suspended` apabila siswa telah pindah kelas/lulus. Akun yang dinonaktifkan tidak dapat login, namun histori transaksi lamanya tetap tersimpan utuh di database.
- **Tujuan**: Memastikan daftar keanggotaan kelas selalu teratur dan teridentifikasi dengan jelas.

### 6.7 Fitur Impor Siswa Masal via CSV (Import Students via Excel/CSV)
- **Penjelasan**: Fitur efisiensi untuk memasukkan puluhan data siswa sekaligus ke dalam sistem menggunakan berkas templat CSV/Excel. Bendahara cukup mengunggah berkas CSV dengan struktur kolom: `username`, `nis`, `full_name`, `attendance_number`, `email`, `phone`.
  - Sistem akan mengurai file, mendeteksi pemisah koma (`,`) atau titik-koma (`;`), serta mengeliminasi UTF-8 BOM.
  - Memvalidasi keunikan username dan NIS agar tidak terduplikasi di database.
  - Mendaftarkan entitas `users` dan `students` secara terisolasi dalam satu transaksi transaksi PDO (*Atomic Transaction*).
  - Mengembalikan rincian laporan: *jumlah siswa berhasil diimpor*, *jumlah baris dilewati*, dan *daftar pesan error spesifik per baris*.
- **Tujuan**: Menghemat waktu pembuatan akun siswa baru pada awal tahun ajaran baru.

### 6.8 Fitur Manajemen Pengeluaran Kas & Upload Nota (Expenses Management)
- **Penjelasan**: Modul untuk mencatat dan mengelola setiap alokasi penggunaan dana kas kelas:
  - **Tambah Pengeluaran**: Memasukkan Judul Pengeluaran, Kategori (*kebersihan*, *perlengkapan*, *kegiatan*, *dekorasi*, *sosial*, *lainnya*), Nominal Rupiah, Tanggal Pengeluaran, Deskripsi Keterangan, serta Unggah Berkas Foto Nota/Resi Pembelian asli (JPG/PNG/PDF maks 5MB).
  - **Edit & Hapus Pengeluaran**: Mengubah detail informasi belanja atau menghapus pencatatan pengeluaran yang salah input. Setiap perubahan otomatis memperbarui perhitungan saldo kas secara real-time.
- **Tujuan**: Menjaga transparansi pencatatan dana kas yang dibelanjakan dan menyertakan bukti resi fisik secara digital.

### 6.9 Fitur Manajemen Pengumuman Kelas (Create, Edit, Delete Announcement)
- **Penjelasan**: Modul publikasi informasi resmi kelas oleh bendahara. Bendahara dapat membuat pengumuman baru, menentukan kategori informasi, mengatur prioritas (*normal* atau *important* yang ditandai garis merah khusus), mengedit isi pesan, atau menghapus pengumuman lama.
- **Tujuan**: Menyampaikan instruksi pembayaran kas atau pengumuman kegiatan kelas secara formal kepada seluruh siswa.

### 6.10 Fitur Broadcast Notifikasi Kelas (Broadcast Notification)
- **Penjelasan**: Fitur pengiriman notifikasi masal instan ke seluruh anggota kelas yang aktif dalam satu kali klik. Bendahara memasukkan Judul dan Pesan Notifikasi, kemudian sistem akan menyebarkan notifikasi tersebut ke masing-masing akun siswa.
- **Tujuan**: Memberikan pengingat cepat (*fast reminder*) kepada seluruh siswa mengenai tagihan kas atau hal mendesak lainnya.

### 6.11 Fitur Kelola & Respons Laporan Masalah Siswa (Reports Management)
- **Penjelasan**: Panel khusus tempat bendahara meninjau laporan keluhan atau kendala yang dikirimkan oleh siswa. Bendahara dapat melihat judul laporan, pengirim, kategori, deskripsi masalah, ID transaksi terkait, dan mengunduh lampiran foto bukti dari siswa. Bendahara dapat memperbarui status laporan (`dikirim` -> `diproses` -> `selesai`) serta memberikan pesan balasan tanggapan (*response*) yang dapat dibaca langsung oleh siswa.
- **Tujuan**: Memastikan setiap kendala teknis atau pertanyaan siswa tertangani dengan baik dan terdokumentasi.

### 6.12 Fitur Ekspor Laporan Keuangan ke CSV (CSV Financial Export)
- **Penjelasan**: Fitur untuk mengunduh rekapitulasi data keuangan kelas ke dalam berkas Spreadsheet CSV yang kompatibel dengan Microsoft Excel, Google Sheets, atau LibreOffice Calc:
  - **Pilihan Jenis Laporan**:
    1. **Laporan Transaksi Kas (`type=transactions`)**: Berisi kolom Tanggal, Nama Siswa, NIS, Nama Periode, Frekuensi, Jumlah Nominal, Metode Pembayaran, Status, dan Tanggal Verifikasi (hanya mencakup transaksi berstatus lunas/`berhasil`).
    2. **Laporan Pengeluaran Kas (`type=expenses`)**: Berisi kolom Tanggal, Nama Pengeluaran, Kategori, Jumlah Nominal, Deskripsi, Dibuat Oleh, dan Status Bukti Nota.
  - **Filter Tanggal Custom**: Mendukung pencetakan berdasarkan rentang tanggal (`start_date` dan `end_date`).
  - **Keamanan & Format**: Dilengkapi UTF-8 BOM (`0xEF, 0xBB, 0xBF`) agar karakter Indonesia dan angka tercetak sempurna di Excel, serta diproteksi oleh *Rate Limiting Throttling* (maksimal 10 kali unduh per menit per bendahara).
- **Tujuan**: Memudahkan bendahara dalam membuat laporan cetak fisik (*hardcopy*) atau rekapitulasi pembukuan bulanan kepada Wali Kelas dan Sekolah.

---

## 7. Aturan Bisnis & Formulasi Keuangan

Untuk menjamin konsistensi dan integritas data keuangan pada aplikasi Smart Kas, sistem menerapkan kaidah aturan bisnis matematis sebagai berikut:

### 7.1 Formula Perhitungan Saldo Kas Kelas (Balance Formula)
$$\text{Saldo Kas Aktif} = \text{Total Pemasukan Disetujui} - \text{Total Pengeluaran Valid}$$

- **Total Pemasukan Disetujui**: Hanya menjumlahkan `total_amount` dari tabel `transactions` yang memiliki status `status = 'berhasil'` pada `class_id` terkait.
- **Transaksi Menunggu (`menunggu`) dan Ditolak (`ditolak`) DIKECUALIKAN** dari perhitungan pemasukan dan tidak menambah saldo kas kelas.
- **Total Pengeluaran Valid**: Menjumlahkan seluruh `amount` dari tabel `expenses` pada `class_id` terkait.

### 7.2 Perhitungan Tunggakan Kas (Arrears Formula)
- Suatu periode kas dianggap **LUNAS** bagi seorang siswa jika dan hanya jika terdapat transaksi berstatus `berhasil` yang mencakup `period_id` tersebut.
- Jika transaksi masih `menunggu` atau `ditolak`, periode tersebut **tetap dikategorikan sebagai BELUM LUNAS / TUNGGAKAN**.
- **Tunggakan Pribadi**: Penjumlahan nominal `amount` dari seluruh periode kas yang memiliki `start_date <= CURRENT_DATE` yang belum berstatus `lunas` bagi siswa tersebut.
- **Periode Masa Depan (`upcoming`)**: Periode yang memiliki `start_date > CURRENT_DATE` **dikecualikan** dari perhitungan tunggakan dan tagihan aktif.

### 7.3 Lifecycle Status Periode Kas
1. **`upcoming`**: Periode kas yang dibuat untuk masa mendatang (`start_date > CURRENT_DATE`). Belum muncul dalam daftar tagihan aktif.
2. **`active`**: Periode kas berjalan (`start_date <= CURRENT_DATE <= due_date`). Tagihan aktif berstatus `belum` bagi siswa yang belum membayar.
3. **`closed` / `terlambat`**: Periode kas yang telah melewati tanggal jatuh tempo (`CURRENT_DATE > due_date`). Status tagihan otomatis berubah menjadi `terlambat` bagi siswa yang belum melunasi.

### 7.4 Penanganan Integritas Berkas Upload (File Handling Security)
1. **Foto Profil**: Maksimal 2MB, ekstensi `.jpg`, `.jpeg`, `.png`, `.webp`. Disimpan dengan penamaan terenkripsi di folder `uploads/`.
2. **Bukti Pembayaran & Nota Pengeluaran**: Maksimal 5MB, ekstensi `.jpg`, `.jpeg`, `.png`, `.pdf`. File fisik tua otomatis dihapus dari server ketika terjadi penggantian bukti atau pembatalan transaksi (*Atomic Replacement*).
3. **Pemberian Akses File**: Seluruh berkas di folder `uploads/` tidak dibuka secara publik langsung, melainkan dikendalikan oleh script gateway PHP (`proof.php`, `receipt.php`, `avatar.php`, `report_attachment.php`) yang memverifikasi hak akses `class_id` dan sesi login pengguna.

---

## 8. Penutup

Dokumentasi ini mencakup seluruh spesifikasi teknis, arsitektur, basis data, API endpoint, serta rincian lengkap fitur **Smart Kas (KasKelas)** baik untuk peran **User (Siswa)** maupun **Bendahara**. Sistem ini dirancang secara rapi, aman, akuntabel, dan profesional untuk memberikan pengalaman terbaik dalam manajemen keuangan kas kelas digital.
