const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    room_type_id: { type: mongoose.Schema.Types.Number, required: true, unique: true },
    hotel_id: { type: mongoose.Schema.Types.Number, ref: 'Hotel', required: true },
    name: { type: String, required: true },
    description: { type: String },
    base_capacity: { type: Number, required: true },
    max_capacity: { type: Number, required: true }
});

module.exports = mongoose.model('RoomType', roomTypeSchema);
