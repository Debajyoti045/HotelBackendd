const express = require('express');
const Admin = require('../models/admin');
const Hotel = require('../models/hotels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const fetchAdmin = require("../middleware/fetchAdmin");
const mongoose = require('mongoose');
const router = express.Router();

router.post('/createAdmin', async (req, res) => {
    try {
        const { username, password, email, role, hotel_id } = req.body;

        if (!username || !password || !email || !hotel_id) {
            return res.status(400).json({ error: "Missing required fields (username, password, email, hotel_id)" });
        }

        const hotel = await Hotel.findById(hotel_id);
        if (!hotel) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ error: "Admin with this email or username already exists" });
        }

        const newAdmin = new Admin({
            username,
            email,
            password,
            role: role || 'admin',  
            hotel_id
        });

        await newAdmin.save();
        return res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/loginAdmin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const isMatch = await admin.validatePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                username: admin.username,
                email: admin.email,
                role: admin.role,
                hotel_id: admin.hotel_id
            }
        });
    } catch (error) {
        console.error("Error logging in admin:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/hotels', fetchAdmin, async (req, res) => {
    try {
        const { name, address, rating } = req.body;

        if (!name || !address || !rating) {
            return res.status(400).json({ error: "Missing required fields (name, address, rating)" });
        }

        const newHotel = new Hotel({
            name,
            address,
            rating: mongoose.Types.Decimal128.fromString(rating.toString()),  
        });

        await newHotel.save();
        return res.status(201).json({ message: "Hotel created successfully", hotel: newHotel });
    } catch (error) {
        console.error("Error creating hotel:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
