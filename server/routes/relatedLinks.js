const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload();

// GET all links
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM RelatedLinks ORDER BY ID DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST new link
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { title, url } = req.body;
        let finalUrl = url || '#';

        if (req.file) {
            finalUrl = toBase64DataUrl(req.file);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('url', sql.NVarChar(sql.MAX), finalUrl)
            .query('INSERT INTO RelatedLinks (Title, Url) VALUES (@title, @url)');

        res.status(201).json({ message: 'Link created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// PUT update link
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url } = req.body;

        let finalUrl = url;
        if (req.file) {
            finalUrl = toBase64DataUrl(req.file);
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('url', sql.NVarChar(sql.MAX), finalUrl)
            .query('UPDATE RelatedLinks SET Title = @title, Url = @url WHERE ID = @id');

        res.json({ message: 'Link updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// DELETE link
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM RelatedLinks WHERE ID = @id');

        res.json({ message: 'Link deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
