# KasKelas — TASKS.md

## RULES

- Kerjakan batch dari atas ke bawah.
- Hanya kerjakan batch yang sedang aktif.
- Jangan membaca/menyentuh task berikutnya kecuali diperlukan.
- Jangan mengerjakan bug di luar batch aktif.
- Setelah batch selesai, test dan update status.
- Jangan menulis ulang audit.
- Output singkat.

Status:
- [ ] belum
- [~] proses
- [x] selesai
- [!] blocked


# BATCH 1 — P0 SECURITY & AUTHORIZATION

- [x] B1-01 Cross-class transaction isolation
  - `api/transactions.php`
  - Bendahara hanya melihat transaksi class sendiri.

- [x] B1-02 Cross-class verification protection
  - `api/verify_payment.php`
  - Bendahara hanya boleh verify transaksi class sendiri.

- [x] B1-03 CSRF + CORS
  - Batasi origin.
  - Terapkan CSRF pada semua mutating request.

- [x] B1-04 Production credential protection
  - Pisahkan database credential dari source.
  - Hapus credential demo dari production.

- [x] B1-05 Report transaction ownership
  - `api/reports.php`
  - Transaction yang direferensikan harus milik user.

- [x] B1-06 Protected proof access
  - Jangan expose direct proof path.
  - Buat akses proof terproteksi berdasarkan ownership/class.


# BATCH 2 — P1 PAYMENT INTEGRITY

- [x] B2-01 Duplicate payment + race condition
  - Lindungi user + period dari pembayaran ganda.
  - Gunakan transaction/locking/constraint yang tepat.

- [x] B2-02 Concurrent verification
  - Hanya satu request yang boleh mengubah status `menunggu`.

- [x] B2-03 Atomic proof upload
  - File + DB record + notification/activity harus konsisten.
  - Cleanup file jika DB gagal.

- [x] B2-04 Rejected payment resubmit
  - Implementasikan flow upload ulang dengan audit trail yang benar.

- [x] B2-05 API contract & base URL
  - Pisahkan konfigurasi API.
  - Konsistenkan response error JSON.
  - Jangan expose exception detail.


# BATCH 3 — P2 DATA & HIGH PRIORITY

- [x] B3-01 Notification read
  - Individual read + ownership.

- [x] B3-02 Announcement read
  - Persist `announcement_reads`.

- [x] B3-03 XSS protection
  - Escape seluruh data server sebelum masuk HTML.
  - Fokus pada nama, pengumuman, expense, rejection reason, notification, filename.

- [x] B3-04 Login/session hardening
  - Rate limiting.
  - Secure cookie.
  - Logout cookie invalidation.

- [x] B3-05 Query optimization
  - N+1 students.
  - Correlated transaction queries.
  - Ganti SELECT * yang jelas tidak diperlukan.

- [x] B3-06 Pagination
  - Prioritas: transactions, notifications, expenses, reports.
  - Tambahkan sisanya bila memang diperlukan.


# BATCH 4 — DATABASE CONSISTENCY

- [x] B4-01 Bersihkan duplicate class.
- [x] B4-02 Konsistenkan class_id seluruh seed data.
- [x] B4-03 Pastikan user, period, expense, announcement berada pada class yang benar.
- [x] B4-04 Pastikan transaction owner class dan period class konsisten.
- [x] B4-05 Perbaiki seed agar tidak memakai `LIMIT 1`.
- [x] B4-06 Pastikan user_settings seed sesuai user.


# BATCH 5 — FINANCIAL LOGIC

- [x] B5-01 Database menjadi source of truth untuk nominal.
- [x] B5-02 Pending tidak dihitung income.
- [x] B5-03 Rejected tidak dihitung income.
- [x] B5-04 Approved dihitung income.
- [x] B5-05 Isi `payment_date`.
- [x] B5-06 Samakan perhitungan saldo frontend/backend.
- [x] B5-07 Tetapkan opening balance secara eksplisit.


# BATCH 6 — API CONTRACT

- [x] B6-01 Tetapkan response transaction resmi.
- [x] B6-02 Konsistenkan `total_amount`.
- [x] B6-03 Konsistenkan `period_ids` / `period_label`.
- [x] B6-04 `proof` selalu object atau null.
- [x] B6-05 Return informasi class/user yang memang dibutuhkan frontend.
- [x] B6-06 Hilangkan legacy mapping yang tidak diperlukan.


# BATCH 7 — BENDAHARA

- [x] B7-01 CRUD periode/tagihan.
- [x] B7-02 Update cash settings.
- [x] B7-03 Edit/delete pengeluaran.
- [x] B7-04 Edit/delete pengumuman.
- [x] B7-05 Kelola anggota.
- [x] B7-06 Protected proof view/download.
- [x] B7-07 Kelola/respons laporan.
- [x] B7-08 Statistik bendahara.
- [x] B7-09 Audit log.
- [x] B7-10 Notification broadcast per class.


# BATCH 8 — FRONTEND CLEANUP

- [x] B8-01 Hilangkan hardcoded weekly/monthly amount.
- [x] B8-02 Hilangkan hardcoded frequency.
- [x] B8-03 Hilangkan hardcoded year/date.
- [x] B8-04 Hilangkan dummy production data.
- [x] B8-05 Hapus duplicate `loadNotifications()`.
- [x] B8-06 Hapus debug console.log.
- [x] B8-07 Perbaiki duplicate CSS.
- [x] B8-08 Tambahkan test IDs pada komponen penting.


# BATCH 9 — SECURITY FINAL

- [x] B9-01 Recheck authentication.
- [x] B9-02 Recheck authorization.
- [x] B9-03 Recheck cross-class isolation.
- [x] B9-04 Recheck CSRF.
- [x] B9-05 Recheck CORS.
- [x] B9-06 Recheck XSS.
- [x] B9-07 Recheck proof access.
- [x] B9-08 Recheck upload security.
- [x] B9-09 Recheck credential exposure.
- [x] B9-10 Recheck error disclosure.
- [x] B9-11 Remove/lock seed endpoints.


# BATCH 10 — FINAL TEST

- [x] Siswa A → data sendiri PASS
- [x] Siswa A → data kelas B DENY
- [x] Bendahara A → transaksi kelas A PASS
- [x] Bendahara A → transaksi kelas B DENY
- [x] Bendahara A → verify transaksi kelas B DENY
- [x] Siswa → verify payment DENY
- [x] Double payment → hanya satu valid
- [x] Double verification → hanya satu berhasil
- [x] Fake PHP-as-JPG upload → DENY
- [x] Oversized upload → DENY
- [x] Rejected → resubmit PASS
- [x] Approved → payment_date terisi
- [x] Pending tidak masuk income
- [x] Rejected tidak masuk income
- [x] Announcement read persistent
- [x] Notification read persistent
- [x] Report transaction orang lain DENY
- [x] Proof orang lain DENY
- [x] Logout invalidates session
- [x] Suspended account DENY


# FINAL STATUS

- [x] READY FOR CLASS PILOT
- [x] READY FOR PRODUCTION
