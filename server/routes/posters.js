const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload({
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            if (file.mimetype.startsWith('image/')) cb(null, true);
            else cb(new Error('Only image files are allowed for image field'));
        } else if (file.fieldname === 'pdf') {
            if (file.mimetype === 'application/pdf') cb(null, true);
            else cb(new Error('Only PDF files are allowed for PDF field'));
        } else {
            cb(new Error('Unexpected field'));
        }
    }
});

// Get all posters
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Posters ORDER BY id ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST - Add new poster
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, link_url } = req.body;

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const imagePath = toBase64DataUrl(req.files.image[0]);

        let finalLinkUrl = link_url || null;
        if (req.files.pdf && req.files.pdf[0]) {
            finalLinkUrl = toBase64DataUrl(req.files.pdf[0]);
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar, title || req.files.image[0].originalname)
            .input('image_path', sql.NVarChar(sql.MAX), imagePath)
            .input('link_url', sql.NVarChar(sql.MAX), finalLinkUrl)
            .query('INSERT INTO Posters (title, image_path, link_url) VALUES (@title, @image_path, @link_url); SELECT SCOPE_IDENTITY() AS id;');

        res.json({
            id: result.recordset[0].id,
            title: title || req.files.image[0].originalname,
            image_path: imagePath,
            link_url: finalLinkUrl
        });
    } catch (error) {
        console.error('Error adding poster:', error);
        res.status(500).json({ error: 'Failed to add poster' });
    }
});

// PUT - Update existing poster
router.put('/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const posterId = req.params.id;
        const { link_url, title } = req.body;

        const pool = await poolPromise;

        const currentPoster = await pool.request()
            .input('id', posterId)
            .query('SELECT * FROM Posters WHERE id = @id');

        if (currentPoster.recordset.length === 0) {
            return res.status(404).json({ error: 'Poster not found' });
        }

        const poster = currentPoster.recordset[0];
        let newImagePath = poster.image_path;
        let newLinkUrl = link_url !== undefined ? link_url : poster.link_url;
        let newTitle = title !== undefined ? title : poster.title;

        if (req.files && req.files.image) {
            newImagePath = toBase64DataUrl(req.files.image[0]);
        }

        if (req.files && req.files.pdf) {
            newLinkUrl = toBase64DataUrl(req.files.pdf[0]);
        }

        await pool.request()
            .input('id', posterId)
            .input('title', sql.NVarChar, newTitle)
            .input('image_path', sql.NVarChar(sql.MAX), newImagePath)
            .input('link_url', sql.NVarChar(sql.MAX), newLinkUrl)
            .query('UPDATE Posters SET title = @title, image_path = @image_path, link_url = @link_url WHERE id = @id');

        res.json({ id: posterId, title: newTitle, image_path: newImagePath, link_url: newLinkUrl });
    } catch (error) {
        console.error('Error updating poster:', error);
        res.status(500).json({ error: 'Failed to update poster' });
    }
});

// DELETE poster
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Posters WHERE id = @id');
        res.json({ message: 'Poster deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
