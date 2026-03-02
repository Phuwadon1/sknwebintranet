const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db'); // Assuming db.js exports poolPromise
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const verifyToken = require('../middleware/authMiddleware'); // Assuming this exists

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/health_knowledge');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET All Items
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM HealthKnowledge ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST Create Item (Admin Only - simplified verifyToken usage)
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, category, content, link } = req.body;
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const docFile = req.files['file'] ? req.files['file'][0] : null;

        let imagePath = imageFile ? `/uploads/health_knowledge/${imageFile.filename}` : null;
        let filePath = docFile ? `/uploads/health_knowledge/${docFile.filename}` : (link || null);

        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('category', sql.NVarChar, category)
            .input('content', sql.NVarChar, content)
            .input('file_path', sql.NVarChar, filePath)
            .input('image_path', sql.NVarChar, imagePath)
            .query(`INSERT INTO HealthKnowledge (title, category, content, file_path, image_path, created_at) 
                    VALUES (@title, @category, @content, @file_path, @image_path, GETDATE())`);

        res.json({ message: 'Created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT Update Item
router.put('/:id', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, link } = req.body;
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const docFile = req.files['file'] ? req.files['file'][0] : null;

        const pool = await poolPromise;

        // Build update query dynamically
        let query = `UPDATE HealthKnowledge SET 
                     title = @title, 
                     category = @category, 
                     content = @content, 
                     updated_at = GETDATE()`;

        const request = pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('category', sql.NVarChar, category)
            .input('content', sql.NVarChar, content);

        if (imageFile) {
            const imagePath = `/uploads/health_knowledge/${imageFile.filename}`;
            request.input('image_path', sql.NVarChar, imagePath);
            query += `, image_path = @image_path`;
        }

        if (docFile) {
            const filePath = `/uploads/health_knowledge/${docFile.filename}`;
            request.input('file_path', sql.NVarChar, filePath);
            query += `, file_path = @file_path`;
        } else if (link) {
            request.input('link_path', sql.NVarChar, link);
            query += `, file_path = @link_path`;
        }

        query += ` WHERE id = @id`;

        await request.query(query);
        res.json({ message: 'Updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE Item
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Get file paths to delete
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT image_path, file_path FROM HealthKnowledge WHERE id = @id');

        if (result.recordset.length > 0) {
            const { image_path, file_path } = result.recordset[0];

            // Helper to delete file
            const deleteFile = (relativePath) => {
                if (!relativePath) return;
                // Check if it's a local file (starts with /uploads)
                if (relativePath.startsWith('/uploads/')) {
                    const absolutePath = path.join(__dirname, '..', relativePath);
                    if (fs.existsSync(absolutePath)) {
                        try {
                            fs.unlinkSync(absolutePath);
                        } catch (e) { console.error("Error deleting file:", e); }
                    }
                }
            };

            deleteFile(image_path);
            deleteFile(file_path);
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM HealthKnowledge WHERE id = @id');

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
