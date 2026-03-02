const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sql, poolPromise } = require('../db');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/files/';
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use verify-friendly numbering or timestamp to avoid collisions, preserving extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET /api/storage - List files
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const pool = await poolPromise;
        let query = 'SELECT * FROM Files';

        if (search) {
            query += ` WHERE file_name LIKE @search OR original_name LIKE @search`;
        }

        query += ' ORDER BY upload_date DESC';

        const request = pool.request();
        if (search) {
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST /api/storage - Upload file
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { filename, path: filePath, size, mimetype } = req.file;
        // Ensure originalname is correctly encoded (if not already modified by storage engine)
        const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        // Format size
        const formattedSize = size < 1024 * 1024
            ? (size / 1024).toFixed(2) + ' KB'
            : (size / (1024 * 1024)).toFixed(2) + ' MB';

        // file_type simplification (PDF, Image, Doc, Other)
        let fileType = 'Other';
        if (mimetype.includes('pdf')) fileType = 'PDF';
        else if (mimetype.includes('image')) fileType = 'Image';
        else if (mimetype.includes('word') || mimetype.includes('document')) fileType = 'Doc';
        else if (mimetype.includes('sheet') || mimetype.includes('excel')) fileType = 'Excel';

        const pool = await poolPromise;
        await pool.request()
            .input('file_name', sql.NVarChar, filename)
            .input('original_name', sql.NVarChar, originalname)
            .input('file_path', sql.NVarChar, filePath) // Store relative path
            .input('file_type', sql.NVarChar, fileType)
            .input('file_size', sql.NVarChar, formattedSize)
            .query(`
                INSERT INTO Files (file_name, original_name, file_path, file_type, file_size)
                VALUES (@file_name, @original_name, @file_path, @file_type, @file_size)
            `);

        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/storage/:id - Delete file
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Get file path first
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT file_path FROM Files WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filePath = result.recordset[0].file_path;

        // Delete from DB
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Files WHERE id = @id');

        // Delete from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/storage/download/:id - Download file
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Files WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = result.recordset[0];
        const filePath = path.resolve(file.file_path);

        if (fs.existsSync(filePath)) {
            res.download(filePath, file.original_name);
        } else {
            res.status(404).json({ message: 'File not found on server' });
        }
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
