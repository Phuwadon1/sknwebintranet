const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Use original filename as requested by user.
        // Convert from latin1 to utf8 just in case of Multer header encoding issues with Thai characters.
        // Although in modern Node/Multer it might be fine, this is a common fix for Thai filenames in headers.
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Helper for Thai Month sorting
const monthMap = {
    'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4, 'พฤษภาคม': 5, 'มิถุนายน': 6,
    'กรกฎาคม': 7, 'สิงหาคม': 8, 'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
};

// GET all schedules
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Schedules');

        const sortedData = result.recordset.sort((a, b) => {
            // Sort by ID DESC to match strict 1-272 user order
            return b.ID - a.ID;
        });

        res.json(sortedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// ADD a new schedule
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    console.log('POST /schedules hit');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { title, month, year, type } = req.body;
    // If file is uploaded, use its path, otherwise use the provided URL (legacy support)
    const filePath = req.file ? `/uploads/${req.file.filename}` : req.body.filePath;

    if (!title || !type) {
        return res.status(400).json({ message: 'Title and Type are required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Month', sql.NVarChar, month)
            .input('Year', sql.NVarChar, year)
            .input('Type', sql.NVarChar, type)
            .input('FilePath', sql.NVarChar, filePath || '#')
            .query('INSERT INTO Schedules (Title, Month, Year, Type, FilePath) OUTPUT INSERTED.* VALUES (@Title, @Month, @Year, @Type, @FilePath)');

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// UPDATE a schedule
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
    const { id } = req.params;
    const { title, month, year, type } = req.body;

    // Check if a new file is uploaded
    const newFilePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        const pool = await poolPromise;

        // Dynamic Update: If newFilePath is present, update it. If not, keep original.
        // We can do this by selecting first or just conditionally building the query.
        // Simpler approach: If newFilePath is undefined, we need to know the old one OR just not update that column.
        // Let's use a COALESCE logic or just update fields provided.

        let query = `UPDATE Schedules SET Title = @Title, Month = @Month, Year = @Year, Type = @Type`;
        if (newFilePath) {
            query += `, FilePath = @FilePath`;
        }
        query += ` WHERE ID = @ID`;

        const request = pool.request()
            .input('ID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Month', sql.NVarChar, month)
            .input('Year', sql.NVarChar, year)
            .input('Type', sql.NVarChar, type);

        if (newFilePath) {
            request.input('FilePath', sql.NVarChar, newFilePath);
        }

        await request.query(query);

        // Fetch updated item to return
        const updatedItem = await pool.request().input('ID', sql.Int, id).query('SELECT * FROM Schedules WHERE ID = @ID');
        res.json(updatedItem.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


// DELETE a schedule
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM Schedules WHERE ID = @ID');

        res.json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
