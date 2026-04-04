import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUsers, FaEdit } from 'react-icons/fa';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <FaUsers size={24} color="#827717" />
                <h2 style={{ color: '#827717', margin: 0 }}>Customer Management</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                <Button 
                    onClick={() => setActiveTab('register')} 
                    variant={activeTab === 'register' ? 'primary' : 'secondary'}
                    style={{ 
                        border: activeTab === 'register' ? '2px solid #827717' : '1px solid #ccc',
                        backgroundColor: activeTab === 'register' ? '#f0f4c3' : undefined
                    }}
                >
                    Customer Registration
                </Button>
                <Button 
                    onClick={() => setActiveTab('list')} 
                    variant={activeTab === 'list' ? 'primary' : 'secondary'}
                    style={{ 
                        border: activeTab === 'list' ? '2px solid #827717' : '1px solid #ccc',
                        backgroundColor: activeTab === 'list' ? '#f0f4c3' : undefined
                    }}
                >
                    Registered Customers
                </Button>
            </div>

            {activeTab === 'register' && (
                <Card style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Add New Customer</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <FormField
                            label="Full Name"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            required
                        />
                        <FormField
                            label="Shop Name"
                            type="text"
                            value={formData.shopName}
                            onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                            required
                        />
                        <FormField
                            label="Contact Number"
                            type="text"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                            required
                        />
                        <FormField
                            label="Address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            required
                        />
                    </div>
                    <Button
                        onClick={handleAddCustomer}
                        variant="warning"
                        style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaUserPlus />
                        Add Customer
                    </Button>
                </Card>
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
                                            <Button onClick={() => handleEditClick(customer)} variant="warning" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FaEdit />
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {editCustomer && (
                        <Card style={{ marginTop: '20px' }}>
                            <h3>Edit Customer: {editCustomer.fullName}</h3>
                            <FormField
                                label="Full Name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                required
                            />
                            <FormField
                                label="Shop Name"
                                type="text"
                                value={formData.shopName}
                                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                                required
                            />
                            <FormField
                                label="Contact Number"
                                type="text"
                                value={formData.contactNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                required
                            />
                            <FormField
                                label="Address"
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                required
                            />
                            <FormField
                                label="Status"
                                type="select"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' }
                                ]}
                            />
                            <Button onClick={handleSave} variant="primary" style={{ marginTop: '10px' }}>
                                Save Changes
                            </Button>
                        </Card>
                    )}
                </>
            )}

        </div>
    );
}

export default Customers;
