const multer = require('multer');
const path = require('path');

// Disk storage for large files (Schedules, News, Downloads)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Memory storage for small data (Base64 migration)
const memStorage = multer.memoryStorage();

const createUpload = (type = 'disk', options = {}) => multer({
    storage: type === 'disk' ? diskStorage : memStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for disk
    ...options
});

const toBase64DataUrl = (file) => {
    if (!file || !file.buffer) return null;
    const mimeType = file.mimetype || 'application/octet-stream';
    const base64 = file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
};

module.exports = { createUpload, toBase64DataUrl };
