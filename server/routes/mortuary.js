const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET All cases (Recent first)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 100 * FROM Mortuary 
            ORDER BY admission_date DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching mortuary list:', err);
        res.status(500).send('Server Error');
    }
});

// GET Statistics for current year
router.get('/stats', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // JS Year is usually AD. Check server timezone/locale if needed.
        // Assuming database modification is minimal, doing simplified stats
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'รอญาติมารับ' THEN 1 ELSE 0 END) as waiting,
                SUM(CASE WHEN status = 'ดำเนินคดี' THEN 1 ELSE 0 END) as legal,
                SUM(CASE WHEN status = 'รับกลับแล้ว' THEN 1 ELSE 0 END) as completed
            FROM Mortuary
            WHERE YEAR(admission_date) = YEAR(GETDATE())
        `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).send('Server Error');
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST New Case
router.post('/', verifyToken, async (req, res) => {
    try {
        const { first_name, last_name, id_card, age, cause_of_death, notes, recorder_name } = req.body;
        const pool = await poolPromise;

        // Generate a simple ID logic if needed, or rely on IDENTITY

        await pool.request()
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('id_card', sql.NVarChar, id_card)
            .input('age', sql.Int, age)
            .input('cause_of_death', sql.NVarChar, cause_of_death)
            .input('notes', sql.NVarChar, notes)
            .input('recorder_name', sql.NVarChar, recorder_name)
            .query(`
                INSERT INTO Mortuary (first_name, last_name, id_card, age, cause_of_death, notes, recorder_name, status, admission_date)
                VALUES (@first_name, @last_name, @id_card, @age, @cause_of_death, @notes, @recorder_name, 'รอญาติมารับ', GETDATE())
            `);

        res.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
    } catch (err) {
        console.error('Error creating case:', err);
        res.status(500).send('Server Error');
    }
});

// PUT Update Status
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE Mortuary 
                SET status = @status, 
                    discharge_date = CASE WHEN @status = 'รับกลับแล้ว' THEN GETDATE() ELSE discharge_date END,
                    updated_at = GETDATE()
                WHERE id = @id
            `);

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send('Server Error');
    }
});

// PUT Update Info
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, id_card, age, cause_of_death, notes, recorder_name } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('id_card', sql.NVarChar, id_card)
            .input('age', sql.Int, age)
            .input('cause_of_death', sql.NVarChar, cause_of_death)
            .input('notes', sql.NVarChar, notes)
            .input('recorder_name', sql.NVarChar, recorder_name)
            .query(`
                UPDATE Mortuary 
                SET first_name = @first_name,
                    last_name = @last_name,
                    id_card = @id_card,
                    age = @age,
                    cause_of_death = @cause_of_death,
                    notes = @notes,
                    recorder_name = @recorder_name,
                    updated_at = GETDATE()
                WHERE id = @id
            `);

        res.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ' });
    } catch (err) {
        console.error('Error updating info:', err);
        res.status(500).send('Server Error');
    }
});

// DELETE Case
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Mortuary WHERE id = @id');

        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (err) {
        console.error('Error deleting case:', err);
        res.status(500).send('Server Error');
    }
});

// GET Search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query; // search query
        const pool = await poolPromise;
        const result = await pool.request()
            .input('q', sql.NVarChar, `%${q}%`)
            .query(`
                SELECT TOP 50 * FROM Mortuary 
                WHERE first_name LIKE @q 
                   OR last_name LIKE @q 
                   OR id_card LIKE @q
                ORDER BY admission_date DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
