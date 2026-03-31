const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); 
const twilio = require('twilio');

// 🧠 Import your team's new MongoDB Models!
const Equipment = require('../models/Equipment');
const Order = require('../models/Order');

// 📧 EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'buildforge.operations@gmail.com',
        pass: 'hhamtbwzfqspuonb'
    }
});

// 📱 TWILIO SMS SETUP
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = new twilio(accountSid, authToken);

// We keep settings in memory for now so your emails/SMS still work perfectly!
let systemSettings = {
    operationsEmail: 'buildforge.operations@gmail.com', 
    operationsPhone: '+94770000000'                    
};

// ========== 📦 INVENTORY ROUTES (Cloud Connected) ==========
router.get('/inventory', async (req, res) => {
    try {
        const equipment = await Equipment.find();
        res.json(equipment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/inventory', async (req, res) => {
    try {
        const { itemName, availableQty } = req.body;
        const newEquipment = new Equipment({
            itemName,
            availableQty: Number(availableQty)
        });
        await newEquipment.save();
        res.json({ message: "Equipment added successfully!", equipment: newEquipment });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== 📜 ORDER ROUTES (Cloud Connected) ==========
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            customerName: req.body.customerName,
            priority: req.body.priority || 'Normal',
            status: 'Pending',
            itemsRequested: [{ 
                itemName: req.body.equipmentName, 
                qty: Number(req.body.qty), 
                pickedQty: 0 
            }]
        });
        await newOrder.save();
        res.json({ message: "Order created successfully!", order: newOrder });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== 🛑 CANCELLATION AUDIT TRAIL ==========
router.put('/orders/:id/cancel', async (req, res) => {
    try {
        const { cancellationCategory, cancellationReason } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        order.status = 'Cancelled';
        order.cancellationCategory = cancellationCategory;
        order.cancellationReason = cancellationReason;
        order.cancelledAt = new Date();
        
        await order.save();
        res.json({ message: "Order moved to Cancellation Audit Trail!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ✅ APPROVAL ROUTE ==========
router.put('/orders/:id/approve', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        order.status = 'Approved'; // Matches your exact Schema Enum!

        // Loop through items to update Inventory in the cloud
        for (let requestedItem of order.itemsRequested) {
            const inventoryItem = await Equipment.findOne({ itemName: requestedItem.itemName });
            
            if (inventoryItem) {
                inventoryItem.reservedQty += requestedItem.qty;
                await inventoryItem.save(); // Save the new reserved amount to the cloud
            }
            
            order.stockMovements.push({
                action: 'Reserved',
                itemName: requestedItem.itemName,
                qty: requestedItem.qty,
                notes: 'Order approved and stock reserved'
            });
        }
        
        await order.save(); // Save the updated order to the cloud
        res.json({ message: "Order Approved Successfully!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== 👷‍♂️ PICKING WORKFLOW ==========
router.post('/orders/:id/generate-picklist', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        order.status = 'Picking';
        order.pickingStartedAt = new Date();
        await order.save();
        
        res.json({ message: "Pick List generated successfully!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id/confirm-pick', async (req, res) => {
    try {
        const { itemName, pickedQty, warehouseStaff } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        const item = order.itemsRequested.find(i => i.itemName === itemName);
        if (item) item.pickedQty += pickedQty;
        
        order.stockMovements.push({
            itemName: itemName,
            qty: pickedQty,
            action: 'Picked',
            notes: `Picked by ${warehouseStaff}`
        });
        
        // Check if all items are picked
        const allPicked = order.itemsRequested.every(i => i.pickedQty >= i.qty);
        if (allPicked) {
            order.status = 'Ready for Gate Pass';
            order.pickingCompletedAt = new Date();
            order.pickedBy = warehouseStaff;
        }
        
        await order.save();
        res.json({ message: "Item picked successfully!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== 🚚 GATE PASS & DISPATCH ==========
router.post('/orders/:id/generate-gatepass', async (req, res) => {
    try {
        const { driverName, dispatchLocation, vehicleNumber, vehicleType } = req.body;
        const order = await Order.findById(req.params.id);
        
        order.gatePassNumber = 'GP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        order.generatedAt = new Date();
        order.driverName = driverName;
        order.dispatchLocation = dispatchLocation;
        order.vehicleNumber = vehicleNumber;
        order.vehicleType = vehicleType;

        await order.save();
        res.json({ message: "Gate Pass generated!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id/dispatch', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        order.status = 'Dispatched';

        for (let requestedItem of order.itemsRequested) {
            const inventoryItem = await Equipment.findOne({ itemName: requestedItem.itemName });
            
            if (inventoryItem) {
                const dispatchQty = requestedItem.pickedQty > 0 ? requestedItem.pickedQty : requestedItem.qty;
                inventoryItem.availableQty -= dispatchQty;
                inventoryItem.reservedQty -= dispatchQty;
                await inventoryItem.save();
            }

            order.stockMovements.push({
                itemName: requestedItem.itemName,
                qty: requestedItem.pickedQty > 0 ? requestedItem.pickedQty : requestedItem.qty,
                action: 'Dispatched',
                notes: `Dispatched in vehicle ${order.vehicleNumber || 'N/A'}`
            });
        }

        await order.save();
        res.json({ message: "Order Dispatched! Inventory updated.", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ⚠️ EMERGENCY & REPORTS ==========
router.post('/orders/:id/damage-report', async (req, res) => {
    try {
        const { itemName, qty, reason, reportedBy } = req.body;
        const order = await Order.findById(req.params.id);
        
        const item = order.itemsRequested.find(i => i.itemName === itemName);
        if (item) item.pickedQty -= qty;
        
        order.damageReports.push({ itemName, qty, reason, reportedBy });
        order.stockMovements.push({ action: 'Damaged', itemName, qty, notes: reason });
        
        // Return broken items to warehouse conceptually, or keep reserved depending on logic
        const inventoryItem = await Equipment.findOne({ itemName });
        if (inventoryItem) {
            inventoryItem.availableQty += qty;
            inventoryItem.reservedQty -= qty;
            await inventoryItem.save();
        }
        
        await order.save();
        res.json({ message: "Damage report recorded!", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== ⚠️ EMERGENCY & REPORTS ==========
router.put('/orders/:id/backorder', async (req, res) => { 
    try {
        // 1. FIRST: Safely update the database
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        order.status = 'Backordered'; // Move it to the Backordered table!
        await order.save();

        let equipmentList = order.itemsRequested.map(item => `- ${item.qty}x ${item.itemName}`).join('\n');
        
        // 2. SECOND: Try to send alerts inside a "Safe Zone"
        try {
            const mailOptions = {
                from: 'BuildForge System',
                to: systemSettings.operationsEmail, 
                subject: `⚠️ URGENT: Manufacturing Request for ${order.customerName}`,
                text: `Operations Team,\n\nUrgent stock shortage for:\n${equipmentList}\n\nCustomer: ${order.customerName}`
            };

            await transporter.sendMail(mailOptions);
            
            // Only try SMS if Twilio is actually set up in your .env
            if (process.env.TWILIO_ACCOUNT_SID) {
                await twilioClient.messages.create({
                    body: `🏗️ BuildForge Alert: Urgent stock shortage for ${order.customerName}. Email sent.`,
                    from: twilioPhoneNumber,
                    to: systemSettings.operationsPhone
                });
            }

            // If everything works perfectly:
            return res.json({ message: "Order Backordered! Alerts delivered successfully." });

        } catch (alertError) {
            // 🛡️ If Twilio or Email fails, it comes here INSTEAD of crashing!
            console.log("⚠️ Note: Email/SMS failed, but database was updated.");
            return res.json({ message: "Order Backordered! (Email/SMS alerts currently offline)", order });
        }

    } catch (error) { 
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to update database." }); 
    }
});

// ========== ⚙️ SETTINGS ==========
router.get('/settings', (req, res) => res.json(systemSettings));
router.put('/settings', (req, res) => {
    systemSettings.operationsEmail = req.body.operationsEmail;
    systemSettings.operationsPhone = req.body.operationsPhone;
    res.json({ message: "Settings saved!", settings: systemSettings });
});

module.exports = router;