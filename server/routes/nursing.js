const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

const multer = require('multer');

// Configure Multer for PDF/File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Fix Thai filename encoding
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- Quick Menus ---
// ... (Quick Menus routes remain unchanged) ...
// GET all menus
router.get('/quick-menus', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM NursingQuickMenus ORDER BY OrderIndex ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST new menu
router.post('/quick-menus', verifyToken, async (req, res) => {
    const { title, url, icon, orderIndex, color } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Url', sql.NVarChar, url)
            .input('Icon', sql.NVarChar, icon)
            .input('OrderIndex', sql.Int, orderIndex || 0)
            .input('Color', sql.NVarChar, color || 'pink')
            .query('INSERT INTO NursingQuickMenus (Title, Url, Icon, OrderIndex, Color) OUTPUT INSERTED.ID VALUES (@Title, @Url, @Icon, @OrderIndex, @Color)');

        res.json({ id: result.recordset[0].ID, title, url, icon, orderIndex, color });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update menu
router.put('/quick-menus/:id', verifyToken, async (req, res) => {
    const { title, url, icon, orderIndex, color } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, req.params.id)
            .input('Title', sql.NVarChar, title)
            .input('Url', sql.NVarChar, url)
            .input('Icon', sql.NVarChar, icon)
            .input('OrderIndex', sql.Int, orderIndex)
            .input('Color', sql.NVarChar, color)
            .query('UPDATE NursingQuickMenus SET Title = @Title, Url = @Url, Icon = @Icon, OrderIndex = @OrderIndex, Color = @Color WHERE ID = @ID');

        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE menu
router.delete('/quick-menus/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, req.params.id)
            .query('DELETE FROM NursingQuickMenus WHERE ID = @ID');

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PR News ---

// GET all news
router.get('/pr-news', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM NursingPRNews ORDER BY ID DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new news
router.post('/pr-news', verifyToken, upload.single('file'), async (req, res) => {
    // req.body contains text fields, req.file contains uploaded file
    const { title, date, description, urlType, externalUrl } = req.body;
    let finalUrl = '#';

    if (req.file) {
        finalUrl = `/uploads/${req.file.filename}`;
    } else if (externalUrl) {
        finalUrl = externalUrl;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Description', sql.NVarChar, description)
            .input('Url', sql.NVarChar, finalUrl)
            .query('INSERT INTO NursingPRNews (Title, Date, Description, Url) OUTPUT INSERTED.ID VALUES (@Title, @Date, @Description, @Url)');

        res.json({ id: result.recordset[0].ID, title, date, description, url: finalUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update news
router.put('/pr-news/:id', verifyToken, upload.single('file'), async (req, res) => {
    const { title, date, description, urlType, externalUrl, existingUrl } = req.body;
    let finalUrl = existingUrl || '#';

    if (req.file) {
        finalUrl = `/uploads/${req.file.filename}`;
    } else if (urlType === 'link' && externalUrl) {
        finalUrl = externalUrl;
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, req.params.id)
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Description', sql.NVarChar, description)
            .input('Url', sql.NVarChar, finalUrl)
            .query('UPDATE NursingPRNews SET Title = @Title, Date = @Date, Description = @Description, Url = @Url WHERE ID = @ID');

        res.json({ message: "Updated successfully", url: finalUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE news
router.delete('/pr-news/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, req.params.id)
            .query('DELETE FROM NursingPRNews WHERE ID = @ID');

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Daily Stats ---

// GET stats
router.get('/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 1 * FROM NursingDailyStats ORDER BY ID DESC');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            // Return defaults if empty
            res.json({
                TotalNurses: 450,
                Patients: 320,
                Leave: 12,
                Incidents: 3,
                MorningShift: 45,
                AfternoonShift: 32,
                NightShift: 28
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT stats
router.put('/stats', verifyToken, async (req, res) => {
    const { TotalNurses, Patients, Leave, Incidents, MorningShift, AfternoonShift, NightShift } = req.body;
    try {
        const pool = await poolPromise;

        // Update the single row or insert if not exists
        await pool.request()
            .input('TotalNurses', sql.Int, TotalNurses)
            .input('Patients', sql.Int, Patients)
            .input('Leave', sql.Int, Leave)
            .input('Incidents', sql.Int, Incidents)
            .input('MorningShift', sql.Int, MorningShift)
            .input('AfternoonShift', sql.Int, AfternoonShift)
            .input('NightShift', sql.Int, NightShift)
            .query(`
                IF EXISTS (SELECT * FROM NursingDailyStats)
                    UPDATE NursingDailyStats SET 
                        TotalNurses = @TotalNurses,
                        Patients = @Patients,
                        Leave = @Leave,
                        Incidents = @Incidents,
                        MorningShift = @MorningShift,
                        AfternoonShift = @AfternoonShift,
                        NightShift = @NightShift,
                        LastUpdated = GETDATE()
                ELSE
                    INSERT INTO NursingDailyStats (TotalNurses, Patients, Leave, Incidents, MorningShift, AfternoonShift, NightShift)
                    VALUES (@TotalNurses, @Patients, @Leave, @Incidents, @MorningShift, @AfternoonShift, @NightShift)
            `);

        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
