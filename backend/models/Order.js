const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    itemsRequested: [{
        equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
        itemName: String,
        qty: Number,
        pickedQty: { type: Number, default: 0 }
    }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Dispatched', 'Picking', 'Ready for Gate Pass'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Normal', 'High'], default: 'Normal' },
    driverName: String,
    vehicleNumber: String,
    vehicleType: String,
    dispatchLocation: String,
    // Picking workflow
    pickingStartedAt: Date,
    pickingCompletedAt: Date,
    pickedBy: String, // warehouse staff name
    // Gate pass
    gatePassNumber: String,
    generatedAt: Date,
    // Stock movement history
    stockMovements: [{
        timestamp: { type: Date, default: Date.now },
        itemName: String,
        qty: Number,
        action: { type: String, enum: ['Reserved', 'Picked', 'Dispatched', 'Damaged', 'Returned'] },
        notes: String
    }],
    // Damage reports
    damageReports: [{
        timestamp: { type: Date, default: Date.now },
        itemName: String,
        qty: Number,
        reason: String,
        reportedBy: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);