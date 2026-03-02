const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const verifyToken = require('../middleware/authMiddleware');

// --- Helper Functions ---

function getDaysInMonth(month, year) {
    const days = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0=Sun, 6=Sat
}

// GET all IT Staff (Optional filter by team)
router.get('/staff', async (req, res) => {
    const { team } = req.query;
    try {
        const pool = await poolPromise;
        let query = 'SELECT * FROM ITStaff WHERE IsActive = 1';

        if (team) {
            query += " AND Team = @Team";
        }
        query += ' ORDER BY OrderIndex';

        const request = pool.request();
        if (team) request.input('Team', sql.NVarChar, team);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// POST new IT Staff
router.post('/staff', verifyToken, async (req, res) => {
    const { name, position, team } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Position', sql.NVarChar, position)
            .input('Team', sql.NVarChar, team || 'technology')
            .query('INSERT INTO ITStaff (Name, Position, Team) VALUES (@Name, @Position, @Team)');
        res.json({ message: 'Staff added' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding staff', error: err.message });
    }
});

// GET Schedule
router.get('/', async (req, res) => {
    const { month, year, team } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and Year required' });

    try {
        const pool = await poolPromise;
        let query = `
            SELECT s.*, st.Name, st.Team
            FROM ITSchedule s
            JOIN ITStaff st ON s.StaffID = st.ID
            WHERE s.Month = @Month AND s.Year = @Year
        `;

        if (team) {
            query += " AND st.Team = @Team";
        }

        const request = pool.request()
            .input('Month', sql.Int, month)
            .input('Year', sql.Int, year);

        if (team) request.input('Team', sql.NVarChar, team);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching schedule', error: err.message });
    }
});

// POST Generate Monthly Schedule
router.post('/generate', verifyToken, async (req, res) => {
    const { year, month, team } = req.body;
    if (!year || !month) return res.status(400).json({ message: 'Year and Month are required' });

    const targetTeam = team || 'technology';

    try {
        const pool = await poolPromise;

        // 1. Get active staff for this team
        const staffResult = await pool.request()
            .input('Team', sql.NVarChar, targetTeam)
            .query('SELECT ID FROM ITStaff WHERE IsActive = 1 AND Team = @Team ORDER BY OrderIndex');

        const staffIds = staffResult.recordset.map(s => s.ID);

        if (staffIds.length === 0) return res.status(400).json({ message: `No active staff found for team ${targetTeam}` });

        // 2. Clear existing schedule for that MONTH, year AND that team
        await pool.request()
            .input('Year', sql.Int, year)
            .input('Month', sql.Int, month)
            .input('Team', sql.NVarChar, targetTeam)
            .query(`
                DELETE s 
                FROM ITSchedule s
                JOIN ITStaff st ON s.StaffID = st.ID
                WHERE s.Year = @Year AND s.Month = @Month AND st.Team = @Team
            `);

        // 3. Determine Starting Staff Index (Rotation Logic)
        // Find the LAST scheduled entry before this month for this team

        // Construct YYYY-MM-DD string for safe comparison (Start of current month)
        const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;

        const lastShiftResult = await pool.request()
            .input('Team', sql.NVarChar, targetTeam)
            .input('StartDate', sql.VarChar, startDateStr) // Send as String to ensure direct comparison
            .query(`
                SELECT TOP 1 s.StaffID
                FROM ITSchedule s
                JOIN ITStaff st ON s.StaffID = st.ID
                WHERE st.Team = @Team AND s.Date < CAST(@StartDate AS DATE)
                ORDER BY s.Date DESC, s.ShiftID DESC
            `);

        let staffIndex = 0;
        if (lastShiftResult.recordset.length > 0) {
            const lastStaffId = lastShiftResult.recordset[0].StaffID;
            const lastStaffIndex = staffIds.indexOf(lastStaffId);
            if (lastStaffIndex !== -1) {
                staffIndex = (lastStaffIndex + 1) % staffIds.length;
            }
        }

        // 4. Generate Schedule
        // Generate loop using local date components to avoid UTC shifts

        const daysInMonth = new Date(year, month, 0).getDate(); // Get last day of month
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (let day = 1; day <= daysInMonth; day++) {
                // Construct YYYY-MM-DD
                const dDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Helper for Weekend Check (Native Date works fine for day of week)
                const checkDate = new Date(year, month - 1, day);
                const isWk = isWeekend(checkDate);

                if (isWk) {
                    // Weekend: Shift 1, 2, 3
                    const shifts = [1, 2, 3];
                    for (const shift of shifts) {
                        const staffId = staffIds[staffIndex % staffIds.length];
                        staffIndex++;

                        const request = new sql.Request(transaction);
                        await request
                            .input('StaffID', sql.Int, staffId)
                            .input('Date', sql.Date, dDate)
                            .input('ShiftID', sql.Int, shift)
                            .input('Year', sql.Int, year)
                            .input('Month', sql.Int, month)
                            .query('INSERT INTO ITSchedule (StaffID, Date, ShiftID, Year, Month) VALUES (@StaffID, @Date, @ShiftID, @Year, @Month)');
                    }
                } else {
                    // Weekday: Shift 4 only
                    const staffId = staffIds[staffIndex % staffIds.length];
                    staffIndex++;

                    const request = new sql.Request(transaction);
                    await request
                        .input('StaffID', sql.Int, staffId)
                        .input('Date', sql.Date, dDate)
                        .input('ShiftID', sql.Int, 4)
                        .input('Year', sql.Int, year)
                        .input('Month', sql.Int, month)
                        .query('INSERT INTO ITSchedule (StaffID, Date, ShiftID, Year, Month) VALUES (@StaffID, @Date, @ShiftID, @Year, @Month)');
                }
            }
            await transaction.commit();
            res.json({ message: `Schedule for ${month}/${year} (${targetTeam}) generated successfully` });

        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating schedule', error: err.message });
    }
});

// Update, Delete, Create Single Entry remain same (they work by ID)
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { shiftId } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request().input('ID', sql.Int, id).input('ShiftID', sql.Int, shiftId).query('UPDATE ITSchedule SET ShiftID = @ShiftID WHERE ID = @ID');
        res.json({ message: 'Updated' });
    } catch (err) { res.status(500).json({ message: 'Error', error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request().input('ID', sql.Int, id).query('DELETE FROM ITSchedule WHERE ID = @ID');
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: 'Error', error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    const { staffId, date, shiftId } = req.body;
    try {
        const d = new Date(date);
        const pool = await poolPromise;
        await pool.request()
            .input('StaffID', sql.Int, staffId)
            .input('Date', sql.Date, date)
            .input('ShiftID', sql.Int, shiftId)
            .input('Year', sql.Int, d.getFullYear())
            .input('Month', sql.Int, d.getMonth() + 1)
            .query('INSERT INTO ITSchedule (StaffID, Date, ShiftID, Year, Month) VALUES (@StaffID, @Date, @ShiftID, @Year, @Month)');
        res.json({ message: 'Added' });
    } catch (err) { res.status(500).json({ message: 'Error', error: err.message }); }
});

module.exports = router;
