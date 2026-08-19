-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 17, 2026 at 04:19 AM
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
(3, 2, 'upload_bukti', 'Bukti pembayaran untuk transaksi #2 diupload', '📤', '2026-08-17 02:03:08');

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
(1, 2, 1, 'Reminder Pembayaran Kas', 'Jangan lupa membayar kas tepat waktu.', 'kas', 'normal', '2026-08-16 20:19:35', '2026-08-16 13:19:35', '2026-08-16 13:19:35'),
(2, 2, 1, 'Lomba Kebersihan Kelas', 'Kelas kita mengikuti lomba kebersihan.', 'informasi_kelas', 'important', '2026-08-16 20:19:35', '2026-08-16 13:19:35', '2026-08-16 13:19:35');

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
(1, 2, '10–16 Aug 2026', 'weekly', '2026-08-10', '2026-08-16', '2026-08-16', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50'),
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
(16, 2, '23–29 Nov 2026', 'weekly', '2026-11-23', '2026-11-29', '2026-11-29', 3000.00, 'upcoming', '2026-08-16 13:19:35', '2026-08-16 14:40:50');

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

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `class_id`, `created_by`, `name`, `category`, `amount`, `description`, `expense_date`, `receipt_file`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Pembelian alat kebersihan', 'kebersihan', 75000.00, 'Pembelian sapu, pel, dan perlengkapan kebersihan kelas.', '2026-08-16', NULL, '2026-08-16 13:19:35', '2026-08-16 13:19:35'),
(2, 2, 1, 'Dekorasi kelas', 'dekorasi', 150000.00, 'Pembelian kertas krep, balon, dan bahan dekorasi.', '2026-08-16', NULL, '2026-08-16 13:19:35', '2026-08-16 13:19:35');

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
(3, 2, 'pembayaran_menunggu', 'Pembayaran Menunggu Verifikasi', 'Pembayaran untuk periode 17–23 Aug 2026 sedang menunggu verifikasi.', 'transaction', 2, 0, '2026-08-17 02:03:00'),
(4, 2, 'bukti_diterima', 'Bukti Pembayaran Diterima', 'Bukti pembayaran untuk transaksi #2 telah diupload.', 'transaction', 2, 0, '2026-08-17 02:03:08'),
(5, 2, 'pembayaran_berhasil', 'Pembayaran Berhasil', 'Pembayaran Anda telah diverifikasi.', 'transaction', 2, 0, '2026-08-17 02:04:25');

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
(1, 2, 'ig (1).jpeg', 'uploads/proof_6a826bdcab5c3.jpeg', 'image/jpeg', 8124, '2026-08-17 02:03:08');

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
(1, 2, '2024100', 'Risyad', 1, '2026-08-16 12:42:39', '2026-08-16 12:42:39');

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
(1, 'TRX-6A8258EA8CDC8', 2, 3000.00, 'cash', 'berhasil', NULL, '2026-08-17 02:50:40', '2026-08-17 02:42:18', '2026-08-17 02:50:40', 1, '2026-08-17 00:42:18', '2026-08-17 00:50:40'),
(2, 'TRX-6A826BD4C4B35', 2, 3000.00, 'cash', 'berhasil', NULL, '2026-08-17 04:04:25', '2026-08-17 04:03:00', '2026-08-17 04:04:25', 1, '2026-08-17 02:03:00', '2026-08-17 02:04:25');

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
(2, 2, 2, 3000.00, '2026-08-17 02:03:00');

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
(1, 2, 'bendahara', '$2y$10$lKrulR4QDmx2b2C.oEp3OOZCLdHQxRqPqvQaGSnFyjt0SllVstTga', 'bendahara', 'bendahara@kelas.id', NULL, NULL, 'active', NULL, '2026-08-16 12:42:39', '2026-08-16 12:42:39'),
(2, 2, 'risyad', '$2y$10$Hw5BpjpMVQZJdmNKEkIy4eyXPklW1pxnI/JHqwC7FQVJsmEXqNg8C', 'siswa', 'risyad@gmail.com', NULL, NULL, 'active', NULL, '2026-08-16 12:42:39', '2026-08-16 12:42:39');

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
(1, 'light', 'id', 1, 1, 1, 0, '2026-08-17 02:04:33'),
(2, 'light', 'id', 1, 1, 1, 0, '2026-08-17 02:04:33');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cash_periods`
--
ALTER TABLE `cash_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `cash_settings`
--
ALTER TABLE `cash_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transaction_items`
--
ALTER TABLE `transaction_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
