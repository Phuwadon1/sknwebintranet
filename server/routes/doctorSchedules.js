const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

const verifyToken = require('../middleware/authMiddleware');

// GET all schedules
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM DoctorSchedules ORDER BY DayOfWeek, ID');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// ADD a new schedule
router.post('/', verifyToken, async (req, res) => {
    const { doctor, specialty, time, status, day } = req.body;

    if (!doctor || !day) {
        return res.status(400).json({ message: 'Doctor Name and Day are required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('DoctorName', sql.NVarChar, doctor)
            .input('Specialty', sql.NVarChar, specialty)
            .input('TimeRange', sql.NVarChar, time)
            .input('Status', sql.NVarChar, status)
            .input('DayOfWeek', sql.Int, day)
            .query(`INSERT INTO DoctorSchedules (DoctorName, Specialty, TimeRange, Status, DayOfWeek) 
                    OUTPUT INSERTED.* 
                    VALUES (@DoctorName, @Specialty, @TimeRange, @Status, @DayOfWeek)`);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// UPDATE a schedule
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { doctor, specialty, time, status, day } = req.body;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .input('DoctorName', sql.NVarChar, doctor)
            .input('Specialty', sql.NVarChar, specialty)
            .input('TimeRange', sql.NVarChar, time)
            .input('Status', sql.NVarChar, status)
            .input('DayOfWeek', sql.Int, day)
            .query(`UPDATE DoctorSchedules 
                    SET DoctorName = @DoctorName, 
                        Specialty = @Specialty, 
                        TimeRange = @TimeRange, 
                        Status = @Status, 
                        DayOfWeek = @DayOfWeek
                    WHERE ID = @ID`);

        res.json({ message: 'Updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// DELETE a schedule
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('ID', sql.Int, id)
            .query('DELETE FROM DoctorSchedules WHERE ID = @ID');

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;
