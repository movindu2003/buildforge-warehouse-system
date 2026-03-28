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
import Dispatch from './pages/Dispatch';
import StoreKeeperInventory from './pages/Inventory';

// 🧠 THE SMART LAYOUT: This decides whether to show the Sidebar or not
function Layout() {
  const location = useLocation();
  const [userRole, setUserRole] = React.useState(localStorage.getItem('role')); // Retrieve the user's role from localStorage

// check the user role from localStorage whenever the location changes (i.e. when they navigate to a different page) and update the state accordingly. This ensures that if they log out and log in as a different user, the app will show the correct sidebar menu items without needing a full page refresh.
     React.useEffect(() => {
      const role = localStorage.getItem('role');
      setUserRole(role);
    }, [location]);


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

  if (!userRole && !isLoginPage) {
    return <Navigate to="/login" />;
  }

  // If they are NOT on the login screen, show the Dashboard with the Sidebar!
  return (
    <div style={{ display: 'flex' }}>
      
      <Sidebar /> {/* ⬅️ Sidebar stays on the left */}
      
      <div style={{ marginLeft: '250px', width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        <Routes>
          {/* Managerns  routes */}
          {userRole === 'SalesManager' && (
            <>
              <Route path="/approval-lobby" element={<SalesManagerDashboard />} />
              <Route path="/settings" element={<Settings />} />
            </>
          )}

          {/*  Sales Officer routes */}
          {userRole === 'SalesOfficer' && (
            <Route path="/create-order" element={<CreateOrder />} />
          )}

          {/* Warehouse Manager routes */}
          {userRole === 'WarehouseManager' && (
            <Route path="/dispatch" element={<Dispatch />} />
          )}

          {/* Store Keeper routes */}
          {userRole === 'StoreKeeper' && (
            <Route path="/inventory" element={<StoreKeeperInventory />} />
          )}

          {/* All users want routes */}
          <Route path="/order-history" element={<OrderHistory />} />

          {/* 3. Catch-all route */}
          <Route path="*" element={<Navigate to={
            userRole === 'SalesManager' ? "/approval-lobby" : 
            userRole === 'SalesOfficer' ? "/create-order" : 
            userRole === 'StoreKeeper' ? "/inventory" : 
            userRole === 'WarehouseManager' ? "/dispatch" : "/login"
          } />} />
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