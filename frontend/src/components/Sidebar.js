import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Our menu buttons
    const menuItems = [
        { name: 'Dashboard', path: '/approval-lobby', icon: '🏠' },
        { name: 'Create Order', path: '/create-order', icon: '➕' },
        { name: 'Order History', path: '/order-history', icon: '📜' },
        { name: 'Settings', path: '/settings', icon: '⚙️' }
    ];

    return (
        <div style={{
            width: '250px',
            backgroundColor: '#263238', // Professional dark slate color
            color: 'white',
            height: '100vh', // Full screen height
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed', // Pins it to the left side of the screen
            top: 0,
            left: 0
        }}>
            <h2 style={{ color: '#8bc34a', borderBottom: '1px solid #455a64', paddingBottom: '15px', marginTop: '10px' }}>
                🏗️ BuildForge
            </h2>
            
            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path; // Checks if we are currently on this page
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
                <strong style={{ color: 'white' }}>Sales Manager</strong>
            </div>
        </div>
    );
}

export default Sidebar;