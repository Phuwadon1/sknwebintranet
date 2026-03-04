const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload();

// GET all banners
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM BannerLinks ORDER BY ID DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST new banner
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { title, url } = req.body;
        let imageUrl = req.file ? toBase64DataUrl(req.file) : (url || '');

        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl)
            .input('targetUrl', sql.NVarChar, url || '')
            .query('INSERT INTO BannerLinks (Title, ImageUrl, TargetUrl) VALUES (@title, @imageUrl, @targetUrl)');

        res.status(201).json({ message: 'Banner created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// PUT update banner
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url } = req.body;
        let imageUrl = req.body.existingImage;

        if (req.file) {
            imageUrl = toBase64DataUrl(req.file);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl)
            .input('targetUrl', sql.NVarChar, url)
            .query('UPDATE BannerLinks SET Title = @title, ImageUrl = @imageUrl, TargetUrl = @targetUrl WHERE ID = @id');

        res.json({ message: 'Banner updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// DELETE banner
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM BannerLinks WHERE ID = @id');

        res.json({ message: 'Banner deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
