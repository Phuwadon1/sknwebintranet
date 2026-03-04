const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload();

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

// POST Create Item
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const { title, category, content, link } = req.body;
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const docFile = req.files['file'] ? req.files['file'][0] : null;

        const imagePath = imageFile ? toBase64DataUrl(imageFile) : null;
        const filePath = docFile ? toBase64DataUrl(docFile) : (link || null);

        const pool = await poolPromise;
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('category', sql.NVarChar, category)
            .input('content', sql.NVarChar, content)
            .input('file_path', sql.NVarChar(sql.MAX), filePath)
            .input('image_path', sql.NVarChar(sql.MAX), imagePath)
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

        let query = `UPDATE HealthKnowledge SET 
                     title = @title, category = @category, content = @content, 
                     updated_at = GETDATE()`;

        const request = pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('category', sql.NVarChar, category)
            .input('content', sql.NVarChar, content);

        if (imageFile) {
            request.input('image_path', sql.NVarChar(sql.MAX), toBase64DataUrl(imageFile));
            query += `, image_path = @image_path`;
        }

        if (docFile) {
            request.input('file_path', sql.NVarChar(sql.MAX), toBase64DataUrl(docFile));
            query += `, file_path = @file_path`;
        } else if (link) {
            request.input('link_path', sql.NVarChar(sql.MAX), link);
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
