const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const fetchAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({ error: 'Admin not found' });
        }
        req.admin = admin;
        next();  
    } catch (error) {
        console.error("Error fetching admin:", error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = fetchAdmin;
