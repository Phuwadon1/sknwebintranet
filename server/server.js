const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Server started
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedules');

const app = express();
const PORT = process.env.PORT || 8083;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/doctor-schedules', require('./routes/doctorSchedules'));
app.use('/api/news', require('./routes/news'));
app.use('/api/related-links', require('./routes/relatedLinks'));
app.use('/api/banner-links', require('./routes/bannerLinks'));
app.use('/api/storage', require('./routes/storage'));
app.use('/api/mortuary', require('./routes/mortuary'));
app.use('/api/hemodialysis', require('./routes/hemodialysis'));
app.use('/api/nursing', require('./routes/nursing'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/posters', require('./routes/posters'));
app.use('/api/executives', require('./routes/executives'));
app.use('/api/orgchart', require('./routes/orgchart'));
app.use('/api/activity-photos', require('./routes/activityPhotos'));
app.use('/api/activity-categories', require('./routes/activityCategories'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/visitor', require('./routes/visitor'));
app.use('/api/chief', require('./routes/chief')); // Chief Profile Route
app.use('/api/health-knowledge', require('./routes/healthKnowledge')); // Health Knowledge Route
app.use('/api/chat', require('./routes/chat')); // Chat Route
app.use('/api/it-schedules', require('./routes/itSchedules')); // IT Schedule Route
app.use('/api/departments', require('./routes/departments')); // Departments Route


// ... existing code ...

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend static files from dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
