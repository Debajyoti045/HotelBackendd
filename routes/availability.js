const express = require('express');
const mongoose = require('mongoose');
const RoomTypeInventory = require('../models/roomTypeInventory');
const router = express.Router();

router.get('/:hotelId/availability', async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { checkInDate, checkOutDate, roomTypeId, roomCount } = req.query;

        if (!checkInDate || !checkOutDate || !roomCount) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        const roomCountInt = parseInt(roomCount);

        let query = {
            hotel_id: hotelId,
            date: { $gte: startDate, $lt: endDate }
        };

        if (roomTypeId) {
            query.room_type_id = roomTypeId;
        }

        const inventoryRecords = await RoomTypeInventory.find(query);

        for (let record of inventoryRecords) {
            const availableRooms = record.total_inventory - record.total_reserved;
            if (availableRooms < roomCountInt) {
                return res.status(200).json({ available: false, message: "Insufficient room availability for the selected dates." });
            }
        }
        return res.status(200).json({ available: true, message: "Rooms are available for the selected dates." });
    } catch (error) {
        console.error("Error checking room availability:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
