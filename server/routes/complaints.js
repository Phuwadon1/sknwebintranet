const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Submit Complaint Endpoint
router.post('/submit', async (req, res) => {
    const { topic, detail, contactName, contactInfo } = req.body;

    if (!topic || !detail) {
        return res.status(400).json({ message: 'Topic and Detail are required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('topic', sql.NVarChar, topic)
            .input('detail', sql.NVarChar, detail)
            .input('contactName', sql.NVarChar, contactName || '')
            .input('contactInfo', sql.NVarChar, contactInfo || '')
            .query(`
                INSERT INTO Complaints (Topic, Detail, ContactName, ContactInfo, CreatedAt)
                VALUES (@topic, @detail, @contactName, @contactInfo, GETDATE())
            `);

        res.status(201).json({ message: 'Complaint submitted successfully' });

    } catch (err) {
        console.error('Error submitting complaint:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Get All Complaints Endpoint (Admin Only)
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Complaints ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
