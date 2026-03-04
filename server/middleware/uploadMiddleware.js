const multer = require('multer');

// Use memory storage — file is available as req.file.buffer
const memStorage = multer.memoryStorage();

/**
 * Creates a multer upload instance with memory storage.
 * Usage: const upload = createUpload();
 */
const createUpload = (options = {}) => multer({
    storage: memStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
    ...options
});

/**
 * Converts a multer file (req.file) to a Base64 data-URL string.
 * Returns null if file is not provided.
 * @param {object} file - req.file from multer
 * @returns {string|null}
 */
const toBase64DataUrl = (file) => {
    if (!file || !file.buffer) return null;
    const mimeType = file.mimetype || 'application/octet-stream';
    const base64 = file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
};

module.exports = { createUpload, toBase64DataUrl };
