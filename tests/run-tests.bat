@echo off
REM ============================================
REM KasKelas - Jalankan seluruh suite pengujian
REM Syarat: XAMPP MySQL (MariaDB) sedang berjalan
REM Tidak mengubah data aplikasi; hanya membaca & membuat/membersihkan data uji sendiri.
REM ============================================
setlocal enabledelayedexpansion
set "PHP=C:\xampp\php\php.exe"
if not exist "%PHP%" set "PHP=php"
set "PORT=8500"
set "BASE=http://127.0.0.1:%PORT%/api"

echo [1/3] Menjalankan server sementara di port %PORT% ...
start "" /min "%PHP%" -S 127.0.0.1:%PORT% -t "%~dp0.."
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Suite 1/3 - Smoke (fitur kunci) ...
"%PHP%" "%~dp0smoke-final.php" %PORT%
echo.
echo [3/3a] Suite 2/3 - Lifecycle akun siswa ...
"%PHP%" "%~dp0e2e-a1b.php" %PORT%
echo.
echo [3/3b] Suite 3/3 - Batch 11 lengkap + security denial ...
"%PHP%" "%~dp0e2e-b11.php" %BASE%

echo.
echo Membersihkan server sementara ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% *.*LISTENING"') do taskkill /PID %%p /F >nul 2>&1
echo.
echo Selesai. Baca hasil PASS/FAIL di atas.
pause
