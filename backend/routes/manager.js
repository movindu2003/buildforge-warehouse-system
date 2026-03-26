const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); 
const twilio = require('twilio'); // 👈 1. Import Twilio

// 📧 EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'buildforge.operations@gmail.com',      // Keep your Gmail here
        pass: 'hhamtbwzfqspuonb'  // Keep your App Password here
    }
});

// 📱 2. TWILIO SMS SETUP (Paste your Twilio details here!)
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
            { _id: 'a1', itemName: 'Concrete Mixer', qty: 10 }, 
            { _id: 'a2', itemName: 'Steel Scaffolding', qty: 10 }
        ]
    },
    {
        _id: '102',
        customerName: 'Skyline Developers',
        priority: 'Normal',
        status: 'Pending',
        itemsRequested: [
            { _id: 'b1', itemName: 'Jackhammer', qty: 3 }
        ]
    }
];

let systemSettings = {
    operationsEmail: 'buildforge.operations@gmail.com', 
    operationsPhone: '+94770000000'                     
};

router.get('/inventory', (req, res) => res.json(inventoryDB));
router.get('/orders', (req, res) => res.json(ordersDB));

router.put('/orders/:id/approve', (req, res) => {
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = 'Approved (Pending Dispatch)';
    order.itemsRequested.forEach(requestedItem => {
        const inventoryItem = inventoryDB.find(inv => inv.itemName === requestedItem.itemName);
        if (inventoryItem) inventoryItem.reservedQty += requestedItem.qty; 
    });
    res.json({ message: "Order Approved Successfully!" });
});

// 🏭 3. THE BACKORDER LOGIC (Now sends Email AND SMS!)
router.put('/orders/:id/backorder', async (req, res) => { 
    const orderId = req.params.id;
    const order = ordersDB.find(o => o._id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    order.status = 'Backordered';

    // Draft the Email
    let equipmentList = order.itemsRequested.map(item => `- ${item.qty}x ${item.itemName}`).join('\n');
    const mailOptions = {
        from: 'BuildForge System',
        to: systemSettings.operationsEmail, 
        subject: `⚠️ URGENT: Manufacturing Request for ${order.customerName}`,
        text: `Hello Operations Team,\n\nWe have a stock shortage and cannot fulfill a customer order. Please manufacture the following equipment immediately:\n\n${equipmentList}\n\nCustomer: ${order.customerName}\nPriority: ${order.priority}\n\nThank you,\nSales Manager Dashboard`
    };

    try {
        // 🚀 Send Email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");

        // 🚀 Send SMS
        const smsMessage = await twilioClient.messages.create({
            body: `🏗️ BuildForge Alert: Urgent stock shortage for ${order.customerName}. Please check your email for the manufacturing request.`,
            from: twilioPhoneNumber,             // Must be your Twilio Number
            to: systemSettings.operationsPhone   // Pulls your Sri Lankan number from Settings!
        });
        console.log("SMS sent successfully! SID:", smsMessage.sid);

        res.json({ message: "Order sent to Factory! Email & SMS delivered." });
    } catch (error) {
        console.error("Communication failed:", error);
        res.json({ message: "Order Backordered, but alerts failed. Check server console." });
    }
});

router.post('/orders', (req, res) => {
    const newOrder = {
        _id: Math.random().toString(36).substr(2, 9), 
        customerName: req.body.customerName,
        priority: req.body.priority,
        status: 'Pending',
        itemsRequested: [{ itemName: req.body.equipmentName, qty: Number(req.body.qty) }]
    };
    ordersDB.push(newOrder); 
    res.json({ message: "Order created successfully!", order: newOrder });
});

router.delete('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    ordersDB = ordersDB.filter(order => order._id !== orderId);
    res.json({ message: "Order cancelled and deleted!" });
});

router.get('/settings', (req, res) => res.json(systemSettings));

router.put('/settings', (req, res) => {
    systemSettings.operationsEmail = req.body.operationsEmail;
    systemSettings.operationsPhone = req.body.operationsPhone;
    res.json({ message: "Settings saved!", settings: systemSettings });
});

module.exports = router;