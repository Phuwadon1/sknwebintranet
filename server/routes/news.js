const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload();

// GET all news
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const newsResult = await pool.request().query('SELECT * FROM News ORDER BY ID DESC');
        const attachResult = await pool.request().query('SELECT * FROM NewsAttachments');

        const news = newsResult.recordset.map(item => ({
            ...item,
            Attachments: attachResult.recordset.filter(a => a.NewsID === item.ID)
        }));

        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new news item
router.post('/', verifyToken, upload.array('files'), async (req, res) => {
    const { title, date, category } = req.body;
    let fileNames = req.body.fileNames;

    if (!fileNames) fileNames = [];
    else if (!Array.isArray(fileNames)) fileNames = [fileNames];

    const firstFile = req.files && req.files.length > 0 ? req.files[0] : null;
    const mainFilePath = firstFile ? toBase64DataUrl(firstFile) : '#';

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Category', sql.NVarChar, category)
            .input('FilePath', sql.NVarChar(sql.MAX), mainFilePath)
            .query('INSERT INTO News (Title, Date, Category, FilePath) OUTPUT INSERTED.ID VALUES (@Title, @Date, @Category, @FilePath)');

        const newsId = result.recordset[0].ID;

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const displayName = (fileNames[i] && fileNames[i].trim() !== '') ? fileNames[i] : file.originalname;
                const fileData = toBase64DataUrl(file);

                await pool.request()
                    .input('NewsID', sql.Int, newsId)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar(sql.MAX), fileData)
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

    if (!fileNames) fileNames = [];
    else if (!Array.isArray(fileNames)) fileNames = [fileNames];

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Date', sql.NVarChar, date)
            .input('Category', sql.NVarChar, category)
            .query('UPDATE News SET Title = @Title, Date = @Date, Category = @Category WHERE ID = @ID');

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const displayName = (fileNames[i] && fileNames[i].trim() !== '') ? fileNames[i] : file.originalname;
                const fileData = toBase64DataUrl(file);

                await pool.request()
                    .input('NewsID', sql.Int, id)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar(sql.MAX), fileData)
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
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM News WHERE ID = @ID');
        res.json({ message: 'News deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
