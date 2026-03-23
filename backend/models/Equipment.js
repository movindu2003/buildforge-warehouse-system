const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    availableQty: { type: Number, required: true, default: 0 },
    reservedQty: { type: Number, default: 0 } // Items tied up in pending orders
});

module.exports = mongoose.model('Equipment', equipmentSchema);