-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2026 at 06:29 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kaskelas`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `type`, `description`, `icon`, `created_at`) VALUES
(1, 2, 'payment', 'Pembayaran untuk periode 10–16 Aug 2026 dikirim', '💳', '2026-08-17 00:42:18'),
(2, 2, 'payment', 'Pembayaran untuk periode 17–23 Aug 2026 dikirim', '💳', '2026-08-17 02:03:00'),
(3, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #2 diupload', '📤', '2026-08-17 02:03:08'),
(4, 2, 'payment', 'Pembayaran untuk periode 24–30 Aug 2026 dikirim', '💳', '2026-08-18 04:20:58'),
(5, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #6 diupload', '📤', '2026-08-18 04:21:06'),
(6, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #6 diupload', '📤', '2026-08-21 02:10:50'),
(7, 2, 'payment', 'Pembayaran untuk periode contoh 1 dikirim', '💳', '2026-08-21 12:06:14'),
(8, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #7 diupload', '📤', '2026-08-21 12:06:20'),
(9, 2, 'payment', 'Pembayaran untuk periode minggu ke 3 bulan agustus dikirim', '💳', '2026-08-22 00:49:37'),
(10, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #8 diupload', '📤', '2026-08-22 00:49:50'),
(11, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #8 diupload', '📤', '2026-08-22 13:31:24'),
(41, 2, 'payment', 'Pembayaran untuk periode contoh 1 dikirim', '💳', '2026-08-25 13:07:15'),
(42, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #20 diupload', '📤', '2026-08-25 13:07:15'),
(43, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #20 diupload', '📤', '2026-08-25 13:07:15'),
(44, 2, 'payment', 'Pembayaran untuk periode minggu ke 3 bulan agustus dikirim', '💳', '2026-08-28 10:08:36'),
(45, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #21 diupload', '📤', '2026-08-28 10:09:00'),
(46, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #21 diupload', '📤', '2026-08-28 10:10:06');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('kas','kegiatan','informasi_kelas','penting') NOT NULL DEFAULT 'informasi_kelas',
  `priority` enum('normal','important') NOT NULL DEFAULT 'normal',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `class_id`, `created_by`, `title`, `content`, `category`, `priority`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Reminder Pembayaran Kas', 'Jangan lupa membayar kas tepat waktu.', 'kas', 'normal', '2026-08-16 20:19:35', '2026-08-16 13:19:35', '2026-08-17 02:49:34'),
(2, 2, 1, 'Lomba Kebersihan Kelas', 'Kelas kita mengikuti lomba kebersihan.', 'informasi_kelas', 'important', '2026-08-16 20:19:35', '2026-08-16 13:19:35', '2026-08-17 02:49:34'),
(16, 2, 1, 'B11 Ann Edit', 'isi baru', 'kas', 'important', '2026-08-25 15:07:14', '2026-08-25 13:07:14', '2026-08-25 13:07:14'),
(17, 2, 1, 'PEMBAYARAN RUTIN', 'BESOK JANGAN LUPA BAYAR KAS 5RB RUPIAH', 'kas', 'important', '2026-08-26 04:18:45', '2026-08-26 02:18:45', '2026-08-26 02:18:45'),
(18, 2, 1, 'HALO', 'ASDASDASD', 'kas', 'important', '2026-08-26 07:09:05', '2026-08-26 05:09:05', '2026-08-26 05:09:05');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `id` int(11) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcement_reads`
--

INSERT INTO `announcement_reads` (`id`, `announcement_id`, `user_id`, `read_at`) VALUES
(1, 2, 1, '2026-08-22 00:50:25'),
(2, 1, 2, '2026-08-24 06:18:09'),
(18, 16, 2, '2026-08-25 13:07:14'),
(19, 18, 2, '2026-08-26 05:55:53'),
(20, 17, 2, '2026-08-26 05:55:56'),
(21, 17, 1, '2026-08-28 10:01:07');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `created_at`) VALUES
(1, 2, 'resubmit_proof', 'transactions', 6, 'Resubmit bukti pembayaran untuk transaksi #6', '::1', '2026-08-21 02:10:50'),
(2, 1, 'verify_payment', 'transactions', 6, 'Verifikasi pembayaran transaksi #6 status berhasil', '::1', '2026-08-21 02:12:18'),
(3, 1, 'create_period', 'cash_periods', 17, 'Membuat periode kas baru \'minggu ke 3 bulan agustus\' sebesar 3000', '::1', '2026-08-21 11:55:25'),
(4, 1, 'create_period', 'cash_periods', 18, 'Membuat periode kas baru \'contoh 1\' sebesar 3000', '::1', '2026-08-21 12:05:38'),
(5, 2, 'upload_proof', 'transactions', 7, 'Upload bukti pembayaran untuk transaksi #7', '::1', '2026-08-21 12:06:20'),
(6, 1, 'verify_payment', 'transactions', 7, 'Verifikasi pembayaran transaksi #7 status berhasil', '::1', '2026-08-21 12:06:30'),
(7, 2, 'upload_profile_photo', 'users', 2, 'Mengubah foto profil', '::1', '2026-08-21 12:11:40'),
(8, 2, 'upload_proof', 'transactions', 8, 'Upload bukti pembayaran untuk transaksi #8', '::1', '2026-08-22 00:49:50'),
(9, 1, 'reject_payment', 'transactions', 8, 'Verifikasi pembayaran transaksi #8 status ditolak (alasan: bukti gjls)', '::1', '2026-08-22 00:50:20'),
(10, 2, 'resubmit_proof', 'transactions', 8, 'Resubmit bukti pembayaran untuk transaksi #8', '::1', '2026-08-22 13:31:23'),
(11, 1, 'verify_payment', 'transactions', 8, 'Verifikasi pembayaran transaksi #8 status berhasil', '::1', '2026-08-22 13:31:33'),
(12, 1, 'create_period', 'cash_periods', 19, 'Membuat periode kas baru \'E2E Period\' sebesar 1000', '127.0.0.1', '2026-08-24 05:35:53'),
(13, 1, 'delete_period', 'cash_periods', 19, 'Menghapus periode kas \'E2E Period\'', '127.0.0.1', '2026-08-24 05:35:53'),
(14, 2, 'create_report', 'reports', 2, 'Membuat laporan \'E2E ATT\'', '127.0.0.1', '2026-08-24 05:47:41'),
(15, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:36:19'),
(16, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:36:19'),
(17, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:36:20'),
(18, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:39:32'),
(19, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:39:33'),
(20, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:39:34'),
(21, 1, 'create_period', 'cash_periods', 22, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:39:35'),
(22, 2, 'upload_proof', 'transactions', 9, 'Upload bukti pembayaran untuk transaksi #9', '127.0.0.1', '2026-08-24 08:39:35'),
(23, 1, 'reject_payment', 'transactions', 9, 'Verifikasi pembayaran transaksi #9 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:39:35'),
(24, 2, 'resubmit_proof', 'transactions', 9, 'Resubmit bukti pembayaran untuk transaksi #9', '127.0.0.1', '2026-08-24 08:39:35'),
(25, 1, 'verify_payment', 'transactions', 9, 'Verifikasi pembayaran transaksi #9 status berhasil', '127.0.0.1', '2026-08-24 08:39:35'),
(26, 1, 'create_expense', 'expenses', 3, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 08:42:50'),
(27, 1, 'create_announcement', 'announcements', 3, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 08:42:50'),
(28, 1, 'edit_announcement', 'announcements', 3, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 08:42:50'),
(29, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 08:42:51'),
(30, 1, 'add_member', 'users', 13, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 08:42:52'),
(31, 1, 'update_member', 'users', 13, 'Mengubah data siswa ID #13', '127.0.0.1', '2026-08-24 08:42:52'),
(32, 1, 'disable_member', 'users', 13, 'Menonaktifkan anggota siswa ID #13', '127.0.0.1', '2026-08-24 08:42:52'),
(33, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:42:53'),
(34, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:42:54'),
(35, 2, 'create_report', 'reports', 3, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 08:42:54'),
(36, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:42:55'),
(37, 1, 'create_period', 'cash_periods', 24, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:42:56'),
(38, 2, 'upload_proof', 'transactions', 10, 'Upload bukti pembayaran untuk transaksi #10', '127.0.0.1', '2026-08-24 08:42:56'),
(39, 1, 'reject_payment', 'transactions', 10, 'Verifikasi pembayaran transaksi #10 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:42:56'),
(40, 2, 'resubmit_proof', 'transactions', 10, 'Resubmit bukti pembayaran untuk transaksi #10', '127.0.0.1', '2026-08-24 08:42:57'),
(41, 1, 'verify_payment', 'transactions', 10, 'Verifikasi pembayaran transaksi #10 status berhasil', '127.0.0.1', '2026-08-24 08:42:57'),
(42, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'x\'', '127.0.0.1', '2026-08-24 08:45:16'),
(43, 1, 'create_expense', 'expenses', 4, 'Membuat pengeluaran DBG sebesar 100', '127.0.0.1', '2026-08-24 08:46:43'),
(44, 1, 'edit_expense', 'expenses', 4, 'Mengubah pengeluaran DBG2', '127.0.0.1', '2026-08-24 08:46:44'),
(45, 1, 'create_expense', 'expenses', 5, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 08:49:43'),
(46, 1, 'create_announcement', 'announcements', 4, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 08:49:43'),
(47, 1, 'edit_announcement', 'announcements', 4, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 08:49:43'),
(48, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 08:49:43'),
(49, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:49:44'),
(50, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:49:44'),
(51, 2, 'create_report', 'reports', 4, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 08:49:44'),
(52, 1, 'respond_report', 'reports', 4, 'Merespons laporan ID 4 status diproses', '127.0.0.1', '2026-08-24 08:49:44'),
(53, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:49:44'),
(54, 1, 'create_period', 'cash_periods', 26, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:49:44'),
(55, 1, 'reject_payment', 'transactions', 11, 'Verifikasi pembayaran transaksi #11 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:49:44'),
(56, 1, 'create_expense', 'expenses', 6, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 08:53:11'),
(57, 1, 'create_announcement', 'announcements', 5, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 08:53:11'),
(58, 1, 'edit_announcement', 'announcements', 5, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 08:53:11'),
(59, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 08:53:11'),
(60, 1, 'add_member', 'users', 18, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 08:53:11'),
(61, 1, 'update_member', 'users', 18, 'Mengubah data siswa ID #18', '127.0.0.1', '2026-08-24 08:53:11'),
(62, 1, 'disable_member', 'users', 18, 'Menonaktifkan anggota siswa ID #18', '127.0.0.1', '2026-08-24 08:53:11'),
(63, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:53:11'),
(64, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:53:11'),
(65, 2, 'create_report', 'reports', 5, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 08:53:11'),
(66, 1, 'respond_report', 'reports', 5, 'Merespons laporan ID 5 status diproses', '127.0.0.1', '2026-08-24 08:53:11'),
(67, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:53:11'),
(68, 1, 'create_period', 'cash_periods', 28, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:53:12'),
(69, 1, 'reject_payment', 'transactions', 12, 'Verifikasi pembayaran transaksi #12 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:53:12'),
(70, 1, 'create_expense', 'expenses', 7, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 08:58:05'),
(71, 1, 'edit_expense', 'expenses', 7, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 08:58:05'),
(72, 1, 'create_announcement', 'announcements', 6, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 08:58:05'),
(73, 1, 'edit_announcement', 'announcements', 6, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 08:58:05'),
(74, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 08:58:05'),
(75, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 08:58:05'),
(76, 1, 'add_member', 'users', 21, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 08:58:05'),
(77, 1, 'update_member', 'users', 21, 'Mengubah data siswa ID #21', '127.0.0.1', '2026-08-24 08:58:05'),
(78, 1, 'disable_member', 'users', 21, 'Menonaktifkan anggota siswa ID #21', '127.0.0.1', '2026-08-24 08:58:05'),
(79, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:58:06'),
(80, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:58:06'),
(81, 2, 'create_report', 'reports', 6, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 08:58:06'),
(82, 1, 'respond_report', 'reports', 6, 'Merespons laporan ID 6 status diproses', '127.0.0.1', '2026-08-24 08:58:06'),
(83, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:58:06'),
(84, 1, 'create_period', 'cash_periods', 30, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:58:06'),
(85, 2, 'upload_proof', 'transactions', 13, 'Upload bukti pembayaran untuk transaksi #13', '127.0.0.1', '2026-08-24 08:58:06'),
(86, 1, 'reject_payment', 'transactions', 13, 'Verifikasi pembayaran transaksi #13 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:58:06'),
(87, 2, 'resubmit_proof', 'transactions', 13, 'Resubmit bukti pembayaran untuk transaksi #13', '127.0.0.1', '2026-08-24 08:58:06'),
(88, 1, 'verify_payment', 'transactions', 13, 'Verifikasi pembayaran transaksi #13 status berhasil', '127.0.0.1', '2026-08-24 08:58:06'),
(89, 1, 'create_expense', 'expenses', 8, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 08:59:15'),
(90, 1, 'edit_expense', 'expenses', 8, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 08:59:15'),
(91, 1, 'create_announcement', 'announcements', 7, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 08:59:15'),
(92, 1, 'edit_announcement', 'announcements', 7, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 08:59:15'),
(93, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 08:59:15'),
(94, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 08:59:15'),
(95, 1, 'add_member', 'users', 24, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 08:59:15'),
(96, 1, 'update_member', 'users', 24, 'Mengubah data siswa ID #24', '127.0.0.1', '2026-08-24 08:59:16'),
(97, 1, 'disable_member', 'users', 24, 'Menonaktifkan anggota siswa ID #24', '127.0.0.1', '2026-08-24 08:59:16'),
(98, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:59:16'),
(99, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 08:59:17'),
(100, 2, 'create_report', 'reports', 7, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 08:59:17'),
(101, 1, 'respond_report', 'reports', 7, 'Merespons laporan ID 7 status diproses', '127.0.0.1', '2026-08-24 08:59:17'),
(102, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 08:59:17'),
(103, 1, 'create_period', 'cash_periods', 32, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 08:59:17'),
(104, 2, 'upload_proof', 'transactions', 14, 'Upload bukti pembayaran untuk transaksi #14', '127.0.0.1', '2026-08-24 08:59:17'),
(105, 1, 'reject_payment', 'transactions', 14, 'Verifikasi pembayaran transaksi #14 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 08:59:17'),
(106, 2, 'resubmit_proof', 'transactions', 14, 'Resubmit bukti pembayaran untuk transaksi #14', '127.0.0.1', '2026-08-24 08:59:17'),
(107, 1, 'verify_payment', 'transactions', 14, 'Verifikasi pembayaran transaksi #14 status berhasil', '127.0.0.1', '2026-08-24 08:59:17'),
(108, 1, 'create_expense', 'expenses', 9, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 09:01:19'),
(109, 1, 'edit_expense', 'expenses', 9, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 09:01:19'),
(110, 1, 'create_announcement', 'announcements', 8, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 09:01:19'),
(111, 1, 'edit_announcement', 'announcements', 8, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 09:01:19'),
(112, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 09:01:19'),
(113, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 09:01:19'),
(114, 1, 'add_member', 'users', 27, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 09:01:19'),
(115, 1, 'update_member', 'users', 27, 'Mengubah data siswa ID #27', '127.0.0.1', '2026-08-24 09:01:19'),
(116, 1, 'disable_member', 'users', 27, 'Menonaktifkan anggota siswa ID #27', '127.0.0.1', '2026-08-24 09:01:19'),
(117, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:01:20'),
(118, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:01:20'),
(119, 2, 'create_report', 'reports', 8, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 09:01:20'),
(120, 1, 'respond_report', 'reports', 8, 'Merespons laporan ID 8 status diproses', '127.0.0.1', '2026-08-24 09:01:20'),
(121, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 09:01:20'),
(122, 1, 'create_period', 'cash_periods', 34, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 09:01:20'),
(123, 2, 'upload_proof', 'transactions', 15, 'Upload bukti pembayaran untuk transaksi #15', '127.0.0.1', '2026-08-24 09:01:20'),
(124, 1, 'reject_payment', 'transactions', 15, 'Verifikasi pembayaran transaksi #15 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 09:01:20'),
(125, 2, 'resubmit_proof', 'transactions', 15, 'Resubmit bukti pembayaran untuk transaksi #15', '127.0.0.1', '2026-08-24 09:01:20'),
(126, 1, 'verify_payment', 'transactions', 15, 'Verifikasi pembayaran transaksi #15 status berhasil', '127.0.0.1', '2026-08-24 09:01:20'),
(127, 1, 'create_expense', 'expenses', 10, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 09:02:04'),
(128, 1, 'edit_expense', 'expenses', 10, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 09:02:04'),
(129, 1, 'create_announcement', 'announcements', 9, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 09:02:04'),
(130, 1, 'edit_announcement', 'announcements', 9, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 09:02:04'),
(131, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 09:02:04'),
(132, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 09:02:04'),
(133, 1, 'add_member', 'users', 30, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 09:02:04'),
(134, 1, 'update_member', 'users', 30, 'Mengubah data siswa ID #30', '127.0.0.1', '2026-08-24 09:02:05'),
(135, 1, 'disable_member', 'users', 30, 'Menonaktifkan anggota siswa ID #30', '127.0.0.1', '2026-08-24 09:02:05'),
(136, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:02:06'),
(137, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:02:06'),
(138, 2, 'create_report', 'reports', 9, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 09:02:06'),
(139, 1, 'respond_report', 'reports', 9, 'Merespons laporan ID 9 status diproses', '127.0.0.1', '2026-08-24 09:02:06'),
(140, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 09:02:06'),
(141, 1, 'create_period', 'cash_periods', 36, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 09:02:06'),
(142, 2, 'upload_proof', 'transactions', 16, 'Upload bukti pembayaran untuk transaksi #16', '127.0.0.1', '2026-08-24 09:02:07'),
(143, 1, 'reject_payment', 'transactions', 16, 'Verifikasi pembayaran transaksi #16 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 09:02:07'),
(144, 2, 'resubmit_proof', 'transactions', 16, 'Resubmit bukti pembayaran untuk transaksi #16', '127.0.0.1', '2026-08-24 09:02:07'),
(145, 1, 'verify_payment', 'transactions', 16, 'Verifikasi pembayaran transaksi #16 status berhasil', '127.0.0.1', '2026-08-24 09:02:07'),
(146, 1, 'create_expense', 'expenses', 11, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 09:06:14'),
(147, 1, 'edit_expense', 'expenses', 11, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 09:06:14'),
(148, 1, 'create_announcement', 'announcements', 10, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 09:06:14'),
(149, 1, 'edit_announcement', 'announcements', 10, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 09:06:14'),
(150, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 09:06:14'),
(151, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 09:06:14'),
(152, 1, 'add_member', 'users', 34, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 09:06:14'),
(153, 1, 'update_member', 'users', 34, 'Mengubah data siswa ID #34', '127.0.0.1', '2026-08-24 09:06:15'),
(154, 1, 'disable_member', 'users', 34, 'Menonaktifkan anggota siswa ID #34', '127.0.0.1', '2026-08-24 09:06:15'),
(155, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:06:15'),
(156, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:06:15'),
(157, 2, 'create_report', 'reports', 10, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 09:06:15'),
(158, 1, 'respond_report', 'reports', 10, 'Merespons laporan ID 10 status diproses', '127.0.0.1', '2026-08-24 09:06:15'),
(159, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 09:06:15'),
(160, 1, 'create_period', 'cash_periods', 39, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 09:06:15'),
(161, 2, 'upload_proof', 'transactions', 17, 'Upload bukti pembayaran untuk transaksi #17', '127.0.0.1', '2026-08-24 09:06:15'),
(162, 1, 'reject_payment', 'transactions', 17, 'Verifikasi pembayaran transaksi #17 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 09:06:15'),
(163, 2, 'resubmit_proof', 'transactions', 17, 'Resubmit bukti pembayaran untuk transaksi #17', '127.0.0.1', '2026-08-24 09:06:15'),
(164, 1, 'verify_payment', 'transactions', 17, 'Verifikasi pembayaran transaksi #17 status berhasil', '127.0.0.1', '2026-08-24 09:06:16'),
(165, 1, 'create_expense', 'expenses', 12, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 09:08:02'),
(166, 1, 'edit_expense', 'expenses', 12, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 09:08:02'),
(167, 1, 'create_announcement', 'announcements', 11, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 09:08:02'),
(168, 1, 'edit_announcement', 'announcements', 11, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 09:08:02'),
(169, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 09:08:03'),
(170, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 09:08:03'),
(171, 1, 'add_member', 'users', 37, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 09:08:03'),
(172, 1, 'update_member', 'users', 37, 'Mengubah data siswa ID #37', '127.0.0.1', '2026-08-24 09:08:03'),
(173, 1, 'disable_member', 'users', 37, 'Menonaktifkan anggota siswa ID #37', '127.0.0.1', '2026-08-24 09:08:03'),
(174, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:08:04'),
(175, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 09:08:04'),
(176, 2, 'create_report', 'reports', 11, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 09:08:04'),
(177, 1, 'respond_report', 'reports', 11, 'Merespons laporan ID 11 status diproses', '127.0.0.1', '2026-08-24 09:08:04'),
(178, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 09:08:05'),
(179, 1, 'create_period', 'cash_periods', 41, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 09:08:05'),
(180, 2, 'upload_proof', 'transactions', 18, 'Upload bukti pembayaran untuk transaksi #18', '127.0.0.1', '2026-08-24 09:08:05'),
(181, 1, 'reject_payment', 'transactions', 18, 'Verifikasi pembayaran transaksi #18 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 09:08:05'),
(182, 2, 'resubmit_proof', 'transactions', 18, 'Resubmit bukti pembayaran untuk transaksi #18', '127.0.0.1', '2026-08-24 09:08:05'),
(183, 1, 'verify_payment', 'transactions', 18, 'Verifikasi pembayaran transaksi #18 status berhasil', '127.0.0.1', '2026-08-24 09:08:05'),
(184, 1, 'add_member', 'users', 38, 'Menambah anggota siswa baru \'A1 Uji\' pada kelas #2', '127.0.0.1', '2026-08-24 10:18:38'),
(185, 1, 'disable_member', 'users', 38, 'Menonaktifkan anggota siswa ID #38', '127.0.0.1', '2026-08-24 10:18:39'),
(186, 1, 'add_member', 'users', 39, 'Menambah anggota siswa baru \'A1 Uji\' pada kelas #2', '127.0.0.1', '2026-08-24 10:22:33'),
(187, 1, 'disable_member', 'users', 39, 'Menonaktifkan anggota siswa ID #39', '127.0.0.1', '2026-08-24 10:22:33'),
(188, 1, 'create_expense', 'expenses', 13, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-24 10:22:35'),
(189, 1, 'edit_expense', 'expenses', 13, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-24 10:22:36'),
(190, 1, 'create_announcement', 'announcements', 12, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-24 10:22:36'),
(191, 1, 'edit_announcement', 'announcements', 12, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-24 10:22:36'),
(192, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-24 10:22:36'),
(193, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-24 10:22:36'),
(194, 1, 'add_member', 'users', 42, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-24 10:22:36'),
(195, 1, 'update_member', 'users', 42, 'Mengubah data siswa ID #42', '127.0.0.1', '2026-08-24 10:22:36'),
(196, 1, 'disable_member', 'users', 42, 'Menonaktifkan anggota siswa ID #42', '127.0.0.1', '2026-08-24 10:22:36'),
(197, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 10:22:37'),
(198, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-24 10:22:38'),
(199, 2, 'create_report', 'reports', 12, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-24 10:22:38'),
(200, 1, 'respond_report', 'reports', 12, 'Merespons laporan ID 12 status diproses', '127.0.0.1', '2026-08-24 10:22:38'),
(201, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-24 10:22:38'),
(202, 1, 'create_period', 'cash_periods', 43, 'Membuat periode kas baru \'B11 Uji Payment\' sebesar 3000', '127.0.0.1', '2026-08-24 10:22:38'),
(203, 2, 'upload_proof', 'transactions', 19, 'Upload bukti pembayaran untuk transaksi #19', '127.0.0.1', '2026-08-24 10:22:38'),
(204, 1, 'reject_payment', 'transactions', 19, 'Verifikasi pembayaran transaksi #19 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-24 10:22:38'),
(205, 2, 'resubmit_proof', 'transactions', 19, 'Resubmit bukti pembayaran untuk transaksi #19', '127.0.0.1', '2026-08-24 10:22:38'),
(206, 1, 'verify_payment', 'transactions', 19, 'Verifikasi pembayaran transaksi #19 status berhasil', '127.0.0.1', '2026-08-24 10:22:38'),
(207, 1, 'add_member', 'users', 43, 'Menambah anggota siswa baru \'A1 Uji\' pada kelas #2', '127.0.0.1', '2026-08-25 13:01:37'),
(208, 1, 'disable_member', 'users', 43, 'Menonaktifkan anggota siswa ID #43', '127.0.0.1', '2026-08-25 13:01:38'),
(209, 1, 'create_expense', 'expenses', 14, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-25 13:01:39'),
(210, 1, 'edit_expense', 'expenses', 14, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-25 13:01:39'),
(211, 1, 'create_announcement', 'announcements', 13, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-25 13:01:39'),
(212, 1, 'edit_announcement', 'announcements', 13, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-25 13:01:39'),
(213, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-25 13:01:39'),
(214, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-25 13:01:39'),
(215, 1, 'add_member', 'users', 46, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-25 13:01:39'),
(216, 1, 'update_member', 'users', 46, 'Mengubah data siswa ID #46', '127.0.0.1', '2026-08-25 13:01:40'),
(217, 1, 'disable_member', 'users', 46, 'Menonaktifkan anggota siswa ID #46', '127.0.0.1', '2026-08-25 13:01:40'),
(218, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:01:40'),
(219, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:01:40'),
(220, 2, 'create_report', 'reports', 13, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-25 13:01:40'),
(221, 1, 'respond_report', 'reports', 13, 'Merespons laporan ID 13 status diproses', '127.0.0.1', '2026-08-25 13:01:40'),
(222, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-25 13:01:40'),
(223, 1, 'create_expense', 'expenses', 15, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-25 13:03:27'),
(224, 1, 'edit_expense', 'expenses', 15, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-25 13:03:27'),
(225, 1, 'create_announcement', 'announcements', 14, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-25 13:03:27'),
(226, 1, 'edit_announcement', 'announcements', 14, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-25 13:03:27'),
(227, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-25 13:03:28'),
(228, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-25 13:03:28'),
(229, 1, 'add_member', 'users', 49, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-25 13:03:28'),
(230, 1, 'update_member', 'users', 49, 'Mengubah data siswa ID #49', '127.0.0.1', '2026-08-25 13:03:28'),
(231, 1, 'disable_member', 'users', 49, 'Menonaktifkan anggota siswa ID #49', '127.0.0.1', '2026-08-25 13:03:28'),
(232, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:03:28'),
(233, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:03:28'),
(234, 2, 'create_report', 'reports', 14, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-25 13:03:28'),
(235, 1, 'respond_report', 'reports', 14, 'Merespons laporan ID 14 status diproses', '127.0.0.1', '2026-08-25 13:03:28'),
(236, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-25 13:03:28'),
(237, 1, 'create_expense', 'expenses', 16, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-25 13:04:51'),
(238, 1, 'edit_expense', 'expenses', 16, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-25 13:04:51'),
(239, 1, 'create_announcement', 'announcements', 15, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-25 13:04:51'),
(240, 1, 'edit_announcement', 'announcements', 15, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-25 13:04:51'),
(241, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-25 13:04:51'),
(242, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-25 13:04:51'),
(243, 1, 'add_member', 'users', 52, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-25 13:04:51'),
(244, 1, 'update_member', 'users', 52, 'Mengubah data siswa ID #52', '127.0.0.1', '2026-08-25 13:04:52'),
(245, 1, 'disable_member', 'users', 52, 'Menonaktifkan anggota siswa ID #52', '127.0.0.1', '2026-08-25 13:04:52'),
(246, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:04:52'),
(247, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:04:52'),
(248, 2, 'create_report', 'reports', 15, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-25 13:04:52'),
(249, 1, 'respond_report', 'reports', 15, 'Merespons laporan ID 15 status diproses', '127.0.0.1', '2026-08-25 13:04:52'),
(250, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-25 13:04:52'),
(251, 1, 'create_expense', 'expenses', 17, 'Membuat pengeluaran B11 Test sebesar 12000', '127.0.0.1', '2026-08-25 13:07:14'),
(252, 1, 'edit_expense', 'expenses', 17, 'Mengubah pengeluaran B11 Edit', '127.0.0.1', '2026-08-25 13:07:14'),
(253, 1, 'create_announcement', 'announcements', 16, 'Membuat pengumuman B11 Ann', '127.0.0.1', '2026-08-25 13:07:14'),
(254, 1, 'edit_announcement', 'announcements', 16, 'Mengubah pengumuman B11 Ann Edit', '127.0.0.1', '2026-08-25 13:07:14'),
(255, 1, 'edit_period', 'cash_periods', 1, 'Mengubah periode kas \'Minggu Uji Edit\'', '127.0.0.1', '2026-08-25 13:07:14'),
(256, 1, 'update_cash_settings', 'cash_settings', 2, 'Mengubah pengaturan kas kelas 2', '127.0.0.1', '2026-08-25 13:07:14'),
(257, 1, 'add_member', 'users', 55, 'Menambah anggota siswa baru \'B11 Siswa A\' pada kelas #2', '127.0.0.1', '2026-08-25 13:07:14'),
(258, 1, 'update_member', 'users', 55, 'Mengubah data siswa ID #55', '127.0.0.1', '2026-08-25 13:07:14'),
(259, 1, 'disable_member', 'users', 55, 'Menonaktifkan anggota siswa ID #55', '127.0.0.1', '2026-08-25 13:07:14'),
(260, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:07:15'),
(261, 2, 'change_password', 'users', 2, 'Mengubah password akun', '127.0.0.1', '2026-08-25 13:07:15'),
(262, 2, 'create_report', 'reports', 16, 'Membuat laporan \'B11 Report\'', '127.0.0.1', '2026-08-25 13:07:15'),
(263, 1, 'respond_report', 'reports', 16, 'Merespons laporan ID 16 status diproses', '127.0.0.1', '2026-08-25 13:07:15'),
(264, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: B11 Broadcast ke kelas 2', '127.0.0.1', '2026-08-25 13:07:15'),
(265, 2, 'upload_proof', 'transactions', 20, 'Upload bukti pembayaran untuk transaksi #20', '127.0.0.1', '2026-08-25 13:07:15'),
(266, 1, 'reject_payment', 'transactions', 20, 'Verifikasi pembayaran transaksi #20 status ditolak (alasan: foto kurang jelas)', '127.0.0.1', '2026-08-25 13:07:15'),
(267, 2, 'resubmit_proof', 'transactions', 20, 'Resubmit bukti pembayaran untuk transaksi #20', '127.0.0.1', '2026-08-25 13:07:15'),
(268, 1, 'verify_payment', 'transactions', 20, 'Verifikasi pembayaran transaksi #20 status berhasil', '127.0.0.1', '2026-08-25 13:07:15'),
(269, 1, 'create_announcement', 'announcements', 17, 'Membuat pengumuman PEMBAYARAN RUTIN', '::1', '2026-08-26 02:18:45'),
(270, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: asdadasdas ke kelas 2', '::1', '2026-08-26 05:07:50'),
(271, 1, 'create_announcement', 'announcements', 18, 'Membuat pengumuman HALO', '::1', '2026-08-26 05:09:05'),
(272, 1, 'add_member', 'users', 56, 'Menambah anggota siswa baru \'percobaan\' pada kelas #2', '::1', '2026-08-26 05:14:58'),
(273, 1, 'add_member', 'users', 57, 'Menambah anggota siswa baru \'nabila\' pada kelas #2', '::1', '2026-08-28 02:05:23'),
(274, 2, 'upload_profile_photo', 'users', 2, 'Mengubah foto profil', '::1', '2026-08-28 09:29:35'),
(275, 2, 'upload_profile_photo', 'users', 2, 'Mengubah foto profil', '::1', '2026-08-28 09:29:52'),
(276, 2, 'upload_profile_photo', 'users', 2, 'Mengubah foto profil', '::1', '2026-08-28 09:32:57'),
(277, 2, 'upload_profile_photo', 'users', 2, 'Mengubah foto profil', '::1', '2026-08-28 09:38:41'),
(278, 2, 'change_password', 'users', 2, 'Mengubah password akun', '::1', '2026-08-28 10:06:45'),
(279, 2, 'upload_proof', 'transactions', 21, 'Upload bukti pembayaran untuk transaksi #21', '::1', '2026-08-28 10:09:00'),
(280, 1, 'reject_payment', 'transactions', 21, 'Verifikasi pembayaran transaksi #21 status ditolak (alasan: bukti gjls)', '::1', '2026-08-28 10:09:38'),
(281, 2, 'resubmit_proof', 'transactions', 21, 'Resubmit bukti pembayaran untuk transaksi #21', '::1', '2026-08-28 10:10:06'),
(282, 1, 'verify_payment', 'transactions', 21, 'Verifikasi pembayaran transaksi #21 status berhasil', '::1', '2026-08-28 10:10:22'),
(283, 2, 'create_report', 'reports', 17, 'Membuat laporan \'ERROR WOY\'', '::1', '2026-08-28 10:34:27'),
(284, 1, 'respond_report', 'reports', 17, 'Merespons laporan ID 17 status diproses', '::1', '2026-08-28 10:35:08'),
(285, 1, 'respond_report', 'reports', 17, 'Merespons laporan ID 17 status diproses', '::1', '2026-08-28 10:35:15'),
(286, 1, 'respond_report', 'reports', 17, 'Merespons laporan ID 17 status selesai', '::1', '2026-08-28 10:35:56'),
(287, 1, 'broadcast_notification', 'notifications', NULL, 'Broadcast notifikasi: tess ke kelas 2', '::1', '2026-08-29 07:13:15'),
(288, 1, 'delete_expense', 'expenses', 17, 'Menghapus pengeluaran ID 17', '::1', '2026-08-30 03:24:07'),
(289, 1, 'delete_expense', 'expenses', 2, 'Menghapus pengeluaran ID 2', '::1', '2026-08-30 03:24:15'),
(290, 1, 'delete_expense', 'expenses', 1, 'Menghapus pengeluaran ID 1', '::1', '2026-08-30 03:24:20'),
(291, 1, 'create_expense', 'expenses', 18, 'Membuat pengeluaran tes 1 sebesar 70000', '::1', '2026-08-30 03:25:18'),
(292, 1, 'import_student', 'users', 58, 'Import siswa \'Siti Aminah\' via CSV', '::1', '2026-08-30 09:07:04'),
(293, 1, 'import_student', 'users', 59, 'Import siswa \'tes1\' via CSV', '::1', '2026-08-31 02:11:24'),
(294, 1, 'disable_member', 'users', 59, 'Menonaktifkan anggota siswa ID #59', '::1', '2026-08-31 02:11:38'),
(295, 1, 'disable_member', 'users', 59, 'Menonaktifkan anggota siswa ID #59', '::1', '2026-08-31 02:11:54'),
(296, 1, 'disable_member', 'users', 58, 'Menonaktifkan anggota siswa ID #58', '::1', '2026-08-31 02:12:10'),
(297, 1, 'disable_member', 'users', 58, 'Menonaktifkan anggota siswa ID #58', '::1', '2026-08-31 08:00:29'),
(298, 1, 'delete_expense', 'expenses', 18, 'Menghapus pengeluaran ID 18', '::1', '2026-09-01 01:49:23');

-- --------------------------------------------------------

--
-- Table structure for table `cash_periods`
--

CREATE TABLE `cash_periods` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `frequency` enum('weekly','monthly') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `due_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('upcoming','active','closed') NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_periods`
--

INSERT INTO `cash_periods` (`id`, `class_id`, `name`, `frequency`, `start_date`, `end_date`, `due_date`, `amount`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Minggu Uji Edit', 'weekly', '2026-01-01', '2026-01-07', '2026-01-07', 3500.00, 'active', '2026-08-16 13:19:35', '2026-08-25 13:01:39'),
(2, 2, '17–23 Aug 2026', 'weekly', '2026-08-17', '2026-08-23', '2026-08-23', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(3, 2, '24–30 Aug 2026', 'weekly', '2026-08-24', '2026-08-30', '2026-08-30', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(4, 2, '31–06 Sep 2026', 'weekly', '2026-08-31', '2026-09-06', '2026-09-06', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(5, 2, '07–13 Sep 2026', 'weekly', '2026-09-07', '2026-09-13', '2026-09-13', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(6, 2, '14–20 Sep 2026', 'weekly', '2026-09-14', '2026-09-20', '2026-09-20', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(7, 2, '21–27 Sep 2026', 'weekly', '2026-09-21', '2026-09-27', '2026-09-27', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(8, 2, '28–04 Oct 2026', 'weekly', '2026-09-28', '2026-10-04', '2026-10-04', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(9, 2, '05–11 Oct 2026', 'weekly', '2026-10-05', '2026-10-11', '2026-10-11', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(10, 2, '12–18 Oct 2026', 'weekly', '2026-10-12', '2026-10-18', '2026-10-18', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(11, 2, '19–25 Oct 2026', 'weekly', '2026-10-19', '2026-10-25', '2026-10-25', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(12, 2, '26–01 Nov 2026', 'weekly', '2026-10-26', '2026-11-01', '2026-11-01', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(13, 2, '02–08 Nov 2026', 'weekly', '2026-11-02', '2026-11-08', '2026-11-08', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(14, 2, '09–15 Nov 2026', 'weekly', '2026-11-09', '2026-11-15', '2026-11-15', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(15, 2, '16–22 Nov 2026', 'weekly', '2026-11-16', '2026-11-22', '2026-11-22', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(16, 2, '23–29 Nov 2026', 'weekly', '2026-11-23', '2026-11-29', '2026-11-29', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
(17, 2, 'minggu ke 3 bulan agustus', 'weekly', '2026-08-22', '2026-08-29', '2026-08-29', 3000.00, 'upcoming', '2026-08-21 11:55:25', '2026-08-21 11:55:25'),
(18, 2, 'contoh 1', 'weekly', '2026-08-21', '2026-08-28', '2026-08-27', 3000.00, 'upcoming', '2026-08-21 12:05:38', '2026-08-21 12:05:38');

-- --------------------------------------------------------

--
-- Table structure for table `cash_settings`
--

CREATE TABLE `cash_settings` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `frequency` enum('weekly','monthly') NOT NULL DEFAULT 'monthly',
  `default_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_deadline_days` int(11) DEFAULT 0,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `account_holder` varchar(100) DEFAULT NULL,
  `qris_image` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_settings`
--

INSERT INTO `cash_settings` (`id`, `class_id`, `frequency`, `default_amount`, `payment_deadline_days`, `bank_name`, `account_number`, `account_holder`, `qris_image`, `updated_at`) VALUES
(1, 2, 'weekly', 4000.00, 7, 'BCA', '123456', 'Bendahara A', NULL, '2026-08-24 08:42:51');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `school_name` varchar(150) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `school_name`, `academic_year`, `created_at`, `updated_at`) VALUES
(2, 'XII RPL 3', NULL, NULL, '2026-08-16 12:42:39', '2026-08-16 12:42:39');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('kebersihan','perlengkapan','kegiatan','dekorasi','sosial','lainnya') NOT NULL DEFAULT 'lainnya',
  `amount` decimal(12,2) NOT NULL,
  `description` text DEFAULT NULL,
  `expense_date` date NOT NULL,
  `receipt_file` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `reference_type`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 2, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', 'Pembayaran untuk periode 10–16 Aug 2026 sedang menunggu verifikasi.', 'transaction', 1, 1, '2026-08-17 00:42:18'),
(2, 2, 'pembayaran_berhasil', 'Pembayaran Berhasil', 'Pembayaran Anda telah diverifikasi.', 'transaction', 1, 1, '2026-08-17 00:50:40'),
(3, 2, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', 'Pembayaran untuk periode 17–23 Aug 2026 sedang menunggu verifikasi.', 'transaction', 2, 1, '2026-08-17 02:03:00'),
(4, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #2 telah diupload.', 'transaction', 2, 1, '2026-08-17 02:03:08'),
(5, 2, 'pembayaran_berhasil', 'Pembayaran Berhasil', 'Pembayaran Anda telah diverifikasi.', 'transaction', 2, 1, '2026-08-17 02:04:25'),
(98, 1, 'info', 'B11 Broadcast', 'pesan uji', 'broadcast', NULL, 0, '2026-08-25 13:07:15'),
(99, 2, 'info', 'B11 Broadcast', 'pesan uji', 'broadcast', NULL, 1, '2026-08-25 13:07:15'),
(100, 2, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', 'Pembayaran untuk periode contoh 1 sedang menunggu verifikasi.', 'transaction', 20, 1, '2026-08-25 13:07:15'),
(101, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #20 telah diupload.', 'transaction', 20, 1, '2026-08-25 13:07:15'),
(102, 2, 'pembayaran_ditolak', 'Pembayaran Ditolak', 'Pembayaran Anda ditolak. Alasan: foto kurang jelas', 'transaction', 20, 1, '2026-08-25 13:07:15'),
(103, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #20 telah diupload.', 'transaction', 20, 1, '2026-08-25 13:07:15'),
(104, 2, 'pembayaran_berhasil', 'Pembayaran Berhasil', 'Pembayaran Anda telah diverifikasi.', 'transaction', 20, 1, '2026-08-25 13:07:15'),
(105, 1, 'info', 'asdadasdas', 'asdasd', 'broadcast', NULL, 1, '2026-08-26 05:07:50'),
(106, 2, 'info', 'asdadasdas', 'asdasd', 'broadcast', NULL, 1, '2026-08-26 05:07:50'),
(107, 2, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', 'Pembayaran untuk periode minggu ke 3 bulan agustus sedang menunggu verifikasi.', 'transaction', 21, 1, '2026-08-28 10:08:36'),
(108, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #21 telah diupload.', 'transaction', 21, 1, '2026-08-28 10:09:00'),
(109, 2, 'pembayaran_ditolak', 'Pembayaran Ditolak', 'Pembayaran Anda ditolak. Alasan: bukti gjls', 'transaction', 21, 1, '2026-08-28 10:09:38'),
(110, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #21 telah diupload.', 'transaction', 21, 1, '2026-08-28 10:10:06'),
(111, 2, 'pembayaran_berhasil', 'Pembayaran Berhasil', 'Pembayaran Anda telah diverifikasi.', 'transaction', 21, 1, '2026-08-28 10:10:22'),
(112, 1, 'info', 'tess', 'haloo', 'broadcast', NULL, 0, '2026-08-29 07:13:15'),
(113, 2, 'info', 'tess', 'haloo', 'broadcast', NULL, 1, '2026-08-29 07:13:15'),
(114, 56, 'info', 'tess', 'haloo', 'broadcast', NULL, 0, '2026-08-29 07:13:15'),
(115, 57, 'info', 'tess', 'haloo', 'broadcast', NULL, 0, '2026-08-29 07:13:15'),
(116, 2, 'reminder', 'Jatuh Tempo Kas Besok', 'Jangan lupa bayar kas periode 24–30 Aug 2026, jatuh tempo besok (2026-08-30).', 'period', 3, 0, '2026-08-29 07:13:24');

-- --------------------------------------------------------

--
-- Table structure for table `payment_proofs`
--

CREATE TABLE `payment_proofs` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_size` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_proofs`
--

INSERT INTO `payment_proofs` (`id`, `transaction_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_at`) VALUES
(1, 2, 'ig (1).jpeg', 'uploads/proof_6a826bdcab5c3.jpeg', 'image/jpeg', 8124, '2026-08-17 02:03:08'),
(26, 20, 'proof_f9d897ff312ca0d815d58ad250a85963.pdf', 'private/proof_f9d897ff312ca0d815d58ad250a85963.pdf', 'application/pdf', 14, '2026-08-25 13:07:15'),
(28, 21, 'proof_de762c9ba45af0e9b29ee660ade04f8e.jpeg', 'private/proof_de762c9ba45af0e9b29ee660ade04f8e.jpeg', 'image/jpeg', 8124, '2026-08-28 10:10:06');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` enum('pembayaran','akun','bukti_pembayaran','data_kas','aplikasi','lainnya') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `attachment` varchar(500) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `status` enum('dikirim','diproses','selesai') NOT NULL DEFAULT 'dikirim',
  `response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `category`, `title`, `description`, `attachment`, `transaction_id`, `status`, `response`, `created_at`, `updated_at`) VALUES
(16, 2, 'aplikasi', 'B11 Report', 'uji laporan', 'reports/report_aa89ec27eda8846fd8eeeea9.pdf', NULL, 'diproses', 'sedang kami proses', '2026-08-25 13:07:15', '2026-08-25 13:07:15'),
(17, 2, 'lainnya', 'ERROR WOY', 'wwkkwkw', 'reports/report_78582823b7658793c32efe6c.png', NULL, 'selesai', 'sudah ya', '2026-08-28 10:34:27', '2026-08-28 10:35:56');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `attendance_number` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `nis`, `full_name`, `attendance_number`, `created_at`, `updated_at`) VALUES
(1, 2, '2024100', 'Risyad', 1, '2026-08-16 12:42:39', '2026-08-16 12:42:39'),
(33, 55, 'B11NISA', 'B11 Siswa A Edit', 98, '2026-08-25 13:07:14', '2026-08-25 13:07:14'),
(34, 56, '93405305093', 'percobaan', 40, '2026-08-26 05:14:58', '2026-08-26 05:14:58'),
(35, 57, '67676767', 'nabila', 24, '2026-08-28 02:05:23', '2026-08-28 02:05:23'),
(36, 58, '24002', 'Siti Aminah', 2, '2026-08-30 09:07:04', '2026-08-30 09:07:04'),
(37, 59, '2328931', 'tes1', 38, '2026-08-31 02:11:24', '2026-08-31 02:11:24');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `transaction_code` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `method` enum('cash','transfer','qris') NOT NULL,
  `status` enum('menunggu','berhasil','ditolak') NOT NULL DEFAULT 'menunggu',
  `rejection_reason` text DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `transaction_code`, `user_id`, `total_amount`, `method`, `status`, `rejection_reason`, `payment_date`, `submitted_at`, `verified_at`, `verified_by`, `created_at`, `updated_at`) VALUES
(1, 'TRX-6A8258EA8CDC8', 2, 3000.00, 'cash', 'berhasil', NULL, NULL, '2026-08-17 02:42:18', '2026-08-17 02:50:40', 1, '2026-08-17 00:42:18', '2026-08-17 00:50:40'),
(2, 'TRX-6A826BD4C4B35', 2, 3000.00, 'cash', 'berhasil', NULL, NULL, '2026-08-17 04:03:00', '2026-08-17 04:04:25', 1, '2026-08-17 02:03:00', '2026-08-17 02:04:25'),
(20, 'TRX-6A8D938391A1E', 2, 3000.00, 'transfer', 'berhasil', NULL, '2026-08-25 15:07:15', '2026-08-25 15:07:15', '2026-08-25 15:07:15', 1, '2026-08-25 13:07:15', '2026-08-25 13:07:15'),
(21, 'TRX-6A915E2488ED4', 2, 3000.00, 'transfer', 'berhasil', NULL, '2026-08-28 12:10:22', '2026-08-28 12:10:06', '2026-08-28 12:10:22', 1, '2026-08-28 10:08:36', '2026-08-28 10:10:22');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_items`
--

INSERT INTO `transaction_items` (`id`, `transaction_id`, `period_id`, `amount`, `created_at`) VALUES
(1, 1, 1, 3000.00, '2026-08-17 00:42:18'),
(2, 2, 2, 3000.00, '2026-08-17 02:03:00'),
(17, 20, 18, 3000.00, '2026-08-25 13:07:15'),
(18, 21, 17, 3000.00, '2026-08-28 10:08:36');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('siswa','bendahara') NOT NULL DEFAULT 'siswa',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `class_id`, `username`, `password_hash`, `role`, `email`, `phone`, `profile_photo`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 2, 'bendahara', '$2y$10$lKrulR4QDmx2b2C.oEp3OOZCLdHQxRqPqvQaGSnFyjt0SllVstTga', 'bendahara', 'bendahara@kelas.id', NULL, NULL, 'active', '2026-09-01 08:45:00', '2026-08-16 12:42:39', '2026-09-01 01:45:00'),
(2, 2, 'risyad', '$2y$10$02v/GILnTDnSnCLPJfvG5etqbkNY0mtUV2TA46xryAd56xjD8ENZS', 'siswa', 'risyad@gmail.com', '085939282827', 'profiles/avatar_2_1006322ebb2e752d.jpeg', 'active', '2026-08-29 10:15:52', '2026-08-16 12:42:39', '2026-08-29 03:15:52'),
(55, 2, 'b11_siswa_a', '$2y$10$jHICJZzp7ezzMKdcc5FrXOLWAn11vCayhf9zfi/JmSdovTwvflaSy', 'siswa', 'b11@test.id', '08120000', NULL, 'inactive', '2026-08-25 20:07:14', '2026-08-25 13:07:14', '2026-08-25 13:07:14'),
(56, 2, 'coba', '$2y$10$5WyEkCWio/r8c5UwUFVM4eEvQNFtiojn/gXbk3q82Q5IkcO7dRvfe', 'siswa', 'aosdaosda@gmail.com', '364835834', NULL, 'active', '2026-08-26 12:20:29', '2026-08-26 05:14:58', '2026-08-26 05:20:29'),
(57, 2, 'nabila', '$2y$10$N7kOzV5ik3EYPSlG67uGk.mhu1JbJODJmwK2JNNhUB0dhnB7yPTr6', 'siswa', 'nabila@gmail.com', '57575757', NULL, 'active', '2026-08-28 09:13:12', '2026-08-28 02:05:23', '2026-08-28 02:13:12'),
(58, 2, 'siti.aminah', '$2y$10$lC6jjww.0e..fIEijopzCOWXSuWIr1uR6swDvQXrR24f8tvzwBPZm', 'siswa', NULL, NULL, NULL, 'inactive', NULL, '2026-08-30 09:07:04', '2026-08-31 02:12:10'),
(59, 2, 'tes1', '$2y$10$EhEt.YH4gNMMymYEpXYY7OMr/bEFkFcvXyqhz7pxnkS2GNUz0dDk6', 'siswa', 'risyad@gmail.com', '4357375043', NULL, 'inactive', NULL, '2026-08-31 02:11:24', '2026-08-31 02:11:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `user_id` int(11) NOT NULL,
  `theme` enum('light','dark','system') NOT NULL DEFAULT 'light',
  `language` varchar(10) DEFAULT 'id',
  `payment_reminder` tinyint(1) NOT NULL DEFAULT 1,
  `announcement_notif` tinyint(1) NOT NULL DEFAULT 1,
  `sound_notif` tinyint(1) NOT NULL DEFAULT 1,
  `email_notif` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`user_id`, `theme`, `language`, `payment_reminder`, `announcement_notif`, `sound_notif`, `email_notif`, `updated_at`) VALUES
(1, 'light', 'id', 1, 1, 1, 0, '2026-08-28 10:06:01'),
(2, 'dark', 'id', 1, 1, 1, 0, '2026-08-30 03:22:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activities_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_announcements_class` (`class_id`),
  ADD KEY `fk_announcements_creator` (`created_by`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_announcement_user` (`announcement_id`,`user_id`),
  ADD KEY `fk_announcement_reads_user` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_user_date` (`user_id`,`created_at`);

--
-- Indexes for table `cash_periods`
--
ALTER TABLE `cash_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_period_class_date` (`class_id`,`start_date`,`end_date`);

--
-- Indexes for table `cash_settings`
--
ALTER TABLE `cash_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_id` (`class_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_expenses_creator` (`created_by`),
  ADD KEY `idx_expenses_class_date` (`class_id`,`expense_date`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_payment_proofs_transaction` (`transaction_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reports_user` (`user_id`),
  ADD KEY `fk_reports_transaction` (`transaction_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `nis` (`nis`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `fk_transactions_verifier` (`verified_by`),
  ADD KEY `idx_transactions_user` (`user_id`),
  ADD KEY `idx_transactions_status` (`status`),
  ADD KEY `idx_transactions_date` (`created_at`);

--
-- Indexes for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_transaction_period` (`transaction_id`,`period_id`),
  ADD KEY `idx_transaction_items_period` (`period_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_users_class` (`class_id`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=299;

--
-- AUTO_INCREMENT for table `cash_periods`
--
ALTER TABLE `cash_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `cash_settings`
--
ALTER TABLE `cash_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_announcements_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `fk_announcement_reads_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_announcement_reads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `cash_periods`
--
ALTER TABLE `cash_periods`
  ADD CONSTRAINT `fk_cash_periods_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cash_settings`
--
ALTER TABLE `cash_settings`
  ADD CONSTRAINT `fk_cash_settings_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `fk_expenses_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_expenses_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  ADD CONSTRAINT `fk_payment_proofs_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transactions_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `transaction_items`
--
ALTER TABLE `transaction_items`
  ADD CONSTRAINT `fk_transaction_items_period` FOREIGN KEY (`period_id`) REFERENCES `cash_periods` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_transaction_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
