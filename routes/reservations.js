const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/reservation'); 
const RoomTypeInventory = require('../models/roomTypeInventory'); 
const router = express.Router();

async function checkAndUpdateInventory(hotelId, roomTypeId, startDate, endDate, roomCount) {
    let attempts = 3; 
    while (attempts > 0) {
        const inventoryRecords = await RoomTypeInventory.find({
            hotel_id: hotelId,
            room_type_id: roomTypeId,
            date: { $gte: startDate, $lt: endDate }
        });

        const insufficientInventory = inventoryRecords.some(record => {
            const availableRooms = record.total_inventory - record.total_reserved;
            return availableRooms < roomCount;
        });

        if (insufficientInventory) {
            return { success: false, message: "Insufficient room availability for the selected dates." };
        }

        const bulkOps = inventoryRecords.map(record => ({
            updateOne: {
                filter: {
                    _id: record._id,
                    version: record.version 
                },
                update: {
                    $inc: { total_reserved: roomCount },
                    $set: { version: record.version + 1 }
                }
            }
        }));

        const result = await RoomTypeInventory.bulkWrite(bulkOps);

        if (result.matchedCount === inventoryRecords.length) {
            return { success: true, message: "Inventory updated successfully." };
        }

        attempts -= 1;
    }
    console.error("Inventory update failed after multiple attempts due to concurrent updates.");
    return { success: false, message: "Could not update inventory due to concurrent updates. Please try again." };
}

router.post('/reservations', async (req, res) => {
    try {
        const { hotelId, roomTypeId, checkInDate, checkOutDate, roomCount, guestDetails, reservationId } = req.body;

        if (!hotelId || !roomTypeId || !checkInDate || !checkOutDate || !roomCount || !guestDetails || !reservationId) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);

        if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) {
            return res.status(400).json({ error: "Invalid check-in or check-out date." });
        }

        const inventoryUpdateResult = await checkAndUpdateInventory(hotelId, roomTypeId, startDate, endDate, roomCount);

        if (!inventoryUpdateResult.success) {
            return res.status(409).json({ message: inventoryUpdateResult.message });
        }

        const newReservation = new Reservation({
            hotel_id: hotelId,
            room_type_id: roomTypeId,
            check_in_date: startDate,
            check_out_date: endDate,
            room_count: roomCount,
            guest_details: guestDetails,
            reservation_id: reservationId,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        });

        await newReservation.save();

        return res.status(201).json({ message: "Reservation created successfully.", reservation: newReservation });
    } catch (error) {
        console.error("Error creating reservation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/reservations/:reservationId/confirm', async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { paymentDetails } = req.body;

        if (!paymentDetails || !paymentDetails.paymentMethodId || !paymentDetails.amount || !paymentDetails.currency) {
            return res.status(400).json({ error: "Missing or invalid payment details." });
        }

        const reservation = await Reservation.findOne({ reservation_id: reservationId });

        if (!reservation) {
            return res.status(404).json({ error: "Reservation not found." });
        }

        if (reservation.status !== 'pending') {
            return res.status(409).json({ message: "Reservation is already confirmed or completed." });
        }

        const isPaymentSuccessful = paymentDetails.amount > 0; 

        if (!isPaymentSuccessful) {
            return res.status(400).json({ error: "Payment failed. Please try again." });
        }

        reservation.status = 'confirmed';
        reservation.updated_at = new Date();

        await reservation.save();

        return res.status(200).json({
            message: "Reservation confirmed successfully.",
            reservation: {
                id: reservation._id,
                status: reservation.status,
                guest: reservation.guest_details,
                checkInDate: reservation.check_in_date,
                checkOutDate: reservation.check_out_date,
                roomCount: reservation.room_count,
                paymentDetails: paymentDetails,
            }
        });
    } catch (error) {
        console.error("Error confirming reservation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
