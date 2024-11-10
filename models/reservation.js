const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    room_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    room_count: { type: Number, required: true },
    guest_details: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    reservation_id: { type: String, unique: true, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
