const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const path = require('path');

const upload = createUpload();

// GET /api/storage - List files
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const pool = await poolPromise;
        let query = 'SELECT id, file_name, original_name, file_type, file_size, upload_date FROM Files';

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

        const { size, mimetype, originalname: rawOriginalName } = req.file;
        const originalname = Buffer.from(rawOriginalName, 'latin1').toString('utf8');

        const formattedSize = size < 1024 * 1024
            ? (size / 1024).toFixed(2) + ' KB'
            : (size / (1024 * 1024)).toFixed(2) + ' MB';

        let fileType = 'Other';
        if (mimetype.includes('pdf')) fileType = 'PDF';
        else if (mimetype.includes('image')) fileType = 'Image';
        else if (mimetype.includes('word') || mimetype.includes('document')) fileType = 'Doc';
        else if (mimetype.includes('sheet') || mimetype.includes('excel')) fileType = 'Excel';

        const fileData = toBase64DataUrl(req.file);

        const pool = await poolPromise;
        await pool.request()
            .input('file_name', sql.NVarChar, originalname)
            .input('original_name', sql.NVarChar, originalname)
            .input('file_path', sql.NVarChar(sql.MAX), fileData) // store data-url in file_path for backward compat
            .input('file_data', sql.NVarChar(sql.MAX), fileData)
            .input('file_type', sql.NVarChar, fileType)
            .input('file_size', sql.NVarChar, formattedSize)
            .query(`
                INSERT INTO Files (file_name, original_name, file_path, file_data, file_type, file_size)
                VALUES (@file_name, @original_name, @file_path, @file_data, @file_type, @file_size)
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

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id FROM Files WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Files WHERE id = @id');

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/storage/download/:id - Download file from DB data
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
        const dataUrl = file.file_data || file.file_path;

        if (!dataUrl || !dataUrl.startsWith('data:')) {
            return res.status(404).json({ message: 'File data not found in database' });
        }

        // Parse data-URL: data:<mime>;base64,<data>
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            return res.status(500).json({ message: 'Invalid file data format' });
        }

        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_name)}"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
