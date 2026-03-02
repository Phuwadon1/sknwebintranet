
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
        // Handle Thai characters
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, 'activity-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET photos by category
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Category', sql.NVarChar, category)
            .query('SELECT * FROM ActivityPhotos WHERE category = @Category ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST upload photo
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    const { category, title } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/${file.filename}`;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Category', sql.NVarChar, category)
            .input('Title', sql.NVarChar, title || '')
            .input('ImagePath', sql.NVarChar, imagePath)
            .query('INSERT INTO ActivityPhotos (category, title, image_path) VALUES (@Category, @Title, @ImagePath)');

        res.json({ message: 'Photo uploaded successfully', imagePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE photo
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM ActivityPhotos WHERE id = @ID');
        res.json({ message: 'Photo deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
