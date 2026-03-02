const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Verify token middleware
const verifyToken = require('../middleware/authMiddleware');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/chief';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use a fixed name or timestamp to prevent clutter, but unique enough to avoid cache issues if needed.
        // For a single profile, overwriting might be okay, but unique names are safer for browser caching.
        cb(null, 'chief-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET /api/chief - Get profile data
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 1 * FROM ChiefProfile ORDER BY id DESC');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json({});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/chief - Update profile (Protected)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    // Check if user is admin (Str === '2')
    // Note: In authMiddleware, we set req.user = decodedToken
    // payload was: { id: user.ID, username: user.Username, role: user.Str }
    if (req.user.role !== '2') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    try {
        const { header_text, name, position } = req.body;
        const file = req.file;

        const pool = await poolPromise;

        // 1. Check if profile exists
        const check = await pool.request().query('SELECT TOP 1 id, image_path FROM ChiefProfile');

        let imagePath = null;
        if (file) {
            // Use relative path so it works via proxy on any device
            imagePath = `/uploads/chief/${file.filename}`;
        }

        if (check.recordset.length > 0) {
            const currentProfile = check.recordset[0];
            const oldImagePath = currentProfile.image_path;

            // Delete old image if requested or if new image is uploaded
            if ((req.body.delete_image === 'true' || imagePath) && oldImagePath) {
                try {
                    // Convert relative web path to absolute system path
                    // Assuming oldImagePath starts with /uploads/chief/
                    // oldImagePath: /uploads/chief/filename.jpg

                    const fileName = path.basename(oldImagePath);
                    const absolutePath = path.join(__dirname, '../uploads/chief', fileName);

                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                        console.log(`Deleted old image: ${absolutePath}`);
                    }
                } catch (fsErr) {
                    console.error("Failed to delete old image:", fsErr);
                    // Continue updating DB even if delete fails
                }
            }

            // Update
            const id = currentProfile.id;
            const request = pool.request()
                .input('id', sql.Int, id)
                .input('header_text', sql.NVarChar, header_text)
                .input('name', sql.NVarChar, name)
                .input('position', sql.NVarChar, position);

            let query = `UPDATE ChiefProfile SET 
                         header_text = @header_text, 
                         name = @name, 
                         position = @position,
                         updated_at = GETDATE()`;

            if (req.body.delete_image === 'true') {
                query += `, image_path = NULL`;
            } else if (imagePath) {
                request.input('image_path', sql.NVarChar, imagePath);
                query += `, image_path = @image_path`;
            }

            query += ` WHERE id = @id`;

            await request.query(query);
        } else {
            // Insert (Shouldn't happen often if seeded, but good fallback)
            await pool.request()
                .input('header_text', sql.NVarChar, header_text)
                .input('name', sql.NVarChar, name)
                .input('position', sql.NVarChar, position)
                .input('image_path', sql.NVarChar, imagePath || null)
                .query(`INSERT INTO ChiefProfile (header_text, name, position, image_path) 
                        VALUES (@header_text, @name, @position, @image_path)`);
        }

        res.json({ message: 'บันทึกข้อมูลสำเร็จ (Profile updated successfully)', imagePath });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
