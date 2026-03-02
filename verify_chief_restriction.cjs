const axios = require('axios');
const jwt = require('jsonwebtoken');

// Hardcoded secret from server/.env
const JWT_SECRET = 'MakeSureToChangeThisToARandomSecretKey!!!';

// 1. Create a non-admin token (Str = '1')
const userToken = jwt.sign(
    { id: 999, username: 'testuser', role: '1' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

// 2. Create an admin token (Str = '2')
const adminToken = jwt.sign(
    { id: 888, username: 'testadmin', role: '2' },
    JWT_SECRET,
    { expiresIn: '1h' }
);

const API_URL = 'http://localhost:3002/api/chief';

async function testAccess() {
    console.log("--- Testing Backend Security ---");

    // Test 1: Non-Admin Request
    try {
        await axios.post(API_URL, {}, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.error("FAILED: Non-admin request should have failed but succeeded.");
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log("PASSED: Non-admin request was blocked (403 Forbidden).");
        } else {
            console.error(`FAILED: Non-admin request failed with unexpected status: ${err.response ? err.response.status : err.message}`);
        }
    }

    // Test 2: Admin Request (Simulated)
    try {
        await axios.post(API_URL, {
            header_text: 'Test',
            name: 'Test',
            position: 'Test'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log("PASSED: Admin request succeeded (or at least passed auth).");
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.error("FAILED: Admin request was blocked (403 Forbidden).");
        } else {
            // If it fails with something else (like 500 or validation), it means it passed the 403 check.
            console.log(`PASSED: Admin request passed auth check (Fail reason: ${err.response ? err.response.status : err.message} - expected due to dummy data/missing file).`);
        }
    }
}

testAccess();
