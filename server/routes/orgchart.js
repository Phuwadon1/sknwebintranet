const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to server/uploads/orgchart instead of public
        const uploadDir = path.join(__dirname, '../uploads/orgchart');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// GET all org chart data
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM OrgChart ORDER BY Level, [Order]');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching org chart:', err);
        res.status(500).json({ message: 'Error fetching org chart data' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST - Add new person
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, title, photo, level, parentId, position, order, prefix, specialTitle } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('title', sql.NVarChar, title)
            .input('specialTitle', sql.NVarChar, specialTitle || null)
            .input('photo', sql.NVarChar, photo || null)
            .input('level', sql.Int, level)
            .input('parentId', sql.Int, parentId || null)
            .input('position', sql.NVarChar, position || null)
            .input('order', sql.Int, order || 0)
            .input('prefix', sql.NVarChar, prefix || null)
            .query(`
                INSERT INTO OrgChart (Name, Title, SpecialTitle, Photo, Level, ParentId, Position, [Order], Prefix)
                OUTPUT INSERTED.*
                VALUES (@name, @title, @specialTitle, @photo, @level, @parentId, @position, @order, @prefix)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error adding person:', err);
        res.status(500).json({ message: 'Error adding person to org chart' });
    }
});

// PUT - Update person
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, title, photo, level, parentId, position, order, prefix, specialTitle } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('title', sql.NVarChar, title)
            .input('specialTitle', sql.NVarChar, specialTitle || null)
            .input('photo', sql.NVarChar, photo)
            .input('level', sql.Int, level)
            .input('parentId', sql.Int, parentId || null)
            .input('position', sql.NVarChar, position)
            .input('order', sql.Int, order)
            .input('prefix', sql.NVarChar, prefix)
            .query(`
                UPDATE OrgChart
                SET Name = @name,
                    Title = @title,
                    SpecialTitle = @specialTitle,
                    Photo = @photo,
                    Level = @level,
                    ParentId = @parentId,
                    Position = @position,
                    [Order] = @order,
                    Prefix = @prefix,
                    UpdatedAt = GETDATE()
                WHERE Id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json({ message: 'Person updated successfully' });
    } catch (err) {
        console.error('Error updating person:', err);
        res.status(500).json({ message: 'Error updating person' });
    }
});

// DELETE - Remove person
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        // Check if person has children
        const checkChildren = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT COUNT(*) as count FROM OrgChart WHERE ParentId = @id');

        if (checkChildren.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Cannot delete person with subordinates' });
        }

        // Get photo path to delete file
        const person = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT Photo FROM OrgChart WHERE Id = @id');

        if (person.recordset[0]?.Photo) {
            // Fix: Point to server/uploads instead of public
            // Photo string starts with /uploads/orgchart/...
            // So we need to join with server root, which is __dirname/..
            const photoPath = path.join(__dirname, '..', person.recordset[0].Photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Delete person
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM OrgChart WHERE Id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json({ message: 'Person deleted successfully' });
    } catch (err) {
        console.error('Error deleting person:', err);
        res.status(500).json({ message: 'Error deleting person' });
    }
});

// POST - Upload photo
router.post('/upload', verifyToken, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `/uploads/orgchart/${req.file.filename}`;
        res.json({ path: filePath });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

module.exports = router;
