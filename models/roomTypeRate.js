const mongoose = require('mongoose');

const roomTypeRateSchema = new mongoose.Schema({
    hotel_id: { type: mongoose.Schema.Types.Number, ref: 'Hotel', required: true },
    room_type_id: { type: mongoose.Schema.Types.Number, ref: 'RoomType', required: true },
    date: { type: Date, required: true },
    rate_amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    rate_currency: { type: String, required: true }
}, { timestamps: true });

roomTypeRateSchema.index({ hotel_id: 1, room_type_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RoomTypeRate', roomTypeRateSchema);
