const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    itemsRequested: [{
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        itemName: String,
        qty: Number
    }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Dispatched'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' }
});

module.exports = mongoose.model('Order', orderSchema);