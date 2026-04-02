import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [editCustomer, setEditCustomer] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', shopName: '', contactNumber: '', address: '', status: 'Pending' });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/manager/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleEditClick = (customer) => {
        setEditCustomer(customer);
        setFormData({
            fullName: customer.fullName,
            shopName: customer.shopName,
            contactNumber: customer.contactNumber || '',
            address: customer.address || '',
            status: customer.status || 'Pending'
        });
    };

    const handleAddCustomer = async () => {
        if (!formData.fullName.trim() || !formData.shopName.trim() || !formData.contactNumber.trim() || !formData.address.trim()) {
            alert('All fields are required for new customer');
            return;
        }

        try {
            await axios.post('http://localhost:5001/api/manager/customers', {
                fullName: formData.fullName,
                shopName: formData.shopName,
                contactNumber: formData.contactNumber,
                address: formData.address
            });
            setFormData({ fullName: '', shopName: '', contactNumber: '', address: '', status: 'Pending' });
            fetchCustomers();
            alert('Customer added successfully as Pending');
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Unable to add customer');
        }
    };

    const handleSave = async () => {
        if (!formData.fullName.trim()) {
            alert('Customer name is required');
            return;
        }

        try {
            await axios.put(`http://localhost:5001/api/manager/customers/${editCustomer._id}`, { ...formData });
            setEditCustomer(null);
            setFormData({ name: '', contact: '', status: 'Pending' });
            fetchCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Unable to save customer');
        }
    };

    const [activeTab, setActiveTab] = useState('register');

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: '#827717', marginBottom: '20px' }}>👥 Customer Management</h2>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <button onClick={() => setActiveTab('register')} style={{ padding: '10px 14px', borderRadius: '6px', border: activeTab === 'register' ? '2px solid #827717' : '1px solid #ccc', backgroundColor: activeTab === 'register' ? '#f0f4c3' : '#fff' }}>
                    Customer Registration
                </button>
                <button onClick={() => setActiveTab('list')} style={{ padding: '10px 14px', borderRadius: '6px', border: activeTab === 'list' ? '2px solid #827717' : '1px solid #ccc', backgroundColor: activeTab === 'list' ? '#f0f4c3' : '#fff' }}>
                    Registered Customers
                </button>
            </div>

            {activeTab === 'register' && (
                <div style={{ marginBottom: '30px', padding: '20px', borderRadius: '8px', border: '1px solid #cddc39', backgroundColor: '#fffde7' }}>
                    <h3 style={{ marginBottom: '15px' }}>➕ Add New Customer (Pending)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block' }}>Full Name</label>
                            <input
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block' }}>Shop Name</label>
                            <input
                                value={formData.shopName}
                                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block' }}>Contact Number</label>
                            <input
                                value={formData.contactNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block' }}>Address</label>
                            <input
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddCustomer}
                        style={{ marginTop: '14px', backgroundColor: '#f9a825', color: 'white', padding: '10px 14px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                        ➕ Add Customer
                    </button>
                </div>
            )}

            {activeTab === 'list' && (
                <>
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #cddc39', backgroundColor: '#f9fbe7' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#e6ee9c' }}>
                                <tr>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Full Name</th>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Shop Name</th>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Contact Number</th>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Address</th>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Status</th>
                                    <th style={{ padding: '12px', border: '1px solid #cddc39' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.filter(customer => customer.status !== 'Pending').map(customer => (
                                    <tr key={customer._id} style={{ backgroundColor: '#fff' }}>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>{customer.fullName}</td>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>{customer.shopName}</td>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>{customer.contactNumber}</td>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>{customer.address}</td>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>{customer.status}</td>
                                        <td style={{ padding: '12px', border: '1px solid #cddc39' }}>
                                            <button onClick={() => handleEditClick(customer)} style={{ padding: '8px 12px', border: 'none', borderRadius: '4px', backgroundColor: '#ffb300', color: '#000', cursor: 'pointer' }}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {editCustomer && (
                        <div style={{ marginTop: '20px', padding: '20px', borderRadius: '8px', border: '1px solid #cddc39', backgroundColor: '#fffde7' }}>
                            <h3>Edit Customer: {editCustomer.fullName}</h3>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block' }}>Full Name</label>
                                <input type="text" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block' }}>Shop Name</label>
                                <input type="text" value={formData.shopName} onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block' }}>Contact Number</label>
                                <input type="text" value={formData.contactNumber} onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block' }}>Address</label>
                                <input type="text" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block' }}>Status</label>
                                <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button onClick={handleSave} style={{ backgroundColor: '#8bc34a', color: '#fff', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Save Changes
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

export default Customers;
