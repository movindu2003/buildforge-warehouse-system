import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // 🕵️ Get the role from localStorage
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/manager/orders');
                setOrders(res.data);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, []);

    // 🚦 Smart Back Button Logic
    const handleBackClick = () => {
        if (userRole === 'SalesManager') {
            navigate('/approval-lobby');
        } else if (userRole === 'SalesOfficer') {
            navigate('/create-order');
        } else {
            navigate('/login'); 
        }
    };

    const historyOrders = orders.filter(order => 
        order.status === 'Approved (Pending Dispatch)' || order.status === 'Dispatched'
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            
            {/* 👈 Dynamic Back Button */}
            <button 
                onClick={handleBackClick} 
                style={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    padding: '10px 15px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    marginBottom: '20px',
                    fontWeight: 'bold'
                }}
            >
                {userRole === 'SalesManager' ? '⬅ Back to Dashboard' : '⬅ Back to Create Order'}
            </button>

            <h2 style={{ color: '#607d8b' }}>📜 Full Order History</h2>
            <p>A complete record of all orders sent to the Warehouse.</p>
            <hr />

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', opacity: '0.9', marginTop: '20px' }}>
                <thead style={{ backgroundColor: '#cfd8dc' }}>
                    <tr>
                        <th>Customer</th>
                        <th>Items Approved</th>
                        <th>Current Status</th>
                    </tr>
                </thead>
                <tbody>
                    {historyOrders.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No orders have been approved yet.</td></tr>
                    ) : (
                        historyOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.customerName}</td>
                                <td>
                                    {order.itemsRequested.map((item, index) => (
                                        <div key={index}>• {item.itemName} (Qty: {item.qty})</div>
                                    ))}
                                </td>
                                <td>
                                    <span style={{ 
                                        backgroundColor: order.status === 'Dispatched' ? '#c8e6c9' : '#fff9c4', 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontWeight: 'bold',
                                        color: '#333'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default OrderHistory;