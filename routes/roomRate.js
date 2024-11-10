const express = require('express');
const RoomTypeRate = require('../models/roomTypeRate');  
const Admin = require('../models/admin'); 
const Hotel = require('../models/hotels');  
const RoomType = require('../models/roomType');
const fetchAdmin = require('../middleware/fetchAdmin');
const router = express.Router();

router.post('/rooms/rate', fetchAdmin, async (req, res) => {
    try {
        const { hotelId, roomTypeId, date, rateAmount, rateCurrency } = req.body;

        if (!hotelId || !roomTypeId || !date || !rateAmount || !rateCurrency) {
            return res.status(400).json({ error: "Missing required fields (hotelId, roomTypeId, date, rateAmount, rateCurrency)" });
        }

        const decimalRateAmount = new mongoose.Types.Decimal128(rateAmount);

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ error: "Hotel not found" });
        }

        const roomType = await RoomType.findOne({ hotel_id: hotelId, room_type_id: roomTypeId });
        if (!roomType) {
            return res.status(404).json({ error: "Room type not found for this hotel" });
        }

        const existingRate = await RoomTypeRate.findOne({ hotel_id: hotelId, room_type_id: roomTypeId, date });
        if (existingRate) {
            existingRate.rate_amount = decimalRateAmount;
            existingRate.rate_currency = rateCurrency;
            existingRate.updated_at = new Date();  
            await existingRate.save();
            return res.status(200).json({ message: "Room type rate updated successfully", roomTypeRate: existingRate });
        }

        const newRoomTypeRate = new RoomTypeRate({
            hotel_id: hotelId,
            room_type_id: roomTypeId,
            date,
            rate_amount: decimalRateAmount,
            rate_currency: rateCurrency
        });

        await newRoomTypeRate.save();

        return res.status(201).json({ message: "Room type rate created successfully", roomTypeRate: newRoomTypeRate });
    } catch (error) {
        console.error("Error setting/updating room type rate:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
