
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload();
const verifyToken = require('../middleware/authMiddleware');

// GET all departments
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Departments ORDER BY id ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new department
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    const { title, content, phone_internal, title_color } = req.body;
    const cleanTitleColor = Array.isArray(title_color) ? title_color[0] : (title_color || '#000000');

    let imagePath = req.file ? toBase64DataUrl(req.file) : null;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Content', sql.NVarChar(sql.MAX), content)
            .input('PhoneInternal', sql.NVarChar, phone_internal)
            .input('TitleColor', sql.NVarChar(50), cleanTitleColor)
            .input('ImagePath', sql.NVarChar(sql.MAX), imagePath)
            .query('INSERT INTO Departments (title, content, phone_internal, image_path, title_color) VALUES (@Title, @Content, @PhoneInternal, @ImagePath, @TitleColor)');

        res.json({ message: 'Department created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE department
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM Departments WHERE id = @ID');

        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update department
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, content, phone_internal, title_color } = req.body;
    const cleanTitleColor = Array.isArray(title_color) ? title_color[0] : (title_color || '#000000');

    try {
        const pool = await poolPromise;

        let query = 'UPDATE Departments SET title = @Title, content = @Content, phone_internal = @PhoneInternal, title_color = @TitleColor, updated_at = GETDATE()';

        const request = pool.request()
            .input('ID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Content', sql.NVarChar(sql.MAX), content)
            .input('PhoneInternal', sql.NVarChar, phone_internal)
            .input('TitleColor', sql.NVarChar(50), cleanTitleColor);

        if (req.file) {
            const imagePath = toBase64DataUrl(req.file);
            query += ', image_path = @ImagePath';
            request.input('ImagePath', sql.NVarChar(sql.MAX), imagePath);
        }

        await request.query(query + ' WHERE id = @ID');

        res.json({ message: 'Department updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
