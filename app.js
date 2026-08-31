
// ==================== KONFIGURASI & DATA ====================
const API_BASE_URL = window.KASKELAS_API_BASE_URL || 'api/';
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
        frequency: null,
        defaultAmount: null,
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
    transparansiYear: new Date().getFullYear(),
    selectedUploadTxId: null,
};

// ==================== SVG ICON SYSTEM ====================
const iconsSvg = {
    'home': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    'wallet': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M6 8h12"></path><path d="M18 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"></path></svg>`,
    'credit-card': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
    'history': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"></path><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path></svg>`,
    'alert': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    'bar-chart': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    'check-circle': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    'receipt': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 6v12"></path></svg>`,
    'megaphone': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 13v-2z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`,
    'bell': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    'user': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    'users': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M21 21v-2a4 4 0 0 0-3-3.85"></path><path d="M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
    'settings': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    'search': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    'arrow-left': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    'plus': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    'upload': `<svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`
};

function getIcon(name, extraClass='') {
    const svg = iconsSvg[name] || iconsSvg['home'];
    if (extraClass) {
        return svg.replace('class="svg-icon"', `class="svg-icon ${extraClass}"`);
    }
    return svg;
}

// ==================== UTILITIES ====================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function ic(name){return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;}
function formatRupiah(amount){ return 'Rp' + amount.toLocaleString('id-ID'); }
function formatDate(dateStr){ if(!dateStr) return '-'; const d=new Date(dateStr); if(isNaN(d.getTime())) return dateStr; return d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear(); }
function formatShortDate(dateStr){ if(!dateStr) return '-'; const d=new Date(dateStr); if(isNaN(d.getTime())) return dateStr; return d.getDate()+' '+shortMonths[d.getMonth()]; }
function getInitials(name){ return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function getAvatarHtml(student, size=''){
    const photo = student?.profile_photo;
    const initials = getInitials(student.name || student.username);
    if (photo) {
        const escapedPhoto = escapeHtml(photo);
        const escapedInitials = escapeHtml(initials);
        const escapedSize = escapeHtml(size);
        return `<img class="avatar ${size}" src="api/avatar.php?file=${escapedPhoto}" alt="" data-fallback-initials="${escapedInitials}" data-fallback-size="${escapedSize}" onerror="avatarFallback(this)">`;
    }
    return `<div class="avatar ${size}">${initials}</div>`;
}

function avatarFallback(imgEl){
    imgEl.onerror = null;
    const div = document.createElement('div');
    div.className = `avatar ${imgEl.dataset.fallbackSize || ''}`;
    div.textContent = imgEl.dataset.fallbackInitials || '';
    imgEl.replaceWith(div);
}
function showToast(message, type='success'){ const container=document.getElementById('toastContainer'); const toast=document.createElement('div'); toast.className=`toast toast-${type}`; const icons={success:'i-checkc',error:'i-x',warning:'i-alert',info:'i-info'}; toast.innerHTML=`<svg class="ic"><use href="#${icons[type]||'i-info'}"/></svg><span>${escapeHtml(message)}</span>`; container.appendChild(toast); setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateY(-20px)'; toast.style.transition='all 0.3s ease'; setTimeout(()=>toast.remove(),300); },3000); }
function showBottomSheet(content){ document.getElementById('bsOverlay').classList.add('open'); document.getElementById('bottomSheet').classList.add('open'); document.getElementById('bsContent').innerHTML=content; document.getElementById('bsOverlay').onclick=()=>closeBottomSheet(); }
function closeBottomSheet(){ document.getElementById('bsOverlay').classList.remove('open'); document.getElementById('bottomSheet').classList.remove('open'); }
function showModal(html){ document.getElementById('modalOverlay').classList.add('open'); document.getElementById('modalBox').innerHTML=html; document.getElementById('modalOverlay').onclick=(e)=>{ if(e.target===document.getElementById('modalOverlay')) closeModal(); }; }
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }
function toggleTheme(theme){ state.theme=theme; document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('kaskelas-theme', theme); }
function getCurrentUser(){ return state.currentUserData || state.students.find(s=>s.id===state.currentUser) || {id:state.currentUser, name:'User', username:'user'}; }
function normalizeTransaction(t) {
    if (!t) return null;
    const amountVal = parseFloat(t.total_amount !== undefined ? t.total_amount : (t.amount !== undefined ? t.amount : 0));
    const periodIdsArr = t.period_ids
        ? (Array.isArray(t.period_ids) ? t.period_ids : String(t.period_ids).split(',').map(Number))
        : (t.periodIds ? t.periodIds : (t.period_id ? [t.period_id] : []));

    let proofObj = null;
    if (t.proof) {
        if (typeof t.proof === 'object') {
            proofObj = {
                id: t.proof.id,
                file_name: t.proof.file_name || t.proof.filename || t.proof.name,
                file_type: t.proof.file_type || t.proof.filetype,
                file_size: t.proof.file_size || t.proof.filesize,
                url: t.proof.url
            };
        } else if (typeof t.proof === 'string') {
            proofObj = { id: null, file_name: t.proof, file_type: null, file_size: null, url: t.proof };
        }
    }

    const createdStr = t.created_at || t.createdAt || new Date().toISOString();
    const dateOnly = createdStr ? createdStr.split('T')[0] : new Date().toISOString().split('T')[0];

    return {
        id: t.id,
        user_id: t.user_id ?? t.studentId,
        studentId: t.user_id ?? t.studentId,
        studentName: t.student_name || t.studentName || 'Siswa',
        periodId: t.period_id || t.periodId || (periodIdsArr[0] || null),
        periodIds: periodIdsArr,
        periodLabel: t.period_label || t.periodLabel || '',
        frequency: t.frequency || state.cashSettings.frequency,
        amount: amountVal,
        total_amount: amountVal,
        method: t.method || 'cash',
        date: dateOnly,
        dateObj: new Date(createdStr),
        status: t.status || 'menunggu',
        proof: proofObj,
        rejectionReason: t.rejection_reason || t.rejectionReason || null,
        createdAt: createdStr,
        paymentDate: t.payment_date || t.paymentDate || null,
        verifiedAt: t.verified_at || t.verifiedAt || null
    };
}

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
        const todayStr = now.toISOString().split('T')[0];
        const startDateStr = period.startDate;
        const dueDateStr = period.dueDate;

        if (startDateStr && todayStr < startDateStr) {
            return 'upcoming';
        }
        if (dueDateStr && todayStr > dueDateStr) {
            return 'terlambat';
        }
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
    const todayStr = new Date().toISOString().split('T')[0];
    const eligiblePeriods = state.periods.filter(p => !p.startDate || p.startDate <= todayStr);
    const totalPeriods = eligiblePeriods.length;
    let lunasCount = 0;
    eligiblePeriods.forEach(p => {
        if (getPeriodStatusForUser(p.id, userId) === 'lunas') lunasCount++;
    });
    const rate = totalPeriods > 0 ? Math.round((lunasCount / totalPeriods) * 100) : 0;
    return { lunasCount, totalPeriods, rate };
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
            const csrfRes = await fetch(API_BASE_URL + 'csrf.php', { credentials: 'same-origin' });
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
    const res = await fetch(API_BASE_URL + endpoint, options);
    const text = await res.text();

    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        console.error(`Respons dari ${endpoint} bukan JSON:`, text);
        throw new Error('Respons server tidak valid');
    }

    if (!res.ok) {
        console.warn(`API ${endpoint} status ${res.status}:`, json);
        if (res.status === 401) {
            csrfToken = null; // sesi berakhir -> token lama pasti tidak berlaku lagi
            state.currentUser = null;
            state.role = null;
            state.currentUserData = null;
            if (state.currentPage !== 'login') {
                showToast('Sesi Anda telah berakhir, silakan login kembali', 'warning');
                navigateTo('login');
            }
        }
        // Token CSRF basi (mis. sesi baru setelah logout) -> paksa ambil ulang di request berikutnya
        if (res.status === 403 && json && typeof json.error === 'string' && /CSRF/i.test(json.error)) {
            csrfToken = null;
        }
    }

    return json;
}

// Mengambil seluruh halaman data dari endpoint yang dipaginasi backend
async function apiFetchAll(endpoint, listKey) {
    const limit = 100;
    let page = 1;
    let out = [];
    for (;;) {
        const sep = endpoint.includes('?') ? '&' : '?';
        const res = await apiFetch(`${endpoint}${sep}page=${page}&limit=${limit}`);
        if (!res || !Array.isArray(res[listKey])) break;
        out = out.concat(res[listKey]);
        const totalPages = Number(res.pagination && res.pagination.total_pages) || page;
        if (page >= totalPages || res[listKey].length === 0) break;
        page++;
    }
    return out;
}

// ==================== INISIALISASI DATA ====================
async function loadDataFromServer() {
    try {
        const requests = [
            apiFetch('current_user.php'),
            apiFetch('periods.php'),
            apiFetchAll('transactions.php', 'transactions'),
            apiFetchAll('expenses.php', 'expenses'),
            apiFetchAll('announcements.php', 'announcements'),
            apiFetchAll('notifications.php', 'notifications'),
            apiFetchAll('activities.php', 'activities'),
            apiFetch('students.php'),
            apiFetch('user_settings.php'),
            apiFetchAll('reports.php', 'reports'),
            apiFetch('cash_settings.php')
        ];

        // Satu endpoint gagal tidak boleh menggagalkan seluruh pemuatan data
        const results = await Promise.all(requests.map(p => p.catch(err => {
            console.warn('Gagal memuat sebagian data:', err);
            return null;
        })));

        const [userRes, periodsRes, txRes, expRes, annRes, notifRes, actRes, studentsRes, settingsRes, reportsRes, cashRes] = results;

        if (userRes?.user) {
            state.currentUserData = userRes.user;
            state.currentUserData.kelas = userRes.user.class_name || userRes.user.kelas || 'Kelas';
            state.currentUser = userRes.user.id;
            state.role = userRes.user.role;
        }

        if (periodsRes?.periods) {
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

        if (Array.isArray(txRes)) {
            state.transactions = txRes.map(t => normalizeTransaction(t));
        }

        if (Array.isArray(expRes)) {
            state.expenses = expRes.map(e => ({
                id: e.id,
                name: e.name,
                category: e.category,
                amount: parseFloat(e.amount),
                desc: e.description,
                date: e.expense_date,
                receiptFile: e.receipt_file,
                balanceBefore: e.balance_before,
                balanceAfter: e.balance_after
            }));
        }

        if (Array.isArray(annRes)) {
            state.announcements = annRes.map(a => ({
                id: a.id,
                title: a.title,
                content: a.content,
                category: a.category,
                isImportant: a.priority === 'important',
                date: a.published_at ? a.published_at.split('T')[0] : a.created_at.split('T')[0],
                isRead: a.is_read > 0
            }));
        }

        if (Array.isArray(notifRes)) {
            state.notifications = notifRes.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                isRead: Number(n.is_read) === 1,
                reference_type: n.reference_type,
                reference_id: n.reference_id,
                date: n.created_at
            }));
        }

        if (Array.isArray(actRes)) {
            state.activities = actRes.map(a => ({
                id: a.id,
                type: a.type,
                description: a.description,
                icon: a.icon || '📄',
                time: a.created_at
            }));
        }

        if (studentsRes?.students) {
            state.students = studentsRes.students.map(s => ({
                id: s.id,
                name: s.full_name,
                username: s.username,
                email: s.email,
                phone: s.phone,
                nis: s.nis,
                absenNumber: s.attendance_number,
                kelas: s.kelas || state.currentUserData?.kelas || 'Kelas',
                status: s.status,
                user_status: s.user_status || 'active'
            }));
        }

        if (settingsRes?.settings) {
            state.reminderSettings = {
                paymentReminder: Number(settingsRes.settings.payment_reminder) === 1,
                announcementNotif: Number(settingsRes.settings.announcement_notif) === 1,
                soundNotif: Number(settingsRes.settings.sound_notif) === 1
            };
            state.theme = settingsRes.settings.theme || 'light';
        }

        if (Array.isArray(reportsRes)) {
            state.userReports = reportsRes.map(r => ({
                id: r.id,
                userId: r.user_id,
                category: r.category,
                title: r.title,
                desc: r.description,
                transactionId: r.transaction_id,
                status: r.status,
                attachment: r.attachment,
                response: r.response,
                createdAt: r.created_at
            }));
        }

        if (cashRes?.cash_settings) {
            const cs = cashRes.cash_settings;
            state.cashSettings = {
                frequency: cs.frequency || 'monthly',
                defaultAmount: parseFloat(cs.default_amount || 0),
                paymentDeadlineDays: parseInt(cs.payment_deadline_days || 0),
                bankName: cs.bank_name || null,
                accountNumber: cs.account_number || null,
                accountHolder: cs.account_holder || null
            };
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
            state.currentUserData.kelas = userRes.user.class_name || userRes.user.kelas || 'Kelas';
            state.currentUser = userRes.user.id;
            state.role = userRes.user.role;
        }

        if (settingsRes.cash_settings) {
            const cs = settingsRes.cash_settings;
            state.cashSettings = {
                frequency: cs.frequency || 'monthly',
                defaultAmount: parseFloat(cs.default_amount || 0),
                paymentDeadlineDays: parseInt(cs.payment_deadline_days || 0),
                bankName: cs.bank_name || null,
                accountNumber: cs.account_number || null,
                accountHolder: cs.account_holder || null
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
                periodIds: t.period_ids ? (Array.isArray(t.period_ids) ? t.period_ids : String(t.period_ids).split(',').map(Number)) : [],
                periodLabel: t.period_label || '',
                frequency: t.frequency || state.cashSettings.frequency,
                amount: parseFloat(t.total_amount !== undefined ? t.total_amount : t.amount),
                total_amount: parseFloat(t.total_amount !== undefined ? t.total_amount : t.amount),
                method: t.method,
                date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                dateObj: new Date(t.created_at || new Date()),
                status: t.status,
                proof: t.proof ? {
                    id: t.proof.id,
                    file_name: t.proof.file_name || t.proof.filename,
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
        const notifications = await apiFetchAll('notifications.php', 'notifications');
        state.notifications = notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            isRead: Number(n.is_read) === 1,
            link: n.link,
            date: n.created_at
        }));
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
    document.getElementById('app').classList.toggle('as-bendahara', state.role === 'bendahara');
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
    const kasMenu = document.querySelector('[data-page="kas-settings"]');
    if (kasMenu) {
        kasMenu.style.display = (state.role === 'bendahara') ? 'flex' : 'none';
    }
    const laporanMenu = document.querySelector('[data-page="laporan-masuk"]');
    if (laporanMenu) {
        laporanMenu.style.display = (state.role === 'bendahara') ? 'flex' : 'none';
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
        'verifikasi': renderVerifikasiPage,
        'kas-settings': renderKasSettingsPage,
        'laporan-masuk': renderLaporanMasukPage,
        'detail-laporan': renderDetailLaporanPage
    };
    const renderFn = pages[state.currentPage];
    if (renderFn) {
        content.innerHTML = '<div class="page-loading"><span class="spinner"></span><b>Memuat…</b></div>';
        content.innerHTML = await renderFn();
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
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
        ${showBack ? `<button class="back-btn" onclick="goBack()">${getIcon('arrow-left')} Kembali</button>` : ''}
        <span class="page-title">${title}</span>
        <button class="header-action" onclick="navigateTo('search')" aria-label="Cari">${getIcon('search')}</button>
    </div>`;
}

// ==================== HALAMAN LOGIN ====================
function renderLoginPage() {
    return `
    <main class="login-page">
        <div class="login-panel">
            <div class="login-brand">
                <img src="assets/logo.svg" alt="Smart Kas" class="login-logo">
                <h1>Smart Kas</h1>
                <p>Ayo Bayar Uang Kas</p>
            </div>
            <section class="card login-card" aria-labelledby="loginTitle" data-testid="login-form">
                <h2 id="loginTitle">Masuk</h2>
                <div class="form-group"><label class="form-label" for="loginNis">NIS / Username</label><input type="text" class="form-input" id="loginNis" data-testid="login-username" autocomplete="username"></div>
                <div class="form-group"><label class="form-label" for="loginPass">Password</label><input type="password" class="form-input" id="loginPass" data-testid="login-password" autocomplete="current-password"></div>
                <button class="btn btn-primary btn-block btn-lg" id="btnLogin" data-testid="login-submit" onclick="handleLogin()">Masuk</button>
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

            // Muat seluruh data aplikasi agar semua halaman terisi sejak login
            await loadDataFromServer();

            navigateTo('home');
            showToast(`Selamat datang, ${data.user.name}! 👋`, 'success');
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
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('upload-bukti')">Upload Ulang</button>`;
    } else {
        heroButton = `<button class="btn btn-primary" onclick="navigateTo('pembayaran')">Bayar Sekarang</button>`;
    }

    return `
    ${renderHeader('Dashboard')}
    <div class="container">
        <div class="flex items-center gap-12 mb-16">
            ${getAvatarHtml(user, 'avatar-lg')}
            <div>
                <h2 style="font-size:20px;font-weight:800;">Selamat pagi, ${escapeHtml(user.name || user.username)} 👋</h2>
                <p style="font-size:13px;color:var(--text-secondary);">${escapeHtml(user.kelas || 'Kelas')} • ${user.absenNumber ? 'Absen '+escapeHtml(user.absenNumber) : escapeHtml(user.role || 'Siswa')}</p>
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
            <p style="font-size:12px;opacity:0.9;margin-top:8px;">Periode: ${escapeHtml(currentPeriod.label)}</p>
            <p style="font-size:12px;opacity:0.9;">Jatuh tempo: ${formatDate(currentPeriod.dueDate)} (${diffDays>=0?diffDays+' hari lagi':'Terlambat '+Math.abs(diffDays)+' hari'})</p>
            <div class="progress-bar mt-16" style="background:rgba(255,255,255,0.2);">
                <div class="progress-fill" style="width:${progress.rate}%;"></div>
            </div>
            <p style="font-size:11px;margin-top:4px;">${progress.lunasCount} dari ${progress.totalPeriods} periode lunas</p>
        </div>

        <div class="stat-grid mb-16">
            <div class="stat-card"><div class="stat-value">${formatRupiah(state.periods.filter(p => getPeriodStatusForUser(p.id, user.id) === 'lunas').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}</div><div class="stat-label">Total Dibayar</div></div>
            <div class="stat-card"><div class="stat-value" style="color:${totalUnpaid>0?'var(--danger)':'var(--success)'};">${formatRupiah(totalUnpaid)}</div><div class="stat-label">Tunggakan</div></div>
            <div class="stat-card"><div class="stat-value">${progress.lunasCount}</div><div class="stat-label">Periode Lunas</div></div>
            <div class="stat-card"><div class="stat-value">${progress.rate}%</div><div class="stat-label">Progress</div></div>
        </div>

        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Aksi Cepat</span></div>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateTo('pembayaran')"><span class="qa-icon">${getIcon('credit-card')}</span>Bayar Kas</button>
                <button class="quick-action-btn" onclick="navigateTo('tunggakan')"><span class="qa-icon">${getIcon('alert')}</span>Tunggakan</button>
                <button class="quick-action-btn" onclick="navigateTo('riwayat')"><span class="qa-icon">${getIcon('history')}</span>Riwayat</button>
                <button class="quick-action-btn" onclick="navigateTo('transparansi')"><span class="qa-icon">${getIcon('bar-chart')}</span>Transparansi</button>
            </div>
        </div>

        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Fitur Kelas</span></div>
            <div class="quick-actions-grid">
                <button class="quick-action-btn" onclick="navigateTo('pengeluaran')"><span class="qa-icon">${getIcon('receipt')}</span>Pengeluaran</button>
                <button class="quick-action-btn" onclick="navigateTo('pengumuman')"><span class="qa-icon">${getIcon('megaphone')}</span>Pengumuman</button>
                <button class="quick-action-btn" onclick="navigateTo('kalender')"><span class="qa-icon">${getIcon('history')}</span>Kalender</button>
                <button class="quick-action-btn" onclick="navigateTo('anggota')"><span class="qa-icon">${getIcon('users')}</span>Anggota</button>
            </div>
        </div>

        <div class="card mb-16">
            <div class="card-header">
                <span class="card-title">Transaksi Terbaru</span>
                <button style="font-size:12px;color:var(--primary);" onclick="navigateTo('riwayat')">Lihat Semua →</button>
            </div>
            ${recentTx.length===0?'<p style="font-size:13px;color:var(--text-muted);">Belum ada transaksi.</p>':recentTx.map(tx=>`
                <div class="list-item" onclick="navigateTo('detail-transaksi',{id:'${tx.id}'})">
                    ${ic('i-card')}
                    <div class="item-info"><div class="item-title">${escapeHtml(tx.periodLabel || tx.period_label || 'Periode')}</div><div class="item-subtitle">${formatShortDate(tx.date)} • ${tx.method.toUpperCase()}</div></div>
                    <span class="badge ${getStatusBadgeClass(tx.status)}">${getStatusLabel(tx.status)}</span>
                </div>`).join('')}
        </div>

        <div class="card">
            <div class="card-header">
                <span class="card-title">${ic('i-mega')} Pengumuman</span>
                <button style="font-size:12px;color:var(--primary);" onclick="navigateTo('pengumuman')">Lihat Semua →</button>
            </div>
        ${announcements.length===0?'<p style="font-size:13px;color:var(--text-muted);">Tidak ada pengumuman baru.</p>':announcements.map(a=>`
                <div class="list-item" onclick="navigateTo('detail-pengumuman',{id:${a.id}})" style="${a.isImportant?'border-left:3px solid var(--danger);':''}">
                    <span>${ic('i-mega')}</span>
                    <div class="item-info"><div class="item-title">${escapeHtml(a.title)}</div><div class="item-subtitle">${formatShortDate(a.date)} • ${escapeHtml(a.category)}</div></div>
                </div>`).join('')}
        </div>

        ${unpaidCount>0?`<div class="card mt-16" style="background:var(--warning-bg);border:1px solid var(--warning);"><p style="font-size:13px;font-weight:600;color:var(--warning);">Anda memiliki ${unpaidCount} periode tunggakan.</p><button class="btn btn-outline btn-sm mt-8" onclick="navigateTo('tunggakan')">Lihat Tunggakan</button></div>`:''}
    </div>`;
}

// ==================== KAS SAYA ====================
function renderKasSayaPage() {
    const user = getCurrentUser();
    const progress = calculateProgress(user.id);
    const totalAmount = state.periods.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalPaid = state.periods.filter(p => getPeriodStatusForUser(p.id, user.id) === 'lunas').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalUnpaid = getUnpaidPeriods(user.id).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
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
            <div class="stat-card"><div class="stat-value">${formatRupiah(totalPaid)}</div><div class="stat-label">Sudah Dibayar</div></div>
            <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${formatRupiah(totalUnpaid)}</div><div class="stat-label">Tunggakan</div></div>
            <div class="stat-card"><div class="stat-value">${progress.lunasCount}</div><div class="stat-label">Periode Lunas</div></div>
            <div class="stat-card"><div class="stat-value">${getUnpaidPeriods(user.id).length}</div><div class="stat-label">Belum Bayar</div></div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Daftar Periode (${state.cashSettings.frequency==='weekly'?'Mingguan':'Bulanan'})</span>${state.role==='bendahara'?`<button class="btn btn-primary btn-sm" onclick="showAddPeriodModal()">+ Tambah Periode</button>`:''}</div>
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
                        <span>${st==='lunas'?ic('i-checkc'):st==='menunggu'?ic('i-clock'):ic('i-alert')}</span>
                        <div class="item-info"><div class="item-title">${escapeHtml(p.label)}</div><div class="item-subtitle">${formatRupiah(p.amount)} • Deadline ${formatShortDate(p.dueDate)}</div></div>
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

    const freqLabel = state.cashSettings.frequency === 'weekly' ? 'Mingguan' : 'Bulanan';
    return `
    ${renderHeader('Pembayaran Kas', true)}
    <div class="container">
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Pilih Periode (${freqLabel})</span></div>
            <div style="max-height:300px;overflow-y:auto;">
                ${unpaidPeriods.length === 0 ? 
                    '<p class="text-center" style="color:var(--success);">Tidak ada tunggakan.</p>' :
                    unpaidPeriods.map(p => {
                        const checked = state.selectedPeriods.some(id => String(id) === String(p.id));
                        return `<label class="list-item" style="cursor:pointer;">
                            <input type="checkbox" ${checked?'checked':''} onchange="togglePeriodSelection('${p.id}')" style="width:20px;height:20px;">
                            <span>${escapeHtml(p.label)}</span>
                            <span style="margin-left:auto;font-weight:700;">${formatRupiah(p.amount)}</span>
                        </label>`;
                    }).join('')
                }
            </div>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Metode Pembayaran</span></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                ${['cash','transfer','qris'].map(m=>`<button class="chip ${state.selectedMethod===m?'active':''}" onclick="state.selectedMethod='${m}';renderPage()" style="padding:12px;text-align:center;"><span style="font-size:20px;display:block;">${m==='cash'?ic('i-cash'):m==='transfer'?ic('i-bank'):ic('i-qr')}</span>${m.toUpperCase()}</button>`).join('')}
            </div>
            ${state.selectedMethod==='qris'?`<div class="text-center mt-8"><div style="padding:16px;background:var(--warning-bg);border-radius:8px;border:1px solid var(--warning);">${ic('i-qr')}<p style="font-size:13px;font-weight:600;margin-top:8px;">Kode QRIS belum tersedia di aplikasi</p><p style="font-size:12px;color:var(--text-secondary);">Minta kode QRIS kepada bendahara, atau lanjutkan lalu upload bukti pembayaran.</p></div><p style="font-size:12px;color:var(--text-muted);margin-top:8px;">Nominal: ${formatRupiah(totalAmount)}</p></div>`:state.selectedMethod==='transfer'?`<p style="font-size:13px;margin-top:8px;">Transfer ke rekening: <strong>${state.cashSettings.bankName && state.cashSettings.accountNumber ? `${escapeHtml(state.cashSettings.bankName)} ${escapeHtml(state.cashSettings.accountNumber)} ${state.cashSettings.accountHolder ? 'a.n. ' + escapeHtml(state.cashSettings.accountHolder) : ''}` : 'rekening belum dikonfigurasi'}</strong></p>`:`<p style="font-size:13px;margin-top:8px;">Serahkan uang kepada bendahara.</p>`}
        </div>
        <div class="card mb-16">
            <p>Total yang harus dibayar:</p>
            <p style="font-size:24px;font-weight:800;color:var(--primary);">${formatRupiah(totalAmount)}</p>
        </div>
        <button class="btn btn-primary btn-block btn-lg" data-testid="payment-submit" onclick="handlePaymentSubmit()">${ic('i-card')} Bayar Sekarang</button>
    </div>`;
}

function togglePeriodSelection(periodId) {
    const id = String(periodId);
    const idx = state.selectedPeriods.findIndex(selId => String(selId) === id);
    if (idx > -1) {
        state.selectedPeriods.splice(idx, 1);
    } else {
        state.selectedPeriods.push(id);
    }
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
        <p>Periode: ${escapeHtml(periodLabels)}</p>
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

    if (periods.length === 0) {
        showToast('Tidak ada periode valid untuk dibayar', 'error');
        closeBottomSheet();
        return;
    }

    const periodIds = periods.map(p => parseInt(p.id));
    const totalAmount = periods.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    try {
        const data = await apiFetch('submit_payment.php', 'POST', {
            period_ids: periodIds,
            method: state.selectedMethod,
            total: totalAmount
        });

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
    const uploadableTxs = state.transactions.filter(t => (t.user_id === user.id || t.studentId === user.id) && (t.status === 'menunggu' || t.status === 'ditolak'));
    if (uploadableTxs.length === 0) {
        return `${renderHeader('Upload Bukti', true)}<div class="container"><div class="empty-state"><div class="empty-icon">📤</div><div class="empty-title">Tidak ada pembayaran yang perlu bukti</div><button class="btn btn-primary mt-16" onclick="navigateTo('pembayaran')">Bayar Kas</button></div></div>`;
    }
    if (!state.selectedUploadTxId || !uploadableTxs.some(t => String(t.id) === String(state.selectedUploadTxId))) {
        state.selectedUploadTxId = uploadableTxs[0].id;
    }
    const selectedTx = uploadableTxs.find(t => String(t.id) === String(state.selectedUploadTxId));
    return `
    ${renderHeader('Upload Bukti', true)}
    <div class="container">
        ${uploadableTxs.length > 1 ? `
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Pilih Transaksi</span></div>
            ${uploadableTxs.map(tx => `
                <div class="list-item ${String(state.selectedUploadTxId) === String(tx.id) ? 'active' : ''}" onclick="state.selectedUploadTxId='${tx.id}';renderPage()">
                    ${ic('i-card')}
                    <div class="item-info"><div class="item-title">${escapeHtml(tx.periodLabel || tx.period_label || 'Periode')}</div><div class="item-subtitle">${tx.id} • ${formatRupiah(tx.amount)}</div></div>
                    ${String(state.selectedUploadTxId) === String(tx.id) ? '<span style="color:var(--primary);font-weight:700;">' + ic("i-check") + '</span>' : ''}
                </div>`).join('')}
        </div>` : ''}
        <div class="card mb-16">
            <p>Periode: <strong>${escapeHtml(selectedTx.periodLabel || selectedTx.period_label || 'Periode')}</strong></p>
            <p>Nominal: <strong>${formatRupiah(selectedTx.amount)}</strong></p>
            <p>Metode: <strong>${selectedTx.method.toUpperCase()}</strong></p>
            <span class="badge ${selectedTx.status === 'ditolak' ? 'badge-danger' : 'badge-warning'}">${selectedTx.status === 'ditolak' ? 'Ditolak (Upload Ulang)' : 'Menunggu Verifikasi'}</span>
            ${selectedTx.rejectionReason ? `<div style="margin-top:8px;padding:8px;background:var(--danger-bg);border-radius:6px;font-size:12px;color:var(--danger);">Alasan Penolakan: ${escapeHtml(selectedTx.rejectionReason)}</div>` : ''}
        </div>
        <div class="card">
            <div class="upload-zone" onclick="document.getElementById('fileInput').click()"><div class="upload-icon">${ic('i-cam')}</div><p>Klik untuk pilih file</p><p style="font-size:11px;color:var(--text-muted);">JPG, PNG, PDF (Maks 5MB)</p></div>
            <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.pdf" style="display:none;" onchange="handleFileSelect(event)">
            <div id="filePreviewContainer"></div>
        </div>
        <button class="btn btn-primary btn-block mt-16" id="btnUpload" onclick="handleUploadProof()" disabled>${ic('i-send')} Kirim Bukti</button>
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
    preview.innerHTML = `<div class="file-preview">${isImage?`<img src="${URL.createObjectURL(file)}">`:ic("i-doc")}<div class="flex-1"><p>${escapeHtml(file.name)}</p><p style="font-size:11px;color:var(--text-muted);">${(file.size/1024/1024).toFixed(2)} MB</p></div><button onclick="removeFile()">${ic('i-x')}</button></div>`;
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
            btn.innerHTML = ic('i-send') + ' Kirim Bukti';
        }
    } catch (err) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false;
        btn.innerHTML = ic('i-send') + ' Kirim Bukti';
    }
}

// ==================== RIWAYAT ====================
function renderRiwayatPage() {
    const user = getCurrentUser();
    // Bendahara melihat seluruh transaksi kelasnya; siswa hanya miliknya
    let tx = state.role === 'bendahara' ? [...state.transactions] : getUserTransactions(user.id);
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
        <div class="search-input mb-8"><span style="display:flex">${ic('i-search')}</span><input type="text" id="searchInputRiwayat" placeholder="Cari ID atau periode..." value="${state.searchQuery}" oninput="activeInputId='searchInputRiwayat'; state.searchQuery=this.value; renderPage()"></div>
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
        ${tx.length===0?'<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div></div>':tx.map(t=>`<div class="card mb-8" onclick="navigateTo('detail-transaksi',{id:'${t.id}'})"><div class="flex items-center gap-10">${ic('i-card')}<div class="flex-1"><p class="item-title">${escapeHtml(t.periodLabel || t.period_label || 'Periode')}</p><p class="item-subtitle">${escapeHtml(t.id)} • ${formatShortDate(t.date)}</p></div><div class="text-right"><p style="font-weight:800;">${formatRupiah(t.amount)}</p><span class="badge ${getStatusBadgeClass(t.status)}">${getStatusLabel(t.status)}</span></div></div></div>`).join('')}
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
                <div><span style="color:var(--text-muted);">Nama</span><p>${escapeHtml(tx.studentName)}</p></div>
                <div><span style="color:var(--text-muted);">Frekuensi</span><p>${tx.frequency==='weekly'?'Mingguan':'Bulanan'}</p></div>
                <div><span style="color:var(--text-muted);">Periode</span><p>${periodsPaid.length>0?periodsPaid.map(p=>escapeHtml(p.label)).join(', '):'-'}</p></div>
                <div><span style="color:var(--text-muted);">Tanggal</span><p>${formatDate(tx.date)}</p></div>
                <div><span style="color:var(--text-muted);">Nominal</span><p style="color:var(--primary);font-weight:600;">${formatRupiah(tx.amount)}</p></div>
                <div><span style="color:var(--text-muted);">Metode</span><p>${escapeHtml(tx.method).toUpperCase()}</p></div>
            </div>
            ${tx.rejectionReason?`<div style="margin-top:12px;padding:8px;background:var(--danger-bg);border-radius:6px;"><p style="font-size:12px;color:var(--danger);">Alasan: ${escapeHtml(tx.rejectionReason)}</p></div>`:''}
        </div>
        ${tx.proof?`<div class="card mb-16"><div class="card-header"><span class="card-title">Bukti Pembayaran</span></div><div style="background:var(--input-bg);padding:12px;border-radius:8px;text-align:center;"><span style="font-size:44px;display:inline-flex;color:var(--violet)">${ic('i-doc')}</span><p>${escapeHtml(tx.proof.file_name)}</p></div><div class="flex gap-8 mt-8"><button class="btn btn-outline btn-sm flex-1" onclick="previewBukti('${tx.id}')">Lihat</button><button class="btn btn-outline btn-sm flex-1" onclick="downloadBukti('${tx.id}')">Download</button></div></div>`:'<div class="card mb-16"><p style="font-size:13px;color:var(--text-muted);text-align:center;">Belum ada bukti pembayaran.</p></div>'}
        <div class="card">
            <div class="card-header"><span class="card-title">Timeline</span></div>
            <div class="timeline">
                <div class="timeline-item success"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Pembayaran dibuat</div></div>
                ${tx.proof?`<div class="timeline-item success"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Bukti dikirim</div></div>`:''}
                ${tx.status==='berhasil'?`<div class="timeline-item success"><div class="timeline-date">${tx.verifiedAt?formatShortDate(tx.verifiedAt):'-'}</div><div class="timeline-content">Diverifikasi</div></div>`:tx.status==='menunggu'?`<div class="timeline-item warning"><div class="timeline-date">Sekarang</div><div class="timeline-content">Menunggu verifikasi</div></div>`:`<div class="timeline-item danger"><div class="timeline-date">${formatShortDate(tx.date)}</div><div class="timeline-content">Ditolak${tx.rejectionReason?`: ${escapeHtml(tx.rejectionReason)}`:''}</div></div>`}
            </div>
        </div>
        ${(tx.status==='ditolak' && String(tx.user_id)===String(getCurrentUser().id))?`<button class="btn btn-primary btn-block mt-16" onclick="resubmitBukti('${tx.id}')">Upload Bukti Baru</button>`:''}
    </div>`;
}

function previewBukti(txId) {
    const tx = state.transactions.find(t => t.id.toString() === txId.toString());
    if (tx) {
        if (tx.proof?.url) {
            window.open(tx.proof.url, '_blank', 'noopener');
        } else {
            showToast('Bukti pembayaran tidak tersedia', 'warning');
        }
    }
}

function downloadBukti(txId) {
    const tx = state.transactions.find(t => t.id.toString() === txId.toString());
    if (tx && tx.proof) {
        if (tx.proof?.url) {
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
    // Flow nyata via backend: arahkan ke halaman upload; upload_proof.php
    // yang mengubah status ditolak -> menunggu setelah bukti baru tersimpan.
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
            return `<div class="list-item" style="border-bottom:1px solid var(--border);border-radius:0;">${ic('i-alert')}<div class="item-info"><div class="item-title">${escapeHtml(p.label)}</div><div class="item-subtitle">Deadline: ${formatShortDate(p.dueDate)} • ${diff>0?`Terlambat ${diff} hari`:'Jatuh tempo'}</div></div><span style="font-weight:700;color:var(--danger);">${formatRupiah(p.amount)}</span></div>`;
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
    const statusMap={lunas:'Lunas',menunggu:'Menunggu',belum:'Belum bayar',nonaktif:'Nonaktif'};
    const badgeMap={lunas:'badge-success',menunggu:'badge-warning',belum:'badge-danger',nonaktif:'badge-neutral'};
    return `
    ${renderHeader('Anggota Kelas', true)}
    <div class="container">
        ${state.role==='bendahara'?`<button class="btn btn-primary btn-block mb-16" onclick="showAddStudentModal()">${getIcon('plus')} Tambah Siswa</button>`:''}
        <div class="search-input mb-8"><span style="display:flex">${ic('i-search')}</span><input type="text" id="searchInputAnggota" placeholder="Cari nama atau nomor absen..." value="${state.searchQuery}" oninput="activeInputId='searchInputAnggota'; state.searchQuery=this.value; renderPage()"></div>
        <div class="filter-chips mb-8">${['semua','lunas','menunggu','belum','nonaktif'].map(f=>`<button class="chip ${state.filterStatus===f?'active':''}" onclick="state.filterStatus='${f}';renderPage()">${f}</button>`).join('')}</div>
        <div class="filter-chips mb-16"><button class="chip ${state.sortBy==='absen'?'active':''}" onclick="state.sortBy='absen';renderPage()">No. Absen</button><button class="chip ${state.sortBy==='nama-asc'?'active':''}" onclick="state.sortBy='nama-asc';renderPage()">A-Z</button><button class="chip ${state.sortBy==='nama-desc'?'active':''}" onclick="state.sortBy='nama-desc';renderPage()">Z-A</button><button class="chip ${state.sortBy==='status'?'active':''}" onclick="state.sortBy='status';renderPage()">Status</button></div>
        ${members.map(m=>`<div class="card mb-8" onclick="navigateTo('detail-anggota',{id:${m.id}})"><div class="flex items-center gap-12">${getAvatarHtml(m,'avatar-sm')}<div class="flex-1"><p class="item-title">${escapeHtml(m.name)}</p><p class="item-subtitle">Absen ${escapeHtml(String(m.absenNumber).padStart(2,'0'))}</p></div><span class="badge ${badgeMap[m.status] || 'badge-neutral'}">${statusMap[m.status] || escapeHtml(m.status)}</span></div></div>`).join('')}
    </div>`;
}

// ==================== DETAIL ANGGOTA ====================
function renderDetailAnggotaPage() {
    const memberId = state.pageParams.id;
    const member = state.students.find(s => s.id == memberId);
    if (!member) return `${renderHeader('Detail Anggota', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Anggota tidak ditemukan</div></div></div>`;
    return `${renderHeader('Detail Anggota', true)}<div class="container">${state.role==='bendahara'?`<div class="flex gap-8 mb-16"><button class="btn btn-outline flex-1" onclick="showEditStudentModal(${member.id})">Edit</button><button class="btn btn-danger flex-1" onclick="confirmDeactivateStudent(${member.id})">Nonaktifkan</button></div>`:''}<div class="text-center mb-16">${getAvatarHtml(member,'avatar-lg')}<h2 style="font-size:20px;font-weight:800;margin-top:8px;">${escapeHtml(member.name)}</h2><p style="font-size:13px;color:var(--text-secondary);">${escapeHtml(member.kelas || 'Kelas')} • Absen ${escapeHtml(member.absenNumber)}</p></div><div class="card mb-16"><div class="card-header"><span class="card-title">Informasi</span></div><p>NIS: ${escapeHtml(member.nis || '-')}</p><p>Email: ${escapeHtml(member.email || '-')}</p><p>Phone: ${escapeHtml(member.phone || '-')}</p></div><div class="card"><div class="card-header"><span class="card-title">Timeline Pembayaran</span></div>${state.periods.slice(0,8).map(p=>{ const st=getPeriodStatusForUser(p.id,member.id); return `<div class="list-item" style="border-bottom:1px solid var(--border);border-radius:0;"><span>${st==='lunas'?ic('i-checkc'):st==='menunggu'?ic('i-clock'):ic('i-alert')}</span><div class="item-info"><div class="item-title">${escapeHtml(p.label)}</div></div><span class="badge ${getStatusBadgeClass(st)}">${getStatusLabel(st)}</span></div>`; }).join('')}</div></div>`;
}

// ==================== TRANSPARANSI ====================
async function renderTransparansiPage() {
    // Backend adalah sumber kebenaran untuk angka transparansi kas
    let d;
    try {
        d = await apiFetch('transparansi.php?year=' + encodeURIComponent(state.transparansiYear));
        if (!d || d.error) throw new Error((d && d.error) || 'Gagal memuat data');
    } catch (err) {
        console.warn('Gagal memuat transparansi', err);
        return `${renderHeader('Transparansi Kas', true)}<div class="container"><div class="empty-state"><div class="empty-icon">📊</div><div class="empty-title">Gagal memuat data transparansi</div><button class="btn btn-outline mt-16" onclick="renderPage()">Coba Lagi</button></div></div>`;
    }
    const totalIncome = parseFloat(d.total_income) || 0;
    const totalExpense = parseFloat(d.total_expense) || 0;
    const balance = parseFloat(d.balance) || 0;
    const monthlyData = (d.monthly_income || []).map(v => parseFloat(v) || 0);
    const expenseMonthly = (d.monthly_expense || []).map(v => parseFloat(v) || 0);
    const maxIn = Math.max(...monthlyData, 1);
    const maxEx = Math.max(...expenseMonthly, 1);
    const selectedMonth = state.transparansiMonth;
    const monthIncome = monthlyData[selectedMonth] || 0;
    const monthExpense = expenseMonthly[selectedMonth] || 0;
    const years = Array.isArray(d.years) && d.years.length ? d.years.map(Number) : [state.transparansiYear];
    return `
    ${renderHeader('Transparansi Kas', true)}
    <div class="container">
        <div class="card text-center mb-16"><p style="font-size:14px;color:var(--text-secondary);">Saldo Kas</p><p style="font-size:36px;font-weight:800;color:var(--primary);">${formatRupiah(balance)}</p></div>
        <div class="stat-grid mb-16">
            <div class="stat-card"><div class="stat-value" style="color:var(--success);">${formatRupiah(totalIncome)}</div><div class="stat-label">Total Pemasukan</div></div>
            <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${formatRupiah(totalExpense)}</div><div class="stat-label">Total Pengeluaran</div></div>
        </div>
        <div class="card mb-16"><div class="card-header"><span class="card-title">Grafik Pemasukan ${escapeHtml(String(state.transparansiYear))}</span></div><div class="chart-container"><div class="chart-bars">${monthlyData.map((v,i)=>{ const h=Math.max((v/maxIn)*140, v>0?8:0); return `<div class="chart-bar-group" title="${formatRupiah(v)}">${v>0?`<b class="amount" style="font-size:8.5px;color:var(--mint)">${formatRupiah(v)}</b>`:""}<div class="chart-bar" style="height:${h}px;background:var(--mint);"></div><span class="chart-label">${shortMonths[i]}</span></div>`; }).join('')}</div></div></div>
        <div class="card mb-16"><div class="card-header"><span class="card-title">Grafik Pengeluaran ${escapeHtml(String(state.transparansiYear))}</span></div><div class="chart-container"><div class="chart-bars">${expenseMonthly.map((v,i)=>{ const h=Math.max((v/maxEx)*140, v>0?8:0); return `<div class="chart-bar-group" title="${formatRupiah(v)}">${v>0?`<b class="amount" style="font-size:8.5px;color:var(--pink)">${formatRupiah(v)}</b>`:""}<div class="chart-bar" style="height:${h}px;background:var(--pink);"></div><span class="chart-label">${shortMonths[i]}</span></div>`; }).join('')}</div></div></div>
        <div class="card">
            <div class="card-header"><span class="card-title">Ringkasan Bulanan</span></div>
            <select class="form-input mb-8" onchange="state.transparansiYear=parseInt(this.value);renderPage()">
                ${years.map(y=>`<option value="${y}" ${state.transparansiYear===y?'selected':''}>Tahun ${y}</option>`).join('')}
            </select>
            <select class="form-input mb-8" onchange="state.transparansiMonth=parseInt(this.value);renderPage()">
                ${months.map((m,i)=>`<option value="${i}" ${state.transparansiMonth===i?'selected':''}>${m} ${state.transparansiYear}</option>`).join('')}
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
    const catIcons = { kebersihan:'i-trash', perlengkapan:'i-doc', kegiatan:'i-checkc', dekorasi:'i-sun', sosial:'i-users', lainnya:'i-list' };
    return `${renderHeader('Pengeluaran Kelas', true)}<div class="container">${state.role==='bendahara'?`<button class="btn btn-primary btn-block mb-16" onclick="showAddExpenseModal()">${getIcon('plus')} Tambah Pengeluaran</button>`:''}<div class="search-input mb-8"><span style="display:flex">${ic('i-search')}</span><input type="text" id="searchInputPengeluaran" placeholder="Cari pengeluaran..." value="${escapeHtml(state.searchQuery)}" oninput="activeInputId='searchInputPengeluaran'; state.searchQuery=this.value; renderPage()"></div><div class="filter-chips mb-16"><button class="chip ${state.filterStatus==='semua'?'active':''}" onclick="state.filterStatus='semua';renderPage()">Semua</button>${categories.map(c=>`<button class="chip ${state.filterStatus===c?'active':''}" onclick="state.filterStatus='${c}';renderPage()">${ic(catIcons[c]||'i-list')} ${escapeHtml(c)}</button>`).join('')}</div>${exps.map(e=>`<div class="card mb-8" onclick="navigateTo('detail-pengeluaran',{id:${e.id}})"><div class="flex items-center gap-12"><span style="font-size:28px;display:inline-flex;color:var(--violet)">${ic(catIcons[e.category]||'i-receipt')}</span><div class="flex-1"><p class="item-title">${escapeHtml(e.name)}</p><p class="item-subtitle">${escapeHtml(e.category)} • ${formatShortDate(e.date)}</p></div><span style="font-weight:800;color:var(--danger);">${formatRupiah(e.amount)}</span></div></div>`).join('')}</div>`;
}

function renderDetailPengeluaranPage() {
    const expId = state.pageParams.id;
    const exp = state.expenses.find(e => e.id == expId);
    if (!exp) return `${renderHeader('Detail Pengeluaran', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Pengeluaran tidak ditemukan</div></div></div>`;
    return `${renderHeader('Detail Pengeluaran', true)}<div class="container">${state.role==='bendahara'?`<div class="flex gap-8 mb-16"><button class="btn btn-outline flex-1" onclick="showEditExpenseModal(${exp.id})">Edit</button><button class="btn btn-danger flex-1" onclick="confirmDeleteExpense(${exp.id})">Hapus</button></div>`:''}<div class="card text-center mb-16"><span style="font-size:44px;display:inline-flex;color:var(--violet)">${ic('i-receipt')}</span><h2>${escapeHtml(exp.name)}</h2><p style="font-size:24px;font-weight:800;color:var(--danger);">${formatRupiah(exp.amount)}</p></div><div class="card mb-16"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;"><div><span style="color:var(--text-muted);">Tanggal</span><p>${formatDate(exp.date)}</p></div><div><span style="color:var(--text-muted);">Kategori</span><p>${escapeHtml(exp.category)}</p></div></div></div><div class="card mb-16"><div class="card-header"><span class="card-title">Deskripsi</span></div><p>${escapeHtml(exp.desc) || '-'}</p></div>${exp.receiptFile ? `<div class="card"><div class="card-header"><span class="card-title">Nota / Bukti</span></div><p style="display:flex;align-items:center;gap:7px">${ic('i-doc')} ${escapeHtml(exp.receiptFile)}</p><button class="btn btn-primary btn-sm mt-8" onclick="window.open('api/receipt.php?id=${exp.id}','_blank')">Lihat Nota</button></div>` : ''}</div>`;
}

// ==================== PENGUMUMAN ====================
function renderPengumumanPage() {
    let anns = [...state.announcements];
    anns.sort((a,b)=> (b.isImportant?1:0) - (a.isImportant?1:0));
    if (state.filterStatus !== 'semua') anns = anns.filter(a => a.category === state.filterStatus);
    if (state.searchQuery) anns = anns.filter(a => a.title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const categories = [...new Set(state.announcements.map(a => a.category))];
    return `${renderHeader('Pengumuman', true)}<div class="container">${state.role==='bendahara'?`<button class="btn btn-primary btn-block mb-16" onclick="showAddAnnouncementModal()">${getIcon('plus')} Buat Pengumuman</button>`:''}<div class="search-input mb-8"><span style="display:flex">${ic('i-search')}</span><input type="text" id="searchInputPengumuman" placeholder="Cari pengumuman..." value="${escapeHtml(state.searchQuery)}" oninput="activeInputId='searchInputPengumuman'; state.searchQuery=this.value; renderPage()"></div><div class="filter-chips mb-16"><button class="chip ${state.filterStatus==='semua'?'active':''}" onclick="state.filterStatus='semua';renderPage()">Semua</button>${categories.map(c=>`<button class="chip ${state.filterStatus===c?'active':''}" onclick="state.filterStatus='${c}';renderPage()">${escapeHtml(c)}</button>`).join('')}</div>${anns.map(a=>`<div class="card mb-8" onclick="navigateTo('detail-pengumuman',{id:${a.id}})" style="${a.isImportant?'border-left:4px solid var(--danger);':''}"><div class="flex items-start gap-10"><span>${ic('i-mega')}</span><div class="flex-1"><p class="item-title">${escapeHtml(a.title)}</p><p class="item-subtitle">${escapeHtml(a.category)} • ${formatShortDate(a.date)}</p></div>${!a.isRead?'<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;"></span>':''}</div></div>`).join('')}</div>`;
}

async function markAnnouncementRead(announcementId) {
    try {
        await apiFetch('announcements.php', 'POST', {
            action: 'mark_read',
            announcement_id: announcementId
        });
        const ann = state.announcements.find(a => a.id == announcementId);
        if (ann) ann.isRead = true;
    } catch (e) {
        console.warn('Gagal menandai pengumuman dibaca', e);
    }
}

function renderDetailPengumumanPage() {
    const annId = state.pageParams.id;
    const ann = state.announcements.find(a => a.id == annId);
    if (!ann) return `${renderHeader('Detail', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Tidak ditemukan</div></div></div>`;
    if (!ann.isRead) {
        markAnnouncementRead(annId);
    }
    return `${renderHeader('Detail Pengumuman', true)}<div class="container">${state.role==='bendahara'?`<div class="flex gap-8 mb-16"><button class="btn btn-outline flex-1" onclick="showEditAnnouncementModal(${ann.id})">Edit</button><button class="btn btn-danger flex-1" onclick="confirmDeleteAnnouncement(${ann.id})">Hapus</button></div>`:''}<div class="card mb-16"><span class="badge ${ann.isImportant?'badge-danger':'badge-info'}">${escapeHtml(ann.category)}</span><h2 style="font-size:20px;font-weight:800;margin:8px 0;">${escapeHtml(ann.title)}</h2><p style="font-size:12px;color:var(--text-secondary);">${formatDate(ann.date)}</p></div><div class="card"><p style="font-size:14px;line-height:1.6;">${escapeHtml(ann.content)}</p></div></div>`;
}

// ==================== NOTIFIKASI ====================

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
    const typeIcons = { reminder:'i-clock', pembayaran_berhasil:'i-checkc', pembayaran_ditolak:'i-x', bukti_diterima:'i-send', pengumuman:'i-mega', pengeluaran:'i-receipt', info:'i-info', pembayaran_menunggu:'i-clock' };
    return `${renderHeader('Notifikasi', true)}<div class="container"><div class="card-header"><span class="card-title">${unread} belum dibaca</span><button style="font-size:12px;color:var(--primary);" onclick="markAllNotificationsRead()">Tandai semua dibaca</button></div>${state.role==='bendahara'?`<button class="btn btn-primary btn-block mb-16" onclick="showBroadcastModal()">${getIcon('bell')} Kirim Notifikasi ke Kelas</button>`:''}${notifs.length === 0 ? '<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">Tidak ada notifikasi</div></div>' : notifs.map(n=>`<div class="card mb-8" style="${!n.isRead?'background:var(--primary-light);':''}" onclick="handleNotificationClick(${n.id})"><div class="flex gap-10"><span>${ic(typeIcons[n.type]||'i-info')}</span><div class="flex-1"><p class="item-title">${escapeHtml(n.title)}</p><p class="item-subtitle">${escapeHtml(n.message)}</p><p style="font-size:11px;color:var(--text-muted);">${formatShortDate(n.date)}</p></div>${!n.isRead?'<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;"></span>':''}</div></div>`).join('')}</div>`;
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
    return `${renderHeader('Aktivitas Saya', true)}<div class="container"><div class="card"><div class="timeline">${state.activities.map(a=>`<div class="timeline-item success"><div class="timeline-date">${formatShortDate(a.time)}</div><div class="timeline-content">${a.icon || '📄'} ${escapeHtml(a.description)}</div></div>`).join('')}</div></div></div>`;
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
    const dueInfoLabel = state.cashSettings.frequency === 'weekly' ? 'setiap akhir minggu' : (state.cashSettings.paymentDeadlineDays > 0 ? `${state.cashSettings.paymentDeadlineDays} hari setelah periode dimulai` : 'tanggal 20');
    return `${renderHeader('Kalender Kas', true)}<div class="container"><div class="card mb-16"><div class="flex justify-between items-center mb-8"><button class="btn btn-outline btn-sm" onclick="state.calendarMonth=state.calendarMonth===0?11:state.calendarMonth-1;if(state.calendarMonth===11)state.calendarYear--;renderPage()">←</button><span style="font-weight:700;">${months[month]} ${year}</span><button class="btn btn-outline btn-sm" onclick="state.calendarMonth=state.calendarMonth===11?0:state.calendarMonth+1;if(state.calendarMonth===0)state.calendarYear++;renderPage()">→</button></div>${html}<div style="display:flex;gap:12px;margin-top:16px;font-size:11px;color:var(--text-secondary);"><span>🟢 Lunas</span><span>🔴 Belum/Terlambat</span><span>🟡 Menunggu</span><span>🔵 Deadline</span></div></div><div class="card"><div class="card-header"><span class="card-title">Event Bulan Ini</span></div><p style="display:flex;align-items:center;gap:7px">${ic('i-cal')} Jatuh tempo kas: ${dueInfoLabel}</p></div></div>`;
}

function showCalendarEvent(day, month, year) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const period = state.periods.find(p => p.startDate === dateStr || p.dueDate === dateStr);
    if (period) {
        showBottomSheet(`<h3>${escapeHtml(period.label)}</h3><p>Status: ${getStatusLabel(getPeriodStatusForUser(period.id, getCurrentUser().id))}</p><button class="btn btn-primary" onclick="closeBottomSheet();navigateTo('kas-saya')">Lihat Kas Saya</button>`);
    } else {
        showToast('Tidak ada event', 'info');
    }
}

function showPeriodDetail(periodId) {
    const period = getPeriodById(periodId);
    if (!period) {
        showToast('Periode tidak ditemukan', 'warning');
        return;
    }
    const user = getCurrentUser();
    const st = getPeriodStatusForUser(period.id, user.id);
    const tx = getTransactionForPeriod(period.id, user.id);
    showBottomSheet(`
        <h3>${escapeHtml(period.label)}</h3>
        <p>Nominal: <strong>${formatRupiah(period.amount)}</strong></p>
        <p>Mulai: ${formatDate(period.startDate)}</p>
        <p>Selesai: ${formatDate(period.endDate)}</p>
        <p>Jatuh tempo: ${formatDate(period.dueDate)}</p>
        <p>Status: <span class="badge ${getStatusBadgeClass(st)}">${getStatusLabel(st)}</span></p>
        <div class="flex gap-8 mt-16">
            ${(st==='belum'||st==='ditolak'||st==='terlambat')?`<button class="btn btn-primary flex-1" onclick="closeBottomSheet();navigateTo('pembayaran')">Bayar Sekarang</button>`:''}
            ${state.role==='bendahara'?`<button class="btn btn-outline flex-1" onclick="closeBottomSheet();showEditPeriodModal('${period.id}')">Edit</button>`:''}
            ${tx?`<button class="btn btn-outline flex-1" onclick="closeBottomSheet();navigateTo('detail-transaksi',{id:'${tx.id}'})">Lihat Transaksi</button>`:`<button class="btn btn-outline flex-1" onclick="closeBottomSheet()">Tutup</button>`}
        </div>
    `);
}

function showAddPeriodModal() {
    const defaultAmt = state.cashSettings.defaultAmount !== null ? state.cashSettings.defaultAmount : '';
    const freq = state.cashSettings.frequency || 'weekly';
    showModal(`
        <h3>Tambah Periode Kas Baru</h3>
        <div class="form-group"><label class="form-label">Nama Periode</label><input type="text" id="pName" class="form-input" placeholder="e.g. Minggu 1 Sep ${new Date().getFullYear()}"></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai</label><input type="date" id="pStart" class="form-input"></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai</label><input type="date" id="pEnd" class="form-input"></div>
        <div class="form-group"><label class="form-label">Jatuh Tempo</label><input type="date" id="pDue" class="form-input"></div>
        <div class="form-group"><label class="form-label">Nominal (Rp)</label><input type="number" id="pAmount" class="form-input" value="${defaultAmt}"></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" onclick="submitNewPeriod('${freq}')">Simpan</button></div>
    `);
}

async function submitNewPeriod(frequency) {
    const name = document.getElementById('pName').value.trim();
    const startDate = document.getElementById('pStart').value;
    const endDate = document.getElementById('pEnd').value;
    const dueDate = document.getElementById('pDue').value;
    const amount = parseFloat(document.getElementById('pAmount').value) || 0;

    if (!name || !startDate || !endDate || !dueDate || amount <= 0) {
        showToast('Semua field wajib diisi dengan benar', 'warning');
        return;
    }

    try {
        const data = await apiFetch('periods.php', 'POST', {
            name, frequency, start_date: startDate, end_date: endDate, due_date: dueDate, amount, status: 'upcoming'
        });
        if (data.success) {
            showToast('Periode berhasil ditambahkan', 'success');
            closeModal();
            await loadDataFromServer();
            renderPage();
        } else {
            showToast(data.error || 'Gagal menambah periode', 'error');
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

async function deletePeriod(periodId) {
    if (!confirm('Yakin ingin menghapus periode ini?')) return;
    try {
        const data = await apiFetch('periods.php', 'DELETE', { id: periodId });
        if (data.success) {
            showToast('Periode berhasil dihapus', 'success');
            closeBottomSheet();
            await loadDataFromServer();
            renderPage();
        } else {
            showToast(data.error || 'Gagal menghapus periode', 'error');
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

// ==================== STATISTIK ====================
async function renderStatistikPage() {
    const user = getCurrentUser();

    if (state.role === 'bendahara') {
        let stats = null;
        try {
            const res = await apiFetch('bendahara_stats.php');
            if (res && !res.error) stats = res;
        } catch (e) {
            console.warn('Gagal memuat statistik bendahara', e);
        }

        if (!stats) {
            return `${renderHeader('Statistik Kelas (Bendahara)', true)}<div class="container"><div class="empty-state">Gagal memuat data statistik kelas.</div></div>`;
        }

        return `
        ${renderHeader('Panel Kelola Bendahara', true)}
        <div class="container" data-testid="bendahara-dashboard">
            <div class="card admin-mode-card text-center mb-16">
                <div class="flex justify-between items-center mb-12">
                    <span class="badge-admin">${ic('i-shield')} Mode Bendahara Admin</span>
                    <span style="font-size:12px;opacity:0.8;">${escapeHtml(user.kelas || 'Kelas')}</span>
                </div>
                <p style="font-size:13px;opacity:0.9;">Saldo Kas Kelas (Live Backend)</p>
                <p style="font-size:36px;font-weight:800;margin:6px 0;">${formatRupiah(stats.saldo)}</p>
            </div>
            <div class="stat-grid mb-16">
                <div class="stat-card"><div class="stat-value" style="color:var(--success);">${formatRupiah(stats.total_income)}</div><div class="stat-label">Pemasukan Approved</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${formatRupiah(stats.total_expense)}</div><div class="stat-label">Pengeluaran</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--warning);">${stats.pending_payments}</div><div class="stat-label">Pembayaran Menunggu</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--success);">${stats.approved_payments}</div><div class="stat-label">Pembayaran Berhasil</div></div>
                <div class="stat-card"><div class="stat-value" style="color:var(--danger);">${stats.rejected_payments}</div><div class="stat-label">Pembayaran Ditolak</div></div>
                <div class="stat-card"><div class="stat-value">${stats.member_count}</div><div class="stat-label">Anggota Kelas</div></div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Tunggakan Kelas</span></div>
                <p>Total Tunggakan: <strong style="color:var(--danger);">${formatRupiah(stats.total_arrears)}</strong></p>
                <p>Siswa Menunggak: <strong>${stats.arrears_student_count} siswa</strong></p>
            </div>
            <div class="flex gap-8 mt-16">
                <button class="btn btn-outline flex-1" onclick="navigateTo('kas-settings')">${getIcon('settings')} Pengaturan Kas</button>
                <button class="btn btn-outline flex-1" onclick="navigateTo('laporan-masuk')">Laporan Masuk</button>
            </div>
        </div>`;
    }

    const myTx = getUserTransactions(user.id);
    const totalPaid = myTx.filter(t => t.status === 'berhasil').reduce((sum, t) => sum + t.amount, 0);
    const onTime = myTx.filter(t => t.status === 'berhasil').length;
    const rate = calculateProgress(user.id).rate;
    const targetTotal = state.periods.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return `${renderHeader('Statistik Pribadi', true)}<div class="container"><div class="stat-grid mb-16"><div class="stat-card"><div class="stat-value">${formatRupiah(totalPaid)}</div><div class="stat-label">Total</div></div><div class="stat-card"><div class="stat-value" style="color:var(--success);">${onTime}</div><div class="stat-label">Transaksi Berhasil</div></div><div class="stat-card"><div class="stat-value" style="color:var(--warning);">${myTx.filter(t=>t.status!=='berhasil').length}</div><div class="stat-label">Belum/Terlambat</div></div><div class="stat-card"><div class="stat-value">${rate}%</div><div class="stat-label">Rate</div></div></div><div class="card"><div class="card-header"><span class="card-title">Target</span></div><p>Target: <strong>${formatRupiah(targetTotal)}</strong></p><div class="progress-bar mt-8"><div class="progress-fill success" style="width:${rate}%;"></div></div></div></div>`;
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
                    <h2>${escapeHtml(user.name || user.username)}</h2>
                    <p style="font-size:13px;color:var(--text-secondary);">${escapeHtml(user.kelas || 'Kelas')} • ${user.absenNumber ? 'Absen '+escapeHtml(user.absenNumber) : escapeHtml(user.role || 'Siswa')}</p>
                    <span class="badge">Akun Aktif</span>
                </div>
            </div>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Informasi Siswa</span></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
                <div><span style="color:var(--text-muted);">NIS</span><p>${escapeHtml(user.nis || '-')}</p></div>
                <div><span style="color:var(--text-muted);">Username</span><p>${escapeHtml(user.username || '-')}</p></div>
                <div><span style="color:var(--text-muted);">Email</span><p>${escapeHtml(user.email || '-')}</p></div>
                <div><span style="color:var(--text-muted);">No. HP</span><p>${escapeHtml(user.phone || '-')}</p></div>
            </div>
        </div>
        <div class="card">
            <div class="menu-item" onclick="navigateTo('edit-profil')">
                <span class="menu-icon">${ic('i-edit')}</span>
                <div class="flex-1"><div class="menu-label">Edit Profil</div><div class="menu-desc">Ubah foto, email, atau nomor HP</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('pengaturan')">
                <span class="menu-icon">${ic('i-gear')}</span>
                <div class="flex-1"><div class="menu-label">Pengaturan</div><div class="menu-desc">Notifikasi, tema, bahasa</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('faq')">
                <span class="menu-icon">${ic('i-help')}</span>
                <div class="flex-1"><div class="menu-label">FAQ</div><div class="menu-desc">Pertanyaan yang sering diajukan</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('bantuan')">
                <span class="menu-icon">${ic('i-bell')}</span>
                <div class="flex-1"><div class="menu-label">Bantuan</div><div class="menu-desc">Hubungi bendahara atau wali kelas</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('report-problem')">
                <span class="menu-icon">${ic('i-doc')}</span>
                <div class="flex-1"><div class="menu-label">Laporkan Masalah</div><div class="menu-desc">Sampaikan kendala yang kamu alami</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="navigateTo('my-reports')">
                <span class="menu-icon">${ic('i-list')}</span>
                <div class="flex-1"><div class="menu-label">Laporan Saya</div><div class="menu-desc">Lihat status laporan kamu</div></div>
                <span class="menu-arrow">→</span>
            </div>
            <div class="menu-item" onclick="handleLogout()">
                <span class="menu-icon" style="color:var(--danger);">${ic('i-logout')}</span>
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
            csrfToken = null; // token milik sesi lama -> wajib ambil ulang untuk login berikutnya
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
    return `${renderHeader('Edit Profil', true)}<div class="container"><div class="text-center mb-16">${getAvatarHtml(user,'avatar-lg')}<button class="btn btn-outline btn-sm mt-8" onclick="document.getElementById('profilePhotoInput').click()">Ganti Foto</button><input type="file" id="profilePhotoInput" accept="image/*" style="display:none;" onchange="handleProfilePhotoUpload(event)"></div><div class="card"><div class="form-group"><label class="form-label">NIS (tidak bisa diedit)</label><input class="form-input" value="${escapeHtml(user.nis || '')}" disabled></div><div class="form-group"><label class="form-label">Kelas</label><input class="form-input" value="${escapeHtml(user.kelas || '')}" disabled></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="editEmail" value="${escapeHtml(user.email || '')}"></div><div class="form-group"><label class="form-label">No. HP</label><input class="form-input" id="editPhone" value="${escapeHtml(user.phone || '')}"></div><div class="form-group"><label class="form-label">Password Saat Ini (wajib jika ubah password)</label><input type="password" class="form-input" id="editCurrentPass" placeholder="Masukkan password saat ini"></div><div class="form-group"><label class="form-label">Password Baru</label><input type="password" class="form-input" id="editNewPass" placeholder="Kosongkan jika tidak diubah"></div><div class="form-group"><label class="form-label">Konfirmasi Password Baru</label><input type="password" class="form-input" id="editConfirmPass" placeholder="Ulangi password baru"></div><button class="btn btn-primary btn-block" onclick="saveEditProfile()">Simpan</button></div></div>`;
}

async function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 2MB', 'error');
        return;
    }
    const formData = new FormData();
    formData.append('photo', file);
    try {
        const data = await apiFetch('upload_profile_photo.php', 'POST', formData, true);
        if (data.success) {
            showToast('Foto profil berhasil diperbarui', 'success');
            if (state.currentUserData) state.currentUserData.profile_photo = data.profile_photo;
            renderPage();
        } else {
            showToast(data.error || 'Gagal mengupload foto profil', 'error');
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
    }
}

async function saveEditProfile() {
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const currentPass = document.getElementById('editCurrentPass')?.value || '';
    const newPass = document.getElementById('editNewPass')?.value || '';
    const confirmPass = document.getElementById('editConfirmPass')?.value || '';

    // Validasi dasar frontend
    if (email && !email.includes('@')) {
        showToast('Email tidak valid', 'error');
        return;
    }
    if (phone && (phone.length < 10 || !/^[0-9]+$/.test(phone))) {
        showToast('Nomor HP minimal 10 digit angka', 'error');
        return;
    }

    if (newPass || confirmPass) {
        if (!currentPass) {
            showToast('Masukkan password saat ini untuk mengubah password', 'warning');
            return;
        }
        if (newPass !== confirmPass) {
            showToast('Konfirmasi password tidak cocok', 'error');
            return;
        }
        if (newPass.length < 6) {
            showToast('Password baru minimal 6 karakter', 'error');
            return;
        }
    }

    try {
        const profileData = await apiFetch('update_profile.php', 'POST', { email, phone });
        if (!profileData.success) {
            showToast(profileData.error || 'Gagal memperbarui profil', 'error');
            return;
        }

        if (newPass) {
            const passData = await apiFetch('change_password.php', 'POST', {
                current_password: currentPass,
                new_password: newPass
            });
            if (!passData.success) {
                showToast(passData.error || 'Gagal mengubah password', 'error');
                return;
            }
        }

        const user = getCurrentUser();
        user.email = email;
        user.phone = phone;
        showToast('Profil dan password berhasil diperbarui', 'success');
        navigateTo('profil');
    } catch (err) {
        showToast('Gagal terhubung ke server. Perubahan tidak disimpan.', 'error');
    }
}

function renderPengaturanPage() {
    const isDark = state.theme === 'dark';
    return `${renderHeader('Pengaturan', true)}<div class="container"><div class="card mb-16"><div class="card-header"><span class="card-title">Tampilan</span></div><button class="list-item" onclick="setTheme('light')"><span>${ic('i-sun')}</span> Light Mode ${!isDark?'✓':''}</button><button class="list-item" onclick="setTheme('dark')"><span>${ic('i-moon')}</span> Dark Mode ${isDark?'✓':''}</button><button class="list-item" onclick="setTheme('system')"><span>${ic('i-monitor')}</span> System</button></div><div class="card mb-16"><div class="card-header"><span class="card-title">Notifikasi</span></div><div class="list-item"><span>${ic('i-bell')}</span> Pengingat Pembayaran <div class="toggle-switch ${state.reminderSettings.paymentReminder?'active':''}" onclick="state.reminderSettings.paymentReminder=!state.reminderSettings.paymentReminder;saveSettings()"><div class="toggle-dot"></div></div></div><div class="list-item"><span>${ic('i-mega')}</span> Pengumuman <div class="toggle-switch ${state.reminderSettings.announcementNotif?'active':''}" onclick="state.reminderSettings.announcementNotif=!state.reminderSettings.announcementNotif;saveSettings()"><div class="toggle-dot"></div></div></div><div class="list-item"><span>${ic('i-cash')}</span> Suara <div class="toggle-switch ${state.reminderSettings.soundNotif?'active':''}" onclick="state.reminderSettings.soundNotif=!state.reminderSettings.soundNotif;saveSettings()"><div class="toggle-dot"></div></div></div></div><button class="btn btn-danger btn-block" onclick="handleLogout()">${ic('i-logout')} Keluar</button></div>`;
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
    const freqLabel = state.cashSettings.frequency === 'weekly' ? 'minggu' : 'bulan';
    const amountLabel = formatRupiah(state.cashSettings.defaultAmount || 0);
    const faqs = [
        { q: 'Bagaimana cara membayar kas?', a: 'Buka menu Pembayaran, pilih periode, pilih metode, lalu konfirmasi.' },
        { q: 'Bagaimana cara upload bukti?', a: 'Setelah pembayaran, Anda akan diarahkan ke halaman upload bukti.' },
        { q: 'Berapa nominal kas?', a: `${amountLabel} per ${freqLabel}` },
        { q: 'Kapan deadline?', a: state.cashSettings.paymentDeadlineDays > 0 ? `${state.cashSettings.paymentDeadlineDays} hari setelah periode dimulai.` : (state.cashSettings.frequency === 'weekly' ? 'Setiap akhir minggu (Minggu).' : 'Tanggal 20 setiap bulan.') },
        { q: 'Kenapa belum diverifikasi?', a: 'Verifikasi membutuhkan 1-3 hari kerja.' },
        { q: 'Jika ditolak?', a: 'Upload ulang bukti yang jelas.' },
    ];
    return `${renderHeader('FAQ', true)}<div class="container"><div class="card">${faqs.map((f, i) => `<div class="accordion"><div class="accordion-header" onclick="this.nextElementSibling.classList.toggle('open')"><span>${f.q}</span><span>▼</span></div><div class="accordion-content">${f.a}</div></div>`).join('')}</div></div>`;
}

function renderBantuanPage() {
    return `${renderHeader('Bantuan', true)}<div class="container"><div class="card mb-16"><div class="card-header"><span class="card-title">Kontak Bendahara</span></div><p>0812-3456-7890</p><a class="btn btn-outline btn-sm mt-8" href="tel:081234567890">Hubungi</a></div><div class="card mb-16"><div class="card-header"><span class="card-title">Wali Kelas</span></div><p>0812-9876-5432</p><a class="btn btn-outline btn-sm mt-8" href="tel:081298765432">Hubungi</a></div><div class="card"><button class="list-item" onclick="navigateTo('faq')"><span>${ic('i-help')}</span> FAQ</button><button class="list-item" onclick="navigateTo('report-problem')">${ic('i-doc')} Laporkan Masalah</button></div></div>`;
}

function renderReportProblemPage() {
    return `${renderHeader('Laporkan Masalah', true)}<div class="container"><div class="card"><div class="form-group"><label class="form-label">Kategori</label><select class="form-input" id="reportCategory"><option>pembayaran</option><option>akun</option><option>bukti_pembayaran</option><option>data_kas</option><option>aplikasi</option><option>lainnya</option></select></div><div class="form-group"><label class="form-label">Judul</label><input class="form-input" id="reportTitle"></div><div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-input" id="reportDesc"></textarea></div><div class="form-group"><label class="form-label">ID Transaksi (opsional)</label><input class="form-input" id="reportTxId" placeholder="TRX-..."></div><div class="form-group"><label class="form-label">Lampiran Bukti (opsional, Maks 5MB)</label><input type="file" id="reportAttachment" class="form-input" accept=".jpg,.jpeg,.png,.pdf"></div><button class="btn btn-primary btn-block" onclick="submitReport()">Kirim</button></div></div>`;
}

async function submitReport() {
    const title = document.getElementById('reportTitle').value.trim();
    const desc = document.getElementById('reportDesc').value.trim();
    const category = document.getElementById('reportCategory').value;
    const txId = document.getElementById('reportTxId')?.value.trim() || '';
    const fileInput = document.getElementById('reportAttachment');
    const attachment = fileInput?.files[0] || null;

    if (!title || !desc) { showToast('Isi judul dan deskripsi', 'warning'); return; }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', desc);
    if (txId) formData.append('transaction_id', txId);
    if (attachment) formData.append('attachment', attachment);

    try {
        const data = await apiFetch('reports.php', 'POST', formData, true);
        if (data.success) {
            showToast('Laporan berhasil dikirim', 'success');
            await loadDataFromServer();
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
    return `${renderHeader('Laporan Saya', true)}<div class="container">${userReports.map(r=>`<div class="card mb-8"><p class="item-title">${escapeHtml(r.title)}</p><p class="item-subtitle">${escapeHtml(r.category)} • ${formatShortDate(r.createdAt)}</p><span class="badge badge-info">${escapeHtml(r.status)}</span>${r.response?`<div style="margin-top:8px;padding:8px;background:var(--input-bg);border-radius:6px;font-size:12px;"><strong>Respons:</strong> ${escapeHtml(r.response)}</div>`:''}${r.attachment?`<button class="btn btn-outline btn-sm mt-8" onclick="window.open('api/report_attachment.php?id=${r.id}','_blank','noopener')">${ic('i-doc')} Lihat Lampiran</button>`:''}</div>`).join('') || '<div class="empty-state">Belum ada laporan.</div>'}</div>`;
}

function renderSearchPage() {
    const q = state.searchQuery;
    const results = [];
    if (q) {
        state.students.forEach(s => { if (s.name.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Anggota', title: s.name, sub: `Absen ${s.absenNumber}`, page: 'detail-anggota', id: s.id }); });
        (state.role === 'bendahara' ? state.transactions : getUserTransactions(getCurrentUser().id)).forEach(t => { if (t.id.toString().includes(q) || (t.periodLabel||'').toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Transaksi', title: t.periodLabel || 'Periode', sub: t.id, page: 'detail-transaksi', id: t.id }); });
        state.announcements.forEach(a => { if (a.title.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Pengumuman', title: a.title, sub: a.category, page: 'detail-pengumuman', id: a.id }); });
        state.expenses.forEach(e => { if (e.name.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Pengeluaran', title: e.name, sub: e.category, page: 'detail-pengeluaran', id: e.id }); });
    }
    return `${renderHeader('Pencarian', true)}<div class="container"><div class="search-input mb-16"><span style="display:flex">${ic('i-search')}</span><input type="text" id="searchInputGlobal" placeholder="Cari..." value="${state.searchQuery}" oninput="activeInputId='searchInputGlobal'; state.searchQuery=this.value; renderPage()"></div>${q===''?'<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Cari di KasKelas</div></div>':results.length===0?'<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Tidak ada hasil</div></div>':results.map(r=>`<div class="card mb-8" onclick="navigateTo('${r.page}',{id:'${r.id}'})"><div class="flex items-center gap-10"><span>${r.type==='Anggota'?'👤':r.type==='Transaksi'?'💳':r.type==='Pengumuman'?'📢':'💸'}</span><div class="flex-1"><p class="item-title">${escapeHtml(r.title)}</p><p class="item-subtitle">${r.type} • ${escapeHtml(String(r.sub))}</p></div><span>→</span></div></div>`).join('')}</div>`;
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
                    ${ic('i-card')}
                    <div class="flex-1">
                        <p class="item-title">${escapeHtml(tx.studentName)} - ${escapeHtml(tx.periodLabel || tx.period_label || 'Periode')}</p>
                        <p class="item-subtitle">${tx.id} • ${formatRupiah(tx.amount)} • ${tx.method.toUpperCase()}</p>
                    </div>
                    <div class="flex gap-8">
                        ${tx.proof?`<button class="btn btn-sm btn-outline" onclick="previewBukti(${tx.id})">${ic('i-eye')} Bukti</button>`:''}
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

// ==================== B11: MANAGEMENT BENDAHARA ====================
const EXPENSE_CATEGORIES = ['kebersihan','perlengkapan','kegiatan','dekorasi','sosial','lainnya'];
const ANNOUNCEMENT_CATEGORIES = ['kas','kegiatan','informasi_kelas','penting'];
const PERIOD_STATUSES = ['upcoming','active','closed'];
const STUDENT_STATUSES = ['active','inactive','suspended'];

function requireBendaharaUI() {
    if (state.role !== 'bendahara') { showToast('Akses khusus bendahara', 'error'); return false; }
    return true;
}

// ---------- B11-01 EXPENSE ----------
function showAddExpenseModal() {
    if (!requireBendaharaUI()) return;
    showModal(`
        <h3>Tambah Pengeluaran</h3>
        <div class="form-group"><label class="form-label">Nama *</label><input type="text" id="exName" class="form-input" placeholder="cth. Beli sapu"></div>
        <div class="form-group"><label class="form-label">Kategori *</label><select id="exCat" class="form-input">${EXPENSE_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Nominal (Rp) *</label><input type="number" id="exAmount" class="form-input" min="1" placeholder="0"></div>
        <div class="form-group"><label class="form-label">Tanggal *</label><input type="date" id="exDate" class="form-input" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label class="form-label">Deskripsi</label><textarea id="exDesc" class="form-input" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Nota / Bukti (opsional, JPG/PNG/PDF maks 5MB)</label><input type="file" id="exReceipt" class="form-input" accept=".jpg,.jpeg,.png,.pdf"></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="exSaveBtn" onclick="submitAddExpense()">Simpan</button></div>
    `);
}

async function submitAddExpense() {
    const name = document.getElementById('exName').value.trim();
    const category = document.getElementById('exCat').value;
    const amount = parseFloat(document.getElementById('exAmount').value);
    const expense_date = document.getElementById('exDate').value;
    const description = document.getElementById('exDesc').value.trim();
    const receipt = document.getElementById('exReceipt').files[0] || null;
    const btn = document.getElementById('exSaveBtn');

    if (!name) { showToast('Nama pengeluaran wajib diisi', 'warning'); return; }
    if (!category || !EXPENSE_CATEGORIES.includes(category)) { showToast('Kategori tidak valid', 'warning'); return; }
    if (!(amount > 0)) { showToast('Nominal harus lebih dari 0', 'warning'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) { showToast('Tanggal tidak valid', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const fd = new FormData();
        fd.append('name', name); fd.append('category', category);
        fd.append('amount', amount); fd.append('expense_date', expense_date);
        fd.append('description', description);
        if (receipt) fd.append('receipt', receipt);
        const res = await apiFetch('expenses.php', 'POST', fd, true);
        if (res.success) {
            closeModal(); showToast('Pengeluaran ditambahkan', 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal menambah pengeluaran', 'error');
            btn.disabled = false; btn.textContent = 'Simpan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan';
    }
}

function showEditExpenseModal(id) {
    if (!requireBendaharaUI()) return;
    const e = state.expenses.find(x => x.id == id);
    if (!e) { showToast('Pengeluaran tidak ditemukan', 'error'); return; }
    showModal(`
        <h3>Edit Pengeluaran</h3>
        <div class="form-group"><label class="form-label">Nama *</label><input type="text" id="exName" class="form-input" value="${escapeHtml(e.name)}"></div>
        <div class="form-group"><label class="form-label">Kategori *</label><select id="exCat" class="form-input">${EXPENSE_CATEGORIES.map(c=>`<option value="${c}" ${c===e.category?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Nominal (Rp) *</label><input type="number" id="exAmount" class="form-input" min="1" value="${parseFloat(e.amount) || 0}"></div>
        <div class="form-group"><label class="form-label">Tanggal *</label><input type="date" id="exDate" class="form-input" value="${escapeHtml(e.date)}"></div>
        <div class="form-group"><label class="form-label">Deskripsi</label><textarea id="exDesc" class="form-input" rows="2">${escapeHtml(e.desc || '')}</textarea></div>
        <p style="font-size:11px;color:var(--text-muted);">Nota tidak diubah melalui form edit.</p>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="exEditBtn" onclick="submitEditExpense(${e.id})">Simpan</button></div>
    `);
}

async function submitEditExpense(id) {
    const name = document.getElementById('exName').value.trim();
    const category = document.getElementById('exCat').value;
    const amount = parseFloat(document.getElementById('exAmount').value);
    const expense_date = document.getElementById('exDate').value;
    const description = document.getElementById('exDesc').value.trim();
    const btn = document.getElementById('exEditBtn');

    if (!name) { showToast('Nama wajib diisi', 'warning'); return; }
    if (!(amount > 0)) { showToast('Nominal harus lebih dari 0', 'warning'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) { showToast('Tanggal tidak valid', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('expenses.php', 'PUT', { id, name, category, amount, expense_date, description });
        if (res.success) {
            closeModal(); showToast('Pengeluaran diperbarui', 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal memperbarui', 'error');
            btn.disabled = false; btn.textContent = 'Simpan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan';
    }
}

function confirmDeleteExpense(id) {
    if (!requireBendaharaUI()) return;
    const e = state.expenses.find(x => x.id == id);
    if (!e) return;
    showModal(`
        <h3>Hapus Pengeluaran?</h3>
        <p>"${escapeHtml(e.name)}" (${formatRupiah(e.amount)}) akan dihapus permanen.</p>
        <div class="flex gap-8 mt-16">
            <button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-danger flex-1" onclick="doDeleteExpense(${e.id})">Hapus</button>
        </div>
    `);
}

async function doDeleteExpense(id) {
    try {
        const res = await apiFetch('expenses.php', 'DELETE', { id });
        if (res.success) {
            closeModal(); showToast('Pengeluaran dihapus', 'success');
            await loadDataFromServer(); goBack();
        } else {
            showToast(res.error || 'Gagal menghapus', 'error');
            closeModal();
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        closeModal();
    }
}

// ---------- B11-02 ANNOUNCEMENT ----------
function showAddAnnouncementModal() {
    if (!requireBendaharaUI()) return;
    showModal(`
        <h3>Buat Pengumuman</h3>
        <div class="form-group"><label class="form-label">Judul *</label><input type="text" id="annTitle" class="form-input"></div>
        <div class="form-group"><label class="form-label">Isi *</label><textarea id="annContent" class="form-input" rows="4"></textarea></div>
        <div class="form-group"><label class="form-label">Kategori</label><select id="annCat" class="form-input">${ANNOUNCEMENT_CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Prioritas</label><select id="annPri" class="form-input"><option value="normal">normal</option><option value="important">important</option></select></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="annSaveBtn" onclick="submitAddAnnouncement()">Terbitkan</button></div>
    `);
}

async function submitAnnouncementPayload(method, payload, btnId, okMsg) {
    const btn = document.getElementById(btnId);
    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('announcements.php', method, payload);
        if (res.success) {
            closeModal(); showToast(okMsg, 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal menyimpan pengumuman', 'error');
            btn.disabled = false; btn.textContent = 'Terbitkan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Terbitkan';
    }
}

function submitAddAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const category = document.getElementById('annCat').value;
    const priority = document.getElementById('annPri').value;
    if (!title || !content) { showToast('Judul dan isi wajib diisi', 'warning'); return; }
    submitAnnouncementPayload('POST', { title, content, category, priority }, 'annSaveBtn', 'Pengumuman diterbitkan');
}

function showEditAnnouncementModal(id) {
    if (!requireBendaharaUI()) return;
    const a = state.announcements.find(x => x.id == id);
    if (!a) { showToast('Pengumuman tidak ditemukan', 'error'); return; }
    const catOk = ANNOUNCEMENT_CATEGORIES.includes(a.category) ? a.category : 'informasi_kelas';
    showModal(`
        <h3>Edit Pengumuman</h3>
        <div class="form-group"><label class="form-label">Judul *</label><input type="text" id="annTitle" class="form-input" value="${escapeHtml(a.title)}"></div>
        <div class="form-group"><label class="form-label">Isi *</label><textarea id="annContent" class="form-input" rows="4">${escapeHtml(a.content)}</textarea></div>
        <div class="form-group"><label class="form-label">Kategori</label><select id="annCat" class="form-input">${ANNOUNCEMENT_CATEGORIES.map(c=>`<option value="${c}" ${c===catOk?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Prioritas</label><select id="annPri" class="form-input"><option value="normal" ${!a.isImportant?'selected':''}>normal</option><option value="important" ${a.isImportant?'selected':''}>important</option></select></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="annEditBtn" onclick="submitEditAnnouncement(${a.id})">Simpan</button></div>
    `);
}

function submitEditAnnouncement(id) {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const category = document.getElementById('annCat').value;
    const priority = document.getElementById('annPri').value;
    if (!title || !content) { showToast('Judul dan isi wajib diisi', 'warning'); return; }
    submitAnnouncementPayload('PUT', { id, title, content, category, priority }, 'annEditBtn', 'Pengumuman diperbarui');
}

function confirmDeleteAnnouncement(id) {
    if (!requireBendaharaUI()) return;
    const a = state.announcements.find(x => x.id == id);
    if (!a) return;
    showModal(`
        <h3>Hapus Pengumuman?</h3>
        <p>"${escapeHtml(a.title)}" akan dihapus permanen.</p>
        <div class="flex gap-8 mt-16">
            <button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-danger flex-1" onclick="doDeleteAnnouncement(${a.id})">Hapus</button>
        </div>
    `);
}

async function doDeleteAnnouncement(id) {
    try {
        const res = await apiFetch('announcements.php', 'DELETE', { id });
        if (res.success) {
            closeModal(); showToast('Pengumuman dihapus', 'success');
            await loadDataFromServer(); goBack();
        } else {
            showToast(res.error || 'Gagal menghapus', 'error');
            closeModal();
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        closeModal();
    }
}

// ---------- B11-03 PERIOD EDIT ----------
function showEditPeriodModal(periodId) {
    if (!requireBendaharaUI()) return;
    const p = getPeriodById(periodId);
    if (!p) { showToast('Periode tidak ditemukan', 'error'); return; }
    showModal(`
        <h3>Edit Periode Kas</h3>
        <div class="form-group"><label class="form-label">Nama Periode *</label><input type="text" id="pdName" class="form-input" value="${escapeHtml(p.label)}"></div>
        <div class="form-group"><label class="form-label">Tanggal Mulai *</label><input type="date" id="pdStart" class="form-input" value="${escapeHtml(p.startDate)}"></div>
        <div class="form-group"><label class="form-label">Tanggal Selesai *</label><input type="date" id="pdEnd" class="form-input" value="${escapeHtml(p.endDate)}"></div>
        <div class="form-group"><label class="form-label">Jatuh Tempo *</label><input type="date" id="pdDue" class="form-input" value="${escapeHtml(p.dueDate)}"></div>
        <div class="form-group"><label class="form-label">Nominal (Rp) *</label><input type="number" id="pdAmount" class="form-input" min="1" value="${parseFloat(p.amount) || 0}"></div>
        <div class="form-group"><label class="form-label">Status</label><select id="pdStatus" class="form-input">${PERIOD_STATUSES.map(s=>`<option value="${s}" ${s===p.status?'selected':''}>${s}</option>`).join('')}</select></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="pdEditBtn" onclick="submitEditPeriod(${p.id})">Simpan</button></div>
    `);
}

async function submitEditPeriod(id) {
    const name = document.getElementById('pdName').value.trim();
    const start_date = document.getElementById('pdStart').value;
    const end_date = document.getElementById('pdEnd').value;
    const due_date = document.getElementById('pdDue').value;
    const amount = parseFloat(document.getElementById('pdAmount').value);
    const status = document.getElementById('pdStatus').value;
    const btn = document.getElementById('pdEditBtn');

    if (!name) { showToast('Nama periode wajib diisi', 'warning'); return; }
    if (!(amount > 0)) { showToast('Nominal harus lebih dari 0', 'warning'); return; }
    if (![start_date, end_date, due_date].every(d => /^\d{4}-\d{2}-\d{2}$/.test(d))) { showToast('Tanggal tidak valid', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('periods.php', 'PUT', { id, name, start_date, end_date, due_date, amount, status });
        if (res.success) {
            closeModal(); closeBottomSheet(); showToast('Periode diperbarui', 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal memperbarui periode', 'error');
            btn.disabled = false; btn.textContent = 'Simpan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan';
    }
}

// ---------- B11-04 CASH SETTINGS ----------
async function renderKasSettingsPage() {
    if (state.role !== 'bendahara') {
        return `<div class="container"><div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Akses khusus bendahara</div></div></div>`;
    }
    let cs = null;
    try {
        const res = await apiFetch('cash_settings.php');
        cs = res && !res.error ? res.cash_settings : null;
    } catch (e) { /* ditangani di bawah */ }
    if (cs === null) {
        return `${renderHeader('Pengaturan Kas', true)}<div class="container"><div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Gagal memuat pengaturan kas</div><button class="btn btn-outline mt-16" onclick="renderPage()">Coba Lagi</button></div></div>`;
    }
    const freq = cs.frequency || 'monthly';
    return `
    ${renderHeader('Pengaturan Kas', true)}
    <div class="container">
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Frekuensi & Nominal Default</span></div>
            <div class="form-group"><label class="form-label">Frekuensi</label><select id="csFreq" class="form-input"><option value="weekly" ${freq==='weekly'?'selected':''}>Mingguan</option><option value="monthly" ${freq==='monthly'?'selected':''}>Bulanan</option></select></div>
            <div class="form-group"><label class="form-label">Nominal Default (Rp)</label><input type="number" id="csAmount" class="form-input" min="0" value="${parseFloat(cs.default_amount) || 0}"></div>
            <div class="form-group"><label class="form-label">Batas Hari Pembayaran</label><input type="number" id="csDeadline" class="form-input" min="0" value="${parseInt(cs.payment_deadline_days) || 0}"></div>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Rekening Transfer</span></div>
            <div class="form-group"><label class="form-label">Nama Bank</label><input type="text" id="csBank" class="form-input" value="${escapeHtml(cs.bank_name || '')}"></div>
            <div class="form-group"><label class="form-label">Nomor Rekening</label><input type="text" id="csAccount" class="form-input" value="${escapeHtml(cs.account_number || '')}"></div>
            <div class="form-group"><label class="form-label">Atas Nama</label><input type="text" id="csHolder" class="form-input" value="${escapeHtml(cs.account_holder || '')}"></div>
        </div>
        <button class="btn btn-primary btn-block" id="csSaveBtn" onclick="saveKasSettings()">Simpan Pengaturan</button>
    </div>`;
}

async function saveKasSettings() {
    const frequency = document.getElementById('csFreq').value;
    const default_amount = parseFloat(document.getElementById('csAmount').value);
    const payment_deadline_days = parseInt(document.getElementById('csDeadline').value);
    const bank_name = document.getElementById('csBank').value.trim() || null;
    const account_number = document.getElementById('csAccount').value.trim() || null;
    const account_holder = document.getElementById('csHolder').value.trim() || null;
    const btn = document.getElementById('csSaveBtn');

    if (!(default_amount >= 0) || !(payment_deadline_days >= 0)) { showToast('Nilai numerik tidak valid', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('cash_settings.php', 'POST', { frequency, default_amount, payment_deadline_days, bank_name, account_number, account_holder });
        if (res.success) {
            showToast('Pengaturan kas disimpan', 'success');
            await loadDataFromServer();   // reload dari API agar tampil nilai tersimpan
            renderPage();
        } else {
            showToast(res.error || 'Gagal menyimpan pengaturan', 'error');
            btn.disabled = false; btn.textContent = 'Simpan Pengaturan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan Pengaturan';
    }
}

// ---------- B11-05 STUDENT MANAGEMENT ----------
function showAddStudentModal() {
    if (!requireBendaharaUI()) return;
    showModal(`
        <h3>Tambah Siswa</h3>
        <div class="form-group"><label class="form-label">Nama Lengkap *</label><input type="text" id="stName" class="form-input"></div>
        <div class="form-group"><label class="form-label">NIS *</label><input type="text" id="stNis" class="form-input"></div>
        <div class="form-group"><label class="form-label">Username Akun *</label><input type="text" id="stUsername" class="form-input"></div>
        <div class="form-group"><label class="form-label">No. Absen</label><input type="number" id="stAbsen" class="form-input" min="1"></div>
        <div class="form-group"><label class="form-label">Email</label><input type="email" id="stEmail" class="form-input"></div>
        <div class="form-group"><label class="form-label">No. HP</label><input type="text" id="stPhone" class="form-input"></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="stSaveBtn" onclick="submitAddStudent()">Tambah</button></div>
    `);
}

async function submitAddStudent() {
    const full_name = document.getElementById('stName').value.trim();
    const nis = document.getElementById('stNis').value.trim();
    const username = document.getElementById('stUsername').value.trim();
    const attendance_number = parseInt(document.getElementById('stAbsen').value) || null;
    const email = document.getElementById('stEmail').value.trim();
    const phone = document.getElementById('stPhone').value.trim();
    const btn = document.getElementById('stSaveBtn');

    if (!full_name || !nis || !username) { showToast('Nama, NIS, dan username wajib diisi', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menambahkan...';
    try {
        const res = await apiFetch('students.php', 'POST', { full_name, nis, username, attendance_number, email, phone });
        if (res.success) {
            closeModal(); showToast(`Siswa "${full_name}" ditambahkan`, 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal menambah siswa', 'error');
            btn.disabled = false; btn.textContent = 'Tambah';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Tambah';
    }
}

function showEditStudentModal(userId) {
    if (!requireBendaharaUI()) return;
    const s = state.students.find(x => x.id == userId);
    if (!s) { showToast('Siswa tidak ditemukan', 'error'); return; }
    const statusOk = STUDENT_STATUSES.includes(s.user_status) ? s.user_status : 'active';
    showModal(`
        <h3>Edit Siswa</h3>
        <div class="form-group"><label class="form-label">Nama Lengkap *</label><input type="text" id="stNameE" class="form-input" value="${escapeHtml(s.name || '')}"></div>
        <div class="form-group"><label class="form-label">No. Absen</label><input type="number" id="stAbsenE" class="form-input" min="1" value="${parseInt(s.absenNumber) || ''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input type="email" id="stEmailE" class="form-input" value="${escapeHtml(s.email || '')}"></div>
        <div class="form-group"><label class="form-label">No. HP</label><input type="text" id="stPhoneE" class="form-input" value="${escapeHtml(s.phone || '')}"></div>
        <div class="form-group"><label class="form-label">Status Akun</label><select id="stStatusE" class="form-input">${STUDENT_STATUSES.map(st=>`<option value="${st}" ${st===statusOk?'selected':''}>${st}</option>`).join('')}</select></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="stEditBtn" onclick="submitEditStudent(${s.id})">Simpan</button></div>
    `);
}

async function submitEditStudent(userId) {
    const full_name = document.getElementById('stNameE').value.trim();
    const attendance_number = parseInt(document.getElementById('stAbsenE').value) || null;
    const email = document.getElementById('stEmailE').value.trim();
    const phone = document.getElementById('stPhoneE').value.trim();
    const status = document.getElementById('stStatusE').value;
    const btn = document.getElementById('stEditBtn');

    if (!full_name) { showToast('Nama wajib diisi', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('students.php', 'PUT', { user_id: userId, full_name, attendance_number, email, phone, status });
        if (res.success) {
            closeModal(); showToast('Data siswa diperbarui', 'success');
            await loadDataFromServer(); renderPage();
        } else {
            showToast(res.error || 'Gagal memperbarui siswa', 'error');
            btn.disabled = false; btn.textContent = 'Simpan';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan';
    }
}

function confirmDeactivateStudent(userId) {
    if (!requireBendaharaUI()) return;
    const s = state.students.find(x => x.id == userId);
    if (!s) return;
    showModal(`
        <h3>Nonaktifkan Siswa?</h3>
        <p>Akun "${escapeHtml(s.name)}" dinonaktifkan. Riwayat pembayaran tetap tersimpan.</p>
        <div class="flex gap-8 mt-16">
            <button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-danger flex-1" onclick="doDeactivateStudent(${s.id})">Nonaktifkan</button>
        </div>
    `);
}

async function doDeactivateStudent(userId) {
    try {
        const res = await apiFetch('students.php', 'DELETE', { user_id: userId });
        if (res.success) {
            closeModal(); showToast('Siswa dinonaktifkan', 'success');
            await loadDataFromServer(); goBack();
        } else {
            showToast(res.error || 'Gagal menonaktifkan siswa', 'error');
            closeModal();
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        closeModal();
    }
}

// ---------- B11-06 REPORT MANAGEMENT ----------
async function renderLaporanMasukPage() {
    if (state.role !== 'bendahara') {
        return `<div class="container"><div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Akses khusus bendahara</div></div></div>`;
    }
    let reports = [];
    try {
        const res = await apiFetchAll('reports.php', 'reports');
        reports = res;
    } catch (e) {
        return `${renderHeader('Laporan Masuk', true)}<div class="container"><div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Gagal memuat laporan</div><button class="btn btn-outline mt-16" onclick="renderPage()">Coba Lagi</button></div></div>`;
    }
    const badgeMap = { dikirim:'badge-warning', diproses:'badge-info', selesai:'badge-success' };
    return `
    ${renderHeader('Laporan Masuk', true)}
    <div class="container">
        ${reports.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Belum ada laporan masuk</div></div>' :
        reports.map(r=>`
        <div class="card mb-8" onclick="navigateTo('detail-laporan',{id:${r.id}})">
            <div class="flex items-start gap-10">
                ${ic('i-doc')}
                <div class="flex-1">
                    <p class="item-title">${escapeHtml(r.title)}</p>
                    <p class="item-subtitle">${escapeHtml(r.reporter_name || '')} • ${formatShortDate(r.created_at)}</p>
                </div>
                <span class="badge ${badgeMap[r.status] || 'badge-neutral'}">${escapeHtml(r.status)}</span>
            </div>
        </div>`).join('')}
    </div>`;
}

async function renderDetailLaporanPage() {
    if (state.role !== 'bendahara') {
        return `<div class="container"><div class="empty-state"><div class="empty-icon">🔒</div><div class="empty-title">Akses khusus bendahara</div></div></div>`;
    }
    const repId = state.pageParams.id;
    let r = null;
    try {
        const all = await apiFetchAll('reports.php', 'reports');
        r = all.find(x => x.id == repId);
    } catch (e) { /* handled below */ }
    if (!r) return `${renderHeader('Detail Laporan', true)}<div class="container"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Laporan tidak ditemukan</div></div></div>`;
    const badgeMap = { dikirim:'badge-warning', diproses:'badge-info', selesai:'badge-success' };
    return `
    ${renderHeader('Detail Laporan', true)}
    <div class="container">
        <div class="card mb-16">
            <span class="badge ${badgeMap[r.status] || 'badge-neutral'}">${escapeHtml(r.status)}</span>
            <h2 style="font-size:18px;font-weight:800;margin:8px 0;">${escapeHtml(r.title)}</h2>
            <p style="font-size:12px;color:var(--text-secondary);">${escapeHtml(r.reporter_name || '')} • ${formatDate(r.created_at)}</p>
        </div>
        <div class="card mb-16">
            <div class="card-header"><span class="card-title">Deskripsi</span></div>
            <p style="font-size:14px;line-height:1.6;">${escapeHtml(r.description)}</p>
            ${r.transaction_id ? `<p style="font-size:12px;color:var(--text-muted);margin-top:8px;">Terkait transaksi #${escapeHtml(String(r.transaction_id))}</p>` : ''}
            ${r.attachment ? `<button class="btn btn-outline btn-sm mt-8" onclick="window.open('api/report_attachment.php?id=${r.id}','_blank','noopener')">${ic('i-doc')} Lihat Lampiran</button>` : ''}
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Respons Bendahara</span></div>
            <div class="form-group"><label class="form-label">Status</label><select id="rpStatus" class="form-input">${['dikirim','diproses','selesai'].map(s=>`<option value="${s}" ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Respons untuk siswa</label><textarea id="rpResponse" class="form-input" rows="3" placeholder="Tulis respons...">${escapeHtml(r.response || '')}</textarea></div>
            <button class="btn btn-primary btn-block" id="rpSaveBtn" onclick="submitLaporanResponse(${r.id})">Simpan Respons</button>
        </div>
    </div>`;
}

async function submitLaporanResponse(id) {
    const status = document.getElementById('rpStatus').value;
    const response = document.getElementById('rpResponse').value.trim();
    const btn = document.getElementById('rpSaveBtn');
    if (!['dikirim','diproses','selesai'].includes(status)) { showToast('Status tidak valid', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Menyimpan...';
    try {
        const res = await apiFetch('reports.php', 'PUT', { id, status, response });
        if (res.success) {
            showToast('Respons laporan tersimpan', 'success');
            await loadDataFromServer();
            renderPage(); // render ulang detail dengan data terbaru dari API
        } else {
            showToast(res.error || 'Gagal menyimpan respons', 'error');
            btn.disabled = false; btn.textContent = 'Simpan Respons';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Simpan Respons';
    }
}

// ---------- B11-07 NOTIFICATION BROADCAST ----------
function showBroadcastModal() {
    if (!requireBendaharaUI()) return;
    showModal(`
        <h3>Kirim Notifikasi ke Kelas</h3>
        <p style="font-size:12px;color:var(--text-secondary);">Notifikasi dikirim ke seluruh anggota kelas yang aktif.</p>
        <div class="form-group"><label class="form-label">Judul *</label><input type="text" id="bcTitle" class="form-input"></div>
        <div class="form-group"><label class="form-label">Pesan *</label><textarea id="bcMessage" class="form-input" rows="3"></textarea></div>
        <div class="flex gap-8 mt-16"><button class="btn btn-outline flex-1" onclick="closeModal()">Batal</button><button class="btn btn-primary flex-1" id="bcSendBtn" onclick="submitBroadcast()">Kirim</button></div>
    `);
}

async function submitBroadcast() {
    const title = document.getElementById('bcTitle').value.trim();
    const message = document.getElementById('bcMessage').value.trim();
    const btn = document.getElementById('bcSendBtn');
    if (!title || !message) { showToast('Judul dan pesan wajib diisi', 'warning'); return; }

    btn.disabled = true; btn.textContent = 'Mengirim...';
    try {
        const res = await apiFetch('notifications.php', 'POST', { action: 'broadcast', title, message });
        if (res.success) {
            closeModal(); showToast(`Notifikasi terkirim ke ${res.count} anggota`, 'success');
            await loadNotifications(); updateNotifBadge();
        } else {
            showToast(res.error || 'Gagal mengirim notifikasi', 'error');
            btn.disabled = false; btn.textContent = 'Kirim';
        }
    } catch (e) {
        showToast('Gagal terhubung ke server', 'error');
        btn.disabled = false; btn.textContent = 'Kirim';
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

    try {
        const userRes = await apiFetch('current_user.php');
        if (userRes?.user) {
            state.currentUserData = userRes.user;
            state.currentUserData.kelas = userRes.user.class_name || userRes.user.kelas || 'Kelas';
            state.currentUser = userRes.user.id;
            state.role = userRes.user.role;
            await loadDataFromServer();
            state.currentPage = 'home';
        } else {
            state.currentPage = 'login';
        }
    } catch (err) {
        state.currentPage = 'login';
    }

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
    history.replaceState({ page: state.currentPage, params: {} }, '', '');
}

initApp();

