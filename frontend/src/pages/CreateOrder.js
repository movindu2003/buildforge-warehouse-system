import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [newOrder, setNewOrder] = useState({
        customerName: '',
        priority: 'Normal',
        equipmentName: '', 
        qty: 1
    });

    // We still need to fetch the inventory so the dropdown menu knows what equipment exists!
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/manager/inventory');
                setInventory(res.data);
                // Set the default dropdown value to the first item in the inventory
                if (res.data.length > 0) {
                    setNewOrder(prev => ({ ...prev, equipmentName: res.data[0].itemName }));
                }
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };
        fetchInventory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            await axios.post('http://localhost:5001/api/manager/orders', newOrder);
            alert("➕ New Order Successfully Created!");
            
        } catch (error) { 
            console.error("Error creating order:", error); 
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
            
            <button 
                onClick={() => navigate('/approval-lobby')} 
                style={{ backgroundColor: '#e0e0e0', color: '#333', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
            >
                ⬅ Back to Dashboard
            </button>

            <h2 style={{ color: '#827717' }}>➕ Create New Customer Order</h2>
            <p>Enter the details below to manually add an order to the system.</p>
            <hr style={{ marginBottom: '30px' }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f9fbe7', padding: '30px', borderRadius: '8px', border: '1px solid #cddc39' }}>
                
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Customer Name:</label>
                    <input type="text" placeholder="e.g. Olanka Travels" required value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Priority Level:</label>
                    <select value={newOrder.priority} onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="Normal">Normal Priority</option>
                        <option value="High">High Priority</option>
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Equipment Requested:</label>
                    <select value={newOrder.equipmentName} onChange={(e) => setNewOrder({...newOrder, equipmentName: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {inventory.map(inv => <option key={inv._id} value={inv.itemName}>{inv.itemName}</option>)}
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Quantity:</label>
                    <input type="number" min="1" required value={newOrder.qty} onChange={(e) => setNewOrder({...newOrder, qty: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                
                <button type="submit" style={{ backgroundColor: '#8bc34a', color: 'white', padding: '15px 20px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.1em', marginTop: '10px' }}>
                    Submit Order
                </button>
            </form>
        </div>
    );
}

export default CreateOrder;