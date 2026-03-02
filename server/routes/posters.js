const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/posters');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            // Allow images
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for image field'));
            }
        } else if (file.fieldname === 'pdf') {
            // Allow PDFs
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files are allowed for PDF field'));
            }
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

const verifyToken = require('../middleware/authMiddleware');

// POST - Add new poster
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, link_url } = req.body;

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const imagePath = `/uploads/posters/${req.files.image[0].filename}`;

        // Handle PDF upload or external link
        let finalLinkUrl = link_url || null;
        if (req.files.pdf && req.files.pdf[0]) {
            // If PDF is uploaded, use full URL to backend server
            finalLinkUrl = `/uploads/posters/${req.files.pdf[0].filename}`;
        }

        const pool = await poolPromise; // Using existing poolPromise
        const result = await pool.request()
            .input('title', title || req.files.image[0].filename) // Assuming title is string
            .input('image_path', imagePath) // Assuming imagePath is string
            .input('link_url', finalLinkUrl) // Assuming finalLinkUrl is string or null
            .query('INSERT INTO Posters (title, image_path, link_url) VALUES (@title, @image_path, @link_url); SELECT SCOPE_IDENTITY() AS id;');

        res.json({
            id: result.recordset[0].id,
            title: title || req.files.image[0].filename,
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

        // Get current poster data
        const currentPoster = await pool.request()
            .input('id', posterId)
            .query('SELECT * FROM Posters WHERE id = @id');

        if (currentPoster.recordset.length === 0) {
            return res.status(404).json({ error: 'Poster not found' });
        }

        const poster = currentPoster.recordset[0];
        let newImagePath = poster.image_path;
        let newLinkUrl = link_url !== undefined ? link_url : poster.link_url; // Use new link_url if provided, else keep old
        let newTitle = title !== undefined ? title : poster.title; // Use new title if provided, else keep old

        // Handle image update
        if (req.files && req.files.image) {
            newImagePath = `/uploads/posters/${req.files.image[0].filename}`;

            // Delete old image
            if (poster.image_path) {
                const oldImagePath = path.join(__dirname, '..', poster.image_path);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Handle PDF update
        if (req.files && req.files.pdf) {
            // Delete old PDF if it exists and is a file path (not external URL)
            if (poster.link_url && (poster.link_url.startsWith('/uploads') || poster.link_url.includes('localhost:3001/uploads'))) {
                const oldPdfPath = poster.link_url.startsWith('/uploads')
                    ? path.join(__dirname, '..', poster.link_url)
                    : path.join(__dirname, '..', '/uploads', poster.link_url.split('/uploads/')[1]);

                if (fs.existsSync(oldPdfPath)) {
                    fs.unlinkSync(oldPdfPath);
                }
            }

            newLinkUrl = `/uploads/posters/${req.files.pdf[0].filename}`;
        }

        // Update database
        await pool.request()
            .input('id', posterId)
            .input('title', newTitle)
            .input('image_path', newImagePath)
            .input('link_url', newLinkUrl)
            .query('UPDATE Posters SET title = @title, image_path = @image_path, link_url = @link_url WHERE id = @id');

        res.json({
            id: posterId,
            title: newTitle,
            image_path: newImagePath,
            link_url: newLinkUrl
        });
    } catch (error) {
        console.error('Error updating poster:', error);
        res.status(500).json({ error: 'Failed to update poster' });
    }
});
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Get image path to delete file
        const result = await pool.request()
            .input('id', id)
            .query('SELECT image_path FROM Posters WHERE id = @id');

        if (result.recordset.length > 0) {
            const imagePath = result.recordset[0].image_path;
            const fullPath = path.join(__dirname, '..', imagePath);

            // Delete file from filesystem
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        // Delete from database
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Posters WHERE id = @id');

        res.json({ message: 'Poster deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
