// ==================== KONFIGURASI & DATA ====================
const CLASS_FREQUENCY = 'weekly';
const WEEKLY_AMOUNT = 3000;
const MONTHLY_AMOUNT = 10000;
let csrfToken = null;

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const shortMonths = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

// ==================== STATE ====================
const state = {
    currentPage: 'login',
    currentUser: null,
    currentUserData: null,
    role: null,
    students: [],
    periods: [],
    transactions: [],
    expenses: [],
    announcements: [],
    notifications: [],
    activities: [],
    cashSettings: {
        frequency: 'weekly',
        defaultAmount: 3000,
        paymentDeadlineDays: 0
    },
    theme: 'light',
    searchQuery: '',
    filterStatus: 'semua',
    filterMethod: 'semua',
    filterPeriod: 'semua',
    sortBy: 'terbaru',
    selectedPeriods: [],
    selectedMethod: 'cash',
    uploadedFile: null,
    paymentSubmitted: false,
    historyStack: [],
    pageParams: {},
    isOnline: true,
    reminderSettings: { paymentReminder: true, announcementNotif: true, soundNotif: true },
    userReports: [],
    isInitialized: false,
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    transparansiMonth: new Date().getMonth(),
    selectedUploadTxId: null,
    txCounter: 1000,
};

// ==================== UTILITIES ====================
function formatRupiah(amount){ return 'Rp' + amount.toLocaleString('id-ID'); }
function formatDate(dateStr){ if(!dateStr) return '-'; const d=new Date(dateStr); if(isNaN(d.getTime())) return dateStr; return d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear(); }
function formatShortDate(dateStr){ if(!dateStr) return '-'; const d=new Date(dateStr); if(isNaN(d.getTime())) return dateStr; return d.getDate()+' '+shortMonths[d.getMonth()]; }
function getInitials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function getAvatarHtml(student, size=''){ return `<div class="avatar ${size}">${getInitials(student.name || student.username)}</div>`; }
function showToast(message, type='success'){ const container=document.getElementById('toastContainer'); const toast=document.createElement('div'); toast.className=`toast toast-${type}`; const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'}; toast.innerHTML=`${icons[type]||'ℹ️'} ${message}`; container.appendChild(toast); setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateY(-20px)'; toast.style.transition='all 0.3s ease'; setTimeout(()=>toast.remove(),300); },3000); }
function showBottomSheet(content){ document.getElementById('bsOverlay').classList.add('open'); document.getElementById('bottomSheet').classList.add('open'); document.getElementById('bsContent').innerHTML=content; document.getElementById('bsOverlay').onclick=()=>closeBottomSheet(); }
function closeBottomSheet(){ document.getElementById('bsOverlay').classList.remove('open'); document.getElementById('bottomSheet').classList.remove('open'); }
function showModal(html){ document.getElementById('modalOverlay').classList.add('open'); document.getElementById('modalBox').innerHTML=html; document.getElementById('modalOverlay').onclick=(e)=>{ if(e.target===document.getElementById('modalOverlay')) closeModal(); }; }
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }
function toggleTheme(theme){ state.theme=theme; document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('kaskelas-theme', theme); }
function getCurrentUser(){ return state.currentUserData || state.students.find(s=>s.id===state.currentUser) || {id:state.currentUser, name:'User', username:'user'}; }
function getUserTransactions(userId){ return state.transactions.filter(t=>t.user_id===userId || t.studentId===userId); }
function getPeriodById(periodId){ 
    return state.periods.find(p => String(p.id) === String(periodId)); 
}
// ==================== LOGIC STATUS ====================
function getPeriodStatusForUser(periodId, userId) {
    const period = getPeriodById(periodId);
    if (!period) return 'belum';
    const tx = state.transactions.find(t => {
        if (parseInt(t.user_id) !== parseInt(userId) && parseInt(t.studentId) !== parseInt(userId)) return false;
        const periodIds = t.periodIds || [];
        if (periodIds.some(id => String(id) === String(periodId))) return true;
        return String(t.periodId) === String(periodId);
    });
    if (!tx) {
        const now = new Date();
        const dueDate = new Date(period.dueDate);
        if (now > dueDate) return 'terlambat';
        return 'belum';
    }
    if (tx.status === 'berhasil') return 'lunas';
    if (tx.status === 'menunggu') return 'menunggu';
    if (tx.status === 'ditolak') return 'ditolak';
    return 'belum';
}

function getTransactionForPeriod(periodId, userId) {
    return state.transactions.find(t => {
        if (String(t.user_id ?? t.studentId) !== String(userId)) return false;
        const periodIds = t.periodIds || [];
        if (periodIds.some(id => String(id) === String(periodId))) return true;
        return String(t.periodId) === String(periodId);
    });
}
function getUnpaidPeriods(userId) {
    return state.periods.filter(p => {
        const s = getPeriodStatusForUser(p.id, userId);
        return s === 'belum' || s === 'ditolak' || s === 'terlambat';
    });
}

function calculateProgress(userId) {
    const totalPeriods = state.periods.length;
    let lunasCount = 0;
    state.periods.forEach(p => {
        if (getPeriodStatusForUser(p.id, userId) === 'lunas') lunasCount++;
    });
    const rate = totalPeriods > 0 ? Math.round((lunasCount / totalPeriods) * 100) : 0;
    return { lunasCount, totalPeriods, rate };
}

function getTimeliness(transaction, period) {
    if (!transaction || !period) return null;
    const paymentDate = new Date(transaction.date);
    const dueDate = new Date(period.dueDate);
    return paymentDate <= dueDate ? 'tepat_waktu' : 'terlambat';
}

function getStatusLabel(status) {
    switch(status) {
        case 'lunas': return 'Lunas';
        case 'menunggu': return 'Menunggu Verifikasi';
        case 'ditolak': return 'Ditolak';
        case 'terlambat': return 'Terlambat';
        default: return 'Belum Bayar';
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'lunas': return 'badge-success';
        case 'menunggu': return 'badge-warning';
        case 'ditolak': return 'badge-danger';
        case 'terlambat': return 'badge-danger';
        default: return 'badge-neutral';
    }
}

function getStudentOverallStatus(studentId) {
    let hasMenunggu = false;
    let allLunas = true;
    for (const p of state.periods) {
        const st = getPeriodStatusForUser(p.id, studentId);
        if (st === 'menunggu') hasMenunggu = true;
        if (st !== 'lunas') allLunas = false;
    }
    if (allLunas) return 'lunas';
    if (hasMenunggu) return 'menunggu';
    return 'belum';
}

function addNotification(type, data) {
    const newNotif = {
        id: state.notifications.length + 1,
        type: type,
        title: '',
        message: '',
        date: new Date().toISOString(),
        isRead: false,
        link: null,
        txId: data?.id || null
    };
    switch(type){
        case 'pembayaran_menunggu':
            newNotif.title = 'Pembayaran Menunggu Verifikasi';
            newNotif.message = `Pembayaran untuk ${data.periodLabel} sedang menunggu verifikasi.`;
            newNotif.link = 'upload-bukti';
            break;
        case 'pembayaran_berhasil':
            newNotif.title = 'Pembayaran Berhasil';
            newNotif.message = `Pembayaran untuk ${data.periodLabel} telah diverifikasi.`;
            newNotif.link = 'riwayat';
            break;
        case 'pembayaran_ditolak':
            newNotif.title = 'Pembayaran Ditolak';
            newNotif.message = `Pembayaran untuk ${data.periodLabel} ditolak. Alasan: ${data.rejectionReason || 'tidak jelas'}.`;
            newNotif.link = 'riwayat';
            break;
        case 'tunggakan':
            newNotif.title = 'Anda memiliki tunggakan';
            newNotif.message = 'Ada periode kas yang belum dibayar atau terlambat.';
            newNotif.link = 'tunggakan';
            break;
        case 'pengumuman':
            newNotif.title = 'Pengumuman Baru';
            newNotif.message = `Ada pengumuman baru: ${data.title}`;
            newNotif.link = 'pengumuman';
            break;
        default:
            newNotif.title = 'Info';
            newNotif.message = data?.message || 'Info baru';
            newNotif.link = null;
    }
    state.notifications.unshift(newNotif);
    updateNotifBadge();
}

// ==================== API HELPER ====================
async function apiFetch(endpoint, method = 'GET', data = null, isFormData = false) {
    const options = { method, headers: {} };
    if (method !== 'GET' && method !== 'HEAD') {
        if (!csrfToken) {
            const csrfRes = await fetch('api/csrf.php', { credentials: 'same-origin' });
            const csrfData = await csrfRes.json();
            if (!csrfRes.ok || !csrfData.csrf_token) throw new Error('CSRF token tidak tersedia');
            csrfToken = csrfData.csrf_token;
        }
        options.headers['X-CSRF-Token'] = csrfToken;
    }
    if (data && !isFormData) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    } else if (data && isFormData) {
        options.body = data;
    }

    options.credentials = 'same-origin';
    const res = await fetch('api/' + endpoint, options);
    const text = await res.text();

    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error(`Respons dari ${endpoint} bukan JSON:`, text);
        throw new Error('Respons server tidak valid');
    }

    if (!res.ok) {
        console.warn(`API ${endpoint} error ${res.status}:`, json);
    }

    return json;
}

// ==================== INISIALISASI DATA ====================
async function loadDataFromServer() {
    try {
        const endpoints = [
            'current_user.php',
            'periods.php',
            'transactions.php',
            'expenses.php',
            'announcements.php',
            'notifications.php',
            'activities.php',
            'students.php',
            'user_settings.php',
            'reports.php'
        ];

        const results = await Promise.all(endpoints.map(ep => apiFetch(ep)));

        const [userRes, periodsRes, txRes, expRes, annRes, notifRes, actRes, studentsRes, settingsRes, reportsRes] = results;

        if (userRes.user) {
            state.currentUserData = userRes.user;
            state.currentUser = userRes.user.id;
            state.role = userRes.user.role;
        }

        if (periodsRes.periods) {
            state.periods = periodsRes.periods.map(p => ({
                id: p.id,
                frequency: p.frequency,
                startDate: p.start_date,
                endDate: p.end_date,
                dueDate: p.due_date,
                amount: parseFloat(p.amount),
                label: p.name,
                shortLabel: p.name,
                monthIdx: new Date(p.start_date).getMonth(),
                year: new Date(p.start_date).getFullYear(),
                isPast: new Date(p.end_date) < new Date(),
                isCurrent: new Date(p.start_date) <= new Date() && new Date() <= new Date(p.end_date),
                nominal: parseFloat(p.amount),
                status: p.status
            }));
        }

        if (txRes.transactions) {
            state.transactions = txRes.transactions.map(t => ({
                id: t.id,
                user_id: t.user_id,
                studentId: t.user_id,
                studentName: t.student_name,
                periodId: t.period_id,
                periodIds: t.period_ids ? (Array.isArray(t.period_ids) ? t.period_ids : t.period_ids.split(',').map(Number)) : [],
                periodLabel: t.period_label || '',
                frequency: t.frequency || CLASS_FREQUENCY,
                amount: parseFloat(t.amount || t.total_amount),
                method: t.method,
                date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                dateObj: new Date(t.created_at || new Date()),
                status: t.status,
                proof: t.proof ? {
                    id: t.proof.id,
                    file_name: t.proof.file_name,
                    file_type: t.proof.file_type,
                    file_size: t.proof.file_size,
                    url: t.proof.url
                } : null,
                rejectionReason: t.rejection_reason,
                createdAt: t.created_at,
                verifiedAt: t.verified_at
            }));
        }

        if (expRes.expenses) {
            state.expenses = expRes.expenses.map(e => ({
                id: e.id,
                name: e.name,
                category: e.category,
                amount: parseFloat(e.amount),
                desc: e.description,
                date: e.expense_date,
                balanceBefore: e.balance_before,
                balanceAfter: e.balance_after
            }));
        }

        if (annRes.announcements) {
            state.announcements = annRes.announcements.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content,
                category: a.category,
                isImportant: a.priority === 'important',
                date: a.published_at ? a.published_at.split('T')[0] : a.created_at.split('T')[0],
                isRead: a.is_read > 0
            }));
        }

        if (notifRes.notifications) {
            state.notifications = notifRes.notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                isRead: n.is_read === 1,
                reference_type: n.reference_type,
                reference_id: n.reference_id,
                date: n.created_at
            }));
        }

        if (actRes.activities) {
            state.activities = actRes.activities.map(a => ({
                id: a.id,
                type: a.type,
                description: a.description,
                icon: a.icon || '📄',
                time: a.created_at
            }));
        }

        if (studentsRes.students) {
            state.students = studentsRes.students.map(s => ({
                id: s.id,
                name: s.full_name,
                username: s.username,
                email: s.email,
                phone: s.phone,
                nis: s.nis,
                absenNumber: s.attendance_number,
                kelas: s.kelas || 'XII RPL 3',
                status: s.status
            }));
        }

        if (settingsRes.settings) {
            state.reminderSettings = {
                paymentReminder: settingsRes.settings.payment_reminder === 1,
                announcementNotif: settingsRes.settings.announcement_notif === 1,
                soundNotif: settingsRes.settings.sound_notif === 1
            };
            state.theme = settingsRes.settings.theme || 'light';
        }

        if (reportsRes.reports) {
            state.userReports = reportsRes.reports.map(r => ({
                id: r.id,
                userId: r.user_id,
                category: r.category,
                title: r.title,
                desc: r.description,
                transactionId: r.transaction_id,
                status: r.status,
                createdAt: r.created_at
            }));
        }

        return true;
    } catch (err) {
        console.warn('Gagal memuat data dari server, fallback ke data kosong', err);
        return false;
    }
}
// Fungsi khusus untuk dashboard (hanya ambil data penting)
async function loadDashboardData() {
    try {
        const [userRes, periodsRes, txRes, settingsRes] = await Promise.all([
            apiFetch('current_user.php'),
            apiFetch('periods.php'),
            apiFetch('transactions.php'),
            apiFetch('cash_settings.php')
        ]);

        if (userRes.user) {
            state.currentUserData = userRes.user;
            state.currentUser = userRes.user.id;
            state.role = userRes.user.role;
        }

        if (settingsRes.cash_settings) {
            const cs = settingsRes.cash_settings;
            state.cashSettings = {
                frequency: cs.frequency,
                defaultAmount: parseFloat(cs.default_amount),
                paymentDeadlineDays: parseInt(cs.payment_deadline_days)
            };
        }

        if (periodsRes.periods) {
            state.periods = periodsRes.periods.map(p => ({
                id: p.id,
                frequency: p.frequency,
                startDate: p.start_date,
                endDate: p.end_date,
                dueDate: p.due_date,
                amount: parseFloat(p.amount),
                label: p.name,
                shortLabel: p.name,
                monthIdx: new Date(p.start_date).getMonth(),
                year: new Date(p.start_date).getFullYear(),
                isPast: new Date(p.end_date) < new Date(),
                isCurrent: new Date(p.start_date) <= new Date() && new Date() <= new Date(p.end_date),
                nominal: parseFloat(p.amount),
                status: p.status
            }));
        }

        if (txRes.transactions) {
            state.transactions = txRes.transactions.map(t => ({
                id: t.id,
                user_id: t.user_id,
                studentId: t.user_id,
                studentName: t.student_name,
                periodId: t.period_id,
                periodIds: t.period_ids ? (Array.isArray(t.period_ids) ? t.period_ids : t.period_ids.split(',').map(Number)) : [],
                periodLabel: t.period_label || '',
                frequency: t.frequency || CLASS_FREQUENCY,
                amount: parseFloat(t.amount || t.total_amount),
                method: t.method,
                date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                dateObj: new Date(t.created_at || new Date()),
                status: t.status,
                proof: t.proof ? {
                    id: t.proof.id,
                    file_name: t.proof.file_name,
                    file_type: t.proof.file_type,
                    file_size: t.proof.file_size,
                    url: t.proof.url
                } : null,
                rejectionReason: t.rejection_reason,
                createdAt: t.created_at,
                verifiedAt: t.verified_at
            }));
        }

        return true;
    } catch (err) {
        console.warn('Gagal memuat data dashboard', err);
        return false;
    }
}


async function loadNotifications() {
    try {
        const res = await apiFetch('notifications.php');
        if (res.notifications) {
            state.notifications = res.notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                isRead: n.is_read === 1,
                link: n.link,
                date: n.created_at
            }));
        }
    } catch (err) {
        console.warn('Gagal memuat notifikasi', err);
    }
}
// ==================== NAVIGATION ====================
let isPopState = false;

function navigateTo(page, params=null) {
    if (page === 'login') { state.currentUser = null; state.historyStack = []; }
    if (page !== 'login' && !state.currentUser) page = 'login';
    if (state.currentPage !== page) {
        const mainPages = ['home','kas-saya','pembayaran','riwayat','tunggakan','anggota','transparansi','pengeluaran','pengumuman','notifikasi','aktivitas','kalender','statistik','profil','pengaturan','verifikasi'];
        if (mainPages.includes(page) && mainPages.includes(state.currentPage)) {
            state.filterStatus = 'semua';
            state.filterMethod = 'semua';
            state.filterPeriod = 'semua';
            state.sortBy = 'terbaru';
            state.searchQuery = '';
            state.selectedPeriods = [];
        }
        state.historyStack.push(state.currentPage);
    }
    state.currentPage = page;
    state.pageParams = params || {};
    renderPage();
    window.scrollTo(0,0);
    updateNavUI();
    closeBottomSheet();
    closeModal();
    if (!isPopState) {
        history.pushState({ page: state.currentPage, params: state.pageParams }, '', '');
    } else {
        isPopState = false;
    }
}

function goBack() {
    if (state.historyStack.length > 0) {
        const prev = state.historyStack.pop();
        state.currentPage = prev;
        state.pageParams = {};
        renderPage();
        window.scrollTo(0,0);
        updateNavUI();
        if (!isPopState) {
            history.pushState({ page: state.currentPage, params: state.pageParams }, '', '');
        } else {
            isPopState = false;
        }
    } else {
        navigateTo('home');
    }
}

function updateNavUI() {
    const isAuthenticated = Boolean(state.currentUser) && state.currentPage !== 'login';
    document.getElementById('app').classList.toggle('is-authenticated', isAuthenticated);
    const pageMap = { home:'home', 'kas-saya':'kas', 'riwayat':'riwayat', notifikasi:'notifikasi', profil:'profil', verifikasi:'verifikasi' };
    const activeNav = pageMap[state.currentPage];
    document.querySelectorAll('.bottom-nav .nav-item, .sidebar-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === activeNav);
    });
    document.getElementById('bottomNav').style.display = isAuthenticated ? 'flex' : 'none';
    // Tampilkan menu verifikasi hanya untuk bendahara di sidebar
    const verifMenu = document.querySelector('[data-page="verifikasi"]');
    if (verifMenu) {
        verifMenu.style.display = (state.role === 'bendahara') ? 'flex' : 'none';
    }
    updateNotifBadge();
}

function updateNotifBadge() {
    const unread = state.notifications.filter(n => !n.isRead).length;
    const bottomNotifBtn = document.querySelector('.bottom-nav [data-page="notifikasi"]');
    const sideNotifBtn = document.querySelector('.sidebar-nav [data-page="notifikasi"]');
    if (bottomNotifBtn) {
        const existingDot = bottomNotifBtn.querySelector('.badge-dot');
        if (unread > 0 && !existingDot) {
            const dot = document.createElement('span');
            dot.className = 'badge-dot';
            bottomNotifBtn.appendChild(dot);
        } else if (unread === 0 && existingDot) {
            existingDot.remove();
        }
    }
    if (sideNotifBtn) {
        const existingDot = sideNotifBtn.querySelector('.badge-dot');
        if (unread > 0 && !existingDot) {
            const dot = document.createElement('span');
            dot.className = 'badge-dot';
            sideNotifBtn.appendChild(dot);
        } else if (unread === 0 && existingDot) {
            existingDot.remove();
        }
    }
}

// ==================== RENDER ====================
let activeInputId = null;

async function renderPage() {
    const content = document.getElementById('pageContent');
    const pages = {
        'login': renderLoginPage,
        'home': renderHomePage,
        'kas-saya': renderKasSayaPage,
        'pembayaran': renderPembayaranPage,
        'upload-bukti': renderUploadBuktiPage,
        'riwayat': renderRiwayatPage,
        'detail-transaksi': renderDetailTransaksiPage,
        'tunggakan': renderTunggakanPage,
        'anggota': renderAnggotaPage,
        'detail-anggota': renderDetailAnggotaPage,
        'transparansi': renderTransparansiPage,
        'pengeluaran': renderPengeluaranPage,
        'detail-pengeluaran': renderDetailPengeluaranPage,
        'pengumuman': renderPengumumanPage,
        'detail-pengumuman': renderDetailPengumumanPage,
        'notifikasi': renderNotifikasiPage,
        'aktivitas': renderAktivitasPage,
        'kalender': renderKalenderPage,
        'statistik': renderStatistikPage,
        'profil': renderProfilPage,
        'edit-profil': renderEditProfilPage,
        'pengaturan': renderPengaturanPage,
        'faq': renderFaqPage,
        'bantuan': renderBantuanPage,
        'report-problem': renderReportProblemPage,
        'my-reports': renderMyReportsPage,
        'search': renderSearchPage,
        'verifikasi': renderVerifikasiPage
    };
    const renderFn = pages[state.currentPage];
    if (renderFn) {
        content.innerHTML = await renderFn();
    } else {
        content.innerHTML = `<div class="container"><div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Halaman tidak ditemukan</div></div></div>`;
    }
    attachPageEvents();
    if (activeInputId) {
        const input = document.getElementById(activeInputId);
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
        activeInputId = null;
    }
}

function renderHeader(title, showBack = false) {
    return `
    <div class="top-header">
        ${showBack ? `<button class="back-btn" onclick="goBack()">← Kembali</button>` : ''}
        <span class="page-title">${title}</span>
        <button class="header-action" onclick="navigateTo('search')" aria-label="Cari">🔍</button>
    </div>`;
}

// ==================== HALAMAN LOGIN ====================
function renderLoginPage() {
    return `
    <main class="login-page">
        <div class="login-panel">
            <div class="login-brand">
                <div class="login-mark" aria-hidden="true">K</div>
                <h1>KasKelas</h1>
                <p>Manajemen kas kelas untuk siswa</p>
            </div>
            <section class="card login-card" aria-labelledby="loginTitle">
                <h2 id="loginTitle">Masuk</h2>
                <div class="form-group"><label class="form-label" for="loginNis">NIS / Username</label><input type="text" class="form-input" id="loginNis" autocomplete="username"></div>
                <div class="form-group"><label class="form-label" for="loginPass">Password</label><input type="password" class="form-input" id="loginPass" autocomplete="current-password"></div>
                <button class="btn btn-primary btn-block btn-lg" id="btnLogin" onclick="handleLogin()">Masuk</button>
            </section>
        </div>
    </main>`;
}

async function handleLogin() {
    const username = document.getElementById('loginNis').value.trim();
    const password = document.getElementById('loginPass').value;
    const btn = document.getElementById('btnLogin');
    btn.disabled = true; btn.innerHTML = '⟳ Memproses...';

    try {
        const data = await apiFetch('login.php', 'POST', { username, password });
        if (data.success) {
            state.currentUser = data.user.id;
            state.role = data.user.role;
            state.currentUserData = data.user;
            state.historyStack = [];

            // Pindah halaman dulu, biar toast dan dashboard muncul cepat
            navigateTo('home');
            showToast(`Selamat datang, ${data.user.name}! 👋`, 'success');

            // Tidak perlu memuat semua data di sini karena dashboard akan
            // memuat data yang dibutuhkan lewat loadDashboardData()
        } else {
            btn.disabled = false;
            btn.innerHTML = 'Masuk';
            showToast(data.error || 'Login gagal', 'error');
        }
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = 'Masuk';
        showToast('Terjadi kesalahan jaringan', 'error');
    }
}

// ==================== DASHBOARD ====================
async function renderHomePage() {
    
    // Ambil hanya data penting untuk dashboard
    if (state.periods.length === 0 || state.transactions.length === 0) {
        await loadDashboardData();
    }
   
    const user = getCurrentUser();
    const progress = calculateProgress(user.id);
    const unpaidPeriods = getUnpaidPeriods(user.id);
    const totalUnpaid = unpaidPeriods.reduce((sum, p) => sum + p.amount, 0);
    const currentPeriod = state.periods.find(p => p.isCurrent) || state.periods[state.periods.length-1];
    if (!currentPeriod) {
        return `<div class="container"><div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">Belum ada periode</div><p class="empty-desc">Jalankan seed_periods.php untuk menambah periode.</p></div></div>`;
    }
    const currentStatus = getPeriodStatusForUser(currentPeriod.id, user.id);
    const dueDate = new Date(currentPeriod.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const recentTx = getUserTransactions(user.id).slice(-5).reverse();
    const announcements = state.announcements.filter(a => !a.isRead).slice(0, 3);
    const unpaidCount = unpaidPeriods.length;

    let heroButton;
    if (currentStatus === 'lunas') {
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('kas-saya')">Lihat Detail</button>`;
    } else if (currentStatus === 'menunggu') {
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('riwayat')">Lihat Status</button>`;
    } else if (currentStatus === 'ditolak') {
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('riwayat')">Upload Ulang</button>`;
    } else {
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('pembayaran')">Bayar Sekarang</button>`;
    }

    return `
    ${renderHeader('Dashboard')}
    <div class="container">
        <div class="flex items-center gap-12 mb-16">
            ${getAvatarHtml(user, 'avatar-lg')}
            <div>
                <h2 style="font-size:20px;font-weight:800;">Selamat pagi, ${user.name || user.username} 👋</h2>
                <p style="font-size:13px;color:var(--text-secondary);">${user.kelas || 'Kelas'} • ${user.absenNumber ? 'Absen '+user.absenNumber : user.role || 'Siswa'}</p>
            </div>
        </div>

        <div class="card hero-card mb-16">
            <div class="flex items-center justify-between">
                <div>
                    <p style="font-size:12px;font-weight:600;opacity:0.9;">KAS ${currentPeriod.frequency === 'weekly' ? 'MINGGU INI' : 'BULAN INI'}</p>
                    <p style="font-size:28px;font-weight:800;margin:4px 0;">${formatRupiah(currentPeriod.amount)}</p>
                    <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff;">${getStatusLabel(currentStatus)}</span>
                </div>
                ${heroButton}
            </div>
            <p style="font-size:12px;opacity:0.9;margin-top:8px;">Periode: ${currentPeriod.label}</p>
            <p style="font-size:12px;opacity:0.9;">Jatuh tempo: ${formatDate(currentPeriod.dueDate)} (${diffDays>=0?diffDays+' hari lagi':'Terlambat '+Math.abs(diffDays)+' hari'})</p>
            <div class="progress-bar mt-16" style="background:rgba(255,255,255,0.2);">
                <div class="progress-fill" style="width:${progress.rate}%;"></div>
            </div>
            <p style="font-size:11px;margin-top:4px;">${progress.lunasCount} dari ${progress.totalPeriods} periode lunas</p>
        </div>

        <div class="stat-grid mb-16">
            <div class="stat-card"><div class="stat-value">${formatRupiah(progress.lunasCount * (currentPeriod.frequency === 'weekly' ? WEEKLY_AMOUNT : MONTHLY_AMOUNT))}</div><div class="stat-label">Total Dibayar</div></div>
            <div class="stat-card"><div class="stat-value" style="color:${totalUnpaid>0?'var(--danger)':'var(--success)'};">${formatRupiah(totalUnpaid)}</div><div class="stat-label">Tunggakan</div></div>
            <div class="stat-card"><div class="stat-value">${progress.lunasCount}</div><div class="stat-label">Periode Lunas</div></div>
            <div class="stat-card"><div class="stat-value">${progress.rate}%</div><div class="stat-label">Progress</div></div>
        </div>

        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Quick Access</span></div>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateTo('pembayaran')"><span class="qa-icon">💳</span>Bayar Kas</button>
                <button class="quick-action-btn" onclick="navigateTo('tunggakan')"><span class="qa-icon">⚠️</span>Tunggakan</button>
                <button class="quick-action-btn" onclick="navigateTo('riwayat')"><span class="qa-icon">📋</span>Riwayat</button>
                <button class="quick-action-btn" onclick="navigateTo('transparansi')"><span class="qa-icon">📊</span>Transparansi</button>
            </div>
        </div>

        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Fitur Kelas</span></div>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateTo('pengeluaran')"><span class="qa-icon">💸</span>Pengeluaran</button>
                <button class="quick-action-btn" onclick="navigateTo('pengumuman')"><span class="qa-icon">📢</span>Pengumuman</button>
                <button class="quick-action-btn" onclick="navigateTo('kalender')"><span class="qa-icon">📅</span>Kalender</button>
                <button class="quick-action-btn" onclick="navigateTo('anggota')"><span class="qa-icon">👥</span>Anggota</button>
            </div>
        </div>

        <div class="card mb-16">
            <div class="card-header">
                <span class="card-title">Transaksi Terbaru</span>
                <button style="font-size:12px;color:var(--primary);" onclick="navigateTo('riwayat')">Lihat Semua →</button>
            </div>
            ${recentTx.length===0?'<p style="font-size:13px;color:var(--text-muted);">Belum ada transaksi.</p>':recentTx.map(tx=>`
                <div class="list-item" onclick="navigateTo('detail-transaksi',{id:'${tx.id}'})">
                    <span>💳</span>
                    <div class="item-info"><div class="item-title">${tx.periodLabel || tx.period_label || 'Periode'}</div><div class="item-subtitle">${formatShortDate(tx.date)} • ${tx.method.toUpperCase()}</div></div>
                    <span class="badge ${getStatusBadgeClass(tx.status)}">${getStatusLabel(tx.status)}</span>
                </div>`).join('')}
        </div>

        <div class="card">
            <div class="card-header">
                <span class="card-title">📢 Pengumuman</span>
                <button style="font-size:12px;color:var(--primary);" onclick="navigateTo('pengumuman')">Lihat Semua →</button>
            </div>
            ${announcements.length===0?'<p style="font-size:13px;color:var(--text-muted);">Tidak ada pengumuman baru.</p>':announcements.map(a=>`
                <div class="list-item" onclick="navigateTo('detail-pengumuman',{id:${a.id}})" style="${a.isImportant?'border-left:3px solid var(--danger);':''}">
                    <span>${a.isImportant?'🔴':'📄'}</span>
                    <div class="item-info"><div class="item-title">${a.title}</div><div class="item-subtitle">${formatShortDate(a.date)} • ${a.category}</div></div>
                </div>`).join('')}
        </div>

        ${unpaidCount>0?`<div class="card mt-16" style="background:var(--warning-bg);border:1px solid var(--warning);"><p style="font-size:13px;font-weight:600;color:var(--warning);">⚠️ Anda memiliki ${unpaidCount} periode tunggakan.</p><button class="btn btn-outline btn-sm mt-8" onclick="navigateTo('tunggakan')">Lihat Tunggakan</button></div>`:''}
    </div>`;
}

// ==================== KAS SAYA ====================
function renderKasSayaPage() {
    const user = getCurrentUser();
    const progress = calculateProgress(user.id);
    const totalAmount = progress.totalPeriods * (CLASS_FREQUENCY === 'weekly' ? WEEKLY_AMOUNT : MONTHLY_AMOUNT);
    const totalUnpaid = getUnpaidPeriods(user.id).reduce((sum, p) => sum + p.amount, 0);
    return `
    ${renderHeader('Kas Saya', true)}
    <div class="container">
        <div class="card mb-16 text-center">
            <p style="font-size:14px;color:var(--text-secondary);">Total Kewajiban</p>
            <p style="font-size:32px;font-weight:800;color:var(--primary);">${formatRupiah(totalAmount)}</p>
            <div class="progress-bar mt-16"><div class="progress-fill success" style="width:${progress.rate}%;"></div></div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">Tingkat Pembayaran: ${progress.rate}%</p>
        </div>
        <div class="stat-grid mb-16">
            <div class="stat-card"><div class="stat-value">${formatRupiah(progress.lunasCount * (CLASS_FREQUENCY==='weekly'?WEEKLY_AMOUNT:MONTHLY_AMOUNT))}</div><div class="stat-label">Sudah Dibayar</div></div>
            <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${formatRupiah(totalUnpaid)}</div><div class="stat-label">Tunggakan</div></div>
            <div class="stat-card"><div class="stat-value">${progress.lunasCount}</div><div class="stat-label">Periode Lunas</div></div>
            <div class="stat-card"><div class="stat-value">${getUnpaidPeriods(user.id).length}</div><div class="stat-label">Belum Bayar</div></div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Daftar Periode (${CLASS_FREQUENCY==='weekly'?'Mingguan':'Bulanan'})</span></div>
            <div class="filter-chips mb-8">
                ${['semua','lunas','menunggu','ditolak','terlambat'].map(f=>`<button class="chip ${state.filterStatus===f?'active':''}" onclick="state.filterStatus='${f}';renderPage()">${f}</button>`).join('')}
            </div>
            <div id="periodList">
                ${state.periods.filter(p => {
                    const st = getPeriodStatusForUser(p.id, user.id);
                    if (state.filterStatus === 'semua') return true;
                    if (state.filterStatus === 'lunas') return st === 'lunas';
                    if (state.filterStatus === 'menunggu') return st === 'menunggu';
                    if (state.filterStatus === 'ditolak') return st === 'ditolak';
                    if (state.filterStatus === 'terlambat') return st === 'terlambat';
                    return false;
                }).map(p => {
                    const st = getPeriodStatusForUser(p.id, user.id);
                    return `<div class="list-item" onclick="showPeriodDetail('${p.id}')" style="border-bottom:1px solid var(--border);border-radius:0;">
                        <span>${st==='lunas'?'✅':st==='menunggu'?'⏳':'⬜'}</span>
                        <div class="item-info"><div class="item-title">${p.label}</div><div class="item-subtitle">${formatRupiah(p.amount)} • Deadline ${formatShortDate(p.dueDate)}</div></div>
                        <span class="badge ${getStatusBadgeClass(st)}">${getStatusLabel(st)}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </div>`;
}

// ==================== PEMBAYARAN ====================
async function renderPembayaranPage() {
   
    // Muat data dashboard jika periode/transaksi belum ada
    if (state.periods.length === 0 || state.transactions.length === 0) {
        await loadDashboardData();
    }

    const user = getCurrentUser();
    const unpaidPeriods = getUnpaidPeriods(user.id);

    // Bersihkan selectedPeriods yang tidak valid
    state.selectedPeriods = state.selectedPeriods.filter(id => 
    state.periods.some(p => String(p.id) === String(id))
);

    if (state.selectedPeriods.length === 0 && unpaidPeriods.length > 0) {
    state.selectedPeriods = [String(unpaidPeriods[0].id)];
    }

    const selectedPeriodList = state.selectedPeriods
        .map(id => getPeriodById(id))
        .filter(Boolean);

    const totalAmount = selectedPeriodList.reduce((sum, p) => sum + (p.amount || 0), 0);

    return `
    ${renderHeader('Pembayaran Kas', true)}
    <div class="container">
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Pilih Periode (${CLASS_FREQUENCY==='weekly'?'Mingguan':'Bulanan'})</span></div>
            <div style="max-height:300px;overflow-y:auto;">
                ${unpaidPeriods.length === 0 ? 
                    '<p class="text-center" style="color:var(--success);">Tidak ada tunggakan.</p>' :
                    unpaidPeriods.map(p => {
                        const checked = state.selectedPeriods.some(id => String(id) === String(p.id));
                        return `<label class="list-item" style="cursor:pointer;">
                            <input type="checkbox" ${checked?'checked':''} onchange="togglePeriodSelection('${p.id}')" style="width:20px;height:20px;">
                            <span>${p.label}</span>
                            <span style="margin-left:auto;font-weight:700;">${formatRupiah(p.amount)}</span>
                        </label>`;
                    }).join('')
                }
            </div>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Metode Pembayaran</span></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                ${['cash','transfer','qris'].map(m=>`<button class="chip ${state.selectedMethod===m?'active':''}" onclick="state.selectedMethod='${m}';renderPage()" style="padding:12px;text-align:center;"><span style="font-size:20px;display:block;">${m==='cash'?'💵':m==='transfer'?'🏦':'📱'}</span>${m.toUpperCase()}</button>`).join('')}
            </div>
            ${state.selectedMethod==='qris'?`<div class="text-center mt-8"><div style="width:120px;height:120px;background:var(--input-bg);border-radius:8px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:48px;">📱</div><p style="font-size:12px;color:var(--text-muted);">Scan untuk bayar ${formatRupiah(totalAmount)}</p></div>`:state.selectedMethod==='transfer'?`<p style="font-size:13px;margin-top:8px;">Transfer ke rekening: <strong>BNI 1234-5678-9012 a.n. Bendahara</strong></p>`:`<p style="font-size:13px;margin-top:8px;">Serahkan uang kepada bendahara.</p>`}
        </div>
        <div class="card mb-16">
            <p>Total yang harus dibayar:</p>
            <p style="font-size:24px;font-weight:800;color:var(--primary);">${formatRupiah(totalAmount)}</p>
        </div>
        <button class="btn btn-primary btn-block btn-lg" onclick="handlePaymentSubmit()">💳 Bayar Sekarang</button>
    </div>`;
}

function togglePeriodSelection(periodId) {
    console.log('toggle dipanggil dengan id:', periodId);
    console.log('selectedPeriods sebelum:', JSON.stringify(state.selectedPeriods));

    const id = String(periodId);
    const idx = state.selectedPeriods.findIndex(selId => String(selId) === id);
    if (idx > -1) {
        state.selectedPeriods.splice(idx, 1);
    } else {
        state.selectedPeriods.push(id);
    }

    console.log('selectedPeriods sesudah:', JSON.stringify(state.selectedPeriods));
    renderPage();
}
async function handlePaymentSubmit() {
    if (state.selectedPeriods.length === 0) {
        showToast('Pilih minimal satu periode', 'warning');
        return;
    }

    const user = getCurrentUser();
    const selectedIds = state.selectedPeriods.filter(id => getPeriodById(id));

    if (selectedIds.length === 0) {
        showToast('Periode tidak valid', 'error');
        return;
    }

    for (const periodId of selectedIds) {
        const existingTx = getTransactionForPeriod(periodId, user.id);
        if (existingTx && (existingTx.status === 'menunggu' || existingTx.status === 'berhasil')) {
            const periodLabel = getPeriodById(periodId)?.label || 'Periode';
            showToast(`Periode ${periodLabel} sudah dibayar atau menunggu verifikasi.`, 'error');
            return;
        }
        if (existingTx && existingTx.status === 'ditolak') {
            const periodLabel = getPeriodById(periodId)?.label || 'Periode';
            showToast(`Periode ${periodLabel} ditolak. Gunakan upload ulang bukti.`, 'error');
            return;
        }
    }

    const totalAmount = selectedIds.reduce((sum, id) => {
        const period = getPeriodById(id);
        return sum + (parseFloat(period.amount) || 0);
    }, 0);

    const periodLabels = selectedIds.map(id => getPeriodById(id)?.label || 'Periode').join(', ');

    showBottomSheet(`
        <h3>Konfirmasi</h3>
        <p>Periode: ${periodLabels}</p>
        <p>Total: <strong>${formatRupiah(totalAmount)}</strong></p>
        <p>Metode: ${state.selectedMethod.toUpperCase()}</p>
        <div class="flex gap-8 mt-16">
            <button class="btn btn-outline flex-1" onclick="closeBottomSheet()">Batal</button>
            <button class="btn btn-primary flex-1" onclick="processPayment()">Konfirmasi</button>
        </div>
    `);
}
async function processPayment() {
    const user = getCurrentUser();

    const periods = state.selectedPeriods
        .map(id => getPeriodById(id))
        .filter(Boolean);

    console.log('selectedPeriods:', state.selectedPeriods);
    console.log('periods:', periods);

    if (periods.length === 0) {
        showToast('Tidak ada periode valid untuk dibayar', 'error');
        closeBottomSheet();
        return;
    }

    const periodIds = periods.map(p => parseInt(p.id));
    const totalAmount = periods.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    console.log('periodIds:', periodIds);
    console.log('method:', state.selectedMethod);
    console.log('total:', totalAmount);

    try {
        const data = await apiFetch('submit_payment.php', 'POST', {
            period_ids: periodIds,
            method: state.selectedMethod,
            total: totalAmount
        });

        console.log('Response submit_payment:', data);

        if (data.success) {
            state.selectedPeriods = [];
            state.selectedMethod = 'cash';
            closeBottomSheet();
            showToast('Pembayaran dikirim. Menunggu verifikasi.', 'success');
            await loadDataFromServer(); // refresh data
            navigateTo('upload-bukti');
        } else {
            showToast(data.error || 'Gagal mengirim pembayaran', 'error');
        }
    } catch (err) {
        console.error('Error submit payment:', err);
        showToast('Gagal terhubung ke server: ' + err.message, 'error');
    }
}

// ==================== UPLOAD BUKTI ====================
function renderUploadBuktiPage() {
    const user = getCurrentUser();
    const pendingTxs = state.transactions.filter(t => t.user_id === user.id && t.status === 'menunggu' && !t.proof);
    if (pendingTxs.length === 0) {
        return `${renderHeader('Upload Bukti', true)}<div class="container"><div class="empty-state"><div class="empty-icon">📤</div><div class="empty-title">Tidak ada pembayaran menunggu</div><button class="btn btn-primary mt-16" onclick="navigateTo('pembayaran')">Bayar Kas</button></div></div>`;
    }
    if (!state.selectedUploadTxId || !pendingTxs.some(t => t.id === state.selectedUploadTxId)) {
        state.selectedUploadTxId = pendingTxs[0].id;
    }
    const selectedTx = pendingTxs.find(t => t.id === state.selectedUploadTxId);
    return `
    ${renderHeader('Upload Bukti', true)}
    <div class="container">
        ${pendingTxs.length > 1 ? `
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Pilih Transaksi</span></div>
            ${pendingTxs.map(tx => `
                <div class="list-item ${state.selectedUploadTxId === tx.id ? 'active' : ''}" onclick="state.selectedUploadTxId='${tx.id}';renderPage()">
                    <span>💳</span>
                    <div class="item-info"><div class="item-title">${tx.periodLabel || tx.period_label || 'Periode'}</div><div class="item-subtitle">${tx.id} • ${formatRupiah(tx.amount)}</div></div>
                    ${state.selectedUploadTxId === tx.id ? '<span style="color:var(--primary);font-weight:700;">✓</span>' : ''}
                </div>`).join('')}
        </div>` : ''}
        <div class="card mb-16">
            <p>Periode: <strong>${selectedTx.periodLabel || selectedTx.period_label || 'Periode'}</strong></p>
            <p>Nominal: <strong>${formatRupiah(selectedTx.amount)}</strong></p>
            <p>Metode: <strong>${selectedTx.method.toUpperCase()}</strong></p>
            <span class="badge badge-warning">Menunggu Verifikasi</span>
        </div>
        <div class="card">
            <div class="upload-zone" onclick="document.getElementById('fileInput').click()"><div class="upload-icon">📸</div><p>Klik untuk pilih file</p><p style="font-size:11px;color:var(--text-muted);">JPG, PNG, PDF (Maks 5MB)</p></div>
            <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.pdf" style="display:none;" onchange="handleFileSelect(event)">
            <div id="filePreviewContainer"></div>
        </div>
        <button class="btn btn-primary btn-block mt-16" id="btnUpload" onclick="handleUploadProof()" disabled>📤 Kirim Bukti</button>
    </div>`;
}

function handleFileSelect(event) {
    const file = event.target.files[0]; if (!file) return;
    const allowed = ['image/jpeg','image/png','application/pdf'];
    if (!allowed.includes(file.type)) { showToast('Format tidak didukung', 'error'); return; }
    if (file.size > 5*1024*1024) { showToast('Ukuran >5MB', 'error'); return; }
    state.uploadedFile = file;
    const preview = document.getElementById('filePreviewContainer');
    const isImage = file.type.startsWith('image/');
    preview.innerHTML = `<div class="file-preview">${isImage?`<img src="${URL.createObjectURL(file)}">`:'📄'}<div class="flex-1"><p>${file.name}</p><p style="font-size:11px;color:var(--text-muted);">${(file.size/1024/1024).toFixed(2)} MB</p></div><button onclick="removeFile()">✕</button></div>`;
    document.getElementById('btnUpload').disabled = false;
}

function removeFile() {
    state.uploadedFile = null;
    document.getElementById('filePreviewContainer').innerHTML = '';
    document.getElementById('btnUpload').disabled = true;
    document.getElementById('fileInput').value = '';
}

async function handleUploadProof() {
    if (!state.uploadedFile) { showToast('Pilih file', 'warning'); return; }
    if (!state.selectedUploadTxId) { showToast('Pilih transaksi', 'warning'); return; }
    const btn = document.getElementById('btnUpload');
    btn.disabled = true; btn.innerHTML = '⟳ Mengupload...';
    const formData = new FormData();
    formData.append('proof', state.uploadedFile);
    formData.append('transaction_id', state.selectedUploadTxId);
    try {
        const data = await apiFetch('upload_proof.php', 'POST', formData, true);
        if (data.success) {
            showToast('Bukti berhasil diupload', 'success');
            state.uploadedFile = null;
            state.selectedUploadTxId = null;
            await loadDataFromServer();
            navigateTo('riwayat');
        } else {
            showToast(data.error || 'Gagal upload', 'error');
            btn.disabled = false;
            btn.innerHTML = '📤 Kirim Bukti';
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false;
        btn.innerHTML = '📤 Kirim Bukti';
    }
}

// ==================== RIWAYAT ====================
function renderRiwayatPage() {
    const user = getCurrentUser();
    let tx = getUserTransactions(user.id);
    if (state.filterStatus !== 'semua') tx = tx.filter(t => t.status === state.filterStatus);
    if (state.filterMethod !== 'semua') tx = tx.filter(t => t.method === state.filterMethod);
    if (state.filterPeriod !== 'semua') tx = tx.filter(t => t.periodId === state.filterPeriod);
    if (state.searchQuery) tx = tx.filter(t => t.id.toString().includes(state.searchQuery) || (t.periodLabel||'').toLowerCase().includes(state.searchQuery.toLowerCase()));
    if (state.sortBy === 'terbaru') tx.sort((a,b)=>new Date(b.dateObj)-new Date(a.dateObj));
    if (state.sortBy === 'terlama') tx.sort((a,b)=>new Date(a.dateObj)-new Date(b.dateObj));
    if (state.sortBy === 'nominal-desc') tx.sort((a,b)=>b.amount-a.amount);
    if (state.sortBy === 'nominal-asc') tx.sort((a,b)=>a.amount-b.amount);
    return `
    ${renderHeader('Riwayat Transaksi', true)}
    <div class="container">
        <div class="search-input mb-8"><span>🔍</span><input type="text" id="searchInputRiwayat" placeholder="Cari ID atau periode..." value="${state.searchQuery}" oninput="activeInputId='searchInputRiwayat'; state.searchQuery=this.value; renderPage()"></div>
        <div class="filter-chips mb-8">
            ${['semua','berhasil','menunggu','ditolak'].map(f=>`<button class="chip ${state.filterStatus===f?'active':''}" onclick="state.filterStatus='${f}';renderPage()">${f}</button>`).join('')}
        </div>
        <div class="filter-chips mb-8">
            ${['semua','cash','transfer','qris'].map(m=>`<button class="chip ${state.filterMethod===m?'active':''}" onclick="state.filterMethod='${m}';renderPage()">${m}</button>`).join('')}
        </div>
        <div class="filter-chips mb-16">
            <button class="chip ${state.filterPeriod==='semua'?'active':''}" onclick="state.filterPeriod='semua';renderPage()">Semua Periode</button>
            ${state.periods.map(p=>`<button class="chip ${state.filterPeriod===p.id?'active':''}" onclick="state.filterPeriod='${p.id}';renderPage()">${p.label}</button>`).join('')}
        </div>
        ${tx.length===0?'<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div></div>':tx.map(t=>`<div class="card mb-8" onclick="navigateTo('detail-transaksi',{id:'${t.id}'})"><div class="flex items-center gap-10"><span>💳</span><div class="flex-1"><p class="item-title">${t.periodLabel || t.period_label || 'Periode'}</p><p class="item-subtitle">${t.id} • ${formatShortDate(t.date)}</p></div><div class="text-right"><p style="font-weight:800;">${formatRupiah(t.amount)}</p><span class="badge ${getStatusBadgeClass(t.status)}">${getStatusLabel(t.status)}</span></div></div></div>`).join('')}
    </div>`;
}

// ==================== DETAIL TRANSAKSI ====================
function renderDetailTransaksiPage() {
    const txId = state.pageParams.id;
    const tx = state.transactions.find(t => t.id.toString() === txId.toString());
    if (!tx) return `${renderHeader('Detail Transaksi', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Transaksi tidak ditemukan</div></div></div>`;
    const periodsPaid = tx.periodIds && tx.periodIds.length > 0 ? tx.periodIds.map(id => getPeriodById(id)).filter(Boolean) : [];
    return `
    ${renderHeader('Detail Transaksi', true)}
    <div class="container">
        <div class="card text-center mb-16"><p style="font-size:12px;color:var(--text-secondary);">ID Transaksi</p><p style="font-size:18px;font-weight:800;">${tx.id}</p><span class="badge ${getStatusBadgeClass(tx.status)}">${getStatusLabel(tx.status)}</span></div>
        <div class="card mb-16">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                <div><span style="color:var(--text-muted);">Nama</span><p>${tx.studentName}</p></div>
                <div><span style="color:var(--text-muted);">Frekuensi</span><p>${tx.frequency==='weekly'?'Mingguan':'Bulanan'}</p></div>
                <div><span style="color:var(--text-muted);">Periode</span><p>${periodsPaid.length>0?periodsPaid.map(p=>p.label).join(', '):'-'}</p></div>
                <div><span style="color:var(--text-muted);">Tanggal</span><p>${formatDate(tx.date)}</p></div>
                <div><span style="color:var(--text-muted);">Nominal</span><p style="color:var(--primary);font-weight:600;">${formatRupiah(tx.amount)}</p></div>
                <div><span style="color:var(--text-muted);">Metode</span><p>${tx.method.toUpperCase()}</p></div>
            </div>
            ${tx.rejectionReason?`<div style="margin-top:12px;padding:8px;background:var(--danger-bg);border-radius:6px;"><p style="font-size:12px;color:var(--danger);">Alasan: ${tx.rejectionReason}</p></div>`:''}
        </div>
        ${tx.proofDataUrl?`<div class="card mb-16"><div class="card-header"><span class="card-title">Bukti Pembayaran</span></div><img src="${tx.proofDataUrl}" style="max-width:100%;border-radius:8px;"><div class="flex gap-8 mt-8"><button class="btn btn-outline btn-sm flex-1" onclick="previewBukti('${tx.id}')">Lihat</button><button class="btn btn-outline btn-sm flex-1" onclick="downloadBukti('${tx.id}')">Download</button></div></div>`:tx.proof?`<div class="card mb-16"><div class="card-header"><span class="card-title">Bukti Pembayaran</span></div><div style="background:var(--input-bg);padding:12px;border-radius:8px;text-align:center;"><span style="font-size:48px;">📄</span><p>${tx.proof.file_name}</p></div><div class="flex gap-8 mt-8"><button class="btn btn-outline btn-sm flex-1" onclick="previewBukti('${tx.id}')">Lihat</button><button class="btn btn-outline btn-sm flex-1" onclick="downloadBukti('${tx.id}')">Download</button></div></div>`:'<div class="card mb-16"><p style="font-size:13px;color:var(--text-muted);text-align:center;">Belum ada bukti pembayaran.</p></div>'}
        <div class="card">
            <div class="card-header"><span class="card-title">Timeline</span></div>
            <div class="timeline">
                <div class="timeline-item success"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Pembayaran dibuat</div></div>
                ${tx.proof?`<div class="timeline-item success"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Bukti dikirim</div></div>`:''}
                ${tx.status==='berhasil'?`<div class="timeline-item success"><div class="timeline-date">${tx.verifiedAt?formatShortDate(tx.verifiedAt):'-'}</div><div class="timeline-content">Diverifikasi</div></div>`:tx.status==='menunggu'?`<div class="timeline-item warning"><div class="timeline-date">Sekarang</div><div class="timeline-content">Menunggu verifikasi</div></div>`:`<div class="timeline-item danger"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Ditolak${tx.rejectionReason?`: ${tx.rejectionReason}`:''}</div></div>`}
            </div>
        </div>
        ${tx.status==='ditolak'?`<button class="btn btn-primary btn-block mt-16" onclick="resubmitBukti('${tx.id}')">Upload Bukti Baru</button>`:''}
    </div>`;
}

function previewBukti(txId) {
    const tx = state.transactions.find(t => t.id.toString() === txId.toString());
    if (tx) {
        if (tx.proofDataUrl) {
            showModal(`<div style="text-align:center;"><h3>Preview Bukti</h3><img src="${tx.proofDataUrl}" style="max-width:100%;max-height:300px;border-radius:8px;margin-top:8px;"></div>`);
        } else if (tx.proof?.url) {
            window.open(tx.proof.url, '_blank', 'noopener');
        } else {
            showToast('Bukti pembayaran tidak tersedia', 'warning');
        }
    }
}

function downloadBukti(txId) {
    const tx = state.transactions.find(t => t.id.toString() === txId.toString());
    if (tx && tx.proof) {
        if (tx.proofDataUrl) {
            const a = document.createElement('a');
            a.href = tx.proofDataUrl;
            a.download = tx.proof;
            a.click();
        } else if (tx.proof?.url) {
            const a = document.createElement('a');
            a.href = tx.proof.url + '&download=1';
            a.download = tx.proof.file_name;
            a.click();
        }
    } else {
        showToast('Bukti pembayaran tidak tersedia', 'warning');
    }
}

async function resubmitBukti(txId) {
    // Simulasi: ubah status menjadi menunggu (tidak ada endpoint khusus)
    // Sebaiknya gunakan endpoint verify_payment dengan action tertentu jika ada.
    // Untuk sekarang, arahkan ke upload bukti dengan selectedUploadTxId.
    state.selectedUploadTxId = txId;
    showToast('Silakan upload bukti baru', 'info');
    navigateTo('upload-bukti');
}

// ==================== TUNGGAKAN ====================
function renderTunggakanPage() {
    const user = getCurrentUser();
    const unpaid = getUnpaidPeriods(user.id);
    const totalUnpaid = unpaid.reduce((sum, p) => sum + p.amount, 0);
    const oldest = unpaid[0];
    return `
    ${renderHeader('Tunggakan Saya', true)}
    <div class="container">
        ${unpaid.length===0?'<div class="empty-state"><div class="empty-icon">🎉</div><div class="empty-title">Tidak ada tunggakan!</div><div class="empty-desc">Semua pembayaran kas kamu sudah lunas.</div></div>':`
        <div class="card text-center mb-16" style="border-left:4px solid var(--danger);">
            <p style="font-size:13px;color:var(--text-secondary);">Total Tunggakan</p>
            <p style="font-size:32px;font-weight:800;color:var(--danger);">${formatRupiah(totalUnpaid)}</p>
            <p style="font-size:12px;color:var(--text-muted);">${unpaid.length} periode • ${oldest?oldest.label:'-'}</p>
        </div>
        <div class="card mb-16"><div class="card-header"><span class="card-title">Daftar Tunggakan</span></div>
            ${unpaid.map(p => {
                const dueDate = new Date(p.dueDate);
                const now = new Date();
                const diff = Math.ceil((now - dueDate) / (1000*60*60*24));
                return `<div class="list-item" style="border-bottom:1px solid var(--border);border-radius:0;"><span>⚠️</span><div class="item-info"><div class="item-title">${p.label}</div><div class="item-subtitle">Deadline: ${formatShortDate(p.dueDate)} • ${diff>0?`Terlambat ${diff} hari`:'Jatuh tempo'}</div></div><span style="font-weight:700;color:var(--danger);">${formatRupiah(p.amount)}</span></div>`;
            }).join('')}
        </div>
        <div class="flex gap-8"><button class="btn btn-primary flex-1" onclick="navigateTo('pembayaran')">Bayar Sekarang</button></div>`}
    </div>`;
}

// ==================== ANGGOTA ====================
function renderAnggotaPage() {
    let members = [...state.students];
    if (state.filterStatus !== 'semua') members = members.filter(m => m.status === state.filterStatus);
    if (state.searchQuery) members = members.filter(m => m.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || String(m.absenNumber).includes(state.searchQuery));
    if (state.sortBy === 'absen') members.sort((a,b)=>a.absenNumber-b.absenNumber);
    else if (state.sortBy === 'nama-asc') members.sort((a,b)=>a.name.localeCompare(b.name));
    else if (state.sortBy === 'nama-desc') members.sort((a,b)=>b.name.localeCompare(a.name));
    else if (state.sortBy === 'status') { const order={lunas:1,menunggu:2,belum:3}; members.sort((a,b)=>(order[a.status]||4)-(order[b.status]||4)); }
    const statusMap={lunas:'🟢 Lunas',menunggu:'🟡 Menunggu',belum:'🔴 Belum bayar'};
    const badgeMap={lunas:'badge-success',menunggu:'badge-warning',belum:'badge-danger'};
    return `
    ${renderHeader('Anggota Kelas', true)}
    <div class="container">
        <div class="search-input mb-8"><span>🔍</span><input type="text" id="searchInputAnggota" placeholder="Cari nama atau nomor absen..." value="${state.searchQuery}" oninput="activeInputId='searchInputAnggota'; state.searchQuery=this.value; renderPage()"></div>
        <div class="filter-chips mb-8">${['semua','lunas','menunggu','belum'].map(f=>`<button class="chip ${state.filterStatus===f?'active':''}" onclick="state.filterStatus='${f}';renderPage()">${f}</button>`).join('')}</div>
        <div class="filter-chips mb-16"><button class="chip ${state.sortBy==='absen'?'active':''}" onclick="state.sortBy='absen';renderPage()">No. Absen</button><button class="chip ${state.sortBy==='nama-asc'?'active':''}" onclick="state.sortBy='nama-asc';renderPage()">A-Z</button><button class="chip ${state.sortBy==='nama-desc'?'active':''}" onclick="state.sortBy='nama-desc';renderPage()">Z-A</button><button class="chip ${state.sortBy==='status'?'active':''}" onclick="state.sortBy='status';renderPage()">Status</button></div>
        ${members.map(m=>`<div class="card mb-8" onclick="navigateTo('detail-anggota',{id:${m.id}})"><div class="flex items-center gap-12">${getAvatarHtml(m,'avatar-sm')}<div class="flex-1"><p class="item-title">${m.name}</p><p class="item-subtitle">Absen ${String(m.absenNumber).padStart(2,'0')}</p></div><span class="badge ${badgeMap[m.status] || 'badge-neutral'}">${statusMap[m.status] || m.status}</span></div></div>`).join('')}
    </div>`;
}

// ==================== DETAIL ANGGOTA ====================
function renderDetailAnggotaPage() {
    const memberId = state.pageParams.id;
    const member = state.students.find(s => s.id == memberId);
    if (!member) return `${renderHeader('Detail Anggota', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Anggota tidak ditemukan</div></div></div>`;
    return `${renderHeader('Detail Anggota', true)}<div class="container"><div class="text-center mb-16">${getAvatarHtml(member,'avatar-lg')}<h2 style="font-size:20px;font-weight:800;margin-top:8px;">${member.name}</h2><p style="font-size:13px;color:var(--text-secondary);">${member.kelas || 'Kelas'} • Absen ${member.absenNumber}</p></div><div class="card mb-16"><div class="card-header"><span class="card-title">Informasi</span></div><p>NIS: ${member.nis || '-'}</p><p>Email: ${member.email || '-'}</p><p>Phone: ${member.phone || '-'}</p></div><div class="card"><div class="card-header"><span class="card-title">Timeline Pembayaran</span></div>${state.periods.slice(0,8).map(p=>{ const st=getPeriodStatusForUser(p.id,member.id); return `<div class="list-item" style="border-bottom:1px solid var(--border);border-radius:0;"><span>${st==='lunas'?'✅':st==='menunggu'?'⏳':'⬜'}</span><div class="item-info"><div class="item-title">${p.label}</div></div><span class="badge ${getStatusBadgeClass(st)}">${getStatusLabel(st)}</span></div>`; }).join('')}</div></div>`;
}

// ==================== TRANSPARANSI ====================
function renderTransparansiPage() {
    const totalIncome = state.transactions.filter(t => t.status === 'berhasil').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const monthlyData = Array(12).fill(0);
    state.transactions.filter(t => t.status === 'berhasil').forEach(t => { const d = new Date(t.date); monthlyData[d.getMonth()] = (monthlyData[d.getMonth()] || 0) + t.amount; });
    const expenseMonthly = Array(12).fill(0);
    state.expenses.forEach(e => { const d = new Date(e.date); expenseMonthly[d.getMonth()] = (expenseMonthly[d.getMonth()] || 0) + e.amount; });
    const maxVal = Math.max(...monthlyData, ...expenseMonthly, 1);
    const selectedMonth = state.transparansiMonth;
    const monthIncome = monthlyData[selectedMonth] || 0;
    const monthExpense = expenseMonthly[selectedMonth] || 0;
    return `
    ${renderHeader('Transparansi Kas', true)}
    <div class="container">
        <div class="card text-center mb-16"><p style="font-size:14px;color:var(--text-secondary);">Saldo Kas</p><p style="font-size:36px;font-weight:800;color:var(--primary);">${formatRupiah(balance)}</p></div>
        <div class="stat-grid mb-16">
            <div class="stat-card"><div class="stat-value" style="color:var(--success);">${formatRupiah(totalIncome)}</div><div class="stat-label">Total Pemasukan</div></div>
            <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${formatRupiah(totalExpense)}</div><div class="stat-label">Total Pengeluaran</div></div>
        </div>
        <div class="card mb-16"><div class="card-header"><span class="card-title">Grafik Pemasukan</span></div><div class="chart-container"><div class="chart-bars">${monthlyData.map((v,i)=>{ const h=(v/maxVal)*140; return `<div class="chart-bar-group"><div class="chart-bar" style="height:${h}px;background:var(--success);"></div><span class="chart-label">${shortMonths[i]}</span></div>`; }).join('')}</div></div></div>
        <div class="card mb-16"><div class="card-header"><span class="card-title">Grafik Pengeluaran</span></div><div class="chart-container"><div class="chart-bars">${expenseMonthly.map((v,i)=>{ const h=(v/maxVal)*140; return `<div class="chart-bar-group"><div class="chart-bar" style="height:${h}px;background:var(--danger);"></div><span class="chart-label">${shortMonths[i]}</span></div>`; }).join('')}</div></div></div>
        <div class="card">
            <div class="card-header"><span class="card-title">Ringkasan Bulanan</span></div>
            <select class="form-input mb-8" onchange="state.transparansiMonth=parseInt(this.value);renderPage()">
                ${months.map((m,i)=>`<option value="${i}" ${state.transparansiMonth===i?'selected':''}>${m} 2026</option>`).join('')}
            </select>
            <p>Pemasukan: <strong>${formatRupiah(monthIncome)}</strong></p>
            <p>Pengeluaran: <strong>${formatRupiah(monthExpense)}</strong></p>
        </div>
    </div>`;
}

// ==================== PENGELUARAN ====================
function renderPengeluaranPage() {
    let exps = [...state.expenses];
    if (state.filterStatus !== 'semua') exps = exps.filter(e => e.category === state.filterStatus);
    if (state.searchQuery) exps = exps.filter(e => e.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const categories = [...new Set(state.expenses.map(e => e.category))];
    const catIcons = { kebersihan:'🧹', perlengkapan:'📦', kegiatan:'🎯', dekorasi:'🎨', sosial:'🤝', lainnya:'📋' };
    return `${renderHeader('Pengeluaran Kelas', true)}<div class="container"><div class="search-input mb-8"><span>🔍</span><input type="text" id="searchInputPengeluaran" placeholder="Cari pengeluaran..." value="${state.searchQuery}" oninput="activeInputId='searchInputPengeluaran'; state.searchQuery=this.value; renderPage()"></div><div class="filter-chips mb-16"><button class="chip ${state.filterStatus==='semua'?'active':''}" onclick="state.filterStatus='semua';renderPage()">Semua</button>${categories.map(c=>`<button class="chip ${state.filterStatus===c?'active':''}" onclick="state.filterStatus='${c}';renderPage()">${catIcons[c]||'📋'} ${c}</button>`).join('')}</div>${exps.map(e=>`<div class="card mb-8" onclick="navigateTo('detail-pengeluaran',{id:${e.id}})"><div class="flex items-center gap-12"><span style="font-size:28px;">${catIcons[e.category]||'📋'}</span><div class="flex-1"><p class="item-title">${e.name}</p><p class="item-subtitle">${e.category} • ${formatShortDate(e.date)}</p></div><span style="font-weight:800;color:var(--danger);">${formatRupiah(e.amount)}</span></div></div>`).join('')}</div>`;
}

function renderDetailPengeluaranPage() {
    const expId = state.pageParams.id;
    const exp = state.expenses.find(e => e.id == expId);
    if (!exp) return `${renderHeader('Detail Pengeluaran', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Pengeluaran tidak ditemukan</div></div></div>`;
    return `${renderHeader('Detail Pengeluaran', true)}<div class="container"><div class="card text-center mb-16"><span style="font-size:48px;">📋</span><h2>${exp.name}</h2><p style="font-size:24px;font-weight:800;color:var(--danger);">${formatRupiah(exp.amount)}</p></div><div class="card mb-16"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;"><div><span style="color:var(--text-muted);">Tanggal</span><p>${formatDate(exp.date)}</p></div><div><span style="color:var(--text-muted);">Kategori</span><p>${exp.category}</p></div></div></div><div class="card"><div class="card-header"><span class="card-title">Deskripsi</span></div><p>${exp.desc || '-'}</p></div></div>`;
}

// ==================== PENGUMUMAN ====================
function renderPengumumanPage() {
    let anns = [...state.announcements];
    anns.sort((a,b)=> (b.isImportant?1:0) - (a.isImportant?1:0));
    if (state.filterStatus !== 'semua') anns = anns.filter(a => a.category === state.filterStatus);
    if (state.searchQuery) anns = anns.filter(a => a.title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const categories = [...new Set(state.announcements.map(a => a.category))];
    return `${renderHeader('Pengumuman', true)}<div class="container"><div class="search-input mb-8"><span>🔍</span><input type="text" id="searchInputPengumuman" placeholder="Cari pengumuman..." value="${state.searchQuery}" oninput="activeInputId='searchInputPengumuman'; state.searchQuery=this.value; renderPage()"></div><div class="filter-chips mb-16"><button class="chip ${state.filterStatus==='semua'?'active':''}" onclick="state.filterStatus='semua';renderPage()">Semua</button>${categories.map(c=>`<button class="chip ${state.filterStatus===c?'active':''}" onclick="state.filterStatus='${c}';renderPage()">${c}</button>`).join('')}</div>${anns.map(a=>`<div class="card mb-8" onclick="navigateTo('detail-pengumuman',{id:${a.id}})" style="${a.isImportant?'border-left:4px solid var(--danger);':''}"><div class="flex items-start gap-10"><span>${a.isImportant?'🔴':'📄'}</span><div class="flex-1"><p class="item-title">${a.title}</p><p class="item-subtitle">${a.category} • ${formatShortDate(a.date)}</p></div>${!a.isRead?'<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;"></span>':''}</div></div>`).join('')}</div>`;
}

function renderDetailPengumumanPage() {
    const annId = state.pageParams.id;
    const ann = state.announcements.find(a => a.id == annId);
    if (!ann) return `${renderHeader('Detail', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Tidak ditemukan</div></div></div>`;
    return `${renderHeader('Detail Pengumuman', true)}<div class="container"><div class="card mb-16"><span class="badge ${ann.isImportant?'badge-danger':'badge-info'}">${ann.category}</span><h2 style="font-size:20px;font-weight:800;margin:8px 0;">${ann.title}</h2><p style="font-size:12px;color:var(--text-secondary);">${formatDate(ann.date)}</p></div><div class="card"><p style="font-size:14px;line-height:1.6;">${ann.content}</p></div></div>`;
}

// ==================== NOTIFIKASI ====================
async function loadNotifications() {
    try {
        const res = await apiFetch('notifications.php');
        if (res.notifications) {
            state.notifications = res.notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                isRead: n.is_read === 1,
                reference_type: n.reference_type,
                reference_id: n.reference_id,
                date: n.created_at
            }));
        }
    } catch (err) {
        console.warn('Gagal memuat notifikasi', err);
    }
}

async function markNotificationRead(id) {
    try {
        await apiFetch('notifications.php', 'POST', {
            action: 'mark_read',
            notification_id: id
        });
        // Update state lokal
        const notif = state.notifications.find(n => n.id === id);
        if (notif) notif.isRead = true;
        updateNotifBadge();
    } catch (e) {
        console.warn('Gagal menandai notifikasi dibaca', e);
    }
}

async function handleNotificationClick(id) {
    const notif = state.notifications.find(n => n.id === id);
    if (!notif) return;

    // Tandai dibaca dulu
    await markNotificationRead(id);

    // Navigasi sesuai reference_type dan reference_id
    if (notif.reference_type === 'transaction' && notif.reference_id) {
        navigateTo('detail-transaksi', { id: notif.reference_id });
    } else if (notif.reference_type === 'announcement' && notif.reference_id) {
        navigateTo('detail-pengumuman', { id: notif.reference_id });
    } else if (notif.reference_type === 'arrears') {
        navigateTo('tunggakan');
    } else {
        renderPage();
    }
}

async function renderNotifikasiPage() {
    if (state.notifications.length === 0) {
        await loadNotifications();
    }
    const notifs = state.notifications;
    const unread = notifs.filter(n => !n.isRead).length;
    const typeIcons = { reminder:'⏰', pembayaran_berhasil:'✅', pembayaran_ditolak:'❌', bukti_diterima:'📤', pengumuman:'📢', pengeluaran:'💸', info:'ℹ️', pembayaran_menunggu:'⏳' };
    return `${renderHeader('Notifikasi', true)}<div class="container"><div class="card-header"><span class="card-title">${unread} belum dibaca</span><button style="font-size:12px;color:var(--primary);" onclick="markAllNotificationsRead()">Tandai semua dibaca</button></div>${notifs.length === 0 ? '<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">Tidak ada notifikasi</div></div>' : notifs.map(n=>`<div class="card mb-8" style="${!n.isRead?'background:var(--primary-light);':''}" onclick="handleNotificationClick(${n.id})"><div class="flex gap-10"><span>${typeIcons[n.type]||'ℹ️'}</span><div class="flex-1"><p class="item-title">${n.title}</p><p class="item-subtitle">${n.message}</p><p style="font-size:11px;color:var(--text-muted);">${formatShortDate(n.date)}</p></div>${!n.isRead?'<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;"></span>':''}</div></div>`).join('')}</div>`;
}

async function markAllNotificationsRead() {
    try {
        const data = await apiFetch('notifications.php', 'POST', {});
        if (data.success) {
            state.notifications.forEach(n => n.isRead = true);
            renderPage();
            showToast('Semua notifikasi ditandai dibaca', 'success');
        }
    } catch (err) {
        showToast('Gagal menghubungi server', 'error');
    }
}

// ==================== AKTIVITAS ====================
function renderAktivitasPage() {
    return `${renderHeader('Aktivitas Saya', true)}<div class="container"><div class="card"><div class="timeline">${state.activities.map(a=>`<div class="timeline-item success"><div class="timeline-date">${formatShortDate(a.time)}</div><div class="timeline-content">${a.icon || '📄'} ${a.description}</div></div>`).join('')}</div></div></div>`;
}

// ==================== KALENDER ====================
function renderKalenderPage() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const user = getCurrentUser();
    let html = '<div class="calendar-grid">';
    const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    dayNames.forEach(d => html += `<div class="calendar-day-header">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day other-month"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        const startPeriod = state.periods.find(p => new Date(p.startDate).getDate() === d && new Date(p.startDate).getMonth() === month && new Date(p.startDate).getFullYear() === year);
        const duePeriod = state.periods.find(p => new Date(p.dueDate).getDate() === d && new Date(p.dueDate).getMonth() === month && new Date(p.dueDate).getFullYear() === year);
        const announcement = state.announcements.find(a => new Date(a.date).getDate() === d && new Date(a.date).getMonth() === month);
        let dotClass = '';
        if (duePeriod) dotClass = 'dot-blue';
        if (startPeriod) dotClass = dotClass || 'dot-green';
        if (announcement) dotClass = dotClass || 'dot-yellow';
        html += `<div class="calendar-day ${isToday?'today':''}" onclick="showCalendarEvent(${d},${month},${year})">${d}${dotClass?`<span class="dot ${dotClass}"></span>`:''}</div>`;
    }
    html += '</div>';
    return `${renderHeader('Kalender Kas', true)}<div class="container"><div class="card mb-16"><div class="flex justify-between items-center mb-8"><button class="btn btn-outline btn-sm" onclick="state.calendarMonth=state.calendarMonth===0?11:state.calendarMonth-1;if(state.calendarMonth===11)state.calendarYear--;renderPage()">←</button><span style="font-weight:700;">${months[month]} ${year}</span><button class="btn btn-outline btn-sm" onclick="state.calendarMonth=state.calendarMonth===11?0:state.calendarMonth+1;if(state.calendarMonth===0)state.calendarYear++;renderPage()">→</button></div>${html}<div style="display:flex;gap:12px;margin-top:16px;font-size:11px;color:var(--text-secondary);"><span>🟢 Lunas</span><span>🔴 Belum/Terlambat</span><span>🟡 Menunggu</span><span>🔵 Deadline</span></div></div><div class="card"><div class="card-header"><span class="card-title">Event Bulan Ini</span></div><p>📌 Jatuh tempo kas: ${CLASS_FREQUENCY==='weekly'?'setiap akhir minggu':'tanggal 20'}</p></div></div>`;
}

function showCalendarEvent(day, month, year) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const period = state.periods.find(p => p.startDate === dateStr || p.dueDate === dateStr);
    if (period) {
        showBottomSheet(`<h3>${period.label}</h3><p>Status: ${getStatusLabel(getPeriodStatusForUser(period.id, getCurrentUser().id))}</p><button class="btn btn-primary" onclick="closeBottomSheet();navigateTo('kas-saya')">Lihat Kas Saya</button>`);
    } else {
        showToast('Tidak ada event', 'info');
    }
}

// ==================== STATISTIK ====================
function renderStatistikPage() {
    const user = getCurrentUser();
    const myTx = getUserTransactions(user.id);
    const totalPaid = myTx.filter(t => t.status === 'berhasil').reduce((sum, t) => sum + t.amount, 0);
    const onTime = myTx.filter(t => t.status === 'berhasil').length;
    const rate = calculateProgress(user.id).rate;
    return `${renderHeader('Statistik Pribadi', true)}<div class="container"><div class="stat-grid mb-16"><div class="stat-card"><div class="stat-value">${formatRupiah(totalPaid)}</div><div class="stat-label">Total</div></div><div class="stat-card"><div class="stat-value" style="color:var(--success);">${onTime}</div><div class="stat-label">Tepat Waktu</div></div><div class="stat-card"><div class="stat-value" style="color:var(--warning);">${myTx.filter(t=>t.status!=='berhasil').length}</div><div class="stat-label">Belum/Terlambat</div></div><div class="stat-card"><div class="stat-value">${rate}%</div><div class="stat-label">Rate</div></div></div><div class="card"><div class="card-header"><span class="card-title">Target</span></div><p>Target: <strong>${formatRupiah(state.periods.length*(CLASS_FREQUENCY==='weekly'?WEEKLY_AMOUNT:MONTHLY_AMOUNT))}</strong></p><div class="progress-bar mt-8"><div class="progress-fill success" style="width:${rate}%;"></div></div></div></div>`;
}

// ==================== PROFIL ====================
function renderProfilPage() {
    const user = getCurrentUser();
    return `
    ${renderHeader('Profil', true)}
    <div class="container">
        <div class="profile-header">
            <div class="text-center">
                ${getAvatarHtml(user, 'avatar-lg')}
                <div class="profile-info">
                    <h2>${user.name || user.username}</h2>
                    <p style="font-size:13px;color:var(--text-secondary);">${user.kelas || 'Kelas'} • ${user.absenNumber ? 'Absen '+user.absenNumber : user.role || 'Siswa'}</p>
                    <span class="badge">Akun Aktif</span>
                </div>
            </div>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Informasi Siswa</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                <div><span style="color:var(--text-muted);">NIS</span><p>${user.nis || '-'}</p></div>
                <div><span style="color:var(--text-muted);">Username</span><p>${user.username || '-'}</p></div>
                <div><span style="color:var(--text-muted);">Email</span><p>${user.email || '-'}</p></div>
                <div><span style="color:var(--text-muted);">No. HP</span><p>${user.phone || '-'}</p></div>
            </div>
        </div>
        <div class="card">
            <div class="menu-item" onclick="navigateTo('edit-profil')">
                <span class="menu-icon">✏️</span>
                <div class="flex-1"><div class="menu-label">Edit Profil</div><div class="menu-desc">Ubah foto, email, atau nomor HP</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('pengaturan')">
                <span class="menu-icon">⚙️</span>
                <div class="flex-1"><div class="menu-label">Pengaturan</div><div class="menu-desc">Notifikasi, tema, bahasa</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('faq')">
                <span class="menu-icon">❓</span>
                <div class="flex-1"><div class="menu-label">FAQ</div><div class="menu-desc">Pertanyaan yang sering diajukan</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('bantuan')">
                <span class="menu-icon">📞</span>
                <div class="flex-1"><div class="menu-label">Bantuan</div><div class="menu-desc">Hubungi bendahara atau wali kelas</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('report-problem')">
                <span class="menu-icon">📝</span>
                <div class="flex-1"><div class="menu-label">Laporkan Masalah</div><div class="menu-desc">Sampaikan kendala yang kamu alami</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('my-reports')">
                <span class="menu-icon">📋</span>
                <div class="flex-1"><div class="menu-label">Laporan Saya</div><div class="menu-desc">Lihat status laporan kamu</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="handleLogout()">
                <span class="menu-icon" style="color:var(--danger);">🚪</span>
                <div class="flex-1"><div class="menu-label" style="color:var(--danger);">Keluar</div><div class="menu-desc">Akhiri sesi</div></div>
                <span class="menu-arrow">→</span>
            </div>
        </div>
    </div>`;
}

function handleLogout() {
    showModal(`
        <h3>Keluar?</h3>
        <p>Yakin ingin keluar dari aplikasi?</p>
        <div class="flex gap-8 mt-16">
            <button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-danger flex-1" onclick="confirmLogout()">Keluar</button>
        </div>
    `);
}
async function confirmLogout() {
    try {
        const data = await apiFetch('logout.php', 'POST');
        if (data.success) {
            // Server session sudah dihancurkan, baru hapus state frontend
            state.currentUser = null;
            state.role = null;
            state.currentUserData = null;
            closeModal();
            navigateTo('login');
            showToast('Berhasil keluar', 'success');
        } else {
            showToast(data.error || 'Gagal logout dari server', 'error');
        }
    } catch (err) {
        // Jangan langsung logout lokal jika server gagal, kecuali network mati total
        showToast('Gagal terhubung ke server saat logout', 'error');
        // Opsional: tetap boleh logout lokal untuk mencegah user terjebak, 
        // tapi beri tahu bahwa session server mungkin masih aktif.
        // Komentar di bawah bisa diaktifkan jika diinginkan.
        // state.currentUser = null;
        // closeModal();
        // navigateTo('login');
    }
}

function renderEditProfilPage() {
    const user = getCurrentUser();
    return `${renderHeader('Edit Profil', true)}<div class="container"><div class="text-center mb-16">${getAvatarHtml(user,'avatar-lg')}<button class="btn btn-outline btn-sm mt-8" onclick="showToast('Upload foto','info')">📸 Ganti Foto</button></div><div class="card"><div class="form-group"><label class="form-label">NIS (tidak bisa diedit)</label><input class="form-input" value="${user.nis || ''}" disabled></div><div class="form-group"><label class="form-label">Kelas</label><input class="form-input" value="${user.kelas || ''}" disabled></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="editEmail" value="${user.email || ''}"></div><div class="form-group"><label class="form-label">No. HP</label><input class="form-input" id="editPhone" value="${user.phone || ''}"></div><div class="form-group"><label class="form-label">Password Baru</label><input type="password" class="form-input" placeholder="Kosongkan jika tidak diubah"></div><button class="btn btn-primary btn-block" onclick="saveEditProfile()">Simpan</button></div></div>`;
}

async function saveEditProfile() {
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();

    // Validasi dasar frontend
    if (!email.includes('@')) {
        showToast('Email tidak valid', 'error');
        return;
    }
    if (phone.length < 10 || !/^[0-9]+$/.test(phone)) {
        showToast('Nomor HP minimal 10 digit angka', 'error');
        return;
    }

    try {
        const data = await apiFetch('update_profile.php', 'POST', { email, phone });
        if (data.success) {
            // Perbarui state lokal hanya jika server berhasil
            const user = getCurrentUser();
            user.email = email;
            user.phone = phone;
            showToast('Profil diperbarui', 'success');
            navigateTo('profil');
        } else {
            showToast(data.error || 'Gagal memperbarui profil', 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server. Perubahan tidak disimpan.', 'error');
    }
}

function renderPengaturanPage() {
    const isDark = state.theme === 'dark';
    return `${renderHeader('Pengaturan', true)}<div class="container"><div class="card mb-16"><div class="card-header"><span class="card-title">Tampilan</span></div><button class="list-item" onclick="setTheme('light')"><span>☀️</span> Light Mode ${!isDark?'✓':''}</button><button class="list-item" onclick="setTheme('dark')"><span>🌙</span> Dark Mode ${isDark?'✓':''}</button><button class="list-item" onclick="setTheme('system')"><span>💻</span> System</button></div><div class="card mb-16"><div class="card-header"><span class="card-title">Notifikasi</span></div><div class="list-item"><span>🔔</span> Pengingat Pembayaran <div class="toggle-switch ${state.reminderSettings.paymentReminder?'active':''}" onclick="state.reminderSettings.paymentReminder=!state.reminderSettings.paymentReminder;saveSettings()"><div class="toggle-dot"></div></div></div><div class="list-item"><span>📢</span> Pengumuman <div class="toggle-switch ${state.reminderSettings.announcementNotif?'active':''}" onclick="state.reminderSettings.announcementNotif=!state.reminderSettings.announcementNotif;saveSettings()"><div class="toggle-dot"></div></div></div><div class="list-item"><span>🔊</span> Suara <div class="toggle-switch ${state.reminderSettings.soundNotif?'active':''}" onclick="state.reminderSettings.soundNotif=!state.reminderSettings.soundNotif;saveSettings()"><div class="toggle-dot"></div></div></div></div><button class="btn btn-danger btn-block" onclick="handleLogout()">🚪 Keluar</button></div>`;
}

async function saveSettings() {
    try {
        const data = await apiFetch('user_settings.php', 'POST', {
            theme: state.theme,
            payment_reminder: state.reminderSettings.paymentReminder ? 1 : 0,
            announcement_notif: state.reminderSettings.announcementNotif ? 1 : 0,
            sound_notif: state.reminderSettings.soundNotif ? 1 : 0
        });
        if (!data.success) showToast('Gagal menyimpan pengaturan', 'error');
    } catch (err) {
        showToast('Gagal menyimpan pengaturan (server tidak tersedia)', 'warning');
    }
    renderPage();
}

function setTheme(theme) {
    if (theme === 'system') {
        const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
        toggleTheme(prefers ? 'dark' : 'light');
    } else {
        toggleTheme(theme);
    }
    saveSettings();
    renderPage();
}

function renderFaqPage() {
    const faqs = [
        { q: 'Bagaimana cara membayar kas?', a: 'Buka menu Pembayaran, pilih periode, pilih metode, lalu konfirmasi.' },
        { q: 'Bagaimana cara upload bukti?', a: 'Setelah pembayaran, Anda akan diarahkan ke halaman upload bukti.' },
        { q: 'Berapa nominal kas?', a: CLASS_FREQUENCY === 'weekly' ? 'Rp3.000 per minggu' : 'Rp10.000 per bulan' },
        { q: 'Kapan deadline?', a: CLASS_FREQUENCY === 'weekly' ? 'Setiap akhir minggu (Minggu).' : 'Tanggal 20 setiap bulan.' },
        { q: 'Kenapa belum diverifikasi?', a: 'Verifikasi membutuhkan 1-3 hari kerja.' },
        { q: 'Jika ditolak?', a: 'Upload ulang bukti yang jelas.' },
    ];
    return `${renderHeader('FAQ', true)}<div class="container"><div class="card">${faqs.map((f, i) => `<div class="accordion"><div class="accordion-header" onclick="this.nextElementSibling.classList.toggle('open')"><span>${f.q}</span><span>▼</span></div><div class="accordion-content">${f.a}</div></div>`).join('')}</div></div>`;
}

function renderBantuanPage() {
    return `${renderHeader('Bantuan', true)}<div class="container"><div class="card mb-16"><div class="card-header"><span class="card-title">Kontak Bendahara</span></div><p>📱 0812-3456-7890</p><button class="btn btn-outline btn-sm mt-8" onclick="showToast('Menghubungi...','info')">Hubungi</button></div><div class="card mb-16"><div class="card-header"><span class="card-title">Wali Kelas</span></div><p>📱 0812-9876-5432</p></div><div class="card"><button class="list-item" onclick="navigateTo('faq')"><span>❓</span> FAQ</button><button class="list-item" onclick="navigateTo('report-problem')"><span>📝</span> Laporkan Masalah</button></div></div>`;
}

function renderReportProblemPage() {
    return `${renderHeader('Laporkan Masalah', true)}<div class="container"><div class="card"><div class="form-group"><label class="form-label">Kategori</label><select class="form-input" id="reportCategory"><option>Pembayaran</option><option>Akun</option><option>Data kas</option><option>Bukti</option><option>Bug</option><option>Lainnya</option></select></div><div class="form-group"><label class="form-label">Judul</label><input class="form-input" id="reportTitle"></div><div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-input" id="reportDesc"></textarea></div><div class="form-group"><label class="form-label">ID Transaksi (opsional)</label><input class="form-input" id="reportTxId" placeholder="TRX-..."></div><button class="btn btn-primary btn-block" onclick="submitReport()">Kirim</button></div></div>`;
}

async function submitReport() {
    const title = document.getElementById('reportTitle').value;
    const desc = document.getElementById('reportDesc').value;
    if (!title || !desc) { showToast('Isi judul dan deskripsi', 'warning'); return; }
    try {
        const data = await apiFetch('reports.php', 'POST', {
            category: document.getElementById('reportCategory').value,
            title: title,
            description: desc,
            transaction_id: document.getElementById('reportTxId')?.value || null
        });
        if (data.success) {
            showToast('Laporan berhasil dikirim', 'success');
            navigateTo('my-reports');
        } else {
            showToast(data.error || 'Gagal mengirim laporan', 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

function renderMyReportsPage() {
    const userReports = state.userReports.filter(r => r.userId === getCurrentUser().id);
    return `${renderHeader('Laporan Saya', true)}<div class="container">${userReports.map(r=>`<div class="card mb-8"><p class="item-title">${r.title}</p><p class="item-subtitle">${r.category} • ${formatShortDate(r.createdAt)}</p><span class="badge badge-info">${r.status}</span></div>`).join('') || '<div class="empty-state">Belum ada laporan.</div>'}</div>`;
}

function renderSearchPage() {
    const q = state.searchQuery;
    const results = [];
    if (q) {
        state.students.forEach(s => { if (s.name.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Anggota', title: s.name, sub: `Absen ${s.absenNumber}`, page: 'detail-anggota', id: s.id }); });
        getUserTransactions(getCurrentUser().id).forEach(t => { if (t.id.toString().includes(q) || (t.periodLabel||'').toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Transaksi', title: t.periodLabel || 'Periode', sub: t.id, page: 'detail-transaksi', id: t.id }); });
        state.announcements.forEach(a => { if (a.title.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Pengumuman', title: a.title, sub: a.category, page: 'detail-pengumuman', id: a.id }); });
        state.expenses.forEach(e => { if (e.name.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Pengeluaran', title: e.name, sub: e.category, page: 'detail-pengeluaran', id: e.id }); });
    }
    return `${renderHeader('Pencarian', true)}<div class="container"><div class="search-input mb-16"><span>🔍</span><input type="text" id="searchInputGlobal" placeholder="Cari..." value="${state.searchQuery}" oninput="activeInputId='searchInputGlobal'; state.searchQuery=this.value; renderPage()"></div>${q===''?'<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Cari di KasKelas</div></div>':results.length===0?'<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Tidak ada hasil</div></div>':results.map(r=>`<div class="card mb-8" onclick="navigateTo('${r.page}',{id:'${r.id}'})"><div class="flex items-center gap-10"><span>${r.type==='Anggota'?'👤':r.type==='Transaksi'?'💳':r.type==='Pengumuman'?'📢':'💸'}</span><div class="flex-1"><p class="item-title">${r.title}</p><p class="item-subtitle">${r.type} • ${r.sub}</p></div><span>→</span></div></div>`).join('')}</div>`;
}

// ==================== VERIFIKASI (BENDAHARA) ====================
async function renderVerifikasiPage() {
    if (state.role !== 'bendahara') {
        return `<div class="container"><div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Akses ditolak</div></div></div>`;
    }

    const pending = state.transactions.filter(t => t.status === 'menunggu');
    let pendingHtml = '';

    if (pending.length > 0) {
        pendingHtml = pending.map(tx => `
            <div class="card mb-8">
                <div class="flex items-center gap-10">
                    <span>💳</span>
                    <div class="flex-1">
                        <p class="item-title">${tx.studentName} - ${tx.periodLabel || tx.period_label || 'Periode'}</p>
                        <p class="item-subtitle">${tx.id} • ${formatRupiah(tx.amount)} • ${tx.method.toUpperCase()}</p>
                    </div>
                    <div class="flex gap-8">
                        <button class="btn btn-sm btn-primary" onclick="verifyPayment(${tx.id}, 'berhasil')">Setujui</button>
                        <button class="btn btn-sm btn-danger" onclick="showRejectPrompt(${tx.id})">Tolak</button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        pendingHtml = '<div class="empty-state">Tidak ada transaksi menunggu.</div>';
    }

    return `${renderHeader('Verifikasi Pembayaran', true)}
    <div class="container">
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Daftar Menunggu (${pending.length})</span></div>
        </div>
        ${pendingHtml}
    </div>`;
}

function showRejectPrompt(txId) {
    showModal(`<h3>Tolak Pembayaran</h3><p>Masukkan alasan penolakan:</p><textarea id="rejectReason" class="form-input" placeholder="Alasan..."></textarea><div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-danger flex-1" onclick="verifyPayment(${txId}, 'ditolak', document.getElementById('rejectReason').value)">Tolak</button></div>`);
}

async function verifyPayment(txId, action, reason = null) {
    try {
        const data = await apiFetch('verify_payment.php', 'POST', { transaction_id: txId, action, reason });
        if (data.success) {
            showToast('Verifikasi berhasil', 'success');
            await loadDataFromServer();
            renderPage();
        } else {
            showToast(data.error || 'Verifikasi gagal', 'error');
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

// ==================== EVENT & INIT ====================
function attachPageEvents() {
    document.querySelectorAll('.bottom-nav .nav-item, .sidebar-nav .nav-item').forEach(item => {
        item.onclick = () => {
            const page = item.dataset.page;
            if (page) navigateTo(page);
        };
    });
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.onclick = () => goBack();
    });
}

async function initApp() {
    const savedTheme = localStorage.getItem('kaskelas-theme');
    if (savedTheme) toggleTheme(savedTheme);
    else {
        const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
        toggleTheme(prefers ? 'dark' : 'light');
    }
    state.currentPage = 'login';
    renderPage();
    updateNavUI();
    window.addEventListener('online', () => {
        state.isOnline = true;
        document.getElementById('offlineBanner').classList.remove('show');
        showToast('Online', 'success');
    });
    window.addEventListener('offline', () => {
        state.isOnline = false;
        document.getElementById('offlineBanner').classList.add('show');
        showToast('Offline', 'warning');
    });
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            isPopState = true;
            state.currentPage = event.state.page;
            state.pageParams = event.state.params || {};
            renderPage();
            updateNavUI();
        }
    });
    history.replaceState({ page: 'login', params: {} }, '', '');
}

initApp();
