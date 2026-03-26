import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login details to our backend
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        username,
        password
      });

      // Find out what role this person is
      const userRole = response.data.role;

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('username', username);

      alert(`Welcome ${username}! You are logging in as: ${userRole}`);

      // Route them to their specific lobby based on their role
      if (userRole === 'StoreKeeper') navigate('/inventory');
      if (userRole === 'SalesOfficer') navigate('/create-order');
      if (userRole === 'SalesManager') navigate('/approval-lobby');
      if (userRole === 'WarehouseManager') navigate('/dispatch');

    } catch (error) {
      alert('Login failed. Please check your username and password.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>BuildForge WMS - Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Username" 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ margin: '10px', padding: '5px' }}
        /><br />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ margin: '10px', padding: '5px' }}
        /><br />
        <button type="submit" style={{ padding: '5px 20px', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
}

export default Login;