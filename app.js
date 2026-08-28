require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

// ⚡ Persistent Supabase Engine
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
});

// ========================================================
// 🚀 ULTRA-FAST IN-MEMORY CACHE & AUTO-PREFETCH ENGINE
// ========================================================
const MEMORY_CACHE = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // ৩ মিনিট পর্যন্ত মেমোরিতে থাকবে

function getCache(key) {
    const cached = MEMORY_CACHE.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
    }
    return null;
}

function setCache(key, data) {
    MEMORY_CACHE.set(key, { data, timestamp: Date.now() });
}

function clearAppCache() {
    MEMORY_CACHE.clear();
}

// 25 Schools List (RAM - 0ms Lookup)
const SCHOOLS = [
    { id: 1, name: "Bochaganj Model Govt. Primary School", teachers: ["Md. Abdul Karim (Head Teacher)", "Nazma Akhter (Assistant)", "Rafiqul Islam (Assistant)", "Salma Begum (Assistant)", "Md. Kamal Uddin (Assistant)"] },
    { id: 2, name: "Setabganj Upashahar Govt. Primary School", teachers: ["Farhana Yeasmin (Head Teacher)", "Anwar Hossain (Assistant)", "Shamima Nasrin (Assistant)", "Rashedul Hasan (Assistant)", "Mst. Kulsum Banu (Assistant)"] },
    { id: 3, name: "Bochaganj Central Govt. Primary School", teachers: ["Md. Shahidul Islam (Head Teacher)", "Ruma Rani Das (Assistant)", "Md. Mizanur Rahman (Assistant)", "Sultana Razia (Assistant)", "Md. Asaduzzaman (Assistant)"] },
    { id: 4, name: "Muraripur Govt. Primary School", teachers: ["Animesh Roy (Head Teacher)", "Nasrin Sultana (Assistant)", "Belal Hossain (Assistant)", "Rina Begum (Assistant)", "Anisur Rahman (Assistant)"] },
    { id: 5, name: "Chawk Rampur Govt. Primary School", teachers: ["Mahbuba Khatun (Head Teacher)", "Md. Abu Taleb (Assistant)", "Mst. Jannatun Nayeem (Assistant)", "Golam Rabbani (Assistant)", "Tapasi Rani (Assistant)"] },
    { id: 6, name: "Bogula Govt. Primary School", teachers: ["Haradhan Chandra (Head Teacher)", "Rokeya Begum (Assistant)", "Abdul Mannan (Assistant)", "Geeta Rani (Assistant)", "Sohel Rana (Assistant)"] },
    { id: 7, name: "Chira Govt. Primary School", teachers: ["Mozammel Haque (Head Teacher)", "Shikha Rani (Assistant)", "Enamul Haque (Assistant)", "Kohinoor Begum (Assistant)", "Liton Kumar (Assistant)"] },
    { id: 8, name: "Gopalpur Govt. Primary School", teachers: ["Bipul Chandra Roy (Head Teacher)", "Khadiza Akhter (Assistant)", "Md. Zakir Hossain (Assistant)", "Arati Rani (Assistant)", "Monirul Islam (Assistant)"] },
    { id: 9, name: "Ishania Govt. Primary School", teachers: ["Nurul Huda (Head Teacher)", "Shampa Rani (Assistant)", "Al Amin (Assistant)", "Taslima Nasrin (Assistant)", "Pankaj Kumar (Assistant)"] },
    { id: 10, name: "Nandigram Govt. Primary School", teachers: ["Md. Jahangir Alam (Head Teacher)", "Momotaz Begum (Assistant)", "Biplob Kumar (Assistant)", "Mst. Shahnaz Parvin (Assistant)", "Sujon Ali (Assistant)"] },
    { id: 11, name: "Shibpur Govt. Primary School", teachers: ["Abdul Latif (Head Teacher)", "Sabina Yasmin (Assistant)", "Uttam Kumar (Assistant)", "Rubina Akhter (Assistant)", "Shahidul Islam (Assistant)"] },
    { id: 12, name: "Ratanpur Govt. Primary School", teachers: ["Mst. Morium Begum (Head Teacher)", "Prosenjit Roy (Assistant)", "Nargis Banu (Assistant)", "Ashraful Alam (Assistant)", "Rehana Khatun (Assistant)"] },
    { id: 13, name: "Chak Kalikapur Govt. Primary School", teachers: ["Subodh Chandra (Head Teacher)", "Pori Rani (Assistant)", "Md. Habibur Rahman (Assistant)", "Shirin Akhter (Assistant)", "Tariqul Islam (Assistant)"] },
    { id: 14, name: "Bara Maheshtpur Govt. Primary School", teachers: ["Md. Abdur Razzak (Head Teacher)", "Afroza Begum (Assistant)", "Sujit Kumar (Assistant)", "Mst. Parvin Akhter (Assistant)", "Mahmudul Hasan (Assistant)"] },
    { id: 15, name: "Chatra Govt. Primary School", teachers: ["Narayan Chandra (Head Teacher)", "Beauty Rani (Assistant)", "Md. Aminul Islam (Assistant)", "Shahanara Begum (Assistant)", "Dipak Roy (Assistant)"] },
    { id: 16, name: "Jagannathpur Govt. Primary School", teachers: ["Md. Moksed Ali (Head Teacher)", "Nasima Akhter (Assistant)", "Pranab Kumar (Assistant)", "Fatema Khatun (Assistant)", "Kamrul Hasan (Assistant)"] },
    { id: 17, name: "Kashipur Govt. Primary School", teachers: ["Mst. Rahela Khatun (Head Teacher)", "Dinesh Chandra (Assistant)", "Sultana Parvin (Assistant)", "Md. Mostafizur Rahman (Assistant)", "Barnali Rani (Assistant)"] },
    { id: 18, name: "Ramnagar Govt. Primary School", teachers: ["Md. Ayub Ali (Head Teacher)", "Shefali Rani (Assistant)", "Shariful Islam (Assistant)", "Jesmin Ara (Assistant)", "Nirmal Chandra (Assistant)"] },
    { id: 19, name: "Kismat Bogula Govt. Primary School", teachers: ["Manoranjan Roy (Head Teacher)", "Ferdousi Begum (Assistant)", "Md. Saiful Islam (Assistant)", "Minati Rani (Assistant)", "Golam Azam (Assistant)"] },
    { id: 20, name: "Bahadurpur Govt. Primary School", teachers: ["Md. Golam Sarwar (Head Teacher)", "Hosne Ara (Assistant)", "Dulal Chandra (Assistant)", "Mst. Bilkis Banu (Assistant)", "Rabiul Islam (Assistant)"] },
    { id: 21, name: "Bhatgaon Govt. Primary School", teachers: ["Sudhir Chandra (Head Teacher)", "Ruksana Parvin (Assistant)", "Md. Jahid Hasan (Assistant)", "Kalyani Rani (Assistant)", "Shahinur Alam (Assistant)"] },
    { id: 22, name: "Salandar Govt. Primary School", teachers: ["Md. Anwarul Islam (Head Teacher)", "Taslima Begum (Assistant)", "Bikash Roy (Assistant)", "Mst. Sharmin Sultana (Assistant)", "Firoz Ali (Assistant)"] },
    { id: 23, name: "Nayaghat Govt. Primary School", teachers: ["Amal Chandra Roy (Head Teacher)", "Salma Khatun (Assistant)", "Md. Masud Rana (Assistant)", "Anita Rani (Assistant)", "Habib Ullah (Assistant)"] },
    { id: 24, name: "Sahapur Govt. Primary School", teachers: ["Md. Zillur Rahman (Head Teacher)", "Mita Rani (Assistant)", "Abu Bakar Siddiq (Assistant)", "Ruma Begum (Assistant)", "Kishore Kumar (Assistant)"] },
    { id: 25, name: "Chakpara Govt. Primary School", teachers: ["Nirmal Kumar Roy (Head Teacher)", "Sufia Begum (Assistant)", "Md. Emdadul Haque (Assistant)", "Lipi Rani (Assistant)", "Suman Ali (Assistant)"] }
];

function getSafeSchoolId(schoolName) {
    if (!schoolName) return 999;
    const match = String(schoolName).match(/^(\d+)\./);
    if (match) return parseInt(match[1], 10);
    const clean = String(schoolName).toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = SCHOOLS.find(s => clean.includes(s.name.toLowerCase().replace(/[^a-z0-9]/g, '')));
    return found ? found.id : 999;
}

function getBangladeshDateTime() {
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    return {
        dateStr: bdTime.toISOString().split('T')[0],
        monthStr: bdTime.toISOString().substring(0, 7),
        yearStr: String(bdTime.getUTCFullYear()),
        hourBD: bdTime.getUTCHours()
    };
}

// 🚀 Pre-fetch Helper: সার্ভারে ডাটা আগে থেকেই ক্যাশ করে রাখবে
async function prefetchDailyRecords() {
    try {
        const { dateStr } = getBangladeshDateTime();
        const cacheKey = `summary_daily_${dateStr}_`;
        if (!getCache(cacheKey)) {
            const { data } = await supabase.from('attendance_records').select('id, school_name, attendance_date, attendance_data, latitude, longitude, created_at').eq('attendance_date', dateStr);
            if (data) {
                let records = data.map(r => ({
                    id: r.id,
                    schoolName: r.school_name || 'School',
                    date: r.attendance_date || '',
                    attendance: r.attendance_data || [],
                    latitude: r.latitude || '',
                    longitude: r.longitude || '',
                    timestamp: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }) : ''
                }));
                records.sort((a, b) => getSafeSchoolId(a.schoolName) - getSafeSchoolId(b.schoolName));
                setCache(cacheKey, records);
            }
        }
    } catch (e) {
        // Silent fail to prevent crash
    }
}
// ব্যাকগ্রাউন্ডে প্রি-ফেচ চালানো
setTimeout(prefetchDailyRecords, 1000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// High-speed static caching (1 Year Browser Cache)
const staticOptions = { maxAge: '365d', immutable: true };
app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use(express.static(__dirname, staticOptions));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use((req, res, next) => {
    req.cookies = {};
    const rc = req.headers.cookie;
    if (rc) {
        const pairs = rc.split(';');
        for (let i = 0; i < pairs.length; i++) {
            const parts = pairs[i].split('=');
            req.cookies[parts[0].trim()] = decodeURIComponent(parts[1] || '');
        }
    }
    next();
});

// PWA Assets
app.get('/icon-192.png', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon-192.png')));
app.get('/icon-512.png', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon-512.png')));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon-192.png')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));

const requireAEOAuth = (req, res, next) => {
    if (req.cookies && req.cookies.admin_session === 'authenticated_aeo_2026') return next();
    res.redirect('/');
};

const requireSchoolAuth = (req, res, next) => {
    const schoolSession = req.cookies ? req.cookies.school_session : null;
    if (schoolSession && schoolSession.startsWith('school_')) {
        req.schoolId = parseInt(schoolSession.split('_')[1], 10);
        return next();
    }
    res.redirect('/');
};

// 1. Gateway & Auth (0.001s Instant Login)
app.get('/', (req, res) => res.render('login', { error: null }));
app.get('/login', (req, res) => res.redirect('/'));

app.post('/login', (req, res) => {
    try {
        const { role, password, schoolId } = req.body;
        const enteredPassword = String(password || '').trim();

        if (role === 'admin') {
            if (enteredPassword === 'admin123') {
                res.setHeader('Set-Cookie', 'admin_session=authenticated_aeo_2026; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
                return res.redirect('/admin');
            } else {
                return res.render('login', { error: 'Invalid AEO Password! Use: admin123' });
            }
        } else {
            const targetSchoolId = parseInt(schoolId, 10) || 1;
            const isValidSchoolPass = (enteredPassword === 'School12345' || enteredPassword === `${targetSchoolId}@primary`);
            if (isValidSchoolPass) {
                res.setHeader('Set-Cookie', `school_session=school_${targetSchoolId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
                return res.redirect(`/index?schoolId=${targetSchoolId}`);
            } else {
                return res.render('login', { error: `Invalid password for School ID ${targetSchoolId}! Use: School12345` });
            }
        }
    } catch (e) {
        res.render('login', { error: 'Authentication Failed' });
    }
});

app.get('/logout', (req, res) => {
    res.setHeader('Set-Cookie', ['admin_session=; Path=/; Max-Age=0', 'school_session=; Path=/; Max-Age=0']);
    res.redirect('/');
});

// 2. School Attendance Page (Instant Pre-fetch Checked)
app.get('/index', requireSchoolAuth, async (req, res) => {
    try {
        const schoolId = parseInt(req.query.schoolId, 10) || req.schoolId || 1;
        const school = SCHOOLS.find(s => s.id === schoolId) || SCHOOLS[0];
        const { dateStr, hourBD } = getBangladeshDateTime();

        const [recordRes, lockRes] = await Promise.all([
            supabase.from('attendance_records').select('id, created_at').eq('school_name', school.name).eq('attendance_date', dateStr).limit(1).maybeSingle(),
            supabase.from('system_settings').select('value').eq('key', 'aeo_override_unlock').limit(1).maybeSingle()
        ]);

        const existingRecord = recordRes ? recordRes.data : null;
        const alreadySubmitted = !!existingRecord;
        let submissionTime = '';
        if (existingRecord && existingRecord.created_at) {
            submissionTime = new Date(existingRecord.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' });
        }

        const isAeoUnlocked = lockRes && lockRes.data && lockRes.data.value === 'true';
        const isAllowed = hourBD < 10 || isAeoUnlocked;

        res.render('index', { school, isAllowed, alreadySubmitted, submissionDate: dateStr, submissionTime });
    } catch (err) {
        res.redirect('/');
    }
});

// 3. Submit Attendance
app.post('/submit-attendance', upload.single('registerPhoto'), async (req, res) => {
    try {
        const { schoolId, lat, lng, attendance } = req.body;
        const school = SCHOOLS.find(s => s.id === parseInt(schoolId, 10));
        if (!school) return res.status(400).json({ success: false, message: 'Invalid School' });

        const { dateStr, hourBD } = getBangladeshDateTime();

        const [existingRes, lockRes] = await Promise.all([
            supabase.from('attendance_records').select('id').eq('school_name', school.name).eq('attendance_date', dateStr).limit(1).maybeSingle(),
            supabase.from('system_settings').select('value').eq('key', 'aeo_override_unlock').limit(1).maybeSingle()
        ]);

        if (existingRes && existingRes.data) {
            return res.status(400).json({ success: false, message: 'Attendance for your school has already been submitted today!' });
        }

        const isUnlocked = lockRes && lockRes.data && lockRes.data.value === 'true';
        if (hourBD >= 10 && !isUnlocked) {
            return res.status(403).json({ success: false, message: 'Attendance submission is closed after 10:00 AM.' });
        }

        let photoUrl = '';
        if (req.file) {
            photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        const { error } = await supabase.from('attendance_records').insert([{
            school_name: school.name,
            attendance_date: dateStr,
            attendance_data: typeof attendance === 'string' ? JSON.parse(attendance) : attendance,
            photo_url: photoUrl,
            latitude: lat,
            longitude: lng,
            created_at: new Date().toISOString()
        }]);

        if (error) throw error;
        clearAppCache();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🚀 High-Speed Pre-fetched Memory Cache Helper
async function fetchRecordsWithCache(viewType, date, month, year) {
    const cacheKey = `summary_${viewType}_${date}_${month}_${year}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    let query = supabase.from('attendance_records').select('id, school_name, attendance_date, attendance_data, latitude, longitude, created_at');

    if (viewType === 'daily') query = query.eq('attendance_date', date);
    else if (viewType === 'monthly') query = query.gte('attendance_date', `${month}-01`).lte('attendance_date', `${month}-31`);
    else if (viewType === 'yearly') query = query.gte('attendance_date', `${year}-01-01`).lte('attendance_date', `${year}-12-31`);

    const { data } = await query;
    let records = (data || []).map(r => ({
        id: r.id,
        schoolName: r.school_name || 'School',
        date: r.attendance_date || '',
        attendance: r.attendance_data || [],
        latitude: r.latitude || '',
        longitude: r.longitude || '',
        timestamp: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }) : ''
    }));

    records.sort((a, b) => getSafeSchoolId(a.schoolName) - getSafeSchoolId(b.schoolName));
    setCache(cacheKey, records);
    return records;
}

// 4. Admin Summary Dashboard
app.get('/admin', requireAEOAuth, async (req, res) => {
    try {
        const viewType = req.query.viewType || 'daily';
        const { dateStr, monthStr, yearStr } = getBangladeshDateTime();
        const selectedDate = req.query.date || dateStr;
        const selectedMonth = req.query.month || monthStr;
        const selectedYear = req.query.year || yearStr;

        const [records, lockRes] = await Promise.all([
            fetchRecordsWithCache(viewType, selectedDate, selectedMonth, selectedYear),
            supabase.from('system_settings').select('value').eq('key', 'aeo_override_unlock').limit(1).maybeSingle()
        ]);

        const isAeoUnlocked = lockRes && lockRes.data && lockRes.data.value === 'true';
        res.render('admin', { records, viewType, selectedDate, selectedMonth, selectedYear, isAeoUnlocked });
    } catch (e) {
        res.render('admin', { records: [], viewType: 'daily', selectedDate: '', selectedMonth: '', selectedYear: '', isAeoUnlocked: false });
    }
});

// ⚡ Instant Tab Switching API (0.001s response time)
app.get('/api/admin-summary', requireAEOAuth, async (req, res) => {
    try {
        const { viewType, date, month, year } = req.query;
        const records = await fetchRecordsWithCache(viewType, date, month, year);
        res.json({ success: true, records });
    } catch (e) {
        res.json({ success: false, records: [] });
    }
});

// 5. Admin List View
app.get('/admin/list', requireAEOAuth, async (req, res) => {
    try {
        const viewType = req.query.viewType || 'daily';
        const { dateStr, monthStr, yearStr } = getBangladeshDateTime();
        const selectedDate = req.query.date || dateStr;
        const selectedMonth = req.query.month || monthStr;
        const selectedYear = req.query.year || yearStr;

        const records = await fetchRecordsWithCache(viewType, selectedDate, selectedMonth, selectedYear);
        res.render('admin-list', { records, viewType, selectedDate, selectedMonth, selectedYear, isAeoUnlocked: false });
    } catch (e) {
        res.render('admin-list', { records: [], viewType: 'daily', selectedDate: '', selectedMonth: '', selectedYear: '', isAeoUnlocked: false });
    }
});

// 6. Teacher Management
app.get('/admin/teachers', requireAEOAuth, (req, res) => res.render('admin-teachers', { schools: SCHOOLS }));

app.post('/admin/teachers/update', requireAEOAuth, (req, res) => {
    const { schoolId, teachers } = req.body;
    const school = SCHOOLS.find(s => s.id === parseInt(schoolId, 10));
    if (school) {
        school.teachers = typeof teachers === 'string' ? JSON.parse(teachers) : teachers;
        clearAppCache();
        return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: 'School not found' });
});

// 7. Verify & Edit Record
app.get('/admin/school/:id', requireAEOAuth, async (req, res) => {
    try {
        const recordId = req.params.id;
        const { data, error } = await supabase.from('attendance_records').select('*').eq('id', recordId).single();
        if (error || !data) return res.redirect('/admin/list');

        const record = {
            id: data.id,
            schoolName: data.school_name,
            date: data.attendance_date,
            attendance: data.attendance_data || [],
            photo: data.photo_url,
            location: { lat: data.latitude, lng: data.longitude },
            timestamp: new Date(data.created_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })
        };
        res.render('edit-attendance', { record });
    } catch (e) {
        res.redirect('/admin/list');
    }
});

app.post('/admin/school/update/:id', requireAEOAuth, async (req, res) => {
    try {
        const recordId = req.params.id;
        const { attendance } = req.body;
        const parsedAttendance = typeof attendance === 'string' ? JSON.parse(attendance) : attendance;

        const { error } = await supabase.from('attendance_records').update({ attendance_data: parsedAttendance }).eq('id', recordId);
        if (error) return res.json({ success: false, message: error.message });
        clearAppCache();
        res.json({ success: true });
    } catch(e) {
        res.json({ success: false, message: 'Update failed' });
    }
});

app.post('/admin/school/delete/:id', requireAEOAuth, async (req, res) => {
    try {
        const recordId = req.params.id;
        const { error } = await supabase.from('attendance_records').delete().eq('id', recordId);
        if (error) return res.json({ success: false, message: 'Failed to delete.' });
        clearAppCache();
        res.json({ success: true });
    } catch(e) {
        res.json({ success: false, message: 'Delete failed' });
    }
});

app.post('/admin/toggle-lock', requireAEOAuth, async (req, res) => {
    try {
        const { unlock } = req.body;
        const { error } = await supabase.from('system_settings').upsert([{ key: 'aeo_override_unlock', value: unlock ? 'true' : 'false' }]);
        if (error) return res.json({ success: false, message: 'Failed to update lock' });
        clearAppCache();
        res.json({ success: true, isUnlocked: unlock });
    } catch(e) {
        res.json({ success: false, message: 'Toggle failed' });
    }
});

// 8. APIs
app.get('/api/teacher-analytics', requireAEOAuth, async (req, res) => {
    try {
        const { teacher, mode, month, year } = req.query;
        let query = supabase.from('attendance_records').select('school_name, attendance_date, attendance_data');

        if (mode === 'monthly') query = query.gte('attendance_date', `${month}-01`).lte('attendance_date', `${month}-31`);
        else if (mode === 'yearly') query = query.gte('attendance_date', `${year}-01-01`).lte('attendance_date', `${year}-12-31`);

        const { data: rawRecords } = await query;
        let history = [];
        let schoolName = '';
        let presentCount = 0, leaveCount = 0, absentCount = 0;

        (rawRecords || []).forEach(r => {
            if (r.attendance_data && Array.isArray(r.attendance_data)) {
                const found = r.attendance_data.find(t => t.teacher.trim() === teacher.trim());
                if (found) {
                    schoolName = r.school_name;
                    history.push({ date: r.attendance_date, status: found.status, leaveType: found.leaveType || '' });
                    if (found.status === 'Present') presentCount++;
                    else if (found.status === 'Leave' || found.status === 'On Leave') leaveCount++;
                    else if (found.status === 'Absent') absentCount++;
                }
            }
        });

        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        const total = presentCount + leaveCount + absentCount;
        const presentRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0.0";

        res.json({ success: true, teacherName: teacher, schoolName, stats: { presentCount, leaveCount, absentCount, presentRate }, history });
    } catch(e) {
        res.json({ success: false, message: 'Analytics failed' });
    }
});

app.get('/api/photos-payload', requireAEOAuth, async (req, res) => {
    try {
        const { viewType, date, month, year } = req.query;
        let query = supabase.from('attendance_records').select('school_name, attendance_date, photo_url');

        if (viewType === 'daily') query = query.eq('attendance_date', date);
        else if (viewType === 'monthly') query = query.gte('attendance_date', `${month}-01`).lte('attendance_date', `${month}-31`);
        else if (viewType === 'yearly') query = query.gte('attendance_date', `${year}-01-01`).lte('attendance_date', `${year}-12-31`);

        const { data } = await query;
        const photos = (data || []).map(d => ({ schoolName: d.school_name, date: d.attendance_date, photo: d.photo_url }));
        res.json({ success: true, photos });
    } catch(e) {
        res.json({ success: false, photos: [] });
    }
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;