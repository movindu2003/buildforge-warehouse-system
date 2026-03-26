import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 🧩 Import Components
import Sidebar from './components/Sidebar';

// 📄 Import Pages
import Login from './pages/Login'; // 👈 Make sure you still have your Login.js file here!
import SalesManagerDashboard from './pages/SalesManagerDashboard';
import OrderHistory from './pages/OrderHistory';
import CreateOrder from './pages/CreateOrder';
import Settings from './pages/Settings';

// 🧠 THE SMART LAYOUT: This decides whether to show the Sidebar or not
function Layout() {
  const location = useLocation();
  
  // Check if the user is currently on the login screen
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  // If they are on the login screen, ONLY show the login routes (No Sidebar!)
  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  // If they are NOT on the login screen, show the Dashboard with the Sidebar!
  return (
    <div style={{ display: 'flex' }}>
      
      <Sidebar /> {/* ⬅️ Sidebar stays on the left */}
      
      <div style={{ marginLeft: '250px', width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        <Routes>
          <Route path="/approval-lobby" element={<SalesManagerDashboard />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>

    </div>
  );
}

// 🚀 MAIN APP COMPONENT
function App() {
  return (
    <Router>
      <Layout />
      {/* The Toast speaker stays outside so it works on every page */}
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </Router>
  );
}

export default App;