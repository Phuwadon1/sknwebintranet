const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');

// Register Endpoint
router.post('/register', async (req, res) => {
    const { username, password, fname, lname, tel, position, titleID } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const pool = await poolPromise;

        // Check if user exists
        const checkResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Calculate new ID (since ID is not IDENTITY)
        const idResult = await pool.request().query('SELECT MAX(ID) as maxId FROM Users');
        const maxId = idResult.recordset[0].maxId || 0;
        const newId = maxId + 1;
        const newUserID = newId.toString(); // Set userID same as ID

        // Insert new user
        await pool.request()
            .input('id', sql.Int, newId)
            .input('userID', sql.VarChar, newUserID)
            .input('titleID', sql.VarChar, titleID || '1')
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .input('fname', sql.NVarChar, fname || '')
            .input('lname', sql.NVarChar, lname || '')
            .input('position', sql.NVarChar, position || '')
            .input('tel', sql.NVarChar, tel || '')
            .input('str', sql.VarChar, '1') // Default Str to 1 for general users
            .query('INSERT INTO Users (ID, userID, titleID, Username, Passwd, Fname, Lname, Position, Tel, Str) VALUES (@id, @userID, @titleID, @username, @password, @fname, @lname, @position, @tel, @str)');

        console.log("REGISTER V2 HIT, STR=1");
        res.status(201).json({ message: 'User registered successfully (v2)' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM Users WHERE Username = @username AND Passwd = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            // Don't send password back
            const { Passwd, ...userWithoutPassword } = user;

            // Generate Token
            const token = jwt.sign(
                { id: user.ID, username: user.Username, role: user.Str }, // Payload
                process.env.JWT_SECRET, // Secret Key from .env
                { expiresIn: '24h' } // Token expiration
            );

            res.json({ message: 'Login successful', user: userWithoutPassword, token });
        } else {
            res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
