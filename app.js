if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const multer = require('multer');
const supabase = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const AEO_PASSWORD = process.env.AEO_PASSWORD || 'Aeo12345';

// Multer Memory Storage with 10MB limit
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware & Configurations
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Favicon/Icon Direct Serve Route
app.get('/icon.png', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon.png')));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon.png')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));

// Bochaganj 25 Primary Schools Data with Demo Teachers
const schoolsData = [
    { id: 1, name: "Bochaganj Model Government Primary School", teachers: ["Md. Abdul Karim (Head Teacher)", "Nazma Akhter (Assistant)", "Rafiqul Islam (Assistant)", "Salma Begum (Assistant)", "Mofizur Rahman (Assistant)"] },
    { id: 2, name: "Setabganj Upashahar Government Primary School", teachers: ["Profulla Chandra Roy (Head Teacher)", "Farhana Yeasmin (Assistant)", "Biplob Kumar (Assistant)", "Shahnaz Parvin (Assistant)", "Moksed Ali (Assistant)"] },
    { id: 3, name: "Bochaganj Central Government Primary School", teachers: ["Shah Alam (Head Teacher)", "Parul Rani (Assistant)", "Jahangir Alam (Assistant)", "Sultana Razia (Assistant)", "Kamal Hossain (Assistant)"] },
    { id: 4, name: "Muraripur Government Primary School", teachers: ["Animesh Roy (Head Teacher)", "Nasrin Sultana (Assistant)", "Belal Hossain (Assistant)", "Rina Begum (Assistant)", "Anisur Rahman (Assistant)"] },
    { id: 5, name: "Chawk Rampur Government Primary School", teachers: ["Moniruzzaman (Head Teacher)", "Rita Rani (Assistant)", "Sazzad Hossain (Assistant)", "Monwara Khatun (Assistant)", "Nazrul Islam (Assistant)"] },
    { id: 6, name: "Bogula Government Primary School", teachers: ["Haradhan Chandra (Head Teacher)", "Rokeya Begum (Assistant)", "Abdul Mannan (Assistant)", "Geeta Rani (Assistant)", "Sohel Rana (Assistant)"] },
    { id: 7, name: "Chira Government Primary School", teachers: ["Mozammel Haque (Head Teacher)", "Shikha Rani (Assistant)", "Enamul Haque (Assistant)", "Kohinoor Begum (Assistant)", "Liton Kumar (Assistant)"] },
    { id: 8, name: "Gopalpur Government Primary School", teachers: ["Subhash Chandra (Head Teacher)", "Hosne Ara (Assistant)", "Azizar Rahman (Assistant)", "Champa Rani (Assistant)", "Mizanur Rahman (Assistant)"] },
    { id: 9, name: "Ishania Government Primary School", teachers: ["Nur Mohammad (Head Teacher)", "Archana Rani (Assistant)", "Mahbub Alam (Assistant)", "Firoza Begum (Assistant)", "Aminul Islam (Assistant)"] },
    { id: 10, name: "Nandigram Government Primary School", teachers: ["Bimal Chandra Roy (Head Teacher)", "Lipi Akter (Assistant)", "Shariful Islam (Assistant)", "Rekha Rani (Assistant)", "Dulal Hossain (Assistant)"] },
    { id: 11, name: "Shibpur Government Primary School", teachers: ["Zillur Rahman (Head Teacher)", "Swapna Rani (Assistant)", "Mamunur Rashid (Assistant)", "Josna Begum (Assistant)", "Selim Reza (Assistant)"] },
    { id: 12, name: "Ratanpur Government Primary School", teachers: ["Tarani Kanta Roy (Head Teacher)", "Bulbul Akhter (Assistant)", "Shahidul Islam (Assistant)", "Anjana Rani (Assistant)", "Rahim Uddin (Assistant)"] },
    { id: 13, name: "Chak Kalikapur Government Primary School", teachers: ["Akhtar Hossain (Head Teacher)", "Momena Begum (Assistant)", "Nazmul Huda (Assistant)", "Sumita Rani (Assistant)", "Al-Mamun (Assistant)"] },
    { id: 14, name: "Bara Maheshtpur Government Primary School", teachers: ["Dhirendra Nath (Head Teacher)", "Hasina Khatun (Assistant)", "Rafique Uddin (Assistant)", "Purnima Rani (Assistant)", "Joynal Abedin (Assistant)"] },
    { id: 15, name: "Chatra Government Primary School", teachers: ["Abu Bakar Siddique (Head Teacher)", "Khadija Begum (Assistant)", "Delwar Hossain (Assistant)", "Bithi Rani (Assistant)", "Mokbul Hossain (Assistant)"] },
    { id: 16, name: "Jagannathpur Government Primary School", teachers: ["Sudhir Chandra Roy (Head Teacher)", "Sultana Parvin (Assistant)", "Shahjahan Ali (Assistant)", "Srabani Rani (Assistant)", "Monir Hossain (Assistant)"] },
    { id: 17, name: "Kashipur Government Primary School", teachers: ["Golam Mostafa (Head Teacher)", "Sabina Yasmin (Assistant)", "Rashedul Islam (Assistant)", "Kanika Rani (Assistant)", "Sohag Ali (Assistant)"] },
    { id: 18, name: "Ramnagar Government Primary School", teachers: ["Nikhilesh Roy (Head Teacher)", "Farida Begum (Assistant)", "Tariqul Islam (Assistant)", "Ratna Rani (Assistant)", "Moslem Uddin (Assistant)"] },
    { id: 19, name: "Kismat Bogula Government Primary School", teachers: ["Sirajul Islam (Head Teacher)", "Amena Khatun (Assistant)", "Ziaur Rahman (Assistant)", "Alo Rani (Assistant)", "Belayet Hossain (Assistant)"] },
    { id: 20, name: "Bahadurpur Government Primary School", teachers: ["Prabhat Chandra (Head Teacher)", "Shahana Parvin (Assistant)", "Ariful Islam (Assistant)", "Mala Rani (Assistant)", "Asaduzzaman (Assistant)"] },
    { id: 21, name: "Bhatgaon Government Primary School", teachers: ["Abdul Jabbar (Head Teacher)", "Suraiya Begum (Assistant)", "Mostafizur Rahman (Assistant)", "Shila Rani (Assistant)", "Easin Ali (Assistant)"] },
    { id: 22, name: "Salandar Government Primary School", teachers: ["Kshitish Chandra (Head Teacher)", "Beauty Akhter (Assistant)", "Nazim Uddin (Assistant)", "Putul Rani (Assistant)", "Shah Alam (Assistant)"] },
    { id: 23, name: "Nayaghat Government Primary School", teachers: ["Lutfar Rahman (Head Teacher)", "Rozina Begum (Assistant)", "Mizanur Rahman (Assistant)", "Shampa Rani (Assistant)", "Hridoy Hossain (Assistant)"] },
    { id: 24, name: "Sahapur Government Primary School", teachers: ["Birendra Nath Roy (Head Teacher)", "Parveen Sultana (Assistant)", "Zahidul Islam (Assistant)", "Basana Rani (Assistant)", "Akram Hossain (Assistant)"] },
    { id: 25, name: "Chakpara Government Primary School", teachers: ["Md. Khalilur Rahman (Head Teacher)", "Nazma Begum (Assistant)", "Harun-or-Rashid (Assistant)", "Minati Rani (Assistant)", "Abdul Alim (Assistant)"] }
];

// Routes
app.get('/', (req, res) => res.render('login', { error: null }));

app.post('/login', (req, res) => {
    const { role, password, schoolId } = req.body;
    if (role === 'admin') {
        if (password === AEO_PASSWORD) return res.redirect('/admin?auth=true');
        return res.render('login', { error: 'Invalid AEO Password!' });
    } else if (role === 'school') {
        return res.redirect(`/index?schoolId=${schoolId}`);
    }
    res.redirect('/');
});

app.get('/index', (req, res) => {
    const schoolId = req.query.schoolId;
    if (!schoolId) return res.redirect('/');
    const school = schoolsData.find(s => s.id == schoolId);
    res.render('index', { school });
});

// Submit Attendance
app.post('/submit-attendance', upload.single('registerPhoto'), async (req, res) => {
    const { schoolId, attendance, lat, lng } = req.body;
    const school = schoolsData.find(s => s.id == schoolId);
    
    let photoDataUrl = null;
    if (req.file) {
        photoDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const newRecord = {
        school_name: school ? school.name : 'Unknown School',
        attendance_date: new Date().toISOString().split('T')[0],
        attendance_data: JSON.parse(attendance),
        photo_url: photoDataUrl,
        latitude: lat,
        longitude: lng,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('attendance_records')
        .insert([newRecord]);

    if (error) {
        console.error('Supabase Insert Error:', error.message);
        return res.json({ success: false, message: 'Database error occurred!' });
    }

    res.json({ success: true, message: 'Attendance Submitted Successfully!' });
});

// Admin Route
app.get('/admin', async (req, res) => {
    if (req.query.auth !== 'true') return res.redirect('/');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return res.render('admin', { records: [] });
    }

    const formattedRecords = records.map(rec => ({
        id: rec.id,
        schoolName: rec.school_name,
        date: rec.attendance_date,
        attendance: rec.attendance_data,
        photo: rec.photo_url,
        location: { lat: rec.latitude, lng: rec.longitude },
        timestamp: new Date(rec.created_at).toLocaleString()
    }));

    res.render('admin', { records: formattedRecords });
});

// Edit Page for AEO
app.get('/admin/school/:id', async (req, res) => {
    const recordId = req.params.id;
    const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', recordId)
        .single();

    if (error || !data) return res.redirect('/admin?auth=true');

    const record = {
        id: data.id,
        schoolName: data.school_name,
        date: data.attendance_date,
        attendance: data.attendance_data,
        photo: data.photo_url,
        location: { lat: data.latitude, lng: data.longitude },
        timestamp: new Date(data.created_at).toLocaleString()
    };

    res.render('edit-attendance', { record });
});

// Update Attendance by AEO
app.post('/admin/school/update/:id', async (req, res) => {
    const recordId = req.params.id;
    const { attendance } = req.body;

    const { error } = await supabase
        .from('attendance_records')
        .update({ attendance_data: JSON.parse(attendance) })
        .eq('id', recordId);

    if (error) {
        return res.json({ success: false, message: 'Failed to update attendance.' });
    }

    res.json({ success: true, redirectUrl: '/admin?auth=true' });
});

app.get('/logout', (req, res) => res.redirect('/'));

module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}