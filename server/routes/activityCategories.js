const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// Ensure table exists
async function ensureTableExists() {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivityCategories' and xtype='U')
            BEGIN
                CREATE TABLE ActivityCategories (
                    id VARCHAR(100) PRIMARY KEY,
                    label NVARCHAR(255) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    sort_order INT DEFAULT 0
                )
                
                -- Insert default categories if table is newly created
                INSERT INTO ActivityCategories (id, label, sort_order) VALUES
                ('assessment_summary', N'สรุปผลการประเมินระบบ', 1),
                ('system_test', N'ทดสอบระบบ', 2),
                ('public_health_sports_20', N'กีฬาสาธารณสุข ครั้งที่20', 3),
                ('skn_color_sports_2553', N'กีฬาสี รพ.สน. 2553', 4)
            END
        `);
    } catch (err) {
        console.error("Error creating ActivityCategories table:", err);
    }
}
ensureTableExists();

// GET all categories
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM ActivityCategories ORDER BY sort_order ASC, created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new category
router.post('/', verifyToken, async (req, res) => {
    const { id, label } = req.body;

    if (!id || !label) {
        return res.status(400).json({ message: 'ID and Label are required' });
    }

    try {
        const pool = await poolPromise;

        // Get max sort_order
        const maxResult = await pool.request().query('SELECT ISNULL(MAX(sort_order), 0) as max_sort FROM ActivityCategories');
        const nextSortOrder = maxResult.recordset[0].max_sort + 1;

        await pool.request()
            .input('ID', sql.VarChar, id)
            .input('Label', sql.NVarChar, label)
            .input('SortOrder', sql.Int, nextSortOrder)
            .query('INSERT INTO ActivityCategories (id, label, sort_order) VALUES (@ID, @Label, @SortOrder)');

        res.status(201).json({ id, label, sort_order: nextSortOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE category
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.VarChar, id)
            .query('DELETE FROM ActivityCategories WHERE id = @ID');
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
