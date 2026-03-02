const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Helper to get client Identifier (Visitor ID > Forwarded IP > Remote IP)
const getClientIdentifier = (req) => {
    // Prefer the explicit Visitor ID from frontend if available (Solves NAT/Proxy limit)
    const visitorId = req.headers['x-visitor-id'];
    if (visitorId) return visitorId;

    // Fallback to IP
    return req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress ||
        '127.0.0.1';
};

// GET /api/visitor
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const clientId = getClientIdentifier(req);

        // 1. Update Active Visitors (Upsert)
        // Note: The table column is 'ip_address' but we're storing the Client ID (UUID or IP)
        // Ensure the table column is large enough. If 50 chars, UUID (approx 36) fits.

        const checkId = await pool.request()
            .input('id', sql.NVarChar, clientId)
            .query('SELECT ip_address FROM ActiveVisitors WHERE ip_address = @id');

        if (checkId.recordset.length > 0) {
            await pool.request()
                .input('id', sql.NVarChar, clientId)
                .query('UPDATE ActiveVisitors SET last_active = GETDATE() WHERE ip_address = @id');
        } else {
            // Need to catch error if ID > 50 chars? UUID is fine. Long IP lists might fail.
            // Truncate just in case.
            const safeId = clientId.substring(0, 50);

            await pool.request()
                .input('id', sql.NVarChar, safeId)
                .query('INSERT INTO ActiveVisitors (ip_address, last_active) VALUES (@id, GETDATE())');
        }

        // 2. Clean old sessions (> 15 mins)
        await pool.request()
            .query("DELETE FROM ActiveVisitors WHERE last_active < DATEADD(minute, -15, GETDATE())");

        // 3. Get Online Count
        const onlineResult = await pool.request()
            .query('SELECT COUNT(*) as count FROM ActiveVisitors');
        const onlineCount = onlineResult.recordset[0].count;

        // 4. Increment Total Visits
        await pool.request()
            .query('UPDATE VisitorCounts SET total_visits = total_visits + 1');

        // 5. Get Stats
        const statsResult = await pool.request()
            .query('SELECT TOP 1 total_visits, start_date FROM VisitorCounts');

        if (statsResult.recordset.length > 0) {
            const { total_visits, start_date } = statsResult.recordset[0];
            res.json({
                total_visits,
                start_date,
                online_count: onlineCount
            });
        } else {
            res.status(500).json({ message: 'Visitor data not initialized' });
        }

    } catch (err) {
        console.error('Error in visitor stats:', err);
        // Don't crash frontend, just return approximate data or error
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
