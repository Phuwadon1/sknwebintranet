const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload();

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
    const { title, month, year, type } = req.body;
    // If file is uploaded, convert to Base64; otherwise use provided URL (legacy)
    const filePath = req.file ? toBase64DataUrl(req.file) : (req.body.filePath || '#');

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
            .input('FilePath', sql.NVarChar(sql.MAX), filePath)
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

    const newFileData = req.file ? toBase64DataUrl(req.file) : undefined;

    try {
        const pool = await poolPromise;

        let query = `UPDATE Schedules SET Title = @Title, Month = @Month, Year = @Year, Type = @Type`;
        if (newFileData) {
            query += `, FilePath = @FilePath`;
        }
        query += ` WHERE ID = @ID`;

        const request = pool.request()
            .input('ID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Month', sql.NVarChar, month)
            .input('Year', sql.NVarChar, year)
            .input('Type', sql.NVarChar, type);

        if (newFileData) {
            request.input('FilePath', sql.NVarChar(sql.MAX), newFileData);
        }

        await request.query(query);

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
