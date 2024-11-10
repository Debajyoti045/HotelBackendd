const express = require('express');
const RoomType = require('../models/roomType');  
const Admin = require('../models/admin'); 
const Hotel = require('../models/hotels'); 
const fetchAdmin = require('../middleware/fetchAdmin');
const router = express.Router();

router.post('/rooms', fetchAdmin, async (req, res) => {
    try {
        const { hotelId, name, description, baseCapacity, maxCapacity } = req.body;

        if (!hotelId || !name || !baseCapacity || !maxCapacity) {
            return res.status(400).json({ error: "Missing required fields (hotelId, name, baseCapacity, maxCapacity)" });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        const newRoomType = new RoomType({
            hotel_id: hotelId,
            name,
            description,
            base_capacity: baseCapacity,
            max_capacity: maxCapacity
        });

        await newRoomType.save();

        return res.status(201).json({ message: "Room type added successfully", roomType: newRoomType });
    } catch (error) {
        console.error("Error adding room type:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
