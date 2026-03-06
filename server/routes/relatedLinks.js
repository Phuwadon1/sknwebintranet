const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload('disk');

// GET all links
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT ID, Title,
                CASE 
                    WHEN DATALENGTH(Url) > 1000 THEN '/api/related-links/' + CAST(ID AS VARCHAR) + '/file' 
                    ELSE Url 
                END AS Url 
            FROM RelatedLinks ORDER BY ID DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET specific link file (for legacy Base64 files)
router.get('/:id/file', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT Url FROM RelatedLinks WHERE ID = @id');

        if (result.recordset.length > 0) {
            const fileStr = result.recordset[0].Url;
            if (fileStr && fileStr.startsWith('data:')) {
                const parts = fileStr.split(',');
                if (parts.length === 2) {
                    const mimeTypeMatches = parts[0].match(/:(.*?);/);
                    if (mimeTypeMatches && mimeTypeMatches.length > 1) {
                        const mimeType = mimeTypeMatches[1];
                        const buffer = Buffer.from(parts[1], 'base64');
                        res.setHeader('Content-Type', mimeType);
                        if (mimeType.includes('pdf')) {
                            res.setHeader('Content-Disposition', 'inline; filename="document-' + req.params.id + '.pdf"');
                        } else {
                            res.setHeader('Content-Disposition', 'inline; filename="document-' + req.params.id + '"');
                        }
                        return res.send(buffer);
                    }
                }
            }
            res.redirect(fileStr || '#');
        } else {
            res.status(404).send('File not found');
        }
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
            finalUrl = `/uploads/${req.file.filename}`;
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
            finalUrl = `/uploads/${req.file.filename}`;
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
