
const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const fs = require('fs');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Handle Thai characters
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, 'dept-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// GET all departments
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Departments ORDER BY id ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new department
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    const { title, content, phone_internal, title_color } = req.body;
    const file = req.file;

    // Fix: Handle case where title_color is received as an array
    const cleanTitleColor = Array.isArray(title_color) ? title_color[0] : (title_color || '#000000');

    console.log('DEBUG: POST /api/departments');
    console.log('Title:', title);
    console.log('TitleColor (Raw):', title_color);
    console.log('TitleColor (Clean):', cleanTitleColor);

    // Default image path if no file uploaded (optional, or make it required)
    let imagePath = null;
    if (file) {
        imagePath = `/uploads/${file.filename}`;
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Title', sql.NVarChar, title)
            .input('Content', sql.NVarChar(sql.MAX), content) // HTML content
            .input('PhoneInternal', sql.NVarChar, phone_internal)
            .input('TitleColor', sql.NVarChar(50), cleanTitleColor)
            .input('ImagePath', sql.NVarChar, imagePath)
            .query('INSERT INTO Departments (title, content, phone_internal, image_path, title_color) VALUES (@Title, @Content, @PhoneInternal, @ImagePath, @TitleColor)');

        res.json({ message: 'Department created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE department
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        // Get image path to delete file
        const result = await pool.request()
            .input('ID', sql.Int, id)
            .query('SELECT image_path FROM Departments WHERE id = @ID');

        if (result.recordset.length > 0) {
            const imagePath = result.recordset[0].image_path;
            if (imagePath) {
                const filePath = path.join(__dirname, '..', imagePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM Departments WHERE id = @ID');

        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update department
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, content, phone_internal, title_color } = req.body;
    const file = req.file;

    // Fix: Handle case where title_color is received as an array
    const cleanTitleColor = Array.isArray(title_color) ? title_color[0] : (title_color || '#000000');

    console.log('DEBUG: PUT /api/departments/' + id);
    console.log('TitleColor (Raw):', title_color);
    console.log('TitleColor (Clean):', cleanTitleColor);

    try {
        const pool = await poolPromise;

        let query = 'UPDATE Departments SET title = @Title, content = @Content, phone_internal = @PhoneInternal, title_color = @TitleColor, updated_at = GETDATE()';

        if (file) {
            // If new image uploaded, delete old one
            const oldData = await pool.request()
                .input('ID_Check', sql.Int, id)
                .query('SELECT image_path FROM Departments WHERE id = @ID_Check');

            if (oldData.recordset.length > 0) {
                const oldImagePath = oldData.recordset[0].image_path;
                if (oldImagePath) {
                    const oldFilePath = path.join(__dirname, '..', oldImagePath);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }

            const imagePath = `/uploads/${file.filename}`;
            query += ', image_path = @ImagePath';

            await pool.request()
                .input('ID', sql.Int, id)
                .input('Title', sql.NVarChar, title)
                .input('Content', sql.NVarChar(sql.MAX), content)
                .input('PhoneInternal', sql.NVarChar, phone_internal)
                .input('TitleColor', sql.NVarChar(50), cleanTitleColor)
                .input('ImagePath', sql.NVarChar, imagePath)
                .query(query + ' WHERE id = @ID');
        } else {
            await pool.request()
                .input('ID', sql.Int, id)
                .input('Title', sql.NVarChar, title)
                .input('Content', sql.NVarChar(sql.MAX), content)
                .input('PhoneInternal', sql.NVarChar, phone_internal)
                .input('TitleColor', sql.NVarChar(50), cleanTitleColor)
                .query(query + ' WHERE id = @ID');
        }

        res.json({ message: 'Department updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
