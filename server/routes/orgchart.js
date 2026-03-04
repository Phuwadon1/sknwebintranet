const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const valid = /jpeg|jpg|png|gif/.test(file.mimetype);
        if (valid) cb(null, true);
        else cb(new Error('Only image files are allowed!'));
    }
});

// GET all org chart data
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM OrgChart ORDER BY Level, [Order]');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching org chart:', err);
        res.status(500).json({ message: 'Error fetching org chart data' });
    }
});

// POST - Add new person
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, title, photo, level, parentId, position, order, prefix, specialTitle } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('title', sql.NVarChar, title)
            .input('specialTitle', sql.NVarChar, specialTitle || null)
            .input('photo', sql.NVarChar(sql.MAX), photo || null)
            .input('level', sql.Int, level)
            .input('parentId', sql.Int, parentId || null)
            .input('position', sql.NVarChar, position || null)
            .input('order', sql.Int, order || 0)
            .input('prefix', sql.NVarChar, prefix || null)
            .query(`
                INSERT INTO OrgChart (Name, Title, SpecialTitle, Photo, Level, ParentId, Position, [Order], Prefix)
                OUTPUT INSERTED.*
                VALUES (@name, @title, @specialTitle, @photo, @level, @parentId, @position, @order, @prefix)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error adding person:', err);
        res.status(500).json({ message: 'Error adding person to org chart' });
    }
});

// PUT - Update person
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, photo, level, parentId, position, order, prefix, specialTitle } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('title', sql.NVarChar, title)
            .input('specialTitle', sql.NVarChar, specialTitle || null)
            .input('photo', sql.NVarChar(sql.MAX), photo)
            .input('level', sql.Int, level)
            .input('parentId', sql.Int, parentId || null)
            .input('position', sql.NVarChar, position)
            .input('order', sql.Int, order)
            .input('prefix', sql.NVarChar, prefix)
            .query(`
                UPDATE OrgChart
                SET Name = @name, Title = @title, SpecialTitle = @specialTitle, Photo = @photo,
                    Level = @level, ParentId = @parentId, Position = @position, [Order] = @order,
                    Prefix = @prefix, UpdatedAt = GETDATE()
                WHERE Id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json({ message: 'Person updated successfully' });
    } catch (err) {
        console.error('Error updating person:', err);
        res.status(500).json({ message: 'Error updating person' });
    }
});

// DELETE - Remove person
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const checkChildren = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT COUNT(*) as count FROM OrgChart WHERE ParentId = @id');

        if (checkChildren.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete person with subordinates' });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM OrgChart WHERE Id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json({ message: 'Person deleted successfully' });
    } catch (err) {
        console.error('Error deleting person:', err);
        res.status(500).json({ message: 'Error deleting person' });
    }
});

// POST - Upload photo (returns Base64 data-URL to store in frontend, then save via PUT)
router.post('/upload', verifyToken, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const dataUrl = toBase64DataUrl(req.file);
        res.json({ path: dataUrl });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

module.exports = router;
