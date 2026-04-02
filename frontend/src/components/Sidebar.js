import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the user's role from localStorage to determine which menu items to show
    const role = localStorage.getItem('role') || ''; 

    // An array to hold the menu items that will be displayed in the sidebar
    const menuItems = [];

    // Add menu items based on the user's role
    if (role === 'SalesManager') {
        menuItems.push({ name: 'Dashboard', path: '/approval-lobby', icon: '🏠' });
        menuItems.push({ name: 'Settings', path: '/settings', icon: '⚙️' });
    } 
    
    if (role === 'SalesOfficer') {
        menuItems.push({ name: 'Create Order', path: '/create-order', icon: '➕' });
        menuItems.push({ name: 'Customer Management', path: '/customers', icon: '👥' });
    }
    
    if (role === 'WarehouseManager') {
        menuItems.push({ name: 'Dispatch Center', path: '/dispatch', icon: '🚚' });
        menuItems.push({ name: 'Pick List', path: '/picklist', icon: '📋' });
        menuItems.push({ name: 'Gate Pass', path: '/gatepass', icon: '🚪' });
        menuItems.push({ name: 'Stock Movements', path: '/stock-movements', icon: '📊' });
        menuItems.push({ name: 'Damage Report', path: '/damage-report', icon: '⚠️' });
    }

    if (role === 'StoreKeeper') {
        menuItems.push({ name: 'Inventory Management', path: '/inventory', icon: '🏪' });
        menuItems.push({ name: 'Stock Movements', path: '/stock-movements', icon: '📊' });
    }

    // common menu item for all roles
    menuItems.push({ name: 'Order History', path: '/order-history', icon: '📜' });

    return (
        <div style={{
            width: '250px',
            backgroundColor: '#263238',
            color: 'white',
            height: '100vh',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            <h2 style={{ color: '#8bc34a', borderBottom: '1px solid #455a64', paddingBottom: '15px', marginTop: '10px' }}>
                🏗️ BuildForge
            </h2>
            
            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li 
                            key={index}
                            onClick={() => navigate(item.path)}
                            style={{
                                padding: '15px 15px',
                                marginBottom: '10px',
                                backgroundColor: isActive ? '#37474f' : 'transparent',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: isActive ? 'bold' : 'normal',
                                color: isActive ? '#8bc34a' : '#eceff1',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <span style={{ marginRight: '15px', fontSize: '1.2em' }}>{item.icon}</span>
                            {item.name}
                        </li>
                    )
                })}
            </ul>

            <div style={{ marginTop: 'auto', borderTop: '1px solid #455a64', paddingTop: '15px', fontSize: '0.9em', color: '#90a4ae' }}>
               Logged in as:<br/>
              <strong style={{ color: 'white' }}>{localStorage.getItem('role') || 'User'}</strong>
            </div>
        </div>
    );
}

export default Sidebar;