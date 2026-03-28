import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function StoreKeeperInventory() {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ itemName: '', availableQty: 0 });

    // 1. Fetch current stock from Backend
    const fetchInventory = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/manager/inventory');
            setInventory(res.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // 2. Handle adding new stock
    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            
            await axios.post('http://localhost:5001/api/manager/inventory', newItem);
            toast.success("📦 New equipment added to stock!");
            setNewItem({ itemName: '', availableQty: 0 });
            fetchInventory(); 
        } catch (error) {
            toast.error("Failed to add stock.");
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <h2 style={{ color: '#2c3e50' }}>🏪 Store Keeper - Inventory Management</h2>
            <p>Add new equipment or monitor current warehouse stock levels.</p>

            {/* --- Form to Add New Equipment --- */}
            <form onSubmit={handleAddStock} style={{ backgroundColor: '#ecf0f1', padding: '20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Item Name:</label>
                    <input type="text" value={newItem.itemName} onChange={(e) => setNewItem({...newItem, itemName: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold' }}>Initial Qty:</label>
                    <input type="number" min="1" value={newItem.availableQty} onChange={(e) => setNewItem({...newItem, availableQty: Number(e.target.value)})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #bdc3c7', width: '80px' }} />
                </div>
                <button type="submit" style={{ backgroundColor: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Add to System
                </button>
            </form>

            {/* --- Inventory Table --- */}
            <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
                    <tr>
                        <th>Equipment Name</th>
                        <th>Physical Stock (Total)</th>
                        <th style={{ color: '#f1c40f' }}>Reserved for Orders</th>
                        <th style={{ backgroundColor: '#27ae60' }}>Net Available</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item._id}>
                            <td><strong>{item.itemName}</strong></td>
                            <td>{item.availableQty}</td>
                            <td style={{ color: '#e67e22', fontWeight: 'bold' }}>{item.reservedQty || 0}</td>
                            <td style={{ fontWeight: 'bold', color: '#27ae60' }}>
                                {item.availableQty - (item.reservedQty || 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StoreKeeperInventory;