const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET /api/hemodialysis - Get queues for today
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Get today's queues
        const result = await pool.request().query(`
            SELECT * FROM HemodialysisQueues 
            WHERE queue_date = CAST(GETDATE() AS DATE)
            ORDER BY bed_number ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching queues:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/hemodialysis/stats - Get summary statistics
router.get('/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                COUNT(*) as total_patients,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as active_machines,
                SUM(CASE WHEN status = 'Waiting' THEN 1 ELSE 0 END) as waiting_queue,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
            FROM HemodialysisQueues
            WHERE queue_date = CAST(GETDATE() AS DATE)
        `);
        // We can hardcode total machines to 12 as per requirements/mock
        const stats = {
            total_machines: 12,
            ...result.recordset[0]
        };
        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const verifyToken = require('../middleware/authMiddleware');

// POST /api/hemodialysis - Add new queue
router.post('/', verifyToken, async (req, res) => {
    try {
        const { patient_name, bed_number, time_slot, status, note } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('patient_name', sql.NVarChar, patient_name)
            .input('bed_number', sql.NVarChar, bed_number)
            .input('time_slot', sql.NVarChar, time_slot)
            .input('status', sql.NVarChar, status || 'Waiting')
            .input('note', sql.NVarChar, note || '')
            .query(`
                INSERT INTO HemodialysisQueues (patient_name, bed_number, time_slot, status, note)
                VALUES (@patient_name, @bed_number, @time_slot, @status, @note)
            `);

        res.status(201).json({ message: 'Queue added successfully' });
    } catch (err) {
        console.error('Error adding queue:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/hemodialysis/:id - Update queue status or details
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { patient_name, bed_number, time_slot, status, note } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('patient_name', sql.NVarChar, patient_name)
            .input('bed_number', sql.NVarChar, bed_number)
            .input('time_slot', sql.NVarChar, time_slot)
            .input('status', sql.NVarChar, status)
            .input('note', sql.NVarChar, note)
            .query(`
                UPDATE HemodialysisQueues 
                SET patient_name = @patient_name,
                    bed_number = @bed_number,
                    time_slot = @time_slot,
                    status = @status,
                    note = @note
                WHERE id = @id
            `);

        res.json({ message: 'Queue updated successfully' });
    } catch (err) {
        console.error('Error updating queue:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/hemodialysis/:id - Delete queue
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM HemodialysisQueues WHERE id = @id');

        res.json({ message: 'Queue deleted successfully' });
    } catch (err) {
        console.error('Error deleting queue:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
