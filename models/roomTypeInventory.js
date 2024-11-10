const mongoose = require('mongoose');

const roomTypeInventorySchema = new mongoose.Schema({
    hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    room_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
    date: { type: Date, required: true },
    total_inventory: { type: Number, required: true },
    total_reserved: { type: Number, required: true },
    version: { type: Number, default: 1 } 
});

roomTypeInventorySchema.index({ hotel_id: 1, room_type_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RoomTypeInventory', roomTypeInventorySchema);
