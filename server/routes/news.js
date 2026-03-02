const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');

// Configure Multer (Same as schedules.js)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Fix Thai filename encoding
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // Prevent generic overwrites if possible, but user insisted on original names for schedules. 
        // For news, might be safer to keep original too.
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET all news
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const newsResult = await pool.request().query('SELECT * FROM News ORDER BY ID DESC');
        const attachResult = await pool.request().query('SELECT * FROM NewsAttachments');

        const news = newsResult.recordset.map(item => {
            return {
                ...item,
                Attachments: attachResult.recordset.filter(a => a.NewsID === item.ID)
            };
        });

        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST new news item
router.post('/', verifyToken, upload.array('files'), async (req, res) => {
    console.log('--- POST /api/news CALLED ---');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { title, date, category } = req.body;
    let fileNames = req.body.fileNames;

    // Normalize fileNames to array
    if (!fileNames) {
        fileNames = [];
    } else if (!Array.isArray(fileNames)) {
        fileNames = [fileNames];
    }

    // For backward compatibility or primary display, use the first file as main FilePath, or just '#'
    const firstFile = req.files && req.files.length > 0 ? req.files[0] : null;
    const mainFilePath = firstFile ? `/uploads/${firstFile.filename}` : '#';

    try {
        const pool = await poolPromise;

        // 1. Insert News
        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Category', sql.NVarChar, category)
            .input('FilePath', sql.NVarChar, mainFilePath)
            .query('INSERT INTO News (Title, Date, Category, FilePath) OUTPUT INSERTED.ID VALUES (@Title, @Date, @Category, @FilePath)');

        const newsId = result.recordset[0].ID;

        // 2. Insert Attachments
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                // Use custom name if provided, else original name
                const displayName = (fileNames[i] && fileNames[i].trim() !== '') ? fileNames[i] : file.originalname;
                const filePath = `/uploads/${file.filename}`;

                await pool.request()
                    .input('NewsID', sql.Int, newsId)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar, filePath)
                    .query('INSERT INTO NewsAttachments (NewsID, FileName, FilePath) VALUES (@NewsID, @FileName, @FilePath)');
            }
        }

        res.json({ message: 'News added successfully', id: newsId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// PUT update news item
router.put('/:id', verifyToken, upload.array('files'), async (req, res) => {
    const { id } = req.params;
    const { title, date, category } = req.body;
    let fileNames = req.body.fileNames;

    // Normalize fileNames to array
    if (!fileNames) {
        fileNames = [];
    } else if (!Array.isArray(fileNames)) {
        fileNames = [fileNames];
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Category', sql.NVarChar, category)
            // .input('FilePath', sql.NVarChar, newFilePath) // Skip updating main file path for now unless we decide policy
            .query('UPDATE News SET Title = @Title, Date = @Date, Category = @Category WHERE ID = @ID');

        // Add new attachments if any
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const displayName = (fileNames[i] && fileNames[i].trim() !== '') ? fileNames[i] : file.originalname;
                const filePath = `/uploads/${file.filename}`;

                await pool.request()
                    .input('NewsID', sql.Int, id)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar, filePath)
                    .query('INSERT INTO NewsAttachments (NewsID, FileName, FilePath) VALUES (@NewsID, @FileName, @FilePath)');
            }
        }

        res.json({ message: 'News updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE news item
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        // Delete Attachments first (though ON DELETE CASCADE might handle it if set, but explicit is safe)
        // I set ON DELETE CASCADE in creation script, so deleting News is enough.
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM News WHERE ID = @ID');
        res.json({ message: 'News deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
