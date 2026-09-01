LAPORAN AUDIT TOTAL FINAL — Smart Kas (KasKelas)
RINGKASAN EKSEKUTIF
Audit menyeluruh (code reading baris-per-baris Lapis 1, pengujian fungsional Lapis 2, dan analisa keamanan adversarial Lapis 3) telah dilakukan secara komprehensif sebanyak 9 ronde berturut-turut terhadap seluruh komponen aplikasi Smart Kas (KasKelas).

Total Temuan Kumulatif (31 Temuan):
Bug Fungsional: 16 Temuan (3 High, 10 Medium, 3 Low)
Security: 2 Temuan (1 Medium, 1 Low)
Inefisiensi / DX: 10 Temuan (3 Medium, 7 Low)
Potensi Masalah Masa Depan: 3 Temuan (3 Low)
BAGIAN 1: DAFTAR MASALAH (LENGKAP 31 TEMUAN — URUT CRITICAL / HIGH → LOW)
[BUG-01] File import_students.php & export_report.php Tidak Ditemukan (Missing Endpoints)
Kategori: Bug Fungsional
Severity: High
Lokasi: api/import_students.php, api/export_report.php
Apa yang menyebabkan masalah ini: File api/import_students.php (fitur import CSV siswa) dan api/export_report.php (fitur download CSV laporan kas) yang terdaftar dalam daftar audit dan fungsionalitas aplikasi tidak ada di direktori api/.
Bagaimana ini terbukti bermasalah: Percobaan pengiriman request atau pemanggilan endpoint ini akan menghasilkan HTTP 404 Not Found.
Dampak: Fitur import anggota via CSV dan ekspor laporan kas ke CSV tidak dapat berjalan.
Rekomendasi arah perbaikan: Buat endpoint api/import_students.php dan api/export_report.php dengan validasi role bendahara, validasi CSRF, parsing CSV yang aman, dan penanganan transaksi database per baris.
[BUG2-01] Konten Halaman Bawah Terpotong/Ketutup oleh Bottom Navigation Bar di Mobile
Kategori: Bug Fungsional
Severity: High
Lokasi: app.css (Baris 20, Baris 242)
Apa yang menyebabkan masalah ini: Di app.css, elemen .container hanya memiliki padding-bottom: 32px (padding: 4px 16px 32px;). Sedangkan .bottom-nav di mobile (max-width: 899px) dikonfigurasi dengan position: fixed; bottom: 12px; height: ~68px;.
Bagaimana ini terbukti bermasalah: Pada layar HP (~375px), saat halaman di-scroll sampai ke paling bawah, konten paling bawah (seperti tombol submit, kartu terakhir, atau pagination) berada di posisi Y yang berhimpitan dengan .bottom-nav melayang.
Dampak: Elemen tombol aksi atau text di bagian paling bawah halaman di browser mobile tertutup oleh bottom navigation bar dan sulit/tidak bisa diklik.
Rekomendasi arah perbaikan: Tambahkan padding-bottom: calc(90px + env(safe-area-inset-bottom)) khusus untuk layar mobile (@media (max-width: 899px) .container).
[BUG7-01] Form "Laporkan Masalah" Meminta Kode Transaksi (TRX-...) Namun Backend Hanya Menerima Integer ID
Kategori: Bug Fungsional
Severity: High
Lokasi: app.js Baris 2000 (renderReportProblemPage), api/reports.php Baris 140–146
Apa yang menyebabkan masalah ini: Di frontend app.js, input form ID Transaksi diberi placeholder TRX-.... Pengguna akan memasukkan Kode Transaksi seperti TRX-6A8258EA8CDC8. Namun, pada api/reports.php, backend melakukan query SQL berdasarkan ID numerik integer SELECT id FROM transactions WHERE id = ? AND user_id = ?.
Bagaimana ini terbukti bermasalah: Saat siswa mengisikan kode transaksi TRX-... sesuai petunjuk placeholder, reports.php membandingkan string TRX-... dengan kolom primary key integer id, menghasilkan 0 baris dan memunculkan error "Transaksi tidak ditemukan" (404).
Dampak: Siswa sama sekali tidak dapat mengirimkan laporan masalah yang merujuk pada kode transaksi mereka.
Rekomendasi arah perbaikan: Ubah query SQL di api/reports.php agar menerima pencocokan berdasarkan id ATAU transaction_code (WHERE (id = ? OR transaction_code = ?) AND user_id = ?).
[BUG9-01] Kebocoran State In-Memory (state.students, state.transactions, dll) saat Pergantian Akun Tanpa Refresh
Kategori: Bug Fungsional
Severity: High
Lokasi: app.js Baris 772–775 (handleLogin), Baris 1860–1875 (confirmLogout)
Apa yang menyebabkan masalah ini: Saat pengguna melakukan logout atau switch user (misalnya dari akun Bendahara ke akun Siswa) tanpa merefresh halaman browser, fungsi handleLogin() & confirmLogout() hanya mereset currentUser, role, dan currentUserData. Array state.students, state.transactions, state.expenses, state.userReports, dan state.notifications tidak dikosongkan.
Bagaimana ini terbukti bermasalah: Jika bendahara logout dan siswa lain langsung login di tab/browser yang sama tanpa merefresh page, data sensitif kelas yang tersimpan di state memori JS masih berada di memori sebelum loadDataFromServer() selesai dimuat.
Dampak: Potensi kebocoran data sensitif antar-sesi pengguna pada perangkat yang digunakan bersama (shared device).
Rekomendasi arah perbaikan: Buat fungsi resetAppState() yang mengosongkan seluruh properti array dan objek di dalam state global setiap kali confirmLogout() atau handleLogin() dipanggil.
[SEC-01] Redundansi & Urutan Pengecekan Rate Limit Login pada api/login.php
Kategori: Security
Severity: Medium
Lokasi: api/login.php, Baris 24–35
Apa yang menyebabkan masalah ini: Pada api/login.php, pengecekan rate limit berbasis session ($_SESSION['login_attempts']) dilakukan sebelum pengecekan throttle persisten berbasis file (login_throttle_check).
Bagaimana ini terbukti bermasalah: Penyerang dapat meriset $_SESSION['login_attempts'] dengan cara menghapus cookie session di client.
Dampak: Percobaan login gagal yang dicatat di session dapat dilewati dengan mudah oleh penyerang dengan mengosongkan cookie.
Rekomendasi arah perbaikan: Hapus pengecekan throttle berbasis $_SESSION dan andalkan sepenuhnya mekanisme login_throttle_check persisten berbasis file yang sudah tersedia di helpers.php.
[BUG2-02] Batas Panjang Default GROUP_CONCAT pada MySQL Memotong period_label & period_ids
Kategori: Bug Fungsional
Severity: Medium
Lokasi: api/transactions.php (Baris 38-39 & Baris 87-88)
Apa yang menyebabkan masalah ini: Query pada api/transactions.php menggunakan GROUP_CONCAT(DISTINCT cp.name ORDER BY cp.id SEPARATOR ', ') AS period_label dan GROUP_CONCAT(DISTINCT ti.period_id ORDER BY ti.period_id SEPARATOR ',') AS period_ids. Di MySQL/MariaDB, variabel sistem group_concat_max_len secara default bernilai 1024 byte.
Bagaimana ini terbukti bermasalah: Jika siswa melakukan transaksi gabungan untuk banyak periode kas sekaligus (misalnya borongan 16+ minggu), string period_label atau period_ids yang dihasilkan query akan terpotong (truncated) di pertengahan string ID.
Dampak: Pemanggilan explode(',', $t['period_ids']) pada PHP akan menghasilkan ID periode terakhir yang terpotong/invalid, menyebabkan tampilan label periode di frontend rusak.
Rekomendasi arah perbaikan: Jalankan $pdo->exec("SET SESSION group_concat_max_len = 10000"); sebelum query transaksi dilaksanakan.
[BUG2-03] Kehilangan Focus & Posisi Kursor Saat Mengetik di Input Pencarian Realtime
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 236–243, Baris 1398, Baris 1466, Baris 1483, Baris 2039
Apa yang menyebabkan masalah ini: Pada input pencarian, event oninput memicu re-render seluruh halaman (renderPage()). Saat renderPage() dipanggil, seluruh DOM innerHTML diganti total dengan string HTML baru, menghancurkan elemen <input> yang sedang difokuskan pengguna, lalu mencoba mengembalikan fokus via focus().
Bagaimana ini terbukti bermasalah: Jika pengguna mengetik cepat, re-render DOM instan menghancurkan elemen input sebelum event input berikutnya selesai, menyebabkan input terasa lag, kursor melompat, atau karakter ketikan terlewat.
Dampak: Pengalaman pengguna (UX) saat melakukan pencarian anggota/pengeluaran/pengumuman terasa tidak mulus.
Rekomendasi arah perbaikan: Terapkan teknik debounce pada handler pencarian atau perbarui daftar elemen DOM secara spesifik (filtered list only).
[BUG3-01] Ketidakpresisian Floating Point IEEE 754 pada Akumulasi Total Tunggakan & Saldo PHP
Kategori: Bug Fungsional
Severity: Medium
Lokasi: api/bendahara_stats.php (Baris 29, Baris 98), api/transparansi.php (Baris 33)
Apa yang menyebabkan masalah ini: Pada api/bendahara_stats.php, akumulasi total tunggakan dilakukan dengan menjumlahkan nilai nominal tipe float di dalam loop PHP ($totalArrearsAmount += (float)$p['amount'];). Di PHP, pertambahan angka desimal bertipe float rentan terhadap masalah presisi biner IEEE 754.
Bagaimana ini terbukti bermasalah: Ketika menjumlahkan puluhan nominal kas desimal, nilai $totalArrearsAmount yang dihasilkan di JSON bisa berformat 30000.000000000004 alih-alih 30000.00.
Dampak: Nominal angka pada respon API JSON menjadi tidak rapi / mengandung desimal tidak presisi di frontend.
Rekomendasi arah perbaikan: Gunakan fungsi pembulatan presisi desimal round($totalArrearsAmount, 2) atau lakukan kalkulasi agregat nominal uang dengan query SQL SUM() langsung di MySQL.
[BUG3-02] Penumpukan Memory Tak Terbatas pada state.historyStack saat Navigasi Berulang
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 445–465 (navigateTo & goBack)
Apa yang menyebabkan masalah ini: Fungsi navigateTo(page, params) di app.js menambahkan halaman sebelumnya ke array state.historyStack. Array ini tidak pernah dibatasi jumlah maksimal elemennya dan tidak pernah dibersihkan kecuali saat user kembali ke halaman login.
Bagaimana ini terbukti bermasalah: Jika pengguna membuka aplikasi dalam waktu lama dan berpindah-pindah antar menu puluhan atau ratusan kali tanpa reload, state.historyStack akan terus membengkak menampung string histori navigasi lama.
Dampak: Konsumsi memori RAM browser meningkat dan fungsi goBack() menelusuri riwayat navigasi melingkar yang sangat panjang.
Rekomendasi arah perbaikan: Batasi panjang maksimum state.historyStack (misalnya maksimal 20-30 entri terakhir) atau bersihkan histori saat kembali ke Dashboard.
[BUG4-01] Risiko Double-Submit pada Form Edit Profil (saveEditProfile) dan Laporkan Masalah (submitReport)
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 1904–1952 (saveEditProfile), Baris 2005–2030 (submitReport)
Apa yang menyebabkan masalah ini: Pada fungsi saveEditProfile() dan submitReport(), tombol submit tidak ditiadakan (disabled = true) saat proses request HTTP async sedang berlangsung ke server.
Bagaimana ini terbukti bermasalah: Jika koneksi internet pengguna lambat, pengguna dapat mengeklik tombol "Simpan" atau "Kirim" beberapa kali berturut-turut, memicu multiple AJAX request paralel ke backend.
Dampak: Mengakibatkan pemicuan audit log ganda, pengiriman laporan duplikat di database, dan beban server.
Rekomendasi arah perbaikan: Set btn.disabled = true dan tampilkan indikator loading di awal fungsi, lalu kembalikan state tombol di blok finally.
[BUG4-02] Transaksi Parsial & State Mismatch saat Edit Profil + Ubah Password Berdampingan
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 1932–1950 (saveEditProfile)
Apa yang menyebabkan masalah ini: Fungsi saveEditProfile() melakukan dua panggilan API terpisah: update_profile.php dan change_password.php. Jika request pertama sukses tetapi request kedua gagal (misal password lama salah), email dan nomor HP pengguna sudah terlanjur diperbarui di database.
Bagaimana ini terbukti bermasalah: Pengguna mendapatkan pesan error "Gagal mengubah password", namun data email/HP mereka telah berubah secara permanen.
Dampak: Perubahan data tidak bersifat atomic (all-or-nothing), membingungkan pengguna.
Rekomendasi arah perbaikan: Gabungkan endpoint update profil dan ganti password ke dalam satu API atomic dengan DB transaction, atau pisahkan form edit profil dan ganti password secara independen.
[BUG4-03] Tidak Ada Pengecekan Unik Email/Phone pada update_profile.php
Kategori: Bug Fungsional
Severity: Medium
Lokasi: api/update_profile.php Baris 18–30
Apa yang menyebabkan masalah ini: Script update_profile.php hanya melakukan validasi format sintaks email (FILTER_VALIDATE_EMAIL) dan regex nomor HP, tetapi tidak memeriksa apakah email atau nomor HP tersebut sudah digunakan oleh user/siswa lain di database.
Bagaimana ini terbukti bermasalah: Dua siswa dapat mendaftarkan alamat email atau nomor HP yang sama persis di aplikasi.
Dampak: Ketidakunikan data kontak anggota kelas.
Rekomendasi arah perbaikan: Tambahkan query pengecekan keberadaan email/phone milik user lain (SELECT id FROM users WHERE email = ? AND id != ?).
[BUG5-01] Notifikasi Lokal addNotification() Hilang Saat Refresh karena Tidak Disinkronkan ke Database
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 249–289 (addNotification)
Apa yang menyebabkan masalah ini: Fungsi addNotification(type, data) di app.js membuat objek notifikasi lokal di memori JS sementara. Fungsi ini tidak pernah mengirim request POST ke backend notifications.php untuk menyimpan notifikasi tersebut ke tabel database notifications.
Bagaimana ini terbukti bermasalah: Saat pengguna melakukan refresh halaman atau memuat ulang data via loadDataFromServer(), seluruh notifikasi lokal terhapus dan digantikan oleh data dari API notifications.php.
Dampak: Notifikasi lokal yang terbuat di client tidak persisten antar-sesi atau refresh.
Rekomendasi arah perbaikan: Andalkan pembuatan notifikasi otomatis dari backend PHP (seperti di submit_payment.php, verify_payment.php), atau tambahkan sync POST ke server.
[BUG6-01] handleNotificationClick Memanggil renderPage() Berulang saat Notifikasi Tidak Memiliki Rujukan Spesifik
Kategori: Bug Fungsional
Severity: Medium
Lokasi: app.js Baris 1552–1572 (handleNotificationClick)
Apa yang menyebabkan masalah ini: Pada fungsi handleNotificationClick(id), jika tipe notifikasi adalah notifikasi umum/info (reference_type kosong atau broadcast), pemanggilan renderPage() dilakukan secara langsung di cabang else.
Bagaimana ini terbukti bermasalah: Jika notifikasi diklik dari dalam modal atau halaman yang sedang melakukan re-render, pemanggilan renderPage() ganda menyebabkan kedipan layar (screen flickering) dan pemuatan ulang seluruh DOM.
Dampak: Layar berkedip dan memicu re-fetch/re-render halaman yang tidak perlu.
Rekomendasi arah perbaikan: Hapus cabang else { renderPage(); } karena fungsi markNotificationRead() di dalamnya sudah memperbarui UI badge dan state secara lokal.
[BUG8-01] Inkonsistensi Format Ikon Aktivitas (Emoji vs Helper SVG) Menyebabkan Tampilan Timeline Rusak
Kategori: Bug Fungsional
Severity: Medium
Lokasi: api/submit_payment.php Baris 108, api/upload_proof.php Baris 140, app.js Baris 1588 (renderAktivitasPage)
Apa yang menyebabkan masalah ini: Pada script submit_payment.php dan upload_proof.php, aktivitas dicatat ke tabel activities dengan nilai icon berupa karakter emoji UTF-8 ('💳', '📤'). Sedangkan di frontend app.js, di renderAktivitasPage(), string a.icon dari database di-render langsung secara mentah.
Bagaimana ini terbukti bermasalah: Penggunaan karakter emoji UTF-8 secara mentah menghasilkan ukuran dan font-family yang tidak seragam dengan sistem SVG vector Aurora UI (ic(...)), sehingga tampilan timeline aktivitas terlihat tidak konsisten pada beberapa sistem operasi tanpa font emoji bawaan.
Dampak: Tampilan halaman Aktivitas Saya kurang konsisten secara visual.
Rekomendasi arah perbaikan: Simpan nama alias ikon abstrak (misal: credit-card, upload) pada kolom activities.icon alih-alih karakter emoji UTF-8 mentah.
[EFF-01] Inkonsistensi & Mismatch Sistem Ikon Vector SVG antara getIcon() dan Symbol index.html
Kategori: Inefisiensi / DX
Severity: Medium
Lokasi: app.js (Baris 38–77, iconsSvg dictionary & getIcon()), index.html (Baris 16–57, <symbol id="i-...">)
Apa yang menyebabkan masalah ini: app.js menggunakan dua sistem helper ikon sekaligus: ic(name) (merujuk ke <symbol id="i-${name}"> di index.html) dan getIcon(name) (merujuk ke dictionary JavaScript iconsSvg).
Bagaimana ini terbukti bermasalah: Beberapa nama ikon yang dipanggil getIcon(...) memanggil string SVG inline terpisah, sedangkan di index.html sudah ada SVG symbol terkait.
Dampak: Ukuran bundle JS membengkak dan risiko ikon tidak tampil (fallback ke home).
Rekomendasi arah perbaikan: Unifikasi helper ikon agar seluruh komponen UI di app.js menggunakan satu fungsi helper standar.
[EFF-02] Potensi Inefisiensi Query Arrears & Kurangnya Index Spesifik pada Database
Kategori: Inefisiensi / DX
Severity: Medium
Lokasi: kaskelas.sql, api/bendahara_stats.php (Baris 54–105)
Apa yang menyebabkan masalah ini: Pada api/bendahara_stats.php, query penghitungan tunggakan memfilter berdasarkan class_id dan start_date <= ?. Saat data periode bertambah banyak, iterasi dua tingkat di PHP (foreach ($studentIds as $sId) dan foreach ($periods as $p)) akan meningkatkan penggunaan memori server.
Bagaimana ini terbukti bermasalah: Proses penghitungan tunggakan dilakukan di memori PHP alih-alih memanfaatkan kemampuan agregasi database.
Dampak: Response time bendahara_stats.php akan melambat secara eksponensial seiring bertambahnya jumlah siswa dan periode.
Rekomendasi arah perbaikan: Optimalkan query penghitungan tunggakan menggunakan SQL NOT EXISTS / LEFT JOIN agregat langsung di MySQL.
[BUG-02] Filter Tahun Default pada Transparansi Kas
Kategori: Bug Fungsional
Severity: Low
Lokasi: app.js (renderTransparansiPage), api/transparansi.php
Apa yang menyebabkan masalah ini: Pada api/transparansi.php, jika parameter year tidak dikirim, API mengembalikan total gabungan seluruh tahun. Namun di app.js, state.transparansiYear diinisialisasi dengan new Date().getFullYear().
Bagaimana ini terbukti bermasalah: Jika kelas memiliki data transaksi dari tahun sebelumnya (misal 2025), data tersebut tidak muncul di grafik awal sampai pengguna mengubah dropdown tahun secara manual.
Dampak: Ringkasan kas di awal hanya memperhitungkan tahun berjalan.
Rekomendasi arah perbaikan: Sesuaikan inisialisasi state.transparansiYear agar mengikuti opsi tahun default dari response backend atau sediakan pilihan "Semua Tahun".
[BUG-03] Nomor Kontak Bantuan Ter-hardcode di Frontend
Kategori: Bug Fungsional
Severity: Low
Lokasi: app.js (renderBantuanPage)
Apa yang menyebabkan masalah ini: Pada halaman Bantuan (renderBantuanPage), nomor HP Bendahara (0812-3456-7890) dan Wali Kelas (0812-9876-5432) ditulis secara hardcoded di template JS.
Bagaimana ini terbukti bermasalah: Nomor kontak tidak terhubung dengan data pengguna di database (users.phone).
Dampak: Perubahan nomor HP bendahara di database/profil tidak akan memperbarui nomor kontak di halaman Bantuan.
Rekomendasi arah perbaikan: Ambil nomor HP bendahara secara dinamis dari API students.php atau current_user.php/cash_settings.php.
[EFF-03] Pemuatan Seluruh Data Sekaligus (loadDataFromServer) Saat Inisialisasi Aplikasi
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 269–378 (loadDataFromServer)
Apa yang menyebabkan masalah ini: Fungsi loadDataFromServer() memanggil 11 API endpoint secara paralel menggunakan Promise.all saat login atau refresh, mengambil seluruh halaman data dari server tanpa batasan waktu/tahun.
Bagaimana ini terbukti bermasalah: Untuk skala 1 kelas dengan puluhan siswa selama 1-2 tahun, jumlah transaksi dan aktivitas akan mencapai ribuan baris, menyebabkan beban jaringan awal yang tinggi.
Dampak: Aplikasi terasa lambat saat pertama kali dibuka jika riwayat transaksi sudah menumpuk banyak.
Rekomendasi arah perbaikan: Terapkan pemuatan data secara on-demand (lazy loading) per halaman/tab yang sedang dibuka.
[SEC-02] Potensi Paparan Credential Seed jika Constant ALLOW_SEED Diaktifkan
Kategori: Security
Severity: Low
Lokasi: api/seed.php, api/seed_periods.php
Apa yang menyebabkan masalah ini: File api/seed.php dan api/seed_periods.php dilindungi oleh penanda if (!defined('ALLOW_SEED') || ALLOW_SEED !== true) die('Akses ditolak');. Di dalam seed.php, credential default terdefinisi secara hardcoded.
Bagaimana ini terbukti bermasalah: Jika environment staging/production lupa menonaktifkan konstanta ALLOW_SEED, script seed dapat dieksekusi dari luar dan membuat akun dengan password default yang mudah ditebak.
Dampak: Potensi pengambilalihan akun atau resetting data testing jika file seed terakses di production.
Rekomendasi arah perbaikan: Hapus file seed dari environment production atau pastikan file seed hanya bisa dijalankan melalui PHP CLI.
[EFF2-01] Duplikasi Fetch dan State Mismatch antara loadDashboardData() dan loadDataFromServer()
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 380–435 (loadDashboardData), Baris 269–378 (loadDataFromServer)
Apa yang menyebabkan masalah ini: Fungsi loadDashboardData() mendefinisikan ulang logika transformasi transaksi dan periode kas secara terpisah dari loadDataFromServer() tanpa memanggil helper normalizeTransaction(t).
Bagaimana ini terbukti bermasalah: Mapping properti transaksi dilakukan secara manual yang sedikit berbeda (misalnya penanganan struktur proof).
Dampak: Inkonsistensi struktur objek transaksi di state.transactions.
Rekomendasi arah perbaikan: Gunakan fungsi transformer tunggal normalizeTransaction() di seluruh fungsi pemuatan data.
[POT2-01] Kurangnya Format Sanitasi & Validasi Panjang Karakter pada Input Teks Panjang
Kategori: Potensi Masalah Masa Depan
Severity: Low
Lokasi: api/expenses.php, api/reports.php, api/announcements.php
Apa yang menyebabkan masalah ini: Kolom database seperti expenses.name (VARCHAR(255)), announcements.title (VARCHAR(255)), reports.title (VARCHAR(255)) belum memiliki validasi batas panjang karakter (mb_strlen) di layer PHP.
Bagaimana ini terbukti bermasalah: Jika pengguna memasukkan string judul melebihi 255 karakter, MySQL dalam mode strict akan melempar exception Data too long for column.
Dampak: Response error 500 generik dari server ketika input teks melebihi kapasitas kolom DB.
Rekomendasi arah perbaikan: Tambahkan validasi panjang maksimum string di layer PHP (mb_strlen($title) > 255).
[EFF3-01] Penumpukan Event Listener pada Overwrite document.getElementById('bsOverlay').onclick
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 98 (showBottomSheet), Baris 100 (showModal)
Apa yang menyebabkan masalah ini: Fungsi showBottomSheet(content) menimpa properti handler event click pada elemen overlay dengan menetapkan handler function anonim baru secara berulang setiap kali bottom sheet/modal dibuka.
Bagaimana ini terbukti bermasalah: Pembuatan fungsi anonim baru secara berulang memicu pengumpulan sampah (garbage collection) DOM yang tidak perlu.
Dampak: Inefisiensi alokasi memori kecil saat modal/bottom sheet sering dibuka-tutup.
Rekomendasi arah perbaikan: Daftarkan event listener click pada overlay secara statis satu kali saja saat aplikasi diinisialisasi.
[POT3-01] Format Waktu MySQL DATETIME vs ISO 8601 pada String Date Parsing JS
Kategori: Potensi Masalah Masa Depan
Severity: Low
Lokasi: app.js Baris 118–122 (normalizeTransaction), Baris 85 (formatDate)
Apa yang menyebabkan masalah ini: Backend MySQL mengembalikan string tanggal berformat YYYY-MM-DD HH:MM:SS. Di app.js, string ini di-split dengan karakter 'T': createdStr.split('T')[0].
Bagaimana ini terbukti bermasalah: Jika MySQL mengembalikan format spasi standar 2026-08-17 04:03:00 (tanpa 'T'), pemanggilan createdStr.split('T')[0] akan mengembalikan seluruh string, dan pada beberapa versi browser Safari/iOS lawas memicu Invalid Date.
Dampak: Potensi tampilan Invalid Date pada browser Safari/iOS tertentu.
Rekomendasi arah perbaikan: Ganti karakter spasi dengan 'T' (createdStr.replace(' ', 'T')) atau ekstrak 10 karakter pertama dengan createdStr.substring(0, 10).
[BUG4-04] Modal & Bottom Sheet Tidak Dapat Ditutup Menggunakan Tombol Keyboard (ESC)
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 100–105 (showModal, showBottomSheet)
Apa yang menyebabkan masalah ini: Di app.js, modal dan bottom sheet hanya dapat ditutup dengan mengeklik area overlay luar atau tombol "Batal". Tidak ada handler KeyboardEvent (keyup/keydown) untuk tombol Escape (ESC).
Bagaimana ini terbukti bermasalah: Pengguna desktop/laptop yang menekan tombol Escape tidak dapat menutup modal/bottom sheet secara cepat.
Dampak: Pengalaman navigasi desktop/aksesibilitas keyboard kurang optimal.
Rekomendasi arah perbaikan: Tambahkan global keydown event listener di initApp() yang memanggil closeModal() dan closeBottomSheet() saat event.key === 'Escape'.
[EFF5-01] Tidak Ada Event Listener change pada matchMedia saat Menggunakan Tema System
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 1968–1975 (setTheme), Baris 2701–2710 (initApp)
Apa yang menyebabkan masalah ini: Saat pengguna memilih opsi tema "System", fungsi hanya mengecek kondisi skema warna sistem OS saat itu via window.matchMedia('(prefers-color-scheme: dark)').matches. Tidak ada listener addEventListener('change', ...) pada objek matchMedia.
Bagaimana ini terbukti bermasalah: Jika mode sistem OS berubah (misal dari siang ke malam), tampilan aplikasi tidak berganti mode secara otomatis kecuali pengguna melakukan refresh.
Dampak: Perubahan mode terang/gelap otomatis OS tidak terefleksi secara realtime.
Rekomendasi arah perbaikan: Daftarkan listener window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => ...).
[EFF6-01] Penanganan Timezone Offset pada Perbandingan Tanggal Client vs Server
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 118 (normalizeTransaction), api/submit_payment.php Baris 52
Apa yang menyebabkan masalah ini: Di frontend app.js, string tanggal created_at dari server dikonversi menjadi ISOString().split('T')[0] yang menggunakan format UTC (Z), sedangkan server MySQL dan PHP berjalan pada timezone lokal server (WIB/UTC+7).
Bagaimana ini terbukti bermasalah: Transaksi yang dikirim pada pukul 00:00–06:59 WIB terhitung sebagai tanggal H-1 di UTC pada ISOString().split('T')[0].
Dampak: Tanggal transaksi pada kartu riwayat/dashboard terkadang berbeda 1 hari (H-1) dengan tanggal asli saat transaksi dibuat.
Rekomendasi arah perbaikan: Gunakan tanggal lokal browser (d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')).
[EFF7-01] Perbandingan Tipe Data Integer vs String pada Handlers Notifikasi (handleNotificationClick)
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 1552 (handleNotificationClick), Baris 1545 (markNotificationRead)
Apa yang menyebabkan masalah ini: Fungsi handleNotificationClick(id) menerima parameter id yang terkadang bertipe string (dari HTML attribute onclick) atau number. Di dalamnya digunakan perbandingan ketat ===: const notif = state.notifications.find(n => n.id === id);.
Bagaimana ini terbukti bermasalah: Jika id dikirim sebagai string "1", n.id === "1" akan mengevaluasi false, menyebabkan notif bernilai undefined.
Dampak: Klik pada notifikasi tertentu tidak merespons jika tipe data ID tidak sama (string vs number).
Rekomendasi arah perbaikan: Gunakan pemastian tipe data integer n.id == id atau paksa konversi Number(id).
[EFF8-01] Default Fallback Nilai icon pada app.js Menggunakan Emoji 📄 alih-alih Vector Icon
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: app.js Baris 336 (loadDataFromServer), Baris 1588 (renderAktivitasPage)
Apa yang menyebabkan masalah ini: Pada loadDataFromServer() di app.js, mapping data aktivitas memiliki fallback emoji hardcoded: icon: a.icon || '📄'.
Bagaimana ini terbukti bermasalah: Jika record aktivitas baru dimasukkan tanpa mengisi kolom icon (NULL), UI menampilkan emoji dokumen 📄 alih-alih ikon SVG vector i-doc.
Dampak: Sisa-sisa emoji acak yang tidak sesuai dengan pedoman desain UI tanpa emoji KasKelas.
Rekomendasi arah perbaikan: Ubah fallback menjadi ikon SVG standar i-doc.
[BUG9-02] Handling Error upload_max_filesize PHP Mengembalikan HTML 500 alih-alih JSON Error
Kategori: Inefisiensi / DX
Severity: Low
Lokasi: api/upload_proof.php Baris 30, api/upload_profile_photo.php Baris 11, api/expenses.php Baris 85
Apa yang menyebabkan masalah ini: Script PHP upload memeriksa if ($file['size'] > 5 * 1024 * 1024). Jika file yang diupload melebihi batas upload_max_filesize atau post_max_size pada php.ini, array $_FILES['proof']['error'] bernilai UPLOAD_ERR_INI_SIZE atau $_FILES menjadi kosong.
Bagaimana ini terbukti bermasalah: Pemeriksaan $file['size'] tidak tereksekusi dengan benar karena $_FILES['proof'] tidak berisi data file valid, sehingga apiFetch() menerima string kosong/HTML error yang memicu exception "Respons server tidak valid".
Dampak: Pesan error di frontend menjadi kurang informatif.
Rekomendasi arah perbaikan: Periksa $_FILES['file']['error'] !== UPLOAD_ERR_OK secara rinci sebelum mengecek ['size'].
BAGIAN 2: BAGIAN YANG SUDAH BENAR
Berikut adalah komponen dan logika yang telah diperiksa tuntas dan terkonfirmasi bekerja dengan benar dan aman:

SQL Injection Protection:

Seluruh query SQL di api/ (seperti login.php, transactions.php, submit_payment.php, verify_payment.php, expenses.php, students.php, periods.php, dll) telah menggunakan PDO Prepared Statements dan parameter binding (? atau :param). Tidak ada penggabungan string (concatenation) pada input user.
Isolasi Data Multi-Class & IDOR Protection:

Semua query backend membatasi hak akses berdasarkan class_id dari session user ($_SESSION['user_id'] / $_SESSION['role']).
Bendahara hanya dapat melihat, memverifikasi, dan mengelola transaksi, anggota, pengeluaran, serta pengumuman kelasnya sendiri.
Endpoint terproteksi seperti proof.php, avatar.php, receipt.php, dan report_attachment.php memverifikasi kepemilikan file atau keanggotaan kelas sebelum menyajikan file.
Keamanan File Upload:

upload_proof.php, upload_profile_photo.php, expenses.php, dan reports.php melakukan validasi server-side MIME type menggunakan finfo, pengecekan ekstensi file whitelist (jpg, jpeg, png, pdf, webp), batasan ukuran file (2MB/5MB), serta pemeriksaan byte awal file untuk mencegah script upload.
File disimpan di luar document root publik dengan nama acak (random_bytes), dan disajikan secara aman via proxy script (proof.php, avatar.php, receipt.php).
Penghapusan file fisik lama dilakukan secara aman setelah transaksi PDO berhasil diajukan (commit()).
Integritas Logika Keuangan & Locking Transaction:

submit_payment.php dan verify_payment.php menggunakan transaksi PDO dengan locking FOR UPDATE untuk mencegah race condition (pembayaran ganda pada periode yang sama).
Nominal pembayaran selalu dihitung ulang di server dari tabel cash_periods, tidak pernah mempercayai input nominal dari client.
Perhitungan saldo: Ending Balance = Opening Balance (0.00) + Approved Income (status = 'berhasil') - Approved Expenses. Transaksi pending dan rejected tidak dihitung sebagai saldo/pemasukan.
Proteksi CSRF & Rate Limiting:

Endpoint POST/PUT/DELETE memanggil require_csrf() yang membandingkan token CSRF menggunakan hash_equals() secara timing-safe.
helpers.php memiliki pembatas laju login persisten berbasis file (login_throttle_check & login_throttle_fail) yang tidak dapat dilewati hanya dengan menghapus cookie browser.
Keamanan Sesi & Password:

Password disimpan menggunakan password_hash() (bcrypt) dan diverifikasi dengan password_verify().
password_hash tidak pernah disertakan dalam response JSON API.
Cookie session dikonfigurasi dengan flag HttpOnly, SameSite=Lax, dan regenerasi session ID (session_regenerate_id(true)) saat login sukses untuk mencegah session fixation.
UI & Data Attributes:

index.html dan app.js telah dilengkapi dengan attribute data-testid untuk pengujian otomatis.
Pengaturan tema (light/dark mode) tersimpan dengan baik dan responsif.
BAGIAN 3: CATATAN METODOLOGI
Checklist File yang Telah Dibaca Tuntas (Review Baris-per-Baris / Lapis 1):
 api/activities.php
 api/announcements.php
 api/avatar.php
 api/bendahara_stats.php
 api/cash_settings.php
 api/change_password.php
 api/config.php
 api/csrf.php
 api/current_user.php
 api/expenses.php
 api/helpers.php
 api/login.php
 api/logout.php
 api/notifications.php
 api/periods.php
 api/proof.php
 api/receipt.php
 api/report_attachment.php
 api/reports.php
 api/seed.php
 api/seed_periods.php
 api/students.php
 api/submit_payment.php
 api/transactions.php
 api/transparansi.php
 api/update_profile.php
 api/upload_profile_photo.php
 api/upload_proof.php
 api/user_settings.php
 api/verify_payment.php
 app.js (~3200+ baris)
 app.css
 index.html
 kaskelas.sql