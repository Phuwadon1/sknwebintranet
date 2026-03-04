const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { createUpload, toBase64DataUrl } = require('../middleware/uploadMiddleware');

const upload = createUpload({
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// GET - Get all executives
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ExecutiveBoard ORDER BY level ASC, position_order ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST - Add new executive
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { name, position, parent_id, position_order, level } = req.body;

        const imagePath = req.file ? toBase64DataUrl(req.file) : null;

        const parsedPositionOrder = position_order !== undefined && position_order !== null && position_order !== ''
            ? parseInt(position_order) : 0;
        const parsedLevel = level !== undefined && level !== null && level !== ''
            ? parseInt(level) : 0;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', name)
            .input('position', position)
            .input('image_path', sql.NVarChar(sql.MAX), imagePath)
            .input('parent_id', parent_id || null)
            .input('position_order', parsedPositionOrder)
            .input('level', parsedLevel)
            .query('INSERT INTO ExecutiveBoard (name, position, image_path, parent_id, position_order, level) VALUES (@name, @position, @image_path, @parent_id, @position_order, @level); SELECT SCOPE_IDENTITY() AS id;');

        res.json({
            id: result.recordset[0].id,
            name, position,
            image_path: imagePath,
            parent_id,
            position_order: parsedPositionOrder,
            level: parsedLevel
        });
    } catch (error) {
        console.error('Error adding executive:', error);
        res.status(500).json({ error: 'Failed to add executive' });
    }
});

// PUT - Update executive
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const execId = req.params.id;
        const { name, position, parent_id, position_order, level } = req.body;

        const pool = await poolPromise;

        // Get current executive data
        const currentExec = await pool.request()
            .input('id', execId)
            .query('SELECT * FROM ExecutiveBoard WHERE id = @id');

        if (currentExec.recordset.length === 0) {
            return res.status(404).json({ error: 'Executive not found' });
        }

        const exec = currentExec.recordset[0];
        let newImagePath = exec.image_path;

        if (req.file) {
            newImagePath = toBase64DataUrl(req.file);
        }

        const parsedPositionOrder = position_order !== undefined && position_order !== null && position_order !== ''
            ? parseInt(position_order) : 0;
        const parsedLevel = level !== undefined && level !== null && level !== ''
            ? parseInt(level) : 0;

        await pool.request()
            .input('id', execId)
            .input('name', name)
            .input('position', position)
            .input('image_path', sql.NVarChar(sql.MAX), newImagePath)
            .input('parent_id', parent_id || null)
            .input('position_order', parsedPositionOrder)
            .input('level', parsedLevel)
            .query('UPDATE ExecutiveBoard SET name = @name, position = @position, image_path = @image_path, parent_id = @parent_id, position_order = @position_order, level = @level WHERE id = @id');

        res.json({
            id: execId, name, position,
            image_path: newImagePath,
            parent_id,
            position_order: parsedPositionOrder,
            level: parsedLevel
        });
    } catch (error) {
        console.error('Error updating executive:', error);
        res.status(500).json({ error: 'Failed to update executive' });
    }
});

// DELETE - Delete executive
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        const children = await pool.request()
            .input('parent_id', req.params.id)
            .query('SELECT COUNT(*) as count FROM ExecutiveBoard WHERE parent_id = @parent_id');

        if (children.recordset[0].count > 0) {
            return res.status(400).json({ error: 'Cannot delete executive with subordinates' });
        }

        await pool.request()
            .input('id', req.params.id)
            .query('DELETE FROM ExecutiveBoard WHERE id = @id');

        res.json({ message: 'Executive deleted successfully' });
    } catch (err) {
        console.error('Error deleting executive:', err);
        res.status(500).json({ error: 'Failed to delete executive' });
    }
});

module.exports = router;
