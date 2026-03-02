const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// POST /api/contact/submit
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Input Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const pool = await poolPromise;

        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('Subject', sql.NVarChar, subject)
            .input('Message', sql.NVarChar, message)
            .query(`INSERT INTO ContactMessages (Name, Email, Subject, Message) VALUES (@Name, @Email, @Subject, @Message)`);

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/contact - Get all messages (Admin only)
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ContactMessages ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/contact/:id
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM ContactMessages WHERE ID = @id');
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Error deleting message:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
