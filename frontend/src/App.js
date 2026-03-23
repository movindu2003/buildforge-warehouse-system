import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* The main login page */}
        <Route path="/" element={<Login />} />
        
        {/* The 4 blank "Lobbies" for your team to build later */}
        <Route path="/inventory" element={<h2>Store Keeper Lobby: Inventory</h2>} />
        <Route path="/create-order" element={<h2>Sales Officer Lobby: Create Orders</h2>} />
        <Route path="/approval-lobby" element={<h2>Sales Manager Lobby: Approvals (Movi's Workspace)</h2>} />
        <Route path="/dispatch" element={<h2>Warehouse Manager Lobby: Dispatch</h2>} />
      </Routes>
    </Router>
  );
}

export default App;