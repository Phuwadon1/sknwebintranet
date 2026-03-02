const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        // Use secret from environment variable
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        console.error("Token received:", token.substring(0, 20) + "...");
        res.status(401).json({ message: 'Invalid Token' }); // Return 401 for expired/invalid tokens
    }
};

module.exports = verifyToken;
