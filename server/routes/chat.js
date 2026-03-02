const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// GET all sessions (Grouped by SessionID) for Admin
router.get('/sessions', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                SessionID, 
                MAX(CreatedAt) as LastMessageTime,
                (SELECT TOP 1 Message FROM ChatMessages WHERE SessionID = CM.SessionID ORDER BY CreatedAt DESC) as LastMessage,
                (SELECT TOP 1 Username FROM ChatMessages WHERE SessionID = CM.SessionID AND Username IS NOT NULL AND IsAdminReply = 0 ORDER BY CreatedAt DESC) as Username,
                (SELECT COUNT(*) FROM ChatMessages WHERE SessionID = CM.SessionID AND IsRead = 0 AND IsAdminReply = 0) as UnreadCount
            FROM ChatMessages CM
            GROUP BY SessionID
            ORDER BY LastMessageTime DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// GET chat history (private per session/user)
router.get('/', async (req, res) => {
    try {
        // Expect session_id in query
        const sessionId = req.query.session_id;
        const markRead = req.query.mark_read === 'true'; // Admin reads the chat

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const pool = await poolPromise;

        // If admin opens chat, mark user messages as read
        if (markRead) {
            await pool.request()
                .input('sessionId', sql.VarChar, sessionId)
                .query(`UPDATE ChatMessages SET IsRead = 1 WHERE SessionID = @sessionId AND IsAdminReply = 0`);
        }

        const result = await pool.request()
            .input('sessionId', sql.VarChar, sessionId)
            .query(`
                SELECT * FROM ChatMessages 
                WHERE SessionID = @sessionId 
                ORDER BY CreatedAt ASC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// POST send message
router.post('/', async (req, res) => {
    try {
        const { session_id, message, is_admin, username } = req.body;

        if (!session_id || !message) {
            return res.status(400).json({ error: 'Session ID and Message are required' });
        }

        const isAdminReply = is_admin ? 1 : 0;
        const displayName = username || 'Guest';

        console.log('Received chat message - SessionID:', session_id, 'Username:', displayName, 'IsAdmin:', isAdminReply);

        const pool = await poolPromise;
        await pool.request()
            .input('sessionId', sql.VarChar, session_id)
            .input('message', sql.NVarChar, message)
            .input('isAdminReply', sql.Bit, isAdminReply)
            .input('username', sql.NVarChar, displayName)
            .query(`
                INSERT INTO ChatMessages (SessionID, Message, CreatedAt, IsRead, IsAdminReply, Username)
                VALUES (@sessionId, @message, GETDATE(), 0, @isAdminReply, @username)
            `);

        // Auto-reply only on first message from user (not admin)
        if (!isAdminReply) {
            // Check if this is the first user message in this session
            const countResult = await pool.request()
                .input('sessionId', sql.VarChar, session_id)
                .query(`
                    SELECT COUNT(*) as MessageCount 
                    FROM ChatMessages 
                    WHERE SessionID = @sessionId AND IsAdminReply = 0
                `);

            const messageCount = countResult.recordset[0].MessageCount;

            // If this is the first message, send auto-reply
            if (messageCount === 1) {
                await pool.request()
                    .input('sessionId', sql.VarChar, session_id)
                    .input('autoReplyMessage', sql.NVarChar, 'ขอบคุณที่ติดต่อเรา กรุณารอสักครู่ Admin จะตอบกลับโดยเร็วที่สุดค่ะ')
                    .query(`
                        INSERT INTO ChatMessages (SessionID, Message, CreatedAt, IsRead, IsAdminReply, Username)
                        VALUES (@sessionId, @autoReplyMessage, GETDATE(), 1, 1, 'ระบบอัตโนมัติ')
                    `);
            }
        }

        res.status(201).json({ message: 'Message sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// PUT edit message
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { message, session_id } = req.body; // session_id to verify ownership (simple check)

        if (!message || !id) {
            return res.status(400).json({ error: 'Message ID and new content are required' });
        }

        console.log('Editing message:', id, message); // Debug log

        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, parseInt(id)) // Ensure ID is int
            .input('message', sql.NVarChar, message)
            .query(`
                UPDATE ChatMessages 
                SET Message = @message 
                WHERE ID = @id
            `);

        res.json({ message: 'Message updated' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;

// DELETE chat session
router.delete('/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        if (!session_id) return res.status(400).send('Session ID required');

        const pool = await poolPromise;
        await pool.request()
            .input('sessionId', sql.VarChar, session_id)
            .query('DELETE FROM ChatMessages WHERE SessionID = @sessionId');

        res.json({ message: 'Chat deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});
