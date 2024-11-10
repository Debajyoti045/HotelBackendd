const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotel_id: { type: mongoose.Schema.Types.Number, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: mongoose.Schema.Types.Decimal128, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
