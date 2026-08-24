# KasKelas — Suite Pengujian Otomatis

Jaring pengaman aplikasi: **57 assertion** yang memverifikasi fitur inti,
keamanan (CSRF, isolasi kelas, role), dan alur pembayaran end-to-end.

## Cara pakai

1. Pastikan **MySQL XAMPP berjalan** (Start MySQL di XAMPP Control Panel).
2. Double-click `run-tests.bat` (atau jalankan dari terminal).
3. Baca hasil `PASS / FAIL` — selesai. Server sementara dimatikan otomatis.

## Isi

| Skrip | Cakupan |
|---|---|
| `smoke-final.php` | Auth, 5 endpoint kunci, logout→login cycle |
| `e2e-a1b.php` | Lifecycle status akun siswa (aktif→nonaktif→deny) |
| `e2e-b11.php` | Batch 11 lengkap: CRUD management + payment chain + security denial (40 assertion) |

## Catatan

- Tes membuat data ujinya sendiri (prefiks `B11`/`A1`) dan membersihkannya sendiri.
- Koneksi database dibaca dari `api/config.local.php` (sudah di-gitignore).
- Jalankan kapan saja setelah mengubah kode — jika ada yang rusak, laporan
  akan menyebut persis bagian mana yang FAIL.
