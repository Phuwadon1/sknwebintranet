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
        // Fix Thai filename encoding if needed (similar to news.js)
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // Use original name or unique name. Here we use original name to keep it simple and recognizable
        cb(null, 'related-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET all links
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM RelatedLinks ORDER BY ID DESC'); // Newest first
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST new link
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        // Note: req.body will contain text fields
        const { title, url } = req.body;
        let finalUrl = url || '#';

        // If file is uploaded, use its path
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('url', sql.NVarChar, finalUrl)
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

        // If file is provided, update path. If not, use existing URL (passed from client or ignored if we query DB, but client usually sends old one)
        // However, if client switches to "File" type but doesn't upload new file, or switches to "Link", we need logic.
        // Simplest: Client sends 'url' if it's a link or old file path.
        // If 'file' is in request, it overrides 'url'.

        let finalUrl = url;
        if (req.file) {
            finalUrl = `/uploads/${req.file.filename}`;
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('url', sql.NVarChar, finalUrl)
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
