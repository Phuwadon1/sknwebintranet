const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

// Verify token middleware
const verifyToken = require('../middleware/authMiddleware');

const upload = createUpload();

// GET /api/chief - Get profile data
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 1 * FROM ChiefProfile ORDER BY id DESC');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/chief - Update profile (Protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    if (req.user.role !== '2') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    try {
        const { header_text, name, position } = req.body;
        const file = req.file;

        const pool = await poolPromise;

        // 1. Check if profile exists
        const check = await pool.request().query('SELECT TOP 1 id FROM ChiefProfile');

        let imagePath = null;
        if (file) {
            imagePath = toBase64DataUrl(file);
        }

        if (check.recordset.length > 0) {
            const id = check.recordset[0].id;
            const request = pool.request()
                .input('id', sql.Int, id)
                .input('header_text', sql.NVarChar, header_text)
                .input('name', sql.NVarChar, name)
                .input('position', sql.NVarChar, position);

            let query = `UPDATE ChiefProfile SET 
                         header_text = @header_text, 
                         name = @name, 
                         position = @position,
                         updated_at = GETDATE()`;

            if (req.body.delete_image === 'true') {
                query += `, image_path = NULL`;
            } else if (imagePath) {
                request.input('image_path', sql.NVarChar(sql.MAX), imagePath);
                query += `, image_path = @image_path`;
            }

            query += ` WHERE id = @id`;
            await request.query(query);
        } else {
            await pool.request()
                .input('header_text', sql.NVarChar, header_text)
                .input('name', sql.NVarChar, name)
                .input('position', sql.NVarChar, position)
                .input('image_path', sql.NVarChar(sql.MAX), imagePath || null)
                .query(`INSERT INTO ChiefProfile (header_text, name, position, image_path) 
                        VALUES (@header_text, @name, @position, @image_path)`);
        }

        res.json({ message: 'บันทึกข้อมูลสำเร็จ (Profile updated successfully)', imagePath });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
