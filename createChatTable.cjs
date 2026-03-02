const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const { poolPromise } = require('./server/db');

async function createTable() {
    try {
        console.log("Attempting to connect to DB...");
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatMessages' AND xtype='U')
            CREATE TABLE ChatMessages (
                ID INT IDENTITY(1,1) PRIMARY KEY,
                UserID INT NULL,
                SessionID VARCHAR(255) NULL,
                Message NVARCHAR(MAX),
                CreatedAt DATETIME DEFAULT GETDATE(),
                IsRead BIT DEFAULT 0,
                IsAdminReply BIT DEFAULT 0
            )
        `);
        console.log("Table 'ChatMessages' created or already exists.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit();
    }
}

createTable();
