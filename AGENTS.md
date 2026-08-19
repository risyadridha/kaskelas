# KasKelas — AGENTS.md

## 1. PROJECT

Nama:
KasKelas

Stack:
- HTML
- CSS
- JavaScript
- PHP
- MySQL/MariaDB
- PDO
- PHP Session
- XAMPP

Arsitektur utama:

Frontend
→ PHP API
→ PHP Session
→ PDO
→ MySQL

Project mendukung/mengarah ke arsitektur multi-class berdasarkan `class_id`.

---

## 2. ATURAN UTAMA

WAJIB:

- Jangan rewrite seluruh project.
- Jangan membuat ulang project dari nol.
- Jangan menghapus fitur existing tanpa instruksi eksplisit.
- Pertahankan UI dan struktur yang sudah ada kecuali perubahan diperlukan untuk memperbaiki bug.
- Backend adalah sumber kebenaran.
- Jangan menjadikan state JavaScript sebagai sumber kebenaran untuk data database.
- Semua authorization harus dilakukan di backend.
- Jangan percaya `user_id`, `class_id`, role, atau ownership yang dikirim frontend.
- Identity user harus berasal dari PHP session.
- Gunakan PDO prepared statements.
- Gunakan database transaction untuk operasi keuangan yang harus atomic.
- Semua API harus memberikan response JSON yang konsisten.
- Jangan mengirim stack trace, SQL error mentah, password, credential, atau secret ke frontend.
- Jangan menghapus foreign key / unique constraint tanpa alasan dan migration yang jelas.
- Jangan melakukan operasi database destruktif tanpa backup/migration plan.
- Jangan mengubah schema database secara sembarangan.

---

## 3. MULTI-CLASS

Project harus aman untuk banyak kelas.

Semua data kelas harus terisolasi berdasarkan `class_id`.

Minimal periksa hubungan:

- users
- transactions
- transaction_items
- payment_proofs
- cash_periods
- cash_settings
- expenses
- announcements
- notifications
- reports
- students
- audit_logs

Bendahara hanya boleh mengelola data dari kelasnya sendiri.

Siswa hanya boleh melihat/mengubah data yang memang menjadi haknya.

---

## 4. PAYMENT & FINANCIAL RULES

Backend adalah sumber kebenaran untuk:

- nominal pembayaran
- status pembayaran
- periode
- saldo
- tunggakan
- ownership transaksi
- approval/rejection
- class ownership

Pending tidak dihitung sebagai income.

Rejected tidak dihitung sebagai income.

Approved/berhasil baru dihitung sebagai pemasukan.

Jangan menggunakan nominal hardcoded sebagai sumber utama jika nominal sudah tersedia di database.

---

## 5. SECURITY

Selalu cek:

- authentication
- authorization
- session
- CSRF
- CORS
- IDOR
- XSS
- SQL injection
- file upload security
- credential exposure
- error disclosure

Untuk file bukti pembayaran:
- jangan memberikan direct filesystem path sebagai akses publik;
- akses harus melalui endpoint yang memeriksa permission;
- siswa hanya boleh melihat proof miliknya;
- bendahara hanya boleh melihat proof dari class-nya.

---

## 6. CODE SCOPE

Setiap task memiliki scope sendiri.

Jika task adalah:

P0-01

maka:
- fokus P0-01;
- jangan memperbaiki P1/P2/P3/P4 kecuali perubahan tersebut mutlak diperlukan agar P0-01 bekerja;
- jangan melakukan refactor besar.

Jika menemukan bug lain:
- catat;
- jangan memperbaikinya kecuali diminta.

---

## 7. FILE READING / CONTEXT

Untuk menghemat context:

- Baca hanya file yang relevan dengan task.
- Jangan scan seluruh project pada setiap task.
- Jangan mengulang penjelasan audit.
- Gunakan `AUDIT.md` sebagai daftar temuan.
- Gunakan `TASKS.md` sebagai urutan pekerjaan.
- Jangan meminta user mengirim ulang isi file yang sudah ada di workspace.

Sebelum coding:
1. identifikasi file yang relevan;
2. baca bagian yang dibutuhkan;
3. pahami dependency;
4. baru ubah kode.

---

## 8. IMPLEMENTATION RULE

Untuk setiap perubahan:

1. Cari root cause.
2. Ubah kode seminimal mungkin.
3. Pertahankan kompatibilitas dengan kode existing.
4. Pastikan frontend ↔ PHP ↔ database tetap konsisten.
5. Jalankan test yang relevan.
6. Periksa regression terhadap flow terkait.

Jangan memperbaiki error dengan:
- menyembunyikan error;
- mematikan validasi;
- membuat fallback palsu;
- mengubah status database secara asal;
- menghapus check keamanan.

---

## 9. DATABASE RULE

Sebelum schema berubah:

- jelaskan alasan;
- buat migration/ALTER yang diperlukan;
- jangan DROP DATABASE;
- jangan DELETE seluruh tabel;
- jangan reset database production.

Data testing harus tetap konsisten dengan satu `class_id` yang benar.

---

## 10. OUTPUT RULE

Output final harus SANGAT RINGKAS.

Format:

STATUS: PASS / FAIL / BLOCKED

FILES CHANGED:
- file
- file

TEST:
- test → PASS/FAIL

REMAINING:
- hanya masalah yang belum selesai

Jangan menulis ulang seluruh audit.

Jangan menjelaskan project dari awal.

Jangan memberikan tutorial panjang kecuali diminta.

---

## 11. DEFINITION OF DONE

Task dianggap selesai hanya jika:

- root cause sudah diperbaiki;
- backend validasi benar;
- database konsisten;
- frontend menggunakan response yang benar;
- error handling benar;
- test yang relevan PASS;
- tidak merusak fitur terkait.

"Button terlihat bekerja" ≠ selesai.

"API merespons 200" ≠ selesai.

Fitur harus bekerja end-to-end.

---

## 12. SOURCE OF TRUTH

Untuk daftar bug dan prioritas:
gunakan `AUDIT.md`.

Untuk urutan pekerjaan:
gunakan `TASKS.md`.

Untuk aturan kerja:
gunakan file ini (`AGENTS.md`).