const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); 
const twilio = require('twilio');

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

let inventoryDB = [
    { _id: '1', itemName: 'Concrete Mixer', availableQty: 5, reservedQty: 0 },
    { _id: '2', itemName: 'Jackhammer', availableQty: 12, reservedQty: 0 },
    { _id: '3', itemName: 'Steel Scaffolding', availableQty: 45, reservedQty: 0 }
];

let ordersDB = [
    {
        _id: '101',
        customerName: 'BuildIt Corp',
        priority: 'High',
        status: 'Pending',
        itemsRequested: [
            { _id: 'a1', itemName: 'Concrete Mixer', qty: 10, pickedQty: 0 }, 
            { _id: 'a2', itemName: 'Steel Scaffolding', qty: 10, pickedQty: 0 }
        ],
        stockMovements: [],
        damageReports: []
    },
    {
        _id: '102',
        customerName: 'Skyline Developers',
        priority: 'Normal',
        status: 'Pending',
        itemsRequested: [
            { _id: 'b1', itemName: 'Jackhammer', qty: 3, pickedQty: 0 }
        ],
        stockMovements: [],
        damageReports: []
    }
];

let systemSettings = {
    operationsEmail: 'buildforge.operations@gmail.com', 
    operationsPhone: '+94770000000'                     
};

// ========== INVENTORY ROUTES ==========
router.get('/inventory', (req, res) => res.json(inventoryDB));

router.post('/inventory', (req, res) => {
    const { itemName, availableQty } = req.body;
    const newEquipment = {
        _id: Math.random().toString(36).substr(2, 9),
        itemName,
        availableQty: Number(availableQty),
        reservedQty: 0
    };
    inventoryDB.push(newEquipment);
    res.json({ message: "Equipment added successfully!", equipment: newEquipment });
});

// ========== ORDER ROUTES ==========
router.get('/orders', (req, res) => res.json(ordersDB));

router.post('/orders', (req, res) => {
    const newOrder = {
        _id: Math.random().toString(36).substr(2, 9), 
        customerName: req.body.customerName,
        priority: req.body.priority,
        status: 'Pending',
        itemsRequested: [{ itemName: req.body.equipmentName, qty: Number(req.body.qty), pickedQty: 0 }],
        stockMovements: [],
        damageReports: []
    };
    ordersDB.push(newOrder); 
    res.json({ message: "Order created successfully!", order: newOrder });
});

router.delete('/orders/:id', (req, res) => {
    ordersDB = ordersDB.filter(order => order._id !== req.params.id);
    res.json({ message: "Order cancelled and deleted!" });
});

// ========== APPROVAL ROUTE ==========
router.put('/orders/:id/approve', (req, res) => {
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    order.status = 'Approved (Pending Dispatch)';
    order.itemsRequested.forEach(requestedItem => {
        const inventoryItem = inventoryDB.find(inv => inv.itemName === requestedItem.itemName);
        if (inventoryItem) inventoryItem.reservedQty += requestedItem.qty;
        
        // Log stock movement
        order.stockMovements.push({
            timestamp: new Date(),
            itemName: requestedItem.itemName,
            qty: requestedItem.qty,
            action: 'Reserved',
            notes: 'Order approved and stock reserved'
        });
    });
    res.json({ message: "Order Approved Successfully!", order });
});

// ========== PICKING WORKFLOW ==========
// Generate Pick List
router.post('/orders/:id/generate-picklist', (req, res) => {
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== 'Approved (Pending Dispatch)') {
        return res.status(400).json({ error: "Order must be approved before picking" });
    }
    
    order.status = 'Picking';
    order.pickingStartedAt = new Date();
    
    const pickList = {
        pickListId: 'PL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        orderId: order._id,
        customerName: order.customerName,
        items: order.itemsRequested.map(item => ({
            itemName: item.itemName,
            requiredQty: item.qty,
            pickedQty: 0
        })),
        createdAt: new Date()
    };
    
    res.json({ 
        message: "Pick List generated successfully!", 
        pickList,
        order 
    });
});

// Confirm Pick for an item
router.put('/orders/:id/confirm-pick', (req, res) => {
    const orderId = req.params.id;
    const { itemName, pickedQty, warehouseStaff } = req.body;
    
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    const item = order.itemsRequested.find(i => i.itemName === itemName);
    if (!item) return res.status(404).json({ error: "Item not found in order" });
    
    item.pickedQty += pickedQty;
    
    order.stockMovements.push({
        timestamp: new Date(),
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
    
    res.json({ message: "Item picked successfully!", order });
});

// ========== GATE PASS GENERATION ==========
router.post('/orders/:id/generate-gatepass', (req, res) => {
    const orderId = req.params.id;
    const { driverName, dispatchLocation, vehicleNumber, vehicleType } = req.body;
    const order = ordersDB.find(o => o._id === orderId);
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== 'Ready for Gate Pass') {
        return res.status(400).json({ error: "All items must be picked before generating gate pass" });
    }
    
    const gatePassNumber = 'GP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    order.gatePassNumber = gatePassNumber;
    order.generatedAt = new Date();
    order.driverName = driverName || order.driverName || '';
    order.dispatchLocation = dispatchLocation || order.dispatchLocation || '';
    order.vehicleNumber = vehicleNumber || order.vehicleNumber || '';
    order.vehicleType = vehicleType || order.vehicleType || '';

    const gatePass = {
        gatePassNumber,
        orderId: order._id,
        customerName: order.customerName,
        items: order.itemsRequested.map(item => ({
            itemName: item.itemName,
            qty: item.pickedQty
        })),
        pickedBy: order.pickedBy,
        driverName: order.driverName,
        vehicleNumber: order.vehicleNumber,
        vehicleType: order.vehicleType,
        dispatchLocation: order.dispatchLocation,
        generatedAt: new Date()
    };
    
    res.json({ 
        message: "Gate Pass generated successfully!", 
        gatePass,
        order 
    });
});

// ========== DISPATCH ROUTE (Updated) ==========
router.put('/orders/:id/dispatch', (req, res) => {
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== 'Ready for Gate Pass' && order.status !== 'Approved (Pending Dispatch)') {
        return res.status(400).json({ error: "Order not ready for dispatch" });
    }

    order.status = 'Dispatched';

    // Update inventory
    order.itemsRequested.forEach(requestedItem => {
        const inventoryItem = inventoryDB.find(inv => inv.itemName === requestedItem.itemName);
        if (inventoryItem) {
            const dispatchQty = requestedItem.pickedQty > 0 ? requestedItem.pickedQty : requestedItem.qty;
            inventoryItem.availableQty -= dispatchQty;
            inventoryItem.reservedQty -= dispatchQty;
        }

        order.stockMovements.push({
            timestamp: new Date(),
            itemName: requestedItem.itemName,
            qty: requestedItem.pickedQty > 0 ? requestedItem.pickedQty : requestedItem.qty,
            action: 'Dispatched',
            notes: `Dispatched (GatePass info: driver ${order.driverName || 'N/A'}, vehicle ${order.vehicleType || 'N/A'} ${order.vehicleNumber || 'N/A'}, location ${order.dispatchLocation || 'N/A'})`
        });
    });

    res.json({ message: "Order Dispatched! Inventory updated.", order });
});

// ========== DAMAGE REPORT ==========
router.post('/orders/:id/damage-report', (req, res) => {
    const orderId = req.params.id;
    const { itemName, qty, reason, reportedBy } = req.body;
    
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    const item = order.itemsRequested.find(i => i.itemName === itemName);
    if (!item) return res.status(404).json({ error: "Item not found in order" });
    
    // Reduce picked quantity
    item.pickedQty -= qty;
    
    // Add damage report
    order.damageReports.push({
        timestamp: new Date(),
        itemName,
        qty,
        reason,
        reportedBy
    });
    
    // Log stock movement
    order.stockMovements.push({
        timestamp: new Date(),
        itemName,
        qty,
        action: 'Damaged',
        notes: `Damage reported: ${reason}`
    });
    
    // Update inventory (return to available)
    const inventoryItem = inventoryDB.find(inv => inv.itemName === itemName);
    if (inventoryItem) {
        inventoryItem.availableQty += qty;
        inventoryItem.reservedQty -= qty;
    }
    
    res.json({ message: "Damage report recorded!", order });
});

// ========== STOCK MOVEMENT HISTORY ==========
router.get('/orders/:id/stock-movements', (req, res) => {
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    res.json({
        orderId: order._id,
        customerName: order.customerName,
        stockMovements: order.stockMovements,
        damageReports: order.damageReports
    });
});

// Get all stock movements across all orders
router.get('/stock-movements', (req, res) => {
    const allMovements = [];
    ordersDB.forEach(order => {
        order.stockMovements.forEach(movement => {
            allMovements.push({
                orderId: order._id,
                customerName: order.customerName,
                ...movement
            });
        });
    });
    res.json(allMovements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// ========== BACKORDERING ==========
router.put('/orders/:id/backorder', async (req, res) => { 
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    order.status = 'Backordered';

    let equipmentList = order.itemsRequested.map(item => `- ${item.qty}x ${item.itemName}`).join('\n');
    const mailOptions = {
        from: 'BuildForge System',
        to: systemSettings.operationsEmail, 
        subject: `⚠️ URGENT: Manufacturing Request for ${order.customerName}`,
        text: `Hello Operations Team,\n\nWe have a stock shortage and cannot fulfill a customer order. Please manufacture the following equipment immediately:\n\n${equipmentList}\n\nCustomer: ${order.customerName}\nPriority: ${order.priority}\n\nThank you,\nSales Manager Dashboard`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");

        const smsMessage = await twilioClient.messages.create({
            body: `🏗️ BuildForge Alert: Urgent stock shortage for ${order.customerName}. Please check your email for the manufacturing request.`,
            from: twilioPhoneNumber,
            to: systemSettings.operationsPhone
        });
        console.log("SMS sent successfully! SID:", smsMessage.sid);

        res.json({ message: "Order sent to Factory! Email & SMS delivered." });
    } catch (error) {
        console.error("Communication failed:", error);
        res.json({ message: "Order Backordered, but alerts failed. Check server console." });
    }
});

// ========== SETTINGS ==========
router.get('/settings', (req, res) => res.json(systemSettings));

router.put('/settings', (req, res) => {
    systemSettings.operationsEmail = req.body.operationsEmail;
    systemSettings.operationsPhone = req.body.operationsPhone;
    res.json({ message: "Settings saved!", settings: systemSettings });
});

module.exports = router;