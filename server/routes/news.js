const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload('disk');

// GET all news (Metadata only - Exclude huge FilePath/Attachments data)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const newsResult = await pool.request().query(`
            SELECT ID, Title, Date, Category,
                CASE 
                    WHEN DATALENGTH(FilePath) > 1000 THEN '/api/news/' + CAST(ID AS VARCHAR) + '/file' 
                    ELSE FilePath 
                END AS FilePath 
            FROM News ORDER BY ID DESC
        `);
        const attachResult = await pool.request().query(`
            SELECT ID, NewsID, FileName,
                CASE 
                    WHEN DATALENGTH(FilePath) > 1000 THEN '/api/news/attachment/' + CAST(ID AS VARCHAR) + '/file' 
                    ELSE FilePath 
                END AS FilePath 
            FROM NewsAttachments
        `);

        const news = newsResult.recordset.map(item => ({
            ...item,
            Attachments: attachResult.recordset.filter(a => a.NewsID === item.ID)
        }));

        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET specific news data (including FilePath and Attachments metadata)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const newsResult = await pool.request().input('id', sql.Int, id).query('SELECT * FROM News WHERE ID = @id');
        const attachResult = await pool.request().input('id', sql.Int, id).query('SELECT ID, NewsID, FileName FROM NewsAttachments WHERE NewsID = @id');

        if (newsResult.recordset.length > 0) {
            const news = {
                ...newsResult.recordset[0],
                Attachments: attachResult.recordset
            };
            res.json(news);
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Function to handle base64 binary streaming
function sendBase64File(res, fileStr, defaultFilename) {
    if (fileStr && fileStr.startsWith('data:')) {
        const parts = fileStr.split(',');
        if (parts.length === 2) {
            const mimeTypeMatches = parts[0].match(/:(.*?);/);
            if (mimeTypeMatches && mimeTypeMatches.length > 1) {
                const mimeType = mimeTypeMatches[1];
                const buffer = Buffer.from(parts[1], 'base64');
                res.setHeader('Content-Type', mimeType);
                if (mimeType.includes('pdf')) {
                    res.setHeader('Content-Disposition', 'inline; filename="' + defaultFilename + '.pdf"');
                } else {
                    res.setHeader('Content-Disposition', 'inline; filename="' + defaultFilename + '"');
                }
                return res.send(buffer);
            }
        }
    }
    res.redirect(fileStr || '#');
}

// GET specific news preview image/file
router.get('/:id/file', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.Int, req.params.id).query('SELECT FilePath FROM News WHERE ID = @id');
        if (result.recordset.length > 0) {
            sendBase64File(res, result.recordset[0].FilePath, `news-${req.params.id}`);
        } else { res.status(404).json({ message: 'File not found' }); }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET specific attachment file
router.get('/attachment/:id/file', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.Int, req.params.id).query('SELECT FileName, FilePath FROM NewsAttachments WHERE ID = @id');
        if (result.recordset.length > 0) {
            sendBase64File(res, result.recordset[0].FilePath, result.recordset[0].FileName || `attachment-${req.params.id}`);
        } else { res.status(404).json({ message: 'File not found' }); }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST new news item
router.post('/', verifyToken, upload.array('files'), async (req, res) => {
    const { title, date, category } = req.body;
    let fileNames = req.body.fileNames;

    if (!fileNames) fileNames = [];
    else if (!Array.isArray(fileNames)) fileNames = [fileNames];

    const firstFile = req.files && req.files.length > 0 ? req.files[0] : null;
    const mainFilePath = firstFile ? `/uploads/${firstFile.filename}` : '#';

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
                const filePath = `/uploads/${file.filename}`;

                await pool.request()
                    .input('NewsID', sql.Int, newsId)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar(sql.MAX), filePath)
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
                const filePath = `/uploads/${file.filename}`;

                await pool.request()
                    .input('NewsID', sql.Int, id)
                    .input('FileName', sql.NVarChar, displayName)
                    .input('FilePath', sql.NVarChar(sql.MAX), filePath)
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
