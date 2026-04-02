const mongoose = require('mongoose');
require('dotenv').config();
const Equipment = require('./models/Equipment');
const Order = require('./models/Order');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected for Seeding"))
    .catch(err => console.log(err));

const seedDB = async () => {
    try {
        // 1. Clear old data
        await Equipment.deleteMany({});
        await Order.deleteMany({});
        await User.deleteMany({});

        // 2. Create Test Users
        const hashedPassword = await bcrypt.hash('password', 10);
        await User.insertMany([
            { username: 'manager', password: hashedPassword, role: 'SalesManager' },
            { username: 'officer', password: hashedPassword, role: 'SalesOfficer' },
            { username: 'warehouse', password: hashedPassword, role: 'WarehouseManager' },
            { username: 'keeper', password: hashedPassword, role: 'StoreKeeper' }
        ]);

        // 3. Create Fake Equipment
        const tools = await Equipment.insertMany([
            { itemName: "Concrete Mixer", availableQty: 5 },
            { itemName: "Scaffolding Set", availableQty: 20 },
            { itemName: "Wheelbarrow", availableQty: 10 },
            { itemName: "Jackhammer", availableQty: 3 }
        ]);

        // 4. Create Fake Pending Orders
        await Order.insertMany([
            {
                customerName: "BuildIt Corp",
                priority: "High",
                itemsRequested: [{ equipmentId: tools[0]._id, itemName: tools[0].itemName, qty: 2 }]
            },
            {
                customerName: "City Developments",
                priority: "Normal",
                // Notice this asks for 25 scaffolds, but we only have 20! You will have to reject this later.
                itemsRequested: [{ equipmentId: tools[1]._id, itemName: tools[1].itemName, qty: 25 }] 
            }
        ]);

        console.log("✅ Fake Data Injected Successfully!");
        process.exit();
    } catch (err) {
        console.log("❌ Error:", err);
        process.exit(1);
    }
};

seedDB();