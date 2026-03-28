import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Dispatch() {
    const [orders, setOrders] = useState([]);

    const fetchOrdersForDispatch = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/manager/orders');
            // only see orders that are approved and waiting for dispatch
            const dispatchReady = res.data.filter(o => o.status === 'Approved (Pending Dispatch)');
            setOrders(dispatchReady);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchOrdersForDispatch(); }, []);

    const handleConfirmDispatch = async (orderId) => {
        try {
            
            await axios.put(`http://localhost:5001/api/manager/orders/${orderId}/dispatch`);
            toast.success("🚚 Order Dispatched from Warehouse!");
            fetchOrdersForDispatch();
        } catch (error) { console.error(error); }
    };

    return (
        <div style={{ padding: '30px' }}>
            <h2>📦 Warehouse Dispatch Center</h2>
            <p>Orders approved by Sales Manager and ready for delivery.</p>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead style={{ backgroundColor: '#eeeeee' }}>
                    <tr><th>Customer</th><th>Items</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order.customerName}</td>
                            <td>{order.itemsRequested.map(i => i.itemName).join(', ')}</td>
                            <td>
                                <button onClick={() => handleConfirmDispatch(order._id)} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}>
                                    Confirm Dispatch
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default Dispatch;